import { ipcMain, dialog } from 'electron';
import { AppDatabase } from './database';
import { MediaManager } from './media-manager';
import { OllamaManager } from './ollama-manager';
import { AIManager } from './ai-manager';
import { PostingEngine } from './posting-engine';
import { SocialMediaManager } from './social-connectors';
import { AnalyticsService } from './analytics-service';

export class IPCManager {
  constructor(
    private database: AppDatabase,
    private mediaManager: MediaManager,
    private ollamaManager: OllamaManager,
    private aiManager: AIManager,
    private postingEngine: PostingEngine,
    private socialMediaManager: SocialMediaManager,
    private analyticsService: AnalyticsService
  ) {}

  setupIPC(): void {
    this.setupDatabaseIPC();
    this.setupMediaIPC();
    this.setupAIIPC();
    this.setupPostingIPC();
    this.setupSocialMediaIPC();
    this.setupAnalyticsIPC();
    this.setupUtilityIPC();
  }

  private setupDatabaseIPC(): void {
    // Brand Voice Profiles
    ipcMain.handle('get-brand-voice-profiles', async () => {
      return await this.database.getBrandVoiceProfiles();
    });

    ipcMain.handle('create-brand-voice-profile', async (event, profile) => {
      return await this.database.addBrandVoiceProfile(profile);
    });

    ipcMain.handle('update-brand-voice-profile', async (event, id, updates) => {
      return await this.database.updateBrandVoiceProfile(id, updates);
    });

    ipcMain.handle('delete-brand-voice-profile', async (event, id) => {
      return await this.database.deleteBrandVoiceProfile(id);
    });

    // Posts
    ipcMain.handle('get-posts', async () => {
      return await this.database.getPosts();
    });

    ipcMain.handle('create-post', async (event, post) => {
      return await this.database.addPost(post);
    });

    ipcMain.handle('update-post', async (event, id, updates) => {
      return await this.database.updatePost(id, updates);
    });

    ipcMain.handle('delete-post', async (event, id) => {
      return await this.database.deletePost(id);
    });

    // Scheduled Jobs
    ipcMain.handle('get-scheduled-jobs', async () => {
      return await this.database.getScheduledJobs();
    });

    ipcMain.handle('create-scheduled-job', async (event, job) => {
      return await this.database.addScheduledJob(job);
    });

    ipcMain.handle('update-scheduled-job', async (event, id, updates) => {
      return await this.database.updateScheduledJob(id, updates);
    });

    ipcMain.handle('delete-scheduled-job', async (event, id) => {
      return await this.database.deleteScheduledJob(id);
    });

    // Analytics
    ipcMain.handle('get-analytics-metrics', async () => {
      return await this.database.getAnalyticsMetrics();
    });

    ipcMain.handle('get-analytics-trends', async () => {
      return await this.database.getAnalyticsTrends();
    });

    // Social Media Accounts
    ipcMain.handle('get-social-media-accounts', async () => {
      return await this.database.getSocialMediaAccounts();
    });

    ipcMain.handle('create-social-media-account', async (event, account) => {
      return await this.database.addSocialMediaAccount(account);
    });

    ipcMain.handle('update-social-media-account', async (event, id, updates) => {
      return await this.database.updateSocialMediaAccount(id, updates);
    });

    ipcMain.handle('delete-social-media-account', async (event, id) => {
      return await this.database.deleteSocialMediaAccount(id);
    });

    // Products
    ipcMain.handle('get-products', async () => {
      return await this.database.getProducts();
    });

    // Settings
    ipcMain.handle('get-app-settings', async () => {
      return await this.database.getSettings();
    });

    ipcMain.handle('update-app-settings', async (event, updates) => {
      return await this.database.updateSettings(updates);
    });
  }

  private setupMediaIPC(): void {
    ipcMain.handle('upload-media', async (event, filePath) => {
      return await this.mediaManager.uploadFile(filePath);
    });

    ipcMain.handle('get-media-files', async () => {
      return await this.mediaManager.getFiles();
    });

    ipcMain.handle('delete-media-file', async (event, id) => {
      return await this.mediaManager.deleteFile(id);
    });
  }

  private setupAIIPC(): void {
    // AI methods will be implemented later
  }

  private setupPostingIPC(): void {
    // Posting methods will be implemented later
  }

  private setupSocialMediaIPC(): void {
    // Social media methods will be implemented later
  }

  private setupAnalyticsIPC(): void {
    // Analytics methods will be implemented later
  }

  private setupUtilityIPC(): void {
    ipcMain.handle('select-file', async (event, options) => {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: options?.filters || []
      });
      return result.filePaths[0] || null;
    });

    ipcMain.handle('select-folder', async (event) => {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });
      return result.filePaths[0] || null;
    });

    ipcMain.handle('show-save-dialog', async (event, options) => {
      const result = await dialog.showSaveDialog({
        filters: options?.filters || []
      });
      return result.filePath || null;
    });
  }
}
