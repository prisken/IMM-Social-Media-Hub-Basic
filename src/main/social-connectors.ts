import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

export interface SocialMediaAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'threads';
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  pageId?: string; // For Facebook pages
  businessAccountId?: string; // For Instagram business accounts
  organizationId?: string; // For LinkedIn organizations
  threadsAccountId?: string; // For Threads accounts
  appSecret?: string; // For automatic token refresh
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostingResult {
  success: boolean;
  postId?: string;
  platformPostId?: string;
  error?: string;
  retryCount: number;
  postedAt: string;
}

export interface EngagementInteraction {
  id: string;
  platform: string;
  postId?: string;
  interactionType: 'comment' | 'message' | 'mention';
  interactionId: string;
  authorName: string;
  authorId?: string;
  content: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentScore?: number;
  isProcessed: boolean;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReplyResult {
  success: boolean;
  replyId?: string;
  error?: string;
  sentAt: string;
}

export interface PostingJob {
  id: string;
  postId: string;
  platform: string;
  accountId: string;
  content: string;
  mediaFiles: string[];
  scheduledTime: string;
  status: 'pending' | 'posting' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  result?: PostingResult;
  postedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export abstract class SocialMediaConnector {
  protected accessToken: string;
  protected accountId: string;
  protected platform: string;

  constructor(accessToken: string, accountId: string, platform: string) {
    this.accessToken = accessToken;
    this.accountId = accountId;
    this.platform = platform;
  }

  abstract authenticate(): Promise<boolean>;
  abstract post(content: string, mediaFiles?: string[]): Promise<PostingResult>;
  abstract refreshToken(): Promise<string | null>;
  abstract getAccountInfo(): Promise<any>;
  abstract getEngagementInteractions(limit?: number): Promise<EngagementInteraction[]>;
  abstract replyToInteraction(interactionId: string, content: string): Promise<ReplyResult>;

  protected async makeRequest(url: string, options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(jsonData);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${jsonData.error?.message || data}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  protected async uploadMedia(filePath: string): Promise<string> {
    throw new Error('Media upload not implemented for this platform');
  }
}

export class FacebookConnector extends SocialMediaConnector {
  private pageId?: string;
  private apiVersion = 'v18.0';

  constructor(accessToken: string, accountId: string, pageId?: string) {
    super(accessToken, accountId, 'facebook');
    this.pageId = pageId;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/me?access_token=${this.accessToken}`
      );
      return !!response.id;
    } catch (error) {
      console.error('Facebook authentication failed:', error);
      return false;
    }
  }

  async post(content: string, mediaFiles: string[] = []): Promise<PostingResult> {
    try {
      const targetId = this.pageId || 'me';
      let postData: any = {
        message: content,
        access_token: this.accessToken
      };

      // Handle media uploads
      if (mediaFiles.length > 0) {
        const mediaIds = await Promise.all(
          mediaFiles.map(file => this.uploadMedia(file))
        );
        postData.attached_media = mediaIds.map(id => ({ media_fbid: id }));
      }

      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/${targetId}/feed`,
        {
          method: 'POST',
          body: postData
        }
      );

      return {
        success: true,
        postId: this.accountId,
        platformPostId: response.id,
        retryCount: 0,
        postedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
        postedAt: new Date().toISOString()
      };
    }
  }

  async refreshToken(): Promise<string | null> {
    // Facebook tokens are long-lived, but we can implement refresh logic here
    return null;
  }

  async getAccountInfo(): Promise<any> {
    try {
      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/me?fields=id,name,email&access_token=${this.accessToken}`
      );
      return response;
    } catch (error) {
      throw new Error(`Failed to get account info: ${error}`);
    }
  }

  async getEngagementInteractions(limit: number = 50): Promise<EngagementInteraction[]> {
    try {
      const targetId = this.pageId || 'me';
      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/${targetId}/posts?fields=comments{id,message,from,created_time},limit=${limit}&access_token=${this.accessToken}`
      );

      const interactions: EngagementInteraction[] = [];
      
      for (const post of response.data || []) {
        if (post.comments && post.comments.data) {
          for (const comment of post.comments.data) {
            // Basic sentiment analysis
            const sentiment = this.analyzeBasicSentiment(comment.message);
            
            interactions.push({
              id: comment.id,
              platform: 'facebook',
              postId: post.id,
              interactionType: 'comment',
              interactionId: comment.id,
              authorName: comment.from?.name || 'Unknown',
              authorId: comment.from?.id,
              content: comment.message,
              sentiment: sentiment.sentiment,
              sentimentScore: sentiment.score,
              isProcessed: false,
              createdAt: comment.created_time,
              updatedAt: comment.created_time
            });
          }
        }
      }

      return interactions;
    } catch (error) {
      console.error('Failed to fetch Facebook engagement interactions:', error);
      // Return empty array when no real data is available
      return [];
    }
  }

  private analyzeBasicSentiment(text: string): { sentiment: 'positive' | 'negative' | 'neutral', score: number } {
    const positiveWords = ['love', 'great', 'amazing', 'awesome', 'excellent', 'fantastic', 'wonderful', 'perfect', 'best', 'good', 'nice', 'helpful', 'useful', 'brilliant', 'outstanding', 'impressive', 'incredible', 'superb', 'terrific', 'fabulous', 'marvelous', 'thank', 'thanks', 'appreciate', 'grateful', 'happy', 'excited', 'thrilled', 'satisfied', 'pleased', 'delighted', 'joy', 'wonderful', 'beautiful', 'stunning'];
    const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'disappointing', 'frustrated', 'angry', 'upset', 'sad', 'disappointed', 'annoyed', 'irritated', 'disgusting', 'ridiculous', 'stupid', 'useless', 'waste', 'problem', 'issue', 'broken', 'failed', 'wrong', 'error', 'mistake', 'poor', 'cheap', 'expensive', 'difficult', 'hard', 'complicated', 'confusing', 'disagree', 'dislike'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (positiveWords.includes(cleanWord)) {
        positiveCount++;
      } else if (negativeWords.includes(cleanWord)) {
        negativeCount++;
      }
    });

    const total = words.length;
    const positiveScore = positiveCount / total;
    const negativeScore = negativeCount / total;

    if (positiveScore > negativeScore && positiveScore > 0.1) {
      return { sentiment: 'positive', score: positiveScore };
    } else if (negativeScore > positiveScore && negativeScore > 0.1) {
      return { sentiment: 'negative', score: -negativeScore };
    } else {
      return { sentiment: 'neutral', score: 0 };
    }
  }

  async replyToInteraction(interactionId: string, content: string): Promise<ReplyResult> {
    try {
      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/${interactionId}/comments`,
        {
          method: 'POST',
          body: {
            message: content,
            access_token: this.accessToken
          }
        }
      );

      return {
        success: true,
        replyId: response.id,
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date().toISOString()
      };
    }
  }

  protected override async uploadMedia(filePath: string): Promise<string> {
    try {
      // First, create a media upload session
      const createResponse = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/me/photos`,
        {
          method: 'POST',
          body: {
            source: filePath,
            access_token: this.accessToken
          }
        }
      );

      return createResponse.id;
    } catch (error) {
      throw new Error(`Failed to upload media to Facebook: ${error}`);
    }
  }
}

export class InstagramConnector extends SocialMediaConnector {
  private businessAccountId?: string;
  private apiVersion = 'v18.0';

  constructor(accessToken: string, accountId: string, businessAccountId?: string) {
    super(accessToken, accountId, 'instagram');
    this.businessAccountId = businessAccountId;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/me?access_token=${this.accessToken}`
      );
      return !!response.id;
    } catch (error) {
      console.error('Instagram authentication failed:', error);
      return false;
    }
  }

  async post(content: string, mediaFiles: string[] = []): Promise<PostingResult> {
    try {
      if (!this.businessAccountId) {
        throw new Error('Instagram Business Account ID is required');
      }

      if (mediaFiles.length === 0) {
        throw new Error('Instagram requires at least one media file');
      }

      // For Instagram, we need to create a media container first
      const mediaId = await this.uploadMedia(mediaFiles[0]);
      
      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/${this.businessAccountId}/media_publish`,
        {
          method: 'POST',
          body: {
            creation_id: mediaId,
            caption: content,
            access_token: this.accessToken
          }
        }
      );

      return {
        success: true,
        postId: this.accountId,
        platformPostId: response.id,
        retryCount: 0,
        postedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
        postedAt: new Date().toISOString()
      };
    }
  }

  async refreshToken(): Promise<string | null> {
    return null;
  }

  async getAccountInfo(): Promise<any> {
    try {
      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/me?fields=id,name,email&access_token=${this.accessToken}`
      );
      return response;
    } catch (error) {
      throw new Error(`Failed to get account info: ${error}`);
    }
  }

  async getEngagementInteractions(limit: number = 50): Promise<EngagementInteraction[]> {
    try {
      if (!this.businessAccountId) {
        throw new Error('Instagram Business Account ID is required');
      }

      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/${this.businessAccountId}/media?fields=comments{id,text,from,created_time},limit=${limit}&access_token=${this.accessToken}`
      );

      const interactions: EngagementInteraction[] = [];
      
      for (const media of response.data || []) {
        if (media.comments && media.comments.data) {
          for (const comment of media.comments.data) {
            interactions.push({
              id: comment.id,
              platform: 'instagram',
              postId: media.id,
              interactionType: 'comment',
              interactionId: comment.id,
              authorName: comment.from?.username || 'Unknown',
              authorId: comment.from?.id,
              content: comment.text,
              isProcessed: false,
              createdAt: comment.created_time,
              updatedAt: comment.created_time
            });
          }
        }
      }

      return interactions;
    } catch (error) {
      console.error('Failed to fetch Instagram engagement interactions:', error);
      return [];
    }
  }

  async replyToInteraction(interactionId: string, content: string): Promise<ReplyResult> {
    try {
      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/${interactionId}/replies`,
        {
          method: 'POST',
          body: {
            message: content,
            access_token: this.accessToken
          }
        }
      );

      return {
        success: true,
        replyId: response.id,
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date().toISOString()
      };
    }
  }

  protected override async uploadMedia(filePath: string): Promise<string> {
    try {
      if (!this.businessAccountId) {
        throw new Error('Instagram Business Account ID is required');
      }

      // Create a media container for Instagram
      const createResponse = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/${this.businessAccountId}/media`,
        {
          method: 'POST',
          body: {
            image_url: filePath, // For now, we'll use URL. In production, you'd upload the file first
            caption: 'Uploading media...',
            access_token: this.accessToken
          }
        }
      );

      return createResponse.id;
    } catch (error) {
      throw new Error(`Failed to upload media to Instagram: ${error}`);
    }
  }
}

export class LinkedInConnector extends SocialMediaConnector {
  private organizationId?: string;

  constructor(accessToken: string, accountId: string, organizationId?: string) {
    super(accessToken, accountId, 'linkedin');
    this.organizationId = organizationId;
  }

  async authenticate(): Promise<boolean> {
    try {
      // Skip profile check for now - just verify token is valid
      // We'll test posting directly instead
      return true;
    } catch (error) {
      console.error('LinkedIn authentication failed:', error);
      return false;
    }
  }

  async post(content: string, mediaFiles: string[] = []): Promise<PostingResult> {
    try {
      // LinkedIn requires the author to be in URN format
      let authorUrn: string;
      if (this.organizationId) {
        // Posting as organization
        authorUrn = `urn:li:organization:${this.organizationId}`;
      } else {
        // Posting as person
        authorUrn = `urn:li:person:${this.accountId}`;
      }
      
      let postData: any = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: mediaFiles.length > 0 ? 'IMAGE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      // Handle media uploads
      if (mediaFiles.length > 0) {
        const mediaIds = await Promise.all(
          mediaFiles.map(file => this.uploadMedia(file))
        );
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = mediaIds.map(id => ({
          status: 'READY',
          media: id,
          title: {
            text: 'Media'
          }
        }));
      }

      const response = await this.makeRequest(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: postData
        }
      );

      return {
        success: true,
        postId: this.accountId,
        platformPostId: response.id,
        retryCount: 0,
        postedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
        postedAt: new Date().toISOString()
      };
    }
  }

  async refreshToken(): Promise<string | null> {
    // Implement LinkedIn token refresh
    return null;
  }

  async getAccountInfo(): Promise<any> {
    try {
      const response = await this.makeRequest(
        'https://api.linkedin.com/v2/me',
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      return response;
    } catch (error) {
      throw new Error(`Failed to get account info: ${error}`);
    }
  }

  async getEngagementInteractions(limit: number = 50): Promise<EngagementInteraction[]> {
    try {
      // LinkedIn engagement API is more limited, we'll focus on comments on posts
      const response = await this.makeRequest(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      const interactions: EngagementInteraction[] = [];
      
      // LinkedIn engagement data is more complex to fetch
      // For now, return empty array as LinkedIn's engagement API requires specific permissions
      console.log('LinkedIn engagement interactions require additional API permissions');
      
      return interactions;
    } catch (error) {
      console.error('Failed to fetch LinkedIn engagement interactions:', error);
      return [];
    }
  }

  async replyToInteraction(interactionId: string, content: string): Promise<ReplyResult> {
    try {
      // LinkedIn comment replies require specific API endpoints
      // For now, return error as this requires additional implementation
      return {
        success: false,
        error: 'LinkedIn comment replies require additional API implementation',
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date().toISOString()
      };
    }
  }

  protected override async uploadMedia(filePath: string): Promise<string> {
    try {
      // LinkedIn media upload requires a two-step process
      // First, register the upload
      const registerResponse = await this.makeRequest(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: {
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: this.organizationId ? `urn:li:organization:${this.organizationId}` : `urn:li:person:${this.accountId}`,
              serviceRelationships: [
                {
                  relationshipType: 'OWNER',
                  identifier: 'urn:li:userGeneratedContent'
                }
              ]
            }
          }
        }
      );

      // Then upload the file to the provided upload URL
      const uploadResponse = await this.makeRequest(
        registerResponse.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl,
        {
          method: 'POST',
          body: {
            file: filePath
          }
        }
      );

      return registerResponse.value.asset;
    } catch (error) {
      throw new Error(`Failed to upload media to LinkedIn: ${error}`);
    }
  }
}

export class ThreadsConnector extends SocialMediaConnector {
  private apiVersion = 'v23.0';
  private threadsAccountId: string;

  constructor(accessToken: string, accountId: string, threadsAccountId: string) {
    super(accessToken, accountId, 'threads');
    this.threadsAccountId = threadsAccountId;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/me?fields=id,name&access_token=${this.accessToken}`
      );
      return !!response.id;
    } catch (error) {
      console.error('Threads authentication failed:', error);
      return false;
    }
  }

  async post(content: string, mediaFiles: string[] = []): Promise<PostingResult> {
    try {
      // Threads API endpoint for posting
      const postData: any = {
        message: content
      };

      // Handle media uploads if provided
      if (mediaFiles.length > 0) {
        const mediaIds = await Promise.all(
          mediaFiles.map(file => this.uploadMedia(file))
        );
        postData.media_ids = mediaIds;
      }

      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/${this.threadsAccountId}/feed`,
        {
          method: 'POST',
          body: postData
        }
      );

      return {
        success: true,
        postId: response.id,
        platformPostId: response.id,
        retryCount: 0,
        postedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Threads posting failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
        postedAt: new Date().toISOString()
      };
    }
  }

  override async uploadMedia(filePath: string): Promise<string> {
    try {
      // First, create a media container
      const containerResponse = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/${this.threadsAccountId}/media`,
        {
          method: 'POST',
          body: {
            media_type: this.getMediaType(filePath),
            source_url: filePath // For local files, you'd need to upload to a URL first
          }
        }
      );

      // Then publish the media
      const publishResponse = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/${this.threadsAccountId}/media_publish`,
        {
          method: 'POST',
          body: {
            creation_id: containerResponse.id
          }
        }
      );

      return publishResponse.id;
    } catch (error) {
      throw new Error(`Failed to upload media to Threads: ${error}`);
    }
  }

  private getMediaType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      return 'IMAGE';
    } else if (['.mp4', '.mov', '.avi'].includes(ext)) {
      return 'VIDEO';
    } else {
      return 'IMAGE'; // Default to image
    }
  }

  async refreshToken(): Promise<string | null> {
    // Threads tokens are long-lived, similar to Facebook
    return null;
  }

  async getAccountInfo(): Promise<any> {
    try {
      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/${this.threadsAccountId}?fields=id,name,username,followers_count,following_count,media_count&access_token=${this.accessToken}`
      );
      return response;
    } catch (error) {
      throw new Error(`Failed to get Threads account info: ${error}`);
    }
  }

  async getEngagementInteractions(limit: number = 50): Promise<EngagementInteraction[]> {
    try {
      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/${this.threadsAccountId}/media?fields=comments{id,text,from,created_time},like_count,comment_count&limit=${limit}&access_token=${this.accessToken}`
      );

      const interactions: EngagementInteraction[] = [];
      
      for (const post of response.data || []) {
        if (post.comments && post.comments.data) {
          for (const comment of post.comments.data) {
            const sentiment = this.analyzeBasicSentiment(comment.text);
            
            interactions.push({
              id: comment.id,
              platform: 'threads',
              postId: post.id,
              interactionType: 'comment',
              interactionId: comment.id,
              authorName: comment.from?.username || 'Unknown',
              authorId: comment.from?.id,
              content: comment.text,
              sentiment: sentiment.sentiment,
              sentimentScore: sentiment.score,
              isProcessed: false,
              createdAt: comment.created_time,
              updatedAt: comment.created_time
            });
          }
        }
      }

      return interactions;
    } catch (error) {
      console.error('Failed to fetch Threads engagement interactions:', error);
      return [];
    }
  }

  private analyzeBasicSentiment(text: string): { sentiment: 'positive' | 'negative' | 'neutral', score: number } {
    const positiveWords = ['love', 'great', 'amazing', 'awesome', 'excellent', 'fantastic', 'wonderful', 'perfect', 'best', 'good', 'nice', 'helpful', 'useful', 'brilliant', 'outstanding', 'impressive', 'incredible', 'superb', 'terrific', 'fabulous', 'marvelous', 'thank', 'thanks', 'appreciate', 'grateful', 'happy', 'excited', 'thrilled', 'satisfied', 'pleased', 'delighted', 'joy', 'wonderful', 'beautiful', 'stunning'];
    const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'disappointing', 'frustrated', 'angry', 'upset', 'sad', 'disappointed', 'annoyed', 'irritated', 'disgusting', 'ridiculous', 'stupid', 'useless', 'waste', 'problem', 'issue', 'broken', 'failed', 'wrong', 'error', 'mistake', 'poor', 'cheap', 'expensive', 'difficult', 'hard', 'complicated', 'confusing', 'disagree', 'dislike'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (positiveWords.includes(cleanWord)) {
        positiveCount++;
      } else if (negativeWords.includes(cleanWord)) {
        negativeCount++;
      }
    });

    const total = words.length;
    const positiveScore = positiveCount / total;
    const negativeScore = negativeCount / total;

    if (positiveScore > negativeScore && positiveScore > 0.1) {
      return { sentiment: 'positive', score: positiveScore };
    } else if (negativeScore > positiveScore && negativeScore > 0.1) {
      return { sentiment: 'negative', score: -negativeScore };
    } else {
      return { sentiment: 'neutral', score: 0 };
    }
  }

  async replyToInteraction(interactionId: string, content: string): Promise<ReplyResult> {
    try {
      const response = await this.makeRequest(
        `https://graph.facebook.com/${this.apiVersion}/${interactionId}/comments`,
        {
          method: 'POST',
          body: {
            message: content
          }
        }
      );

      return {
        success: true,
        replyId: response.id,
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date().toISOString()
      };
    }
  }
}

export class SocialMediaManager {
  private connectors: Map<string, SocialMediaConnector> = new Map();

  async createConnector(account: SocialMediaAccount): Promise<SocialMediaConnector> {
    let connector: SocialMediaConnector;

    switch (account.platform) {
      case 'facebook':
        connector = new FacebookConnector(account.accessToken, account.id, account.pageId);
        break;
      case 'instagram':
        throw new Error('Instagram is not currently supported. Coming soon!');
      case 'linkedin':
        throw new Error('LinkedIn is not currently supported. Coming soon!');
      case 'threads':
        connector = new ThreadsConnector(account.accessToken, account.id, account.threadsAccountId || '');
        break;
      default:
        throw new Error(`Unsupported platform: ${account.platform}`);
    }

    this.connectors.set(account.id, connector);
    return connector;
  }

  async postToPlatform(account: SocialMediaAccount, content: string, mediaFiles: string[] = []): Promise<PostingResult> {
    const connector = await this.createConnector(account);
    
    // Authenticate first
    const isAuthenticated = await connector.authenticate();
    if (!isAuthenticated) {
      return {
        success: false,
        error: 'Authentication failed',
        retryCount: 0,
        postedAt: new Date().toISOString()
      };
    }

    // Attempt to post
    return await connector.post(content, mediaFiles);
  }

  async testConnection(account: SocialMediaAccount): Promise<boolean> {
    try {
      const connector = await this.createConnector(account);
      return await connector.authenticate();
    } catch (error) {
      console.error(`Connection test failed for ${account.platform}:`, error);
      return false;
    }
  }

  getConnector(accountId: string): SocialMediaConnector | undefined {
    return this.connectors.get(accountId);
  }

  removeConnector(accountId: string): void {
    this.connectors.delete(accountId);
  }

  async getEngagementInteractions(account: SocialMediaAccount, limit: number = 50): Promise<EngagementInteraction[]> {
    try {
      const connector = await this.createConnector(account);
      return await connector.getEngagementInteractions(limit);
    } catch (error) {
      console.error(`Failed to get engagement interactions for ${account.platform}:`, error);
      return [];
    }
  }

  async replyToInteraction(account: SocialMediaAccount, interactionId: string, content: string): Promise<ReplyResult> {
    try {
      const connector = await this.createConnector(account);
      return await connector.replyToInteraction(interactionId, content);
    } catch (error) {
      console.error(`Failed to reply to interaction on ${account.platform}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date().toISOString()
      };
    }
  }
} 