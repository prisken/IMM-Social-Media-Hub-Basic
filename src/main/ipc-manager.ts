import { ipcMain, dialog } from 'electron';
import { AppDatabase } from './database';
import { MediaManager } from './media-manager';
import { OllamaManager } from './ollama-manager';
import { AIManager } from './ai-manager';
import { PostingEngine } from './posting-engine';
import { SocialMediaManager } from './social-connectors';
import { AnalyticsService } from './analytics-service';
import { FacebookPostsFetcher } from './facebook-posts-fetcher';
import { InstagramPostsFetcher } from './instagram-posts-fetcher';

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
    this.setupCalendarIPC();
    this.setupEngagementIPC();
    this.setupSettingsIPC();
  }

  private setupDatabaseIPC(): void {
    // Brand Voice Profiles - Fix handler names
    ipcMain.handle('brand-voice:get-profiles', async () => {
      return await this.database.getBrandVoiceProfiles();
    });

    ipcMain.handle('brand-voice:create-profile', async (event, profile) => {
      return await this.database.addBrandVoiceProfile(profile);
    });

    ipcMain.handle('brand-voice:update-profile', async (event, id, updates) => {
      return await this.database.updateBrandVoiceProfile(id, updates);
    });

    ipcMain.handle('brand-voice:delete-profile', async (event, id) => {
      return await this.database.deleteBrandVoiceProfile(id);
    });

    // Posts - Fix handler names
    ipcMain.handle('db:get-posts', async () => {
      return await this.database.getPosts();
    });

    ipcMain.handle('db:create-post', async (event, post) => {
      return await this.database.addPost(post);
    });

    ipcMain.handle('db:update-post', async (event, id, updates) => {
      return await this.database.updatePost(id, updates);
    });

    ipcMain.handle('db:delete-post', async (event, id) => {
      return await this.database.deletePost(id);
    });

    // Products - Fix handler names
    ipcMain.handle('db:get-products', async () => {
      return await this.database.getProducts();
    });

    ipcMain.handle('db:get-product-templates', async () => {
      return await this.database.getProductTemplates();
    });

    // Settings - Fix handler names
    ipcMain.handle('db:get-settings', async () => {
      return await this.database.getSettings();
    });

    ipcMain.handle('db:update-settings', async (event, updates) => {
      return await this.database.updateSettings(updates);
    });

    // Keep original handlers for backward compatibility
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
    ipcMain.handle('media:get-files', async () => {
      return await this.mediaManager.getFiles();
    });

    ipcMain.handle('media:upload-file', async (event, filePath) => {
      return await this.mediaManager.uploadFile(filePath);
    });

    ipcMain.handle('media:delete-file', async (event, id) => {
      return await this.mediaManager.deleteFile(id);
    });

    // Keep original handlers for backward compatibility
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
    ipcMain.handle('ollama:get-models', async () => {
      return await this.ollamaManager.getModels();
    });

    ipcMain.handle('ollama:check-status', async () => {
      return await this.ollamaManager.checkStatus();
    });

    ipcMain.handle('ollama:generate-content', async (event, prompt, model) => {
      return await this.ollamaManager.generate(prompt, model);
    });
  }

  private setupPostingIPC(): void {
    // Posting methods will be implemented later
  }

  private setupCalendarIPC(): void {
    ipcMain.handle('calendar:get-scheduled-posts', async () => {
      return await this.database.getScheduledJobs();
    });

    ipcMain.handle('calendar:create-scheduled-post', async (event, post) => {
      return await this.database.addScheduledJob(post);
    });

    ipcMain.handle('calendar:update-scheduled-post', async (event, id, updates) => {
      return await this.database.updateScheduledJob(id, updates);
    });

    ipcMain.handle('calendar:delete-scheduled-post', async (event, id) => {
      return await this.database.deleteScheduledJob(id);
    });
  }

  private setupEngagementIPC(): void {
    ipcMain.handle('engagement:get-interactions', async () => {
      return await this.database.getEngagementInteractions();
    });

    ipcMain.handle('engagement:get-quick-replies', async () => {
      return await this.database.getQuickReplies();
    });

    ipcMain.handle('engagement:create-interaction', async (event, interaction) => {
      return await this.database.addEngagementInteraction(interaction);
    });

    ipcMain.handle('engagement:create-quick-reply', async (event, reply) => {
      return await this.database.addQuickReply(reply);
    });
  }

  private setupSettingsIPC(): void {
    ipcMain.handle('settings:get', async () => {
      return await this.database.getSettings();
    });

    ipcMain.handle('settings:update', async (event, updates) => {
      return await this.database.updateSettings(updates);
    });
  }

  private setupSocialMediaIPC(): void {
    ipcMain.handle('social:add-account', async (event, account) => {
      return await this.database.addSocialMediaAccount(account);
    });

    ipcMain.handle('social:get-accounts', async () => {
      return await this.database.getSocialMediaAccounts();
    });

    ipcMain.handle('social:get-accounts-for-platform', async (event, platform) => {
      const accounts = await this.database.getSocialMediaAccounts();
      return accounts.filter(account => account.platform === platform);
    });

    ipcMain.handle('social:update-account', async (event, accountId, updates) => {
      return await this.database.updateSocialMediaAccount(accountId, updates);
    });

    ipcMain.handle('social:delete-account', async (event, accountId) => {
      return await this.database.deleteSocialMediaAccount(accountId);
    });

    ipcMain.handle('social:test-connection', async (event, account) => {
      try {
        // For now, return a simple test result
        // In a real implementation, this would test the actual API connection
        return {
          success: true,
          connected: account.isActive || false,
          error: null
        };
      } catch (error) {
        return {
          success: false,
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
  }

  private setupAnalyticsIPC(): void {
    ipcMain.handle('analytics:get-data', async () => {
      try {
        // Use the new detailed analytics method
        const detailedAnalytics = await this.analyticsService.getAnalyticsWithContentTypes();
        
        // Format for backward compatibility
        const analyticsData = {
          facebook: { 
            reach: detailedAnalytics.facebook?.total?.reach || 0, 
            posts: detailedAnalytics.facebook?.total?.count || 0, 
            engagement: detailedAnalytics.facebook?.total?.engagement || 0,
            postsCount: detailedAnalytics.facebook?.posts?.count || 0,
            storiesReelsCount: detailedAnalytics.facebook?.storiesReels?.count || 0,
            postsReach: detailedAnalytics.facebook?.posts?.reach || 0,
            storiesReelsReach: detailedAnalytics.facebook?.storiesReels?.reach || 0,
            postsEngagement: detailedAnalytics.facebook?.posts?.engagement || 0,
            storiesReelsEngagement: detailedAnalytics.facebook?.storiesReels?.engagement || 0
          },
          instagram: { reach: 0, posts: 0, engagement: 0 },
          linkedin: { reach: 0, posts: 0, engagement: 0 },
          threads: { 
            reach: detailedAnalytics.threads?.total?.reach || 0, 
            posts: detailedAnalytics.threads?.total?.count || 0, 
            engagement: detailedAnalytics.threads?.total?.engagement || 0,
            postsCount: detailedAnalytics.threads?.posts?.count || 0,
            storiesReelsCount: detailedAnalytics.threads?.storiesReels?.count || 0,
            postsReach: detailedAnalytics.threads?.posts?.reach || 0,
            storiesReelsReach: detailedAnalytics.threads?.storiesReels?.reach || 0,
            postsEngagement: detailedAnalytics.threads?.posts?.engagement || 0,
            storiesReelsEngagement: detailedAnalytics.threads?.storiesReels?.engagement || 0
          },
          total: { 
            reach: (detailedAnalytics.facebook?.total?.reach || 0) + (detailedAnalytics.threads?.total?.reach || 0), 
            posts: (detailedAnalytics.facebook?.total?.count || 0) + (detailedAnalytics.threads?.total?.count || 0), 
            engagement: (detailedAnalytics.facebook?.total?.engagement || 0) + (detailedAnalytics.threads?.total?.engagement || 0),
            postsCount: (detailedAnalytics.facebook?.posts?.count || 0) + (detailedAnalytics.threads?.posts?.count || 0),
            storiesReelsCount: (detailedAnalytics.facebook?.storiesReels?.count || 0) + (detailedAnalytics.threads?.storiesReels?.count || 0),
            postsReach: (detailedAnalytics.facebook?.posts?.reach || 0) + (detailedAnalytics.threads?.posts?.reach || 0),
            storiesReelsReach: (detailedAnalytics.facebook?.storiesReels?.reach || 0) + (detailedAnalytics.threads?.storiesReels?.reach || 0),
            postsEngagement: (detailedAnalytics.facebook?.posts?.engagement || 0) + (detailedAnalytics.threads?.posts?.engagement || 0),
            storiesReelsEngagement: (detailedAnalytics.facebook?.storiesReels?.engagement || 0) + (detailedAnalytics.threads?.storiesReels?.engagement || 0)
          }
        };
        
                return analyticsData;
      } catch (error) {
        console.error('Error getting analytics data:', error);
        return {
          facebook: { 
            reach: 0, posts: 0, engagement: 0,
            postsCount: 0, storiesReelsCount: 0,
            postsReach: 0, storiesReelsReach: 0,
            postsEngagement: 0, storiesReelsEngagement: 0
          },
          instagram: { reach: 0, posts: 0, engagement: 0 },
          linkedin: { reach: 0, posts: 0, engagement: 0 },
          threads: { 
            reach: 0, posts: 0, engagement: 0,
            postsCount: 0, storiesReelsCount: 0,
            postsReach: 0, storiesReelsReach: 0,
            postsEngagement: 0, storiesReelsEngagement: 0
          },
          total: { 
            reach: 0, posts: 0, engagement: 0,
            postsCount: 0, storiesReelsCount: 0,
            postsReach: 0, storiesReelsReach: 0,
            postsEngagement: 0, storiesReelsEngagement: 0
          }
        };
      }
    });

    // Add new IPC handler for fetching Facebook data
    ipcMain.handle('analytics:fetch-facebook-data', async () => {
      try {
        console.log('🔄 Manually triggering Facebook data fetch...');
        
        // Get the current Facebook account with fresh data from database
        const accounts = await this.database.getSocialMediaAccounts();
        const facebookAccount = accounts.find(acc => acc.platform === 'facebook' && acc.isActive);
        
        if (!facebookAccount) {
          return { success: false, error: 'No active Facebook account found' };
        }
        
        if (!facebookAccount.accessToken) {
          return { success: false, error: 'No access token found for Facebook account' };
        }
        
        console.log('📱 Using Facebook account:', facebookAccount.accountName);
        console.log('🔑 Token length:', facebookAccount.accessToken.length);
        
        const facebookFetcher = new FacebookPostsFetcher(this.database);
        await facebookFetcher.fetchExistingPosts();
        console.log('✅ Facebook data fetch completed');
        return { success: true, message: 'Facebook data fetched successfully' };
      } catch (error) {
        console.error('❌ Error fetching Facebook data:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    // Add new IPC handler for fetching Instagram data
    ipcMain.handle('analytics:fetch-instagram-data', async () => {
      try {
        console.log('🔄 Manually triggering Instagram data fetch...');
        const instagramFetcher = new InstagramPostsFetcher(this.database);
        await instagramFetcher.fetchExistingPosts();
        console.log('✅ Instagram data fetch completed');
        return { success: true, message: 'Instagram data fetched successfully' };
      } catch (error) {
        console.error('❌ Error fetching Instagram data:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('analytics:get-platform-stats', async () => {
      return await this.database.getPlatformStats();
    });

    ipcMain.handle('analytics:get-pending-actions', async () => {
      // Return empty array for now
      return [];
    });

    ipcMain.handle('analytics:get-todays-schedule', async () => {
      // Return empty array for now
      return [];
    });

    ipcMain.handle('analytics:get-metrics', async (event, filters) => {
      // Return empty array for now
      return [];
    });

    ipcMain.handle('analytics:get-trends', async (event, platform, days) => {
      // Return empty array for now
      return [];
    });

    ipcMain.handle('analytics:get-top-posts', async (event, platform, limit, days) => {
      // Return empty array for now
      return [];
    });

    // Add IPC handler for clearing analytics data
    ipcMain.handle('analytics:clear-data', async () => {
      try {
        console.log('🗑️ Clearing all analytics data...');
        
        // Clear analytics metrics
        await this.database.clearAnalyticsMetrics();
        
        // Clear posts to ensure fresh data fetch
        await this.database.clearPosts();
        
        // Force refresh account data to get latest tokens
        await this.database.refreshAccountData();
        
        console.log('✅ Analytics data cleared successfully');
        return { success: true, message: 'Analytics data cleared successfully' };
      } catch (error) {
        console.error('❌ Error clearing analytics data:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('analytics:get-brand-voice-performance', async (event, filters) => {
      // Return empty array for now
      return [];
    });

    ipcMain.handle('analytics:save-metrics', async (event, metrics) => {
      return await this.analyticsService.fetchAndStoreMetrics(metrics.postId, metrics.platform);
    });

    ipcMain.handle('analytics:save-trend', async (event, trend) => {
      // Implementation for saving trends
      return true;
    });

    ipcMain.handle('analytics:save-brand-voice-performance', async (event, performance) => {
      // Implementation for saving brand voice performance
      return true;
    });
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
