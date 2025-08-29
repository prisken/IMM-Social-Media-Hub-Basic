const Database = require('better-sqlite3');
import * as path from 'path';
import * as fs from 'fs';
import { SocialMediaAccount, PostingJob, PostingResult } from './social-connectors';
import { PostingLog } from './posting-engine';

export interface AppSettings {
  id: string;
  brandVoice: any;
  socialMedia: any;
  postingSchedule: any;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  filepath: string;
  filetype: string;
  filesize: number;
  dimensions?: string;
  duration?: number;
  uploadDate: string;
  tags: string[];
  category: string;
  usedCount: number;
  metadata: any;
}

export interface BrandVoiceProfile {
  id: string;
  name: string;
  tone: string;
  style: string;
  vocabulary: string[];
  emojiUsage: string;
  callToAction: string;
  examples: string[];
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  platform: string;
  content: string;
  mediaFiles: string[];
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: any;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledJob {
  id: string;
  postId: string;
  platform: string;
  content: string;
  mediaFiles: string[];
  scheduledTime: string;
  status: 'queued' | 'scheduled' | 'running' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsMetrics {
  id: string;
  postId: string;
  platform: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagementRate: number;
  sentimentScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsTrend {
  id: string;
  platform: string;
  date: string;
  totalReach: number;
  totalEngagement: number;
  totalPosts: number;
  avgEngagementRate: number;
  topContentType: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price?: number;
  sku?: string;
  mediaFiles: string[];
  tags: string[];
  features: string[];
  specifications: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imagePath: string;
  imageType: 'main' | 'detail' | 'lifestyle' | 'in-use' | 'generated';
  prompt?: string;
  generationSettings?: {
    style: string;
    background: string;
    lighting: string;
    composition: string;
  };
  createdAt: string;
}

export interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  templatePath: string;
  thumbnailPath: string;
  settings: {
    width: number;
    height: number;
    format: string;
    quality: number;
  };
  isActive: boolean;
  createdAt: string;
}

export interface BrandVoicePerformance {
  id: string;
  voiceProfileId: string;
  tone: string;
  style: string;
  engagementRate: number;
  sentimentScore: number;
  postCount: number;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export interface TopPost extends Post {
  analytics: {
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  };
}

export class AppDatabase {
  private db!: any;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
  }

  async initialize(): Promise<void> {
    // Ensure user_data directory exists
    const userDataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    await this.createTables();
    await this.seedInitialData();
  }

  private async createTables(): Promise<void> {
    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        brand_voice TEXT,
        social_media TEXT,
        posting_schedule TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    // Media files table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS media_files (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        filepath TEXT NOT NULL,
        filetype TEXT NOT NULL,
        filesize INTEGER NOT NULL,
        dimensions TEXT,
        duration INTEGER,
        upload_date TEXT NOT NULL,
        tags TEXT,
        category TEXT NOT NULL,
        used_count INTEGER DEFAULT 0,
        metadata TEXT
      )
    `);

    // Brand voice profiles table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS brand_voice_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tone TEXT NOT NULL,
        style TEXT NOT NULL,
        vocabulary TEXT,
        emoji_usage TEXT,
        call_to_action TEXT,
        examples TEXT,
        confidence REAL DEFAULT 0.7,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    // Posts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        content TEXT NOT NULL,
        media_files TEXT,
        scheduled_time TEXT,
        status TEXT NOT NULL,
        engagement TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    // Scheduled Jobs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scheduled_jobs (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        content TEXT NOT NULL,
        media_files TEXT,
        scheduled_time TEXT NOT NULL,
        status TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        error_message TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (post_id) REFERENCES posts (id)
      )
    `);

    // Social Media Accounts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS social_media_accounts (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        account_name TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TEXT,
        page_id TEXT,
        business_account_id TEXT,
        organization_id TEXT,
        app_secret TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    // Add app_secret column to existing tables if it doesn't exist
    try {
      this.db.exec(`ALTER TABLE social_media_accounts ADD COLUMN app_secret TEXT`);
      console.log('✅ Added app_secret column to social_media_accounts table');
    } catch (error) {
      // Column already exists, ignore error
      console.log('ℹ️ app_secret column already exists in social_media_accounts table');
    }

    // Posting Jobs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS posting_jobs (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        account_id TEXT NOT NULL,
        content TEXT NOT NULL,
        media_files TEXT,
        scheduled_time TEXT NOT NULL,
        status TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        last_error TEXT,
        result TEXT,
        posted_at TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (post_id) REFERENCES posts (id),
        FOREIGN KEY (account_id) REFERENCES social_media_accounts (id)
      )
    `);

    // Posting Logs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS posting_logs (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        account_id TEXT NOT NULL,
        content TEXT NOT NULL,
        media_files TEXT,
        status TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        last_error TEXT,
        result TEXT,
        scheduled_time TEXT NOT NULL,
        posted_at TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (job_id) REFERENCES posting_jobs (id),
        FOREIGN KEY (account_id) REFERENCES social_media_accounts (id)
      )
    `);

    // Engagement Interactions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS engagement_interactions (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        post_id TEXT,
        interaction_type TEXT NOT NULL,
        interaction_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_id TEXT,
        content TEXT NOT NULL,
        sentiment TEXT,
        sentiment_score REAL,
        is_processed BOOLEAN DEFAULT 0,
        processed_at TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (post_id) REFERENCES posts (id)
      )
    `);

    // Quick Replies table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS quick_replies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        platform TEXT,
        is_active BOOLEAN DEFAULT 1,
        usage_count INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    // Analytics Metrics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_metrics (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        reach INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        engagement_rate REAL DEFAULT 0,
        sentiment_score REAL DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (post_id) REFERENCES posts (id)
      )
    `);

    // Analytics Trends table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_trends (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        date TEXT NOT NULL,
        total_reach INTEGER DEFAULT 0,
        total_engagement INTEGER DEFAULT 0,
        total_posts INTEGER DEFAULT 0,
        avg_engagement_rate REAL DEFAULT 0,
        top_content_type TEXT,
        created_at TEXT
      )
    `);

    // Brand Voice Performance table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS brand_voice_performance (
        id TEXT PRIMARY KEY,
        voice_profile_id TEXT NOT NULL,
        tone TEXT NOT NULL,
        style TEXT NOT NULL,
        engagement_rate REAL DEFAULT 0,
        sentiment_score REAL DEFAULT 0,
        post_count INTEGER DEFAULT 0,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        created_at TEXT,
        FOREIGN KEY (voice_profile_id) REFERENCES brand_voice_profiles (id)
      )
    `);

    // Products table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL,
        sku TEXT,
        media_files TEXT,
        tags TEXT,
        features TEXT,
        specifications TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    // Product Images table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS product_images (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        image_path TEXT NOT NULL,
        image_type TEXT NOT NULL,
        prompt TEXT,
        generation_settings TEXT,
        created_at TEXT,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);

    // Product Templates table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS product_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        template_path TEXT NOT NULL,
        thumbnail_path TEXT NOT NULL,
        settings TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at TEXT
      )
    `);
  }

  private async seedInitialData(): Promise<void> {
    const now = new Date().toISOString();
    
    // Check if settings already exist
    const existingSettings = this.db.prepare('SELECT id FROM settings LIMIT 1').get();
    
    if (!existingSettings) {
      const defaultSettings = {
        id: 'default',
        brandVoice: {
          tone: 'professional',
          style: 'conversational',
          vocabulary: ['innovative', 'strategic', 'results-driven'],
          emojiUsage: 'strategic',
          callToAction: 'soft'
        },
        socialMedia: {
          facebook: { connected: false, accessToken: null },
          instagram: { connected: false, accessToken: null },
          linkedin: { connected: false, accessToken: null }
        },
        postingSchedule: {
          facebook: { times: ['09:00', '17:00'], days: ['monday', 'wednesday', 'friday'] },
          instagram: { times: ['10:00', '15:00', '19:00'], days: ['tuesday', 'thursday', 'saturday'] },
          linkedin: { times: ['08:00', '12:00'], days: ['monday', 'wednesday', 'friday'] }
        },
        createdAt: now,
        updatedAt: now
      };

      this.db.prepare(`
        INSERT INTO settings (id, brand_voice, social_media, posting_schedule, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        defaultSettings.id,
        JSON.stringify(defaultSettings.brandVoice),
        JSON.stringify(defaultSettings.socialMedia),
        JSON.stringify(defaultSettings.postingSchedule),
        defaultSettings.createdAt,
        defaultSettings.updatedAt
      );
    }

    // No sample data seeding - all data must be real
    console.log('✅ Database initialized without sample data');
  }





  async getSettings(): Promise<AppSettings> {
    const result = this.db.prepare('SELECT * FROM settings WHERE id = ?').get('default') as any;
    
    if (!result) {
      throw new Error('Settings not found');
    }

    return {
      id: result.id,
      brandVoice: JSON.parse(result.brand_voice),
      socialMedia: JSON.parse(result.social_media),
      postingSchedule: JSON.parse(result.posting_schedule),
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings, updatedAt: new Date().toISOString() };

    this.db.prepare(`
      UPDATE settings 
      SET brand_voice = ?, social_media = ?, posting_schedule = ?, updated_at = ?
      WHERE id = ?
    `).run(
      JSON.stringify(updatedSettings.brandVoice),
      JSON.stringify(updatedSettings.socialMedia),
      JSON.stringify(updatedSettings.postingSchedule),
      updatedSettings.updatedAt,
      updatedSettings.id
    );
  }

  async addMediaFile(file: Omit<MediaFile, 'id'>): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.db.prepare(`
      INSERT INTO media_files (
        id, filename, original_name, filepath, filetype, filesize, 
        dimensions, duration, upload_date, tags, category, used_count, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      file.filename,
      file.originalName,
      file.filepath,
      file.filetype,
      file.filesize,
      file.dimensions,
      file.duration,
      file.uploadDate,
      JSON.stringify(file.tags || []),
      file.category,
      file.usedCount,
      JSON.stringify(file.metadata || {})
    );

    return id;
  }

  async getMediaFiles(): Promise<MediaFile[]> {
    if (!this.db) {
      console.error('Database not initialized');
      return [];
    }
    
    const rows = this.db.prepare('SELECT * FROM media_files ORDER BY upload_date DESC').all() as any[];
    
    return rows.map((row: any) => ({
      id: row.id,
      filename: row.filename,
      originalName: row.original_name,
      filepath: row.filepath,
      filetype: row.filetype,
      filesize: row.filesize,
      dimensions: row.dimensions,
      duration: row.duration,
      uploadDate: row.upload_date,
      tags: JSON.parse(row.tags || '[]'),
      category: row.category,
      usedCount: row.used_count,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  async getMediaFileById(fileId: string): Promise<MediaFile | null> {
    if (!this.db) {
      console.error('Database not initialized');
      return null;
    }
    
    const row = this.db.prepare('SELECT * FROM media_files WHERE id = ?').get(fileId) as any;
    
    if (!row) {
      return null;
    }
    
    return {
      id: row.id,
      filename: row.filename,
      originalName: row.original_name,
      filepath: row.filepath,
      filetype: row.filetype,
      filesize: row.filesize,
      dimensions: row.dimensions,
      duration: row.duration,
      uploadDate: row.upload_date,
      tags: JSON.parse(row.tags || '[]'),
      category: row.category,
      usedCount: row.used_count,
      metadata: JSON.parse(row.metadata || '{}')
    };
  }

  async deleteMediaFile(fileId: string): Promise<void> {
    this.db.prepare('DELETE FROM media_files WHERE id = ?').run(fileId);
  }

  // Brand Voice Profile Management
  async addBrandVoiceProfile(profile: Omit<BrandVoiceProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `brand_voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    this.db.prepare(`
      INSERT INTO brand_voice_profiles (
        id, name, tone, style, vocabulary, emoji_usage, call_to_action, examples, confidence, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      profile.name,
      profile.tone,
      profile.style,
      JSON.stringify(profile.vocabulary),
      profile.emojiUsage,
      profile.callToAction,
      JSON.stringify(profile.examples),
      profile.confidence || 0.7,
      now,
      now
    );

    return id;
  }

  async getBrandVoiceProfiles(): Promise<BrandVoiceProfile[]> {
    const rows = this.db.prepare('SELECT * FROM brand_voice_profiles ORDER BY created_at DESC').all() as any[];
    
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      tone: row.tone,
      style: row.style,
      vocabulary: JSON.parse(row.vocabulary || '[]'),
      emojiUsage: row.emoji_usage,
      callToAction: row.call_to_action,
      examples: JSON.parse(row.examples || '[]'),
      confidence: row.confidence || 0.7,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getBrandVoiceProfileById(profileId: string): Promise<BrandVoiceProfile | null> {
    const row = this.db.prepare('SELECT * FROM brand_voice_profiles WHERE id = ?').get(profileId) as any;
    
    if (!row) {
      return null;
    }
    
    return {
      id: row.id,
      name: row.name,
      tone: row.tone,
      style: row.style,
      vocabulary: JSON.parse(row.vocabulary || '[]'),
      emojiUsage: row.emoji_usage,
      callToAction: row.call_to_action,
      examples: JSON.parse(row.examples || '[]'),
      confidence: row.confidence || 0.7,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async updateBrandVoiceProfile(profileId: string, updates: Partial<BrandVoiceProfile>): Promise<void> {
    const currentProfile = await this.getBrandVoiceProfileById(profileId);
    if (!currentProfile) {
      throw new Error('Brand voice profile not found');
    }

    const updatedProfile = { ...currentProfile, ...updates, updatedAt: new Date().toISOString() };

    this.db.prepare(`
      UPDATE brand_voice_profiles 
      SET name = ?, tone = ?, style = ?, vocabulary = ?, emoji_usage = ?, call_to_action = ?, examples = ?, confidence = ?, updated_at = ?
      WHERE id = ?
    `).run(
      updatedProfile.name,
      updatedProfile.tone,
      updatedProfile.style,
      JSON.stringify(updatedProfile.vocabulary),
      updatedProfile.emojiUsage,
      updatedProfile.callToAction,
      JSON.stringify(updatedProfile.examples),
      updatedProfile.confidence,
      updatedProfile.updatedAt,
      profileId
    );
  }

  async deleteBrandVoiceProfile(profileId: string): Promise<void> {
    this.db.prepare('DELETE FROM brand_voice_profiles WHERE id = ?').run(profileId);
  }

  // Brand Voice Training Data
  async addTrainingData(profileId: string, content: string, feedback?: 'positive' | 'negative'): Promise<string> {
    const id = `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    // Create training_data table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS brand_voice_training_data (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        content TEXT NOT NULL,
        feedback TEXT,
        created_at TEXT,
        FOREIGN KEY (profile_id) REFERENCES brand_voice_profiles (id)
      )
    `);

    this.db.prepare(`
      INSERT INTO brand_voice_training_data (id, profile_id, content, feedback, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, profileId, content, feedback || null, now);

    return id;
  }

  async getTrainingData(profileId: string): Promise<any[]> {
    // Create training_data table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS brand_voice_training_data (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        content TEXT NOT NULL,
        feedback TEXT,
        created_at TEXT,
        FOREIGN KEY (profile_id) REFERENCES brand_voice_profiles (id)
      )
    `);

    const rows = this.db.prepare('SELECT * FROM brand_voice_training_data WHERE profile_id = ? ORDER BY created_at DESC').all(profileId) as any[];
    
    return rows.map((row: any) => ({
      id: row.id,
      profileId: row.profile_id,
      content: row.content,
      feedback: row.feedback,
      createdAt: row.created_at
    }));
  }

  // Post operations
  async addPost(post: Omit<Post, 'id'>, customId?: string): Promise<string> {
    const id = customId || `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO posts (id, platform, content, media_files, scheduled_time, status, engagement, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      post.platform,
      post.content,
      JSON.stringify(post.mediaFiles),
      post.scheduledTime || null,
      post.status,
      JSON.stringify(post.engagement || {}),
      post.createdAt || now,
      post.updatedAt || now
    );

    return id;
  }

  async getPosts(): Promise<Post[]> {
    const rows = this.db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all() as any[];
    
    return rows.map((row: any) => ({
      id: row.id,
      platform: row.platform,
      content: row.content,
      mediaFiles: JSON.parse(row.media_files || '[]'),
      scheduledTime: row.scheduled_time,
      status: row.status,
      engagement: JSON.parse(row.engagement || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getPostById(postId: string): Promise<Post | null> {
    const row = this.db.prepare('SELECT * FROM posts WHERE id = ?').get(postId) as any;
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      platform: row.platform,
      content: row.content,
      mediaFiles: JSON.parse(row.media_files || '[]'),
      scheduledTime: row.scheduled_time,
      status: row.status,
      engagement: JSON.parse(row.engagement || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<void> {
    const currentPost = await this.getPostById(postId);
    if (!currentPost) {
      throw new Error('Post not found');
    }

    const updatedPost = { ...currentPost, ...updates, updatedAt: new Date().toISOString() };

    this.db.prepare(`
      UPDATE posts 
      SET platform = ?, content = ?, media_files = ?, scheduled_time = ?, status = ?, engagement = ?, updated_at = ?
      WHERE id = ?
    `).run(
      updatedPost.platform,
      updatedPost.content,
      JSON.stringify(updatedPost.mediaFiles),
      updatedPost.scheduledTime,
      updatedPost.status,
      JSON.stringify(updatedPost.engagement),
      updatedPost.updatedAt,
      postId
    );
  }

  async deletePost(postId: string): Promise<void> {
    this.db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
  }

  // Scheduled Jobs operations
  async addScheduledJob(job: Omit<ScheduledJob, 'id'>): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO scheduled_jobs (id, post_id, platform, content, media_files, scheduled_time, status, retry_count, max_retries, error_message, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      job.postId,
      job.platform,
      job.content,
      JSON.stringify(job.mediaFiles),
      job.scheduledTime,
      job.status,
      job.retryCount,
      job.maxRetries,
      job.errorMessage || null,
      job.createdAt || now,
      job.updatedAt || now
    );

    return id;
  }

  async getScheduledJobs(): Promise<ScheduledJob[]> {
    const rows = this.db.prepare('SELECT * FROM scheduled_jobs ORDER BY scheduled_time ASC').all() as any[];
    
    return rows.map((row: any) => ({
      id: row.id,
      postId: row.post_id,
      platform: row.platform,
      content: row.content,
      mediaFiles: JSON.parse(row.media_files || '[]'),
      scheduledTime: row.scheduled_time,
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      errorMessage: row.error_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getScheduledJobById(jobId: string): Promise<ScheduledJob | null> {
    const row = this.db.prepare('SELECT * FROM scheduled_jobs WHERE id = ?').get(jobId) as any;
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      postId: row.post_id,
      platform: row.platform,
      content: row.content,
      mediaFiles: JSON.parse(row.media_files || '[]'),
      scheduledTime: row.scheduled_time,
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      errorMessage: row.error_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async updateScheduledJob(jobId: string, updates: Partial<ScheduledJob>): Promise<void> {
    const currentJob = await this.getScheduledJobById(jobId);
    if (!currentJob) {
      throw new Error('Scheduled job not found');
    }

    const updatedJob = { ...currentJob, ...updates, updatedAt: new Date().toISOString() };

    this.db.prepare(`
      UPDATE scheduled_jobs 
      SET post_id = ?, platform = ?, content = ?, media_files = ?, scheduled_time = ?, status = ?, retry_count = ?, max_retries = ?, error_message = ?, updated_at = ?
      WHERE id = ?
    `).run(
      updatedJob.postId,
      updatedJob.platform,
      updatedJob.content,
      JSON.stringify(updatedJob.mediaFiles),
      updatedJob.scheduledTime,
      updatedJob.status,
      updatedJob.retryCount,
      updatedJob.maxRetries,
      updatedJob.errorMessage,
      updatedJob.updatedAt,
      jobId
    );
  }

  async deleteScheduledJob(jobId: string): Promise<void> {
    this.db.prepare('DELETE FROM scheduled_jobs WHERE id = ?').run(jobId);
  }

  async getScheduledPosts(): Promise<Post[]> {
    const rows = this.db.prepare("SELECT * FROM posts WHERE status = 'scheduled' AND scheduled_time IS NOT NULL ORDER BY scheduled_time ASC").all() as any[];
    
    return rows.map((row: any) => ({
      id: row.id,
      platform: row.platform,
      content: row.content,
      mediaFiles: JSON.parse(row.media_files || '[]'),
      scheduledTime: row.scheduled_time,
      status: row.status,
      engagement: JSON.parse(row.engagement || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  // Social Media Accounts methods
  async addSocialMediaAccount(account: Omit<SocialMediaAccount, 'id'>): Promise<string> {
    const id = `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.db.prepare(`
      INSERT INTO social_media_accounts (
        id, platform, account_name, access_token, refresh_token, expires_at,
        page_id, business_account_id, organization_id, app_secret, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      account.platform,
      account.accountName,
      account.accessToken,
      account.refreshToken,
      account.expiresAt,
      account.pageId,
      account.businessAccountId,
      account.organizationId,
      account.appSecret,
      account.isActive ? 1 : 0,
      account.createdAt,
      account.updatedAt
    );

    return id;
  }

  async getSocialMediaAccounts(): Promise<SocialMediaAccount[]> {
    const rows = this.db.prepare('SELECT * FROM social_media_accounts ORDER BY created_at DESC').all() as any[];
    
    return rows.map((row: any) => ({
      id: row.id,
      platform: row.platform,
      accountName: row.account_name,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      expiresAt: row.expires_at,
      pageId: row.page_id,
      businessAccountId: row.business_account_id,
      organizationId: row.organization_id,
      appSecret: row.app_secret,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getSocialMediaAccount(accountId: string): Promise<SocialMediaAccount | null> {
    const row = this.db.prepare('SELECT * FROM social_media_accounts WHERE id = ?').get(accountId) as any;
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      platform: row.platform,
      accountName: row.account_name,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      expiresAt: row.expires_at,
      pageId: row.page_id,
      businessAccountId: row.business_account_id,
      organizationId: row.organization_id,
      appSecret: row.app_secret,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async updateSocialMediaAccount(accountId: string, updates: Partial<SocialMediaAccount>): Promise<void> {
    const currentAccount = await this.getSocialMediaAccount(accountId);
    if (!currentAccount) {
      throw new Error('Social media account not found');
    }

    const updatedAccount = { ...currentAccount, ...updates, updatedAt: new Date().toISOString() };

    this.db.prepare(`
      UPDATE social_media_accounts 
      SET platform = ?, account_name = ?, access_token = ?, refresh_token = ?, expires_at = ?,
          page_id = ?, business_account_id = ?, organization_id = ?, app_secret = ?, is_active = ?, updated_at = ?
      WHERE id = ?
    `).run(
      updatedAccount.platform,
      updatedAccount.accountName,
      updatedAccount.accessToken,
      updatedAccount.refreshToken,
      updatedAccount.expiresAt,
      updatedAccount.pageId,
      updatedAccount.businessAccountId,
      updatedAccount.organizationId,
      updatedAccount.appSecret,
      updatedAccount.isActive ? 1 : 0,
      updatedAccount.updatedAt,
      accountId
    );
  }

  async deleteSocialMediaAccount(accountId: string): Promise<void> {
    this.db.prepare('DELETE FROM social_media_accounts WHERE id = ?').run(accountId);
  }

  // Posting Jobs methods
  async createPostingJob(job: PostingJob): Promise<void> {
    this.db.prepare(`
      INSERT INTO posting_jobs (
        id, post_id, platform, account_id, content, media_files, scheduled_time,
        status, retry_count, max_retries, last_error, result, posted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      job.id,
      job.postId,
      job.platform,
      job.accountId,
      job.content,
      JSON.stringify(job.mediaFiles),
      job.scheduledTime,
      job.status,
      job.retryCount,
      job.maxRetries,
      job.lastError,
      job.result ? JSON.stringify(job.result) : null,
      job.postedAt,
      job.createdAt,
      job.updatedAt
    );
  }

  async getPendingPostingJobs(): Promise<PostingJob[]> {
    const rows = this.db.prepare("SELECT * FROM posting_jobs WHERE status = 'pending' ORDER BY scheduled_time ASC").all() as any[];
    
    return rows.map((row: any) => ({
      id: row.id,
      postId: row.post_id,
      platform: row.platform,
      accountId: row.account_id,
      content: row.content,
      mediaFiles: JSON.parse(row.media_files || '[]'),
      scheduledTime: row.scheduled_time,
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      lastError: row.last_error,
      result: row.result ? JSON.parse(row.result) : undefined,
      postedAt: row.posted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getAllPostingJobs(): Promise<PostingJob[]> {
    const rows = this.db.prepare("SELECT * FROM posting_jobs ORDER BY created_at DESC").all() as any[];
    
    return rows.map((row: any) => ({
      id: row.id,
      postId: row.post_id,
      platform: row.platform,
      accountId: row.account_id,
      content: row.content,
      mediaFiles: JSON.parse(row.media_files || '[]'),
      scheduledTime: row.scheduled_time,
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      lastError: row.last_error,
      result: row.result ? JSON.parse(row.result) : undefined,
      postedAt: row.posted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getPostingJob(jobId: string): Promise<PostingJob | null> {
    const row = this.db.prepare('SELECT * FROM posting_jobs WHERE id = ?').get(jobId) as any;
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      postId: row.post_id,
      platform: row.platform,
      accountId: row.account_id,
      content: row.content,
      mediaFiles: JSON.parse(row.media_files || '[]'),
      scheduledTime: row.scheduled_time,
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      lastError: row.last_error,
      result: row.result ? JSON.parse(row.result) : undefined,
      postedAt: row.posted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async updatePostingJob(job: PostingJob): Promise<void> {
    this.db.prepare(`
      UPDATE posting_jobs 
      SET post_id = ?, platform = ?, account_id = ?, content = ?, media_files = ?, scheduled_time = ?,
          status = ?, retry_count = ?, max_retries = ?, last_error = ?, result = ?, posted_at = ?, updated_at = ?
      WHERE id = ?
    `).run(
      job.postId,
      job.platform,
      job.accountId,
      job.content,
      JSON.stringify(job.mediaFiles),
      job.scheduledTime,
      job.status,
      job.retryCount,
      job.maxRetries,
      job.lastError,
      job.result ? JSON.stringify(job.result) : null,
      job.postedAt,
      job.updatedAt,
      job.id
    );
  }

  async deletePostingJob(jobId: string): Promise<void> {
    this.db.prepare('DELETE FROM posting_jobs WHERE id = ?').run(jobId);
  }

  // Posting Logs methods
  async createPostingLog(log: PostingLog): Promise<void> {
    this.db.prepare(`
      INSERT INTO posting_logs (
        id, job_id, platform, account_id, content, media_files, status,
        retry_count, max_retries, last_error, result, scheduled_time, posted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      log.id,
      log.jobId,
      log.platform,
      log.accountId,
      log.content,
      JSON.stringify(log.mediaFiles),
      log.status,
      log.retryCount,
      log.maxRetries,
      log.lastError,
      log.result ? JSON.stringify(log.result) : null,
      log.scheduledTime,
      log.postedAt,
      log.createdAt,
      log.updatedAt
    );
  }

  async getPostingLogs(limit: number = 50, offset: number = 0): Promise<PostingLog[]> {
    const rows = this.db.prepare('SELECT * FROM posting_logs ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset) as any[];
    
    return rows.map((row: any) => ({
      id: row.id,
      jobId: row.job_id,
      platform: row.platform,
      accountId: row.account_id,
      content: row.content,
      mediaFiles: JSON.parse(row.media_files || '[]'),
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      lastError: row.last_error,
      result: row.result ? JSON.parse(row.result) : undefined,
      scheduledTime: row.scheduled_time,
      postedAt: row.posted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  close(): void {
    if (this.db) {
      this.db.close();
    }
  }

  // Analytics methods
  async getAnalyticsData(): Promise<{
    facebook: { reach: number; posts: number; engagement: number };
    instagram: { reach: number; posts: number; engagement: number };
    linkedin: { reach: number; posts: number; engagement: number };
    total: { reach: number; posts: number; engagement: number };
  }> {
    // Get all published posts
    const posts = await this.getPosts();
    const publishedPosts = posts.filter(post => post.status === 'published');
    
    // Get social media accounts
    const accounts = await this.getSocialMediaAccounts();
    const activeAccounts = accounts.filter(account => account.isActive);
    
    // Calculate metrics by platform
    const analytics = {
      facebook: { reach: 0, posts: 0, engagement: 0 },
      instagram: { reach: 0, posts: 0, engagement: 0 },
      linkedin: { reach: 0, posts: 0, engagement: 0 },
      total: { reach: 0, posts: 0, engagement: 0 }
    };

    // Count posts by platform
    publishedPosts.forEach(post => {
      const platform = post.platform.toLowerCase();
      if (analytics[platform as keyof typeof analytics]) {
        analytics[platform as keyof typeof analytics].posts++;
        
        // Calculate reach and engagement from post data
        if (post.engagement) {
          const engagement = post.engagement;
          const reach = engagement.reach || engagement.impressions || 0;
          const engagementRate = engagement.likes || engagement.comments || engagement.shares || 0;
          
          analytics[platform as keyof typeof analytics].reach += reach;
          analytics[platform as keyof typeof analytics].engagement += engagementRate;
        }
      }
    });

    // Calculate totals
    analytics.total.reach = analytics.facebook.reach + analytics.instagram.reach + analytics.linkedin.reach;
    analytics.total.posts = analytics.facebook.posts + analytics.instagram.posts + analytics.linkedin.posts;
    analytics.total.engagement = analytics.facebook.engagement + analytics.instagram.engagement + analytics.linkedin.engagement;

    return analytics;
  }

  async getPendingActions(): Promise<string[]> {
    const actions: string[] = [];
    
    // Check for posts that need responses (comments)
    const posts = await this.getPosts();
    const postsWithComments = posts.filter(post => 
      post.engagement && post.engagement.comments && post.engagement.comments > 0
    );
    
    if (postsWithComments.length > 0) {
      actions.push(`${postsWithComments.length} posts have comments that need responses`);
    }
    
    // Check for pending posts
    const pendingPosts = posts.filter(post => post.status === 'scheduled');
    if (pendingPosts.length > 0) {
      actions.push(`${pendingPosts.length} posts are scheduled and pending`);
    }
    
    // Check for failed posts
    const failedPosts = posts.filter(post => post.status === 'failed');
    if (failedPosts.length > 0) {
      actions.push(`${failedPosts.length} posts failed and need attention`);
    }
    
    // Check for media files that need processing
    const mediaFiles = await this.getMediaFiles();
    const unprocessedMedia = mediaFiles.filter(file => !file.metadata || !file.metadata.thumbnailPath);
    if (unprocessedMedia.length > 0) {
      actions.push(`${unprocessedMedia.length} media files need processing`);
    }
    
    return actions;
  }

  async getTodaysSchedule(): Promise<Array<{
    time: string;
    platform: string;
    content: string;
    status: string;
  }>> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    // Get scheduled posts for today
    const scheduledPosts = await this.getScheduledPosts();
    const todaysPosts = scheduledPosts.filter(post => {
      const scheduledTime = new Date(post.scheduledTime);
      return scheduledTime >= startOfDay && scheduledTime < endOfDay;
    });
    
    return todaysPosts.map(post => ({
      time: new Date(post.scheduledTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      platform: post.platform.charAt(0).toUpperCase() + post.platform.slice(1),
      content: post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content,
      status: post.status
    }));
  }

  async getPlatformStats(): Promise<{
    facebook: { connected: boolean; accountName?: string };
    instagram: { connected: boolean; accountName?: string };
    linkedin: { connected: boolean; accountName?: string };
  }> {
    const accounts = await this.getSocialMediaAccounts();
    
    const stats = {
      facebook: { connected: false, accountName: undefined as string | undefined },
      instagram: { connected: false, accountName: undefined as string | undefined },
      linkedin: { connected: false, accountName: undefined as string | undefined }
    };
    
    accounts.forEach(account => {
      if (account.isActive) {
        const platform = account.platform.toLowerCase() as keyof typeof stats;
        if (stats[platform]) {
          stats[platform].connected = true;
          stats[platform].accountName = account.accountName;
        }
      }
    });
    
    return stats;
  }

  // Engagement methods
  async addEngagementInteraction(interaction: {
    platform: string;
    postId?: string;
    interactionType: 'comment' | 'message' | 'mention';
    interactionId: string;
    authorName: string;
    authorId?: string;
    content: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    sentimentScore?: number;
    isProcessed?: boolean;
    processedAt?: string;
  }): Promise<string> {
    const id = `engagement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await this.db.exec(`
      INSERT INTO engagement_interactions (
        id, platform, post_id, interaction_type, interaction_id, author_name, 
        author_id, content, sentiment, sentiment_score, is_processed, 
        processed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, interaction.platform, interaction.postId, interaction.interactionType,
      interaction.interactionId, interaction.authorName, interaction.authorId,
      interaction.content, interaction.sentiment, interaction.sentimentScore,
      interaction.isProcessed || false, interaction.processedAt, now, now
    ]);
    
    return id;
  }

  async getEngagementInteractions(filters: {
    platform?: string;
    postId?: string;
    interactionType?: string;
    isProcessed?: boolean;
    limit?: number;
  } = {}): Promise<Array<{
    id: string;
    platform: string;
    postId?: string;
    interactionType: string;
    interactionId: string;
    authorName: string;
    authorId?: string;
    content: string;
    sentiment?: string;
    sentimentScore?: number;
    isProcessed: boolean;
    processedAt?: string;
    createdAt: string;
    updatedAt: string;
  }>> {
    let query = 'SELECT * FROM engagement_interactions WHERE 1=1';
    const params: any[] = [];

    if (filters.platform) {
      query += ' AND platform = ?';
      params.push(filters.platform);
    }

    if (filters.postId) {
      query += ' AND post_id = ?';
      params.push(filters.postId);
    }

    if (filters.interactionType) {
      query += ' AND interaction_type = ?';
      params.push(filters.interactionType);
    }

    if (filters.isProcessed !== undefined) {
      query += ' AND is_processed = ?';
      params.push(filters.isProcessed);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const rows = this.db.prepare(query).all(...params);
    return rows.map((row: any) => ({
      id: row.id,
      platform: row.platform,
      postId: row.post_id,
      interactionType: row.interaction_type,
      interactionId: row.interaction_id,
      authorName: row.author_name,
      authorId: row.author_id,
      content: row.content,
      sentiment: row.sentiment,
      sentimentScore: row.sentiment_score,
      isProcessed: row.is_processed,
      processedAt: row.processed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async updateEngagementInteraction(id: string, updates: {
    isProcessed?: boolean;
    processedAt?: string;
    sentiment?: string;
    sentimentScore?: number;
  }): Promise<void> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await this.db.exec(`
      UPDATE engagement_interactions 
      SET ${fields.join(', ')}
      WHERE id = ?
    `, values);
  }

  async addQuickReply(quickReply: {
    name: string;
    content: string;
    category: string;
    platform?: string;
    isActive?: boolean;
  }): Promise<string> {
    const id = `quick_reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await this.db.exec(`
      INSERT INTO quick_replies (
        id, name, content, category, platform, is_active, usage_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, quickReply.name, quickReply.content, quickReply.category,
      quickReply.platform, quickReply.isActive !== false, 0, now, now
    ]);
    
    return id;
  }

  async getQuickReplies(filters: {
    category?: string;
    platform?: string;
    isActive?: boolean;
  } = {}): Promise<Array<{
    id: string;
    name: string;
    content: string;
    category: string;
    platform?: string;
    isActive: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
  }>> {
    let query = 'SELECT * FROM quick_replies WHERE 1=1';
    const params: any[] = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.platform) {
      query += ' AND platform = ?';
      params.push(filters.platform);
    }

    if (filters.isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.isActive);
    }

    query += ' ORDER BY usage_count DESC, name ASC';

    const rows = this.db.prepare(query).all(...params);
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      content: row.content,
      category: row.category,
      platform: row.platform,
      isActive: row.is_active,
      usageCount: row.usage_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async updateQuickReplyUsage(id: string): Promise<void> {
    await this.db.exec(`
      UPDATE quick_replies 
      SET usage_count = usage_count + 1, updated_at = ?
      WHERE id = ?
    `, [new Date().toISOString(), id]);
  }

  // Analytics Methods
  async saveAnalyticsMetrics(metrics: {
    postId: string;
    platform: string;
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    engagementRate: number;
    sentimentScore: number;
  }): Promise<string> {
    const id = `metrics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    this.db.prepare(`
      INSERT INTO analytics_metrics (
        id, post_id, platform, reach, impressions, likes, comments, shares, clicks,
        engagement_rate, sentiment_score, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      metrics.postId,
      metrics.platform,
      metrics.reach,
      metrics.impressions,
      metrics.likes,
      metrics.comments,
      metrics.shares,
      metrics.clicks,
      metrics.engagementRate,
      metrics.sentimentScore,
      now,
      now
    );
    
    return id;
  }

  async getAnalyticsMetrics(
    postId?: string,
    platform?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsMetrics[]> {
    let query = 'SELECT * FROM analytics_metrics WHERE 1=1';
    const params: any[] = [];
    
    if (postId) {
      query += ' AND post_id = ?';
      params.push(postId);
    }
    
    if (platform) {
      query += ' AND platform = ?';
      params.push(platform);
    }
    
    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const rows = this.db.prepare(query).all(...params);
    return rows.map((row: any) => ({
      id: row.id,
      postId: row.post_id,
      platform: row.platform,
      reach: row.reach,
      impressions: row.impressions,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      clicks: row.clicks,
      engagementRate: row.engagement_rate,
      sentimentScore: row.sentiment_score,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async clearAnalyticsMetrics(): Promise<void> {
    console.log('🗑️ Clearing all analytics metrics from database...');
    this.db.prepare('DELETE FROM analytics_metrics').run();
    console.log('✅ Analytics metrics cleared successfully');
  }

  async clearAnalyticsMetricsForPost(postId: string, platform: string): Promise<void> {
    console.log(`🗑️ Clearing analytics metrics for post ${postId} on ${platform}...`);
    this.db.prepare('DELETE FROM analytics_metrics WHERE post_id = ? AND platform = ?').run(postId, platform);
    console.log(`✅ Analytics metrics cleared for post ${postId}`);
  }

  async getAnalyticsTrends(platform?: string, days: number = 30): Promise<AnalyticsTrend[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let query = 'SELECT * FROM analytics_trends WHERE date >= ? AND date <= ?';
    const params: any[] = [startDate, endDate];
    
    if (platform) {
      query += ' AND platform = ?';
      params.push(platform);
    }
    
    query += ' ORDER BY date ASC';
    
    const rows = this.db.prepare(query).all(...params);
    return rows.map((row: any) => ({
      id: row.id,
      platform: row.platform,
      date: row.date,
      totalReach: row.total_reach,
      totalEngagement: row.total_engagement,
      totalPosts: row.total_posts,
      avgEngagementRate: row.avg_engagement_rate,
      topContentType: row.top_content_type,
      createdAt: row.created_at
    }));
  }

  async saveAnalyticsTrend(trend: {
    platform: string;
    date: string;
    totalReach: number;
    totalEngagement: number;
    totalPosts: number;
    avgEngagementRate: number;
    topContentType: string;
  }): Promise<string> {
    const id = `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    this.db.prepare(`
      INSERT INTO analytics_trends (
        id, platform, date, total_reach, total_engagement, total_posts,
        avg_engagement_rate, top_content_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      trend.platform,
      trend.date,
      trend.totalReach,
      trend.totalEngagement,
      trend.totalPosts,
      trend.avgEngagementRate,
      trend.topContentType,
      now
    );
    
    return id;
  }

  async getBrandVoicePerformance(
    voiceProfileId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<BrandVoicePerformance[]> {
    let query = 'SELECT * FROM brand_voice_performance WHERE 1=1';
    const params: any[] = [];
    
    if (voiceProfileId) {
      query += ' AND voice_profile_id = ?';
      params.push(voiceProfileId);
    }
    
    if (startDate) {
      query += ' AND period_start >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND period_end <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const rows = this.db.prepare(query).all(...params);
    return rows.map((row: any) => ({
      id: row.id,
      voiceProfileId: row.voice_profile_id,
      tone: row.tone,
      style: row.style,
      engagementRate: row.engagement_rate,
      sentimentScore: row.sentiment_score,
      postCount: row.post_count,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      createdAt: row.created_at
    }));
  }

  async saveBrandVoicePerformance(performance: {
    voiceProfileId: string;
    tone: string;
    style: string;
    engagementRate: number;
    sentimentScore: number;
    postCount: number;
    periodStart: string;
    periodEnd: string;
  }): Promise<string> {
    const id = `voice_perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    this.db.prepare(`
      INSERT INTO brand_voice_performance (
        id, voice_profile_id, tone, style, engagement_rate, sentiment_score,
        post_count, period_start, period_end, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      performance.voiceProfileId,
      performance.tone,
      performance.style,
      performance.engagementRate,
      performance.sentimentScore,
      performance.postCount,
      performance.periodStart,
      performance.periodEnd,
      now
    );
    
    return id;
  }

  async getTopPosts(platform?: string, limit: number = 10, days: number = 30): Promise<TopPost[]> {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    let query = `
      SELECT p.*, am.reach, am.impressions, am.likes, am.comments, am.shares, am.engagement_rate
      FROM posts p
      LEFT JOIN analytics_metrics am ON p.id = am.post_id
      WHERE p.created_at >= ? AND p.created_at <= ?
    `;
    const params: any[] = [startDate, endDate];
    
    if (platform) {
      query += ' AND p.platform = ?';
      params.push(platform);
    }
    
    query += ' ORDER BY am.engagement_rate DESC LIMIT ?';
    params.push(limit);
    
    const rows = this.db.prepare(query).all(...params);
    return rows.map((row: any) => ({
      id: row.id,
      platform: row.platform,
      content: row.content,
      mediaFiles: row.media_files ? JSON.parse(row.media_files) : [],
      scheduledTime: row.scheduled_time,
      status: row.status,
      engagement: row.engagement ? JSON.parse(row.engagement) : {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      analytics: {
        reach: row.reach || 0,
        impressions: row.impressions || 0,
        likes: row.likes || 0,
        comments: row.comments || 0,
        shares: row.shares || 0,
        engagementRate: row.engagement_rate || 0
      }
    }));
  }

  // Product Library methods
  async addProduct(product: {
    name: string;
    description: string;
    category: string;
    price?: number;
    sku?: string;
    mediaFiles: string[];
    tags: string[];
    features: string[];
    specifications: Record<string, any>;
    isActive: boolean;
  }): Promise<string> {
    const id = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    this.db.prepare(`
      INSERT INTO products (
        id, name, description, category, price, sku, media_files, tags, features, 
        specifications, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      product.name,
      product.description,
      product.category,
      product.price || null,
      product.sku || null,
      JSON.stringify(product.mediaFiles),
      JSON.stringify(product.tags),
      JSON.stringify(product.features),
      JSON.stringify(product.specifications),
      product.isActive ? 1 : 0,
      now,
      now
    );
    
    return id;
  }

  async getProducts(category?: string, isActive?: boolean): Promise<Product[]> {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(isActive ? 1 : 0);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const rows = this.db.prepare(query).all(...params);
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      price: row.price,
      sku: row.sku,
      mediaFiles: row.media_files ? JSON.parse(row.media_files) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
      features: row.features ? JSON.parse(row.features) : [],
      specifications: row.specifications ? JSON.parse(row.specifications) : {},
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getProduct(productId: string): Promise<Product | null> {
    const row = this.db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      price: row.price,
      sku: row.sku,
      mediaFiles: row.media_files ? JSON.parse(row.media_files) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
      features: row.features ? JSON.parse(row.features) : [],
      specifications: row.specifications ? JSON.parse(row.specifications) : {},
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const setClauses: string[] = [];
    const params: any[] = [];
    
    if (updates.name !== undefined) {
      setClauses.push('name = ?');
      params.push(updates.name);
    }
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      params.push(updates.description);
    }
    if (updates.category !== undefined) {
      setClauses.push('category = ?');
      params.push(updates.category);
    }
    if (updates.price !== undefined) {
      setClauses.push('price = ?');
      params.push(updates.price);
    }
    if (updates.sku !== undefined) {
      setClauses.push('sku = ?');
      params.push(updates.sku);
    }
    if (updates.mediaFiles !== undefined) {
      setClauses.push('media_files = ?');
      params.push(JSON.stringify(updates.mediaFiles));
    }
    if (updates.tags !== undefined) {
      setClauses.push('tags = ?');
      params.push(JSON.stringify(updates.tags));
    }
    if (updates.features !== undefined) {
      setClauses.push('features = ?');
      params.push(JSON.stringify(updates.features));
    }
    if (updates.specifications !== undefined) {
      setClauses.push('specifications = ?');
      params.push(JSON.stringify(updates.specifications));
    }
    if (updates.isActive !== undefined) {
      setClauses.push('is_active = ?');
      params.push(updates.isActive ? 1 : 0);
    }
    
    setClauses.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(productId);
    
    this.db.prepare(`UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
  }

  async deleteProduct(productId: string): Promise<void> {
    this.db.prepare('DELETE FROM products WHERE id = ?').run(productId);
  }

  async addProductImage(image: {
    productId: string;
    imagePath: string;
    imageType: 'main' | 'detail' | 'lifestyle' | 'in-use' | 'generated';
    prompt?: string;
    generationSettings?: {
      style: string;
      background: string;
      lighting: string;
      composition: string;
    };
  }): Promise<string> {
    const id = `product_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    this.db.prepare(`
      INSERT INTO product_images (
        id, product_id, image_path, image_type, prompt, generation_settings, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      image.productId,
      image.imagePath,
      image.imageType,
      image.prompt || null,
      image.generationSettings ? JSON.stringify(image.generationSettings) : null,
      now
    );
    
    return id;
  }

  async getProductImages(productId: string): Promise<ProductImage[]> {
    const rows = this.db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY created_at DESC').all(productId);
    return rows.map((row: any) => ({
      id: row.id,
      productId: row.product_id,
      imagePath: row.image_path,
      imageType: row.image_type,
      prompt: row.prompt,
      generationSettings: row.generation_settings ? JSON.parse(row.generation_settings) : undefined,
      createdAt: row.created_at
    }));
  }

  async deleteProductImage(imageId: string): Promise<void> {
    this.db.prepare('DELETE FROM product_images WHERE id = ?').run(imageId);
  }

  async addProductTemplate(template: {
    name: string;
    description: string;
    category: string;
    templatePath: string;
    thumbnailPath: string;
    settings: {
      width: number;
      height: number;
      format: string;
      quality: number;
    };
    isActive: boolean;
  }): Promise<string> {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    this.db.prepare(`
      INSERT INTO product_templates (
        id, name, description, category, template_path, thumbnail_path, settings, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      template.name,
      template.description,
      template.category,
      template.templatePath,
      template.thumbnailPath,
      JSON.stringify(template.settings),
      template.isActive ? 1 : 0,
      now
    );
    
    return id;
  }

  async getProductTemplates(category?: string): Promise<ProductTemplate[]> {
    let query = 'SELECT * FROM product_templates WHERE is_active = 1';
    const params: any[] = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const rows = this.db.prepare(query).all(...params);
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      templatePath: row.template_path,
      thumbnailPath: row.thumbnail_path,
      settings: JSON.parse(row.settings),
      isActive: row.is_active === 1,
      createdAt: row.created_at
    }));
  }

  async updateProductTemplate(templateId: string, updates: Partial<ProductTemplate>): Promise<void> {
    const setClauses: string[] = [];
    const params: any[] = [];
    
    if (updates.name !== undefined) {
      setClauses.push('name = ?');
      params.push(updates.name);
    }
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      params.push(updates.description);
    }
    if (updates.category !== undefined) {
      setClauses.push('category = ?');
      params.push(updates.category);
    }
    if (updates.templatePath !== undefined) {
      setClauses.push('template_path = ?');
      params.push(updates.templatePath);
    }
    if (updates.thumbnailPath !== undefined) {
      setClauses.push('thumbnail_path = ?');
      params.push(updates.thumbnailPath);
    }
    if (updates.settings !== undefined) {
      setClauses.push('settings = ?');
      params.push(JSON.stringify(updates.settings));
    }
    if (updates.isActive !== undefined) {
      setClauses.push('is_active = ?');
      params.push(updates.isActive ? 1 : 0);
    }
    
    params.push(templateId);
    
    this.db.prepare(`UPDATE product_templates SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
  }

  async deleteProductTemplate(templateId: string): Promise<void> {
    this.db.prepare('DELETE FROM product_templates WHERE id = ?').run(templateId);
  }

  // Clear all posts from database
  async clearPosts(): Promise<void> {
    console.log('🗑️ Clearing all posts from database...');
    this.db.prepare('DELETE FROM posts').run();
    console.log('✅ All posts cleared from database');
  }

  // Force refresh account data to get latest tokens
  async refreshAccountData(): Promise<void> {
    console.log('🔄 Refreshing account data from database...');
    // This will force a fresh read from the database
    // The actual refresh happens when we call getSocialMediaAccounts() again
    console.log('✅ Account data refresh initiated');
  }

} 