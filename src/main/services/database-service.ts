import { AppDatabase } from '../database';
import { 
  AppSettings, 
  MediaFile, 
  BrandVoiceProfile, 
  Post, 
  ScheduledJob, 
  AnalyticsMetrics, 
  AnalyticsTrend,
  Product
} from '../database';
import { SocialMediaAccount } from '../social-connectors';

export class DatabaseService {
  private database: AppDatabase;

  constructor(database: AppDatabase) {
    this.database = database;
  }

  // Settings operations
  async getSettings(): Promise<AppSettings> {
    return await this.database.getSettings();
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    await this.database.updateSettings(updates);
  }

  // Brand Voice operations
  async getBrandVoiceProfiles(): Promise<BrandVoiceProfile[]> {
    return await this.database.getBrandVoiceProfiles();
  }

  async createBrandVoiceProfile(profile: Omit<BrandVoiceProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return await this.database.addBrandVoiceProfile(profile);
  }

  async updateBrandVoiceProfile(id: string, updates: Partial<BrandVoiceProfile>): Promise<void> {
    await this.database.updateBrandVoiceProfile(id, updates);
  }

  async deleteBrandVoiceProfile(id: string): Promise<void> {
    await this.database.deleteBrandVoiceProfile(id);
  }

  // Post operations
  async getPosts(): Promise<Post[]> {
    return await this.database.getPosts();
  }

  async getPostById(id: string): Promise<Post | null> {
    return await this.database.getPostById(id);
  }

  async createPost(post: Omit<Post, 'id'>): Promise<string> {
    return await this.database.addPost(post);
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<void> {
    await this.database.updatePost(id, updates);
  }

  async deletePost(id: string): Promise<void> {
    await this.database.deletePost(id);
  }

  // Scheduled Job operations
  async getScheduledJobs(): Promise<ScheduledJob[]> {
    return await this.database.getScheduledJobs();
  }

  async createScheduledJob(job: Omit<ScheduledJob, 'id'>): Promise<string> {
    return await this.database.addScheduledJob(job);
  }

  async updateScheduledJob(id: string, updates: Partial<ScheduledJob>): Promise<void> {
    await this.database.updateScheduledJob(id, updates);
  }

  async deleteScheduledJob(id: string): Promise<void> {
    await this.database.deleteScheduledJob(id);
  }

  // Analytics operations
  async getAnalyticsMetrics(): Promise<AnalyticsMetrics[]> {
    return await this.database.getAnalyticsMetrics();
  }

  async createAnalyticsMetrics(metrics: Omit<AnalyticsMetrics, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // This method doesn't exist in the database, so we'll need to implement it
    throw new Error('createAnalyticsMetrics not implemented');
  }

  async getAnalyticsTrends(): Promise<AnalyticsTrend[]> {
    return await this.database.getAnalyticsTrends();
  }

  // Social Media Account operations
  async getSocialMediaAccounts(): Promise<SocialMediaAccount[]> {
    return await this.database.getSocialMediaAccounts();
  }

  async createSocialMediaAccount(account: Omit<SocialMediaAccount, 'id'>): Promise<string> {
    return await this.database.addSocialMediaAccount(account);
  }

  async updateSocialMediaAccount(id: string, updates: Partial<SocialMediaAccount>): Promise<void> {
    await this.database.updateSocialMediaAccount(id, updates);
  }

  async deleteSocialMediaAccount(id: string): Promise<void> {
    await this.database.deleteSocialMediaAccount(id);
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await this.database.getProducts();
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // This method doesn't exist in the database, so we'll need to implement it
    throw new Error('createProduct not implemented');
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await this.database.updateProduct(id, updates);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.database.deleteProduct(id);
  }

  // Media operations
  async getMediaFiles(): Promise<MediaFile[]> {
    return await this.database.getMediaFiles();
  }

  async createMediaFile(file: Omit<MediaFile, 'id'>): Promise<string> {
    return await this.database.addMediaFile(file);
  }

  async updateMediaFile(id: string, updates: Partial<MediaFile>): Promise<void> {
    // This method doesn't exist in the database, so we'll need to implement it
    throw new Error('updateMediaFile not implemented');
  }

  async deleteMediaFile(id: string): Promise<void> {
    await this.database.deleteMediaFile(id);
  }

  // Utility operations
  async initialize(): Promise<void> {
    await this.database.initialize();
  }

  async close(): Promise<void> {
    await this.database.close();
  }
}
