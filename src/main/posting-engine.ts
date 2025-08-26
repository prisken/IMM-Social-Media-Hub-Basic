import { SocialMediaManager, SocialMediaAccount, PostingJob, PostingResult } from './social-connectors';
import { AppDatabase } from './database';
import * as fs from 'fs';
import * as path from 'path';

export interface PostingLog {
  id: string;
  jobId: string;
  platform: string;
  accountId: string;
  content: string;
  mediaFiles: string[];
  status: 'pending' | 'posting' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  result?: PostingResult;
  scheduledTime: string;
  postedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformFormatting {
  maxLength: number;
  hashtagLimit: number;
  mediaRequired: boolean;
  mediaTypes: string[];
  maxMediaCount: number;
  ctaPlacement: 'inline' | 'separate' | 'none';
}

export class PostingEngine {
  private socialMediaManager: SocialMediaManager;
  private database: AppDatabase;
  private isRunning: boolean = false;
  private retryDelays: number[] = [1000, 5000, 15000, 30000, 60000]; // Exponential backoff

  // Platform-specific formatting rules
  private platformFormats: Map<string, PlatformFormatting> = new Map([
    ['facebook', {
      maxLength: 63206,
      hashtagLimit: 30,
      mediaRequired: false,
      mediaTypes: ['image', 'video'],
      maxMediaCount: 10,
      ctaPlacement: 'inline'
    }],
    ['instagram', {
      maxLength: 2200,
      hashtagLimit: 30,
      mediaRequired: true,
      mediaTypes: ['image', 'video'],
      maxMediaCount: 10,
      ctaPlacement: 'inline'
    }],
    ['linkedin', {
      maxLength: 3000,
      hashtagLimit: 5,
      mediaRequired: false,
      mediaTypes: ['image', 'video', 'document'],
      maxMediaCount: 9,
      ctaPlacement: 'inline'
    }]
  ]);

  constructor(database: AppDatabase) {
    this.socialMediaManager = new SocialMediaManager();
    this.database = database;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Posting engine is already running');
      return;
    }

    this.isRunning = true;
    console.log('Posting engine started');

    // Start the posting loop
    this.runPostingLoop();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('Posting engine stopped');
  }

  private async runPostingLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.processPendingJobs();
        await this.sleep(30000); // Check every 30 seconds
      } catch (error) {
        console.error('Error in posting loop:', error);
        await this.sleep(60000); // Wait longer on error
      }
    }
  }

  private async processPendingJobs(): Promise<void> {
    const pendingJobs = await this.database.getPendingPostingJobs();
    
    for (const job of pendingJobs) {
      if (!this.isRunning) break;

      const now = new Date();
      const scheduledTime = new Date(job.scheduledTime);
      
      if (scheduledTime <= now) {
        await this.processJob(job);
      }
    }
  }

  private async processJob(job: PostingJob): Promise<void> {
    try {
      // Update job status to posting
      await this.database.updatePostingJob({
        ...job,
        status: 'posting',
        updatedAt: new Date().toISOString()
      });

      // Get the social media account
      const account = await this.database.getSocialMediaAccount(job.accountId);
      if (!account) {
        throw new Error(`Account not found: ${job.accountId}`);
      }

      // Format content for the platform
      const formattedContent = this.formatContentForPlatform(job.content, job.platform);

      // Post to platform
      const result = await this.socialMediaManager.postToPlatform(
        account,
        formattedContent,
        job.mediaFiles
      );

      if (result.success) {
        // Update job as completed
        await this.database.updatePostingJob({
          ...job,
          status: 'completed',
          result: result,
          postedAt: result.postedAt,
          updatedAt: new Date().toISOString()
        });

        // Log the successful post
        await this.logPosting(job, result);
        
        console.log(`Successfully posted to ${job.platform}: ${result.platformPostId}`);
      } else {
        // Handle failure with retry logic
        await this.handlePostingFailure(job, result.error || 'Unknown error');
      }

    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      await this.handlePostingFailure(job, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async handlePostingFailure(job: PostingJob, error: string): Promise<void> {
    const newRetryCount = job.retryCount + 1;
    const maxRetries = job.maxRetries;

    if (newRetryCount <= maxRetries) {
      // Schedule retry with exponential backoff
      const delay = this.retryDelays[Math.min(newRetryCount - 1, this.retryDelays.length - 1)];
      const retryTime = new Date(Date.now() + delay);

      await this.database.updatePostingJob({
        ...job,
        status: 'pending',
        retryCount: newRetryCount,
        lastError: error,
        scheduledTime: retryTime.toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log(`Scheduled retry ${newRetryCount}/${maxRetries} for job ${job.id} in ${delay}ms`);
    } else {
      // Mark as failed after max retries
      await this.database.updatePostingJob({
        ...job,
        status: 'failed',
        lastError: error,
        updatedAt: new Date().toISOString()
      });

      console.log(`Job ${job.id} failed after ${maxRetries} retries`);
    }
  }

  private formatContentForPlatform(content: string, platform: string): string {
    const format = this.platformFormats.get(platform);
    if (!format) {
      return content; // Return original content if platform not found
    }

    let formattedContent = content;

    // Truncate if too long
    if (formattedContent.length > format.maxLength) {
      formattedContent = formattedContent.substring(0, format.maxLength - 3) + '...';
    }

    // Handle hashtags
    const hashtags = this.extractHashtags(formattedContent);
    if (hashtags.length > format.hashtagLimit) {
      // Keep only the first N hashtags
      const limitedHashtags = hashtags.slice(0, format.hashtagLimit);
      formattedContent = this.replaceHashtags(formattedContent, limitedHashtags);
    }

    // Platform-specific formatting
    switch (platform) {
      case 'instagram':
        // Instagram prefers emojis and line breaks
        formattedContent = this.formatForInstagram(formattedContent);
        break;
      case 'linkedin':
        // LinkedIn prefers professional tone and proper formatting
        formattedContent = this.formatForLinkedIn(formattedContent);
        break;
      case 'facebook':
        // Facebook is more flexible
        formattedContent = this.formatForFacebook(formattedContent);
        break;
    }

    return formattedContent;
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#\w+/g;
    return content.match(hashtagRegex) || [];
  }

  private replaceHashtags(content: string, hashtags: string[]): string {
    const hashtagRegex = /#\w+/g;
    return content.replace(hashtagRegex, () => hashtags.shift() || '');
  }

  private formatForInstagram(content: string): string {
    // Add line breaks for better readability
    content = content.replace(/\. /g, '.\n\n');
    content = content.replace(/! /g, '!\n\n');
    content = content.replace(/\? /g, '?\n\n');
    
    // Add emojis if none present
    if (!content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)) {
      content = '✨ ' + content;
    }

    return content;
  }

  private formatForLinkedIn(content: string): string {
    // Ensure professional formatting
    content = content.replace(/\n{3,}/g, '\n\n'); // Remove excessive line breaks
    
    // Add bullet points for lists
    if (content.includes('•') || content.includes('-')) {
      content = content.replace(/^[-•]\s*/gm, '• ');
    }

    return content;
  }

  private formatForFacebook(content: string): string {
    // Facebook is more flexible, just clean up formatting
    content = content.replace(/\n{3,}/g, '\n\n');
    return content;
  }

  async createPostingJob(
    postId: string,
    platform: string,
    accountId: string,
    content: string,
    mediaFiles: string[],
    scheduledTime: string,
    maxRetries: number = 3
  ): Promise<string> {
    const job: PostingJob = {
      id: this.generateId(),
      postId,
      platform,
      accountId,
      content,
      mediaFiles,
      scheduledTime,
      status: 'pending',
      retryCount: 0,
      maxRetries,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.database.createPostingJob(job);
    return job.id;
  }

  async getPostingLogs(limit: number = 50, offset: number = 0): Promise<PostingLog[]> {
    return await this.database.getPostingLogs(limit, offset);
  }

  async getPostingJob(jobId: string): Promise<PostingJob | null> {
    return await this.database.getPostingJob(jobId);
  }

  async cancelPostingJob(jobId: string): Promise<void> {
    const job = await this.database.getPostingJob(jobId);
    if (job && job.status === 'pending') {
      await this.database.updatePostingJob({
        ...job,
        status: 'failed',
        lastError: 'Cancelled by user',
        updatedAt: new Date().toISOString()
      });
    }
  }

  async retryPostingJob(jobId: string): Promise<void> {
    const job = await this.database.getPostingJob(jobId);
    if (job && job.status === 'failed') {
      await this.database.updatePostingJob({
        ...job,
        status: 'pending',
        retryCount: 0,
        lastError: undefined,
        scheduledTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  private async logPosting(job: PostingJob, result: PostingResult): Promise<void> {
    const log: PostingLog = {
      id: this.generateId(),
      jobId: job.id,
      platform: job.platform,
      accountId: job.accountId,
      content: job.content,
      mediaFiles: job.mediaFiles,
      status: result.success ? 'completed' : 'failed',
      retryCount: job.retryCount,
      maxRetries: job.maxRetries,
      lastError: result.error,
      result: result,
      scheduledTime: job.scheduledTime,
      postedAt: result.postedAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.database.createPostingLog(log);
  }

  private generateId(): string {
    return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getPlatformFormat(platform: string): PlatformFormatting | undefined {
    return this.platformFormats.get(platform);
  }

  async validateContent(content: string, platform: string, mediaFiles: string[] = []): Promise<{ valid: boolean; errors: string[] }> {
    const format = this.platformFormats.get(platform);
    const errors: string[] = [];

    if (!format) {
      errors.push(`Unsupported platform: ${platform}`);
      return { valid: false, errors };
    }

    // Check content length
    if (content.length > format.maxLength) {
      errors.push(`Content too long. Maximum ${format.maxLength} characters allowed.`);
    }

    // Check hashtag limit
    const hashtags = this.extractHashtags(content);
    if (hashtags.length > format.hashtagLimit) {
      errors.push(`Too many hashtags. Maximum ${format.hashtagLimit} hashtags allowed.`);
    }

    // Check media requirements
    if (format.mediaRequired && mediaFiles.length === 0) {
      errors.push(`${platform} requires at least one media file.`);
    }

    // Check media count
    if (mediaFiles.length > format.maxMediaCount) {
      errors.push(`Too many media files. Maximum ${format.maxMediaCount} files allowed.`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
} 