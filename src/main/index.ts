import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { AppDatabase } from './database';
import { MediaManager } from './media-manager';
import { OllamaManager } from './ollama-manager';
import { AIManager } from './ai-manager';
import { PostingEngine } from './posting-engine';
import { SocialMediaManager } from './social-connectors';
import { AnalyticsService } from './analytics-service';

class IMMMarketingHub {
  private mainWindow: BrowserWindow | null = null;
  private database: AppDatabase;
  private mediaManager: MediaManager;
  private ollamaManager: OllamaManager;
  private aiManager: AIManager;
  private postingEngine: PostingEngine;
  private socialMediaManager: SocialMediaManager;
  private analyticsService: AnalyticsService;

  constructor() {
    this.database = new AppDatabase();
    this.mediaManager = new MediaManager();
    this.ollamaManager = new OllamaManager();
    this.aiManager = new AIManager(this.database);
    this.postingEngine = new PostingEngine(this.database);
    this.socialMediaManager = new SocialMediaManager();
    this.analyticsService = new AnalyticsService(this.database);
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing database...');
      await this.database.initialize();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      // Try to reinitialize the database
      try {
        console.log('Attempting to reinitialize database...');
        this.database = new AppDatabase();
        await this.database.initialize();
        console.log('Database reinitialized successfully');
      } catch (retryError) {
        console.error('Database reinitialization also failed:', retryError);
        throw new Error('Failed to initialize database');
      }
    }
    
    try {
      await this.mediaManager.initialize();
    } catch (error) {
      console.warn('Media manager initialization failed:', error);
    }
    
    try {
      await this.ollamaManager.initialize();
    } catch (error) {
      console.warn('Ollama manager initialization failed:', error);
    }
    
    try {
      await this.aiManager.initialize();
    } catch (error) {
      console.warn('AI manager initialization failed:', error);
    }
    
    try {
      await this.postingEngine.start();
    } catch (error) {
      console.warn('Posting engine initialization failed:', error);
    }
    
    try {
      // Start analytics service
      await this.analyticsService.scheduleMetricsUpdate();
      console.log('Analytics service started successfully');
    } catch (error) {
      console.warn('Analytics service initialization failed:', error);
    }
    
    this.createWindow();
    this.setupIPC();
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: false,
        allowRunningInsecureContent: true
      },
      titleBarStyle: 'default',
      show: false
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupIPC() {
    // Database operations
    ipcMain.handle('db:initialize', async () => {
      try {
        return { success: true };
      } catch (error) {
        console.error('Database initialization error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('db:get-settings', async () => {
      try {
        return await this.database.getSettings();
      } catch (error) {
        console.error('Error getting settings:', error);
        // Return default settings if database is not available
        return {
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    });

    ipcMain.handle('db:update-settings', async (event, settings) => {
      try {
        await this.database.updateSettings(settings);
        return { success: true };
      } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
      }
    });

    // Post operations
    ipcMain.handle('db:add-post', async (event, post) => {
      try {
        const postId = await this.database.addPost(post);
        return postId;
      } catch (error) {
        console.error('Error adding post:', error);
        throw error;
      }
    });

    ipcMain.handle('db:get-posts', async () => {
      try {
        return await this.database.getPosts();
      } catch (error) {
        console.error('Error getting posts:', error);
        return [];
      }
    });

    ipcMain.handle('db:get-post-by-id', async (event, postId: string) => {
      try {
        return await this.database.getPostById(postId);
      } catch (error) {
        console.error('Error getting post by id:', error);
        return null;
      }
    });

    ipcMain.handle('db:update-post', async (event, postId: string, updates) => {
      try {
        await this.database.updatePost(postId, updates);
        return { success: true };
      } catch (error) {
        console.error('Error updating post:', error);
        throw error;
      }
    });

    ipcMain.handle('db:delete-post', async (event, postId: string) => {
      try {
        await this.database.deletePost(postId);
        return { success: true };
      } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
      }
    });

    // Posting operations
    ipcMain.handle('posting:post-now', async (event, postId: string) => {
      try {
        console.log('Posting now for post ID:', postId);
        
        // Get the post from database
        const post = await this.database.getPostById(postId);
        if (!post) {
          throw new Error('Post not found');
        }

        // Get social media accounts for the platform
        const accounts = await this.database.getSocialMediaAccounts();
        console.log('Available accounts:', accounts.map(acc => ({ platform: acc.platform, isActive: acc.isActive, accountName: acc.accountName })));
        console.log('Looking for platform:', post.platform);
        
        // Find all matching accounts for the platform
        const platformAccounts = accounts.filter(acc => acc.platform.toLowerCase() === post.platform.toLowerCase() && acc.isActive);
        
        if (platformAccounts.length === 0) {
          console.log('No matching account found. Available platforms:', accounts.map(acc => acc.platform));
          throw new Error(`No active ${post.platform} account found. Please connect your ${post.platform} account in Settings.`);
        }
        
        // If multiple accounts exist, use the one with the most recent activity or the first one
        // In the future, this could be enhanced with account selection UI
        let platformAccount = platformAccounts[0];
        
        // If there are multiple accounts, prefer the one that's not a test account
        if (platformAccounts.length > 1) {
          const realAccount = platformAccounts.find(acc => 
            !acc.accountName.toLowerCase().includes('test') && 
            !acc.accessToken.toLowerCase().includes('test')
          );
          if (realAccount) {
            platformAccount = realAccount;
          }
        }
        
        console.log(`Found ${platformAccounts.length} accounts for ${post.platform}. Using: ${platformAccount.accountName}`);
        console.log('Available accounts for this platform:', platformAccounts.map(acc => acc.accountName));

        // Format content for the platform
        const formattedContent = this.formatContentForPlatform(post, post.platform);
        
        // Post to platform
        const result = await this.socialMediaManager.postToPlatform(
          platformAccount,
          formattedContent,
          post.mediaFiles || []
        );

        if (result.success) {
          // Update post status to published
          await this.database.updatePost(postId, {
            status: 'published',
            updatedAt: new Date().toISOString()
          });
          
          console.log('Post published successfully:', result);
          return { success: true, result };
        } else {
          // Update post status to failed
          await this.database.updatePost(postId, {
            status: 'failed',
            updatedAt: new Date().toISOString()
          });
          
          console.error('Post failed:', result.error);
          throw new Error(result.error || 'Posting failed');
        }
      } catch (error) {
        console.error('Error posting now:', error);
        throw error;
      }
    });

    ipcMain.handle('posting:schedule-post', async (event, postId: string, scheduledTime: string) => {
      try {
        console.log('Scheduling post:', postId, 'for:', scheduledTime);
        
        // Get the post from database
        const post = await this.database.getPostById(postId);
        if (!post) {
          throw new Error('Post not found');
        }

        // Create a posting job
        const jobId = await this.postingEngine.createPostingJob(
          postId,
          post.platform,
          'default', // accountId - will be resolved by posting engine
          post.content,
          post.mediaFiles || [],
          scheduledTime
        );

        console.log('Post scheduled successfully:', jobId);
        return { success: true, jobId };
      } catch (error) {
        console.error('Error scheduling post:', error);
        throw error;
      }
    });





    // Analytics operations
    ipcMain.handle('analytics:get-data', async () => {
      try {
        return await this.database.getAnalyticsData();
      } catch (error) {
        console.error('Error getting analytics data:', error);
        return {
          facebook: { reach: 0, posts: 0, engagement: 0 },
          instagram: { reach: 0, posts: 0, engagement: 0 },
          linkedin: { reach: 0, posts: 0, engagement: 0 },
          total: { reach: 0, posts: 0, engagement: 0 }
        };
      }
    });

    ipcMain.handle('analytics:get-pending-actions', async () => {
      try {
        return await this.database.getPendingActions();
      } catch (error) {
        console.error('Error getting pending actions:', error);
        return [];
      }
    });

    ipcMain.handle('analytics:get-todays-schedule', async () => {
      try {
        return await this.database.getTodaysSchedule();
      } catch (error) {
        console.error('Error getting today\'s schedule:', error);
        return [];
      }
    });

    ipcMain.handle('analytics:get-platform-stats', async () => {
      try {
        return await this.database.getSocialMediaAccounts();
      } catch (error) {
        console.error('Error getting platform stats:', error);
        return {
          facebook: { connected: false, accountName: undefined },
          instagram: { connected: false, accountName: undefined },
          linkedin: { connected: false, accountName: undefined }
        };
      }
    });

    // New analytics handlers
    ipcMain.handle('analytics:get-metrics', async (event, filters) => {
      try {
        return await this.database.getAnalyticsMetrics(
          filters?.postId,
          filters?.platform,
          filters?.startDate,
          filters?.endDate
        );
      } catch (error) {
        console.error('Error getting analytics metrics:', error);
        return [];
      }
    });

    ipcMain.handle('analytics:get-trends', async (event, platform, days) => {
      try {
        return await this.database.getAnalyticsTrends(platform, days);
      } catch (error) {
        console.error('Error getting analytics trends:', error);
        return [];
      }
    });

    ipcMain.handle('analytics:get-top-posts', async (event, platform, limit, days) => {
      try {
        return await this.database.getTopPosts(platform, limit, days);
      } catch (error) {
        console.error('Error getting top posts:', error);
        return [];
      }
    });

    ipcMain.handle('analytics:get-brand-voice-performance', async (event, filters) => {
      try {
        return await this.database.getBrandVoicePerformance(
          filters?.voiceProfileId,
          filters?.startDate,
          filters?.endDate
        );
      } catch (error) {
        console.error('Error getting brand voice performance:', error);
        return [];
      }
    });

    ipcMain.handle('analytics:save-metrics', async (event, metrics) => {
      try {
        return await this.database.saveAnalyticsMetrics(metrics);
      } catch (error) {
        console.error('Error saving analytics metrics:', error);
        throw error;
      }
    });

    ipcMain.handle('analytics:save-trend', async (event, trend) => {
      try {
        return await this.database.saveAnalyticsTrend(trend);
      } catch (error) {
        console.error('Error saving analytics trend:', error);
        throw error;
      }
    });

    ipcMain.handle('analytics:save-brand-voice-performance', async (event, performance) => {
      try {
        return await this.database.saveBrandVoicePerformance(performance);
      } catch (error) {
        console.error('Error saving brand voice performance:', error);
        throw error;
      }
    });

    // Media operations
    ipcMain.handle('media:upload', async (event, filePath: string) => {
      try {
        console.log('📁 Uploading file:', filePath);
        const result = await this.mediaManager.uploadFile(filePath);
        console.log('✅ File uploaded successfully:', result.filename);
        return { success: true, file: result };
      } catch (error) {
        console.error('Error uploading file:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('media:get-files', async () => {
      try {
        return await this.mediaManager.getFiles();
      } catch (error) {
        console.error('Error getting files:', error);
        return [];
      }
    });

    ipcMain.handle('media:delete-file', async (event, fileId: string) => {
      try {
        await this.mediaManager.deleteFile(fileId);
        return { success: true };
      } catch (error) {
        console.error('Error deleting file:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('media:search-files', async (event, query: string, category?: string) => {
      try {
        return await this.mediaManager.searchFiles(query, category);
      } catch (error) {
        console.error('Error searching files:', error);
        return [];
      }
    });

    // Media variant operations
    ipcMain.handle('media:generate-variants', async (event, fileId: string, selectedVariants: string[]) => {
      try {
        const result = await this.mediaManager.generateVariants(fileId, selectedVariants);
        return { success: true, variants: result };
      } catch (error) {
        console.error('Error generating variants:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('media:get-variants', async (event, fileId: string) => {
      try {
        console.log('📋 Getting variants for file:', fileId);
        const variants = await this.mediaManager.generateVariants(fileId);
        return { success: true, variants };
      } catch (error) {
        console.error('Error getting variants:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    // Ollama operations
    ipcMain.handle('ollama:check-status', async () => {
      return await this.ollamaManager.checkStatus();
    });

    ipcMain.handle('ollama:get-models', async () => {
      return await this.ollamaManager.getModels();
    });

    ipcMain.handle('ollama:pull-model', async (event, modelName: string) => {
      return await this.ollamaManager.pullModel(modelName);
    });

    ipcMain.handle('ollama:generate', async (event, prompt: string, modelName: string) => {
      return await this.ollamaManager.generate(prompt, modelName);
    });

    // Brand Voice operations
    ipcMain.handle('brand-voice:analyze', async (event, content: string[], modelName: string) => {
      try {
        return await this.ollamaManager.analyzeBrandVoice(content, modelName);
      } catch (error) {
        console.error('Error analyzing brand voice:', error);
        throw error;
      }
    });

    ipcMain.handle('brand-voice:analyze-with-language', async (event, content: string[], language: 'english' | 'chinese' | 'bilingual', modelName: string) => {
      try {
        return await this.ollamaManager.analyzeBrandVoiceWithLanguage(content, language, modelName);
      } catch (error) {
        console.error('Error analyzing brand voice with language:', error);
        throw error;
      }
    });

    ipcMain.handle('brand-voice:train', async (event, trainingContent: string[], feedback: any, modelName: string) => {
      try {
        return await this.ollamaManager.trainBrandVoice(trainingContent, feedback, modelName);
      } catch (error) {
        console.error('Error training brand voice:', error);
        throw error;
      }
    });

    ipcMain.handle('brand-voice:train-with-language', async (event, trainingContent: string[], feedback: any, language: 'english' | 'chinese' | 'bilingual', modelName: string) => {
      try {
        return await this.ollamaManager.trainBrandVoiceWithLanguage(trainingContent, feedback, language, modelName);
      } catch (error) {
        console.error('Error training brand voice with language:', error);
        throw error;
      }
    });

    ipcMain.handle('brand-voice:generate-samples', async (event, brandVoice: any, platform: string, contentType: string, modelName: string) => {
      try {
        return await this.ollamaManager.generateSampleContent(brandVoice, platform, contentType, modelName);
      } catch (error) {
        console.error('Error generating sample content:', error);
        throw error;
      }
    });

    ipcMain.handle('brand-voice:generate-samples-with-language', async (event, brandVoice: any, platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter', contentType: string, language: 'english' | 'chinese' | 'bilingual', modelName: string) => {
      try {
        return await this.ollamaManager.generateSampleContentWithLanguage(brandVoice, platform, contentType, language, modelName);
      } catch (error) {
        console.error('Error generating sample content with language:', error);
        throw error;
      }
    });

    ipcMain.handle('brand-voice:generate-with-voice', async (event, prompt: string, brandVoice: any, modelName: string) => {
      try {
        return await this.ollamaManager.generateWithBrandVoice(prompt, brandVoice, modelName);
      } catch (error) {
        console.error('Error generating with brand voice:', error);
        throw error;
      }
    });

    ipcMain.handle('brand-voice:generate-with-voice-and-language', async (event, prompt: string, brandVoice: any, language: 'english' | 'chinese' | 'bilingual', modelName: string) => {
      try {
        return await this.ollamaManager.generateWithBrandVoiceAndLanguage(prompt, brandVoice, language, modelName);
      } catch (error) {
        console.error('Error generating with brand voice and language:', error);
        throw error;
      }
    });

    // Brand Voice Profile Management
    ipcMain.handle('brand-voice:add-profile', async (event, profile: any) => {
      try {
        const profileId = await this.database.addBrandVoiceProfile(profile);
        return { success: true, profileId };
      } catch (error) {
        console.error('Error adding brand voice profile:', error);
        throw error;
      }
    });

    ipcMain.handle('brand-voice:get-profiles', async () => {
      try {
        return await this.database.getBrandVoiceProfiles();
      } catch (error) {
        console.error('Error getting brand voice profiles:', error);
        throw error;
      }
    });

    ipcMain.handle('brand-voice:get-profile', async (event, profileId: string) => {
      try {
        return await this.database.getBrandVoiceProfileById(profileId);
      } catch (error) {
        console.error('Error getting brand voice profile:', error);
        throw error;
      }
    });

    ipcMain.handle('brand-voice:update-profile', async (event, profileId: string, updates: any) => {
      try {
        await this.database.updateBrandVoiceProfile(profileId, updates);
        return { success: true };
      } catch (error) {
        console.error('Error updating brand voice profile:', error);
        throw error;
      }
    });

    ipcMain.handle('brand-voice:delete-profile', async (event, profileId: string) => {
      try {
        await this.database.deleteBrandVoiceProfile(profileId);
        return { success: true };
      } catch (error) {
        console.error('Error deleting brand voice profile:', error);
        throw error;
      }
    });

    // Brand Voice Training Data
    ipcMain.handle('brand-voice:add-training-data', async (event, profileId: string, content: string, feedback?: string) => {
      try {
        const trainingId = await this.database.addTrainingData(profileId, content, feedback as 'positive' | 'negative');
        return { success: true, trainingId };
      } catch (error) {
        console.error('Error adding training data:', error);
        throw error;
      }
    });

    ipcMain.handle('brand-voice:get-training-data', async (event, profileId: string) => {
      try {
        return await this.database.getTrainingData(profileId);
      } catch (error) {
        console.error('Error getting training data:', error);
        throw error;
      }
    });

    // File dialog
    ipcMain.handle('dialog:open-file', async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'All Supported Files', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg', 'mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'm4v', 'mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'ppt', 'pptx', 'xls', 'xlsx'] },
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'] },
          { name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'm4v'] },
          { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'ppt', 'pptx', 'xls', 'xlsx'] },
          { name: 'Audio', extensions: ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma'] }
        ]
      });
      return (result as any).filePaths || null;
    });

    // Handle file path resolution for drag and drop
    ipcMain.handle('resolve-file-path', async (event, fileName: string) => {
      const os = require('os');
      const path = require('path');
      const fs = require('fs');
      
      // Cross-platform home directory detection
      const homeDir = os.homedir();
      console.log('🔍 Searching for file:', fileName, 'in home directory:', homeDir);
      
      // Platform-specific common directories
      const commonDirs = [
        'Desktop',
        'Downloads', 
        'Documents',
        'Pictures',
        'Movies',
        'Music',
        // Windows-specific
        ...(process.platform === 'win32' ? ['OneDrive', 'OneDrive - Personal'] : []),
        // macOS-specific
        ...(process.platform === 'darwin' ? ['Public', 'Library'] : []),
        // Linux-specific
        ...(process.platform === 'linux' ? ['Public', 'Templates'] : [])
      ];
      
      // Try exact matches in common directories
      for (const dir of commonDirs) {
        const filePath = path.join(homeDir, dir, fileName);
        if (fs.existsSync(filePath)) {
          console.log('✅ Found file at:', filePath);
          return filePath;
        }
      }
      
      // Try recursive search in common directories
      for (const dir of commonDirs) {
        const searchDir = path.join(homeDir, dir);
        if (fs.existsSync(searchDir)) {
          try {
            const foundPath = await searchFileRecursively(searchDir, fileName);
            if (foundPath) {
              console.log('✅ Found file recursively at:', foundPath);
              return foundPath;
            }
          } catch (error) {
            console.log('⚠️ Error searching in directory:', searchDir, error instanceof Error ? error.message : String(error));
          }
        }
      }
      
      // Try to search in mounted volumes (macOS/Linux)
      if (process.platform === 'darwin' || process.platform === 'linux') {
        try {
          const volumes = await getMountedVolumes();
          for (const volume of volumes) {
            const foundPath = await searchFileRecursively(volume, fileName); // Limit depth for volumes
            if (foundPath) {
              console.log('✅ Found file on mounted volume:', foundPath);
              return foundPath;
            }
          }
        } catch (error) {
          console.log('⚠️ Error searching mounted volumes:', error instanceof Error ? error.message : String(error));
        }
      }
      
      console.log('❌ File not found in common locations:', fileName);
      return null;
    });

    // Handle opening folders
    ipcMain.handle('open-folder', async (event, folderPath: string) => {
      const { shell } = require('electron');
      const path = require('path');
      
      try {
        const fullPath = path.resolve(process.cwd(), folderPath);
        console.log('📁 Opening folder:', fullPath);
        await shell.openPath(fullPath);
        return { success: true };
      } catch (error) {
        console.error('Error opening folder:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });
    
    // Helper function to get mounted volumes
    async function getMountedVolumes(): Promise<string[]> {
      const fs = require('fs');
      const path = require('path');
      
      if (process.platform === 'darwin') {
        // macOS: check /Volumes
        const volumesPath = '/Volumes';
        if (fs.existsSync(volumesPath)) {
          try {
            const volumes = fs.readdirSync(volumesPath)
              .map((volume: string) => path.join(volumesPath, volume))
              .filter((volume: string) => {
                try {
                  return fs.statSync(volume).isDirectory();
                } catch {
                  return false;
                }
              });
            return volumes;
          } catch (error) {
            console.log('⚠️ Error reading volumes:', error instanceof Error ? error.message : String(error));
            return [];
          }
        }
      } else if (process.platform === 'linux') {
        // Linux: check /media and /mnt
        const mediaPaths = ['/media', '/mnt'];
        const volumes: string[] = [];
        
        for (const mediaPath of mediaPaths) {
          if (fs.existsSync(mediaPath)) {
            try {
              const items = fs.readdirSync(mediaPath);
              for (const item of items) {
                const fullPath = path.join(mediaPath, item);
                try {
                  if (fs.statSync(fullPath).isDirectory()) {
                    volumes.push(fullPath);
                  }
                } catch {
                  // Ignore permission errors
                }
              }
            } catch (error) {
              console.log('⚠️ Error reading media path:', mediaPath, error instanceof Error ? error.message : String(error));
            }
          }
        }
        return volumes;
      }
      
      return [];
    }
    
    // Helper function to search for files recursively
    async function searchFileRecursively(directory: string, fileName: string): Promise<string | null> {
      const fs = require('fs').promises;
      const path = require('path');
      
      try {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(directory, entry.name);
          
          if (entry.isFile() && entry.name === fileName) {
            return fullPath;
          }
          
          if (entry.isDirectory()) {
            // Limit recursion depth to avoid infinite loops
            const relativePath = path.relative(process.env.HOME || '', fullPath);
            if (relativePath.split(path.sep).length <= 3) { // Max 3 levels deep
              const result = await searchFileRecursively(fullPath, fileName);
              if (result) return result;
            }
          }
        }
      } catch (error) {
        // Ignore permission errors and continue searching
        console.log('⚠️ Cannot access directory:', directory);
      }
      
      return null;
    }

    // Calendar and Scheduler operations
    ipcMain.handle('calendar:get-scheduled-posts', async () => {
      try {
        return await this.database.getScheduledPosts();
      } catch (error) {
        console.error('Error getting scheduled posts:', error);
        return [];
      }
    });

    ipcMain.handle('scheduler:get-jobs', async () => {
      try {
        return await this.database.getScheduledJobs();
      } catch (error) {
        console.error('Error getting scheduled jobs:', error);
        return [];
      }
    });

    ipcMain.handle('scheduler:add-job', async (event, job) => {
      try {
        const jobId = await this.database.addScheduledJob(job);
        return { success: true, jobId };
      } catch (error) {
        console.error('Error adding scheduled job:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('scheduler:update-job', async (event, jobId: string, updates) => {
      try {
        await this.database.updateScheduledJob(jobId, updates);
        return { success: true };
      } catch (error) {
        console.error('Error updating scheduled job:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('scheduler:delete-job', async (event, jobId: string) => {
      try {
        await this.database.deleteScheduledJob(jobId);
        return { success: true };
      } catch (error) {
        console.error('Error deleting scheduled job:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    // AI Operations
    ipcMain.handle('ai:get-status', async () => {
      try {
        return {
          configured: this.aiManager.isConfigured(),
          status: this.aiManager.getStatus()
        };
      } catch (error) {
        console.error('Error getting AI status:', error);
        return { configured: false, status: 'error' };
      }
    });

    ipcMain.handle('ai:research-industry', async (event, request) => {
      try {
        return await this.aiManager.researchIndustry(request);
      } catch (error) {
        console.error('Error researching industry:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('ai:generate-content', async (event, request) => {
      try {
        return await this.aiManager.generateContent(request);
      } catch (error) {
        console.error('Error generating content:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('ai:generate-scheduling-plan', async (event, industry: string, platforms: string[], startDate: string, endDate: string) => {
      try {
        return await this.aiManager.generateSchedulingPlan(industry, platforms, startDate, endDate);
      } catch (error) {
        console.error('Error generating scheduling plan:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    // Social Media Operations
    ipcMain.handle('social:add-account', async (event, account) => {
      try {
        const accountId = await this.database.addSocialMediaAccount(account);
        return { success: true, accountId };
      } catch (error) {
        console.error('Error adding social media account:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('social:get-accounts', async () => {
      try {
        return await this.database.getSocialMediaAccounts();
      } catch (error) {
        console.error('Error getting social media accounts:', error);
        return [];
      }
    });

    ipcMain.handle('social:update-account', async (event, accountId: string, updates) => {
      try {
        await this.database.updateSocialMediaAccount(accountId, updates);
        return { success: true };
      } catch (error) {
        console.error('Error updating social media account:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('social:delete-account', async (event, accountId: string) => {
      try {
        await this.database.deleteSocialMediaAccount(accountId);
        return { success: true };
      } catch (error) {
        console.error('Error deleting social media account:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('social:test-connection', async (event, account) => {
      try {
        const isConnected = await this.socialMediaManager.testConnection(account);
        return { success: true, connected: isConnected };
      } catch (error) {
        console.error('Error testing social media connection:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('social:get-accounts-for-platform', async (event, platform: string) => {
      try {
        const accounts = await this.database.getSocialMediaAccounts();
        const platformAccounts = accounts.filter(acc => 
          acc.platform.toLowerCase() === platform.toLowerCase() && acc.isActive
        );
        return platformAccounts;
      } catch (error) {
        console.error('Error getting accounts for platform:', error);
        return [];
      }
    });

    // Posting Operations
    ipcMain.handle('posting:create-job', async (event, postId: string, platform: string, accountId: string, content: string, mediaFiles: string[], scheduledTime: string, maxRetries: number = 3) => {
      try {
        const jobId = await this.postingEngine.createPostingJob(postId, platform, accountId, content, mediaFiles, scheduledTime, maxRetries);
        return { success: true, jobId };
      } catch (error) {
        console.error('Error creating posting job:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('posting:get-logs', async (event, limit: number = 50, offset: number = 0) => {
      try {
        return await this.postingEngine.getPostingLogs(limit, offset);
      } catch (error) {
        console.error('Error getting posting logs:', error);
        return [];
      }
    });

    ipcMain.handle('posting:get-jobs', async (event, limit: number = 50, offset: number = 0) => {
      try {
        return await this.database.getAllPostingJobs();
      } catch (error) {
        console.error('Error getting posting jobs:', error);
        return [];
      }
    });

    ipcMain.handle('posting:get-job', async (event, jobId: string) => {
      try {
        return await this.postingEngine.getPostingJob(jobId);
      } catch (error) {
        console.error('Error getting posting job:', error);
        return null;
      }
    });

    ipcMain.handle('posting:cancel-job', async (event, jobId: string) => {
      try {
        await this.postingEngine.cancelPostingJob(jobId);
        return { success: true };
      } catch (error) {
        console.error('Error cancelling posting job:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('posting:retry-job', async (event, jobId: string) => {
      try {
        await this.postingEngine.retryPostingJob(jobId);
        return { success: true };
      } catch (error) {
        console.error('Error retrying posting job:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('posting:validate-content', async (event, content: string, platform: string, mediaFiles: string[] = []) => {
      try {
        return await this.postingEngine.validateContent(content, platform, mediaFiles);
      } catch (error) {
        console.error('Error validating content:', error);
        return { valid: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
      }
    });

    ipcMain.handle('posting:get-platform-format', async (event, platform: string) => {
      try {
        return this.postingEngine.getPlatformFormat(platform);
      } catch (error) {
        console.error('Error getting platform format:', error);
        return null;
      }
    });

    // Engagement handlers
    ipcMain.handle('engagement:get-interactions', async (event, filters = {}) => {
      try {
        return await this.database.getEngagementInteractions(filters);
      } catch (error) {
        console.error('Error getting engagement interactions:', error);
        return [];
      }
    });

    ipcMain.handle('engagement:add-interaction', async (event, interaction) => {
      try {
        const id = await this.database.addEngagementInteraction(interaction);
        return { success: true, id };
      } catch (error) {
        console.error('Error adding engagement interaction:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('engagement:update-interaction', async (event, id: string, updates) => {
      try {
        await this.database.updateEngagementInteraction(id, updates);
        return { success: true };
      } catch (error) {
        console.error('Error updating engagement interaction:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('engagement:get-quick-replies', async (event, filters = {}) => {
      try {
        return await this.database.getQuickReplies(filters);
      } catch (error) {
        console.error('Error getting quick replies:', error);
        return [];
      }
    });

    ipcMain.handle('engagement:add-quick-reply', async (event, quickReply) => {
      try {
        const id = await this.database.addQuickReply(quickReply);
        return { success: true, id };
      } catch (error) {
        console.error('Error adding quick reply:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('engagement:send-reply', async (event, replyData) => {
      try {
        // Get the social media account for the platform
        const accounts = await this.database.getSocialMediaAccounts();
        const account = accounts.find(acc => acc.platform === replyData.platform);
        
        if (!account) {
          throw new Error(`No account found for platform: ${replyData.platform}`);
        }

        // Send reply using social media manager
        const result = await this.socialMediaManager.replyToInteraction(account, replyData.interactionId, replyData.content);
        
        if (result.success) {
          // Mark interaction as processed
          await this.database.updateEngagementInteraction(replyData.interactionId, {
            isProcessed: true,
            processedAt: new Date().toISOString()
          });
        }

        return result;
      } catch (error) {
        console.error('Error sending reply:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    ipcMain.handle('engagement:mark-as-processed', async (event, interactionId: string) => {
      try {
        await this.database.updateEngagementInteraction(interactionId, {
          isProcessed: true,
          processedAt: new Date().toISOString()
        });
        return { success: true };
      } catch (error) {
        console.error('Error marking interaction as processed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    // AI Image Generation operations
    ipcMain.handle('ai:generate-product-image', async (event, request) => {
      try {
        const imagePath = await this.aiManager.generateProductImage(request);
        return imagePath;
      } catch (error) {
        console.error('Error generating product image:', error);
        throw error;
      }
    });

    ipcMain.handle('ai:create-product-image-from-template', async (event, request) => {
      try {
        const imagePath = await this.aiManager.createProductImageFromTemplate(request);
        return imagePath;
      } catch (error) {
        console.error('Error creating product image from template:', error);
        throw error;
      }
    });

    // Product Library operations
    ipcMain.handle('db:add-product', async (event, product) => {
      try {
        const productId = await this.database.addProduct(product);
        return productId;
      } catch (error) {
        console.error('Error adding product:', error);
        throw error;
      }
    });

    ipcMain.handle('db:get-products', async (event, category?: string, isActive?: boolean) => {
      try {
        return await this.database.getProducts(category, isActive);
      } catch (error) {
        console.error('Error getting products:', error);
        return [];
      }
    });

    ipcMain.handle('db:get-product', async (event, productId: string) => {
      try {
        return await this.database.getProduct(productId);
      } catch (error) {
        console.error('Error getting product:', error);
        return null;
      }
    });

    ipcMain.handle('db:update-product', async (event, productId: string, updates) => {
      try {
        await this.database.updateProduct(productId, updates);
        return { success: true };
      } catch (error) {
        console.error('Error updating product:', error);
        throw error;
      }
    });

    ipcMain.handle('db:delete-product', async (event, productId: string) => {
      try {
        await this.database.deleteProduct(productId);
        return { success: true };
      } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    });

    ipcMain.handle('db:add-product-image', async (event, image) => {
      try {
        const imageId = await this.database.addProductImage(image);
        return imageId;
      } catch (error) {
        console.error('Error adding product image:', error);
        throw error;
      }
    });

    ipcMain.handle('db:get-product-images', async (event, productId: string) => {
      try {
        return await this.database.getProductImages(productId);
      } catch (error) {
        console.error('Error getting product images:', error);
        return [];
      }
    });

    ipcMain.handle('db:delete-product-image', async (event, imageId: string) => {
      try {
        await this.database.deleteProductImage(imageId);
        return { success: true };
      } catch (error) {
        console.error('Error deleting product image:', error);
        throw error;
      }
    });

    ipcMain.handle('db:add-product-template', async (event, template) => {
      try {
        const templateId = await this.database.addProductTemplate(template);
        return templateId;
      } catch (error) {
        console.error('Error adding product template:', error);
        throw error;
      }
    });

    ipcMain.handle('db:get-product-templates', async (event, category?: string) => {
      try {
        return await this.database.getProductTemplates(category);
      } catch (error) {
        console.error('Error getting product templates:', error);
        return [];
      }
    });

    ipcMain.handle('db:update-product-template', async (event, templateId: string, updates) => {
      try {
        await this.database.updateProductTemplate(templateId, updates);
        return { success: true };
      } catch (error) {
        console.error('Error updating product template:', error);
        throw error;
      }
    });

    ipcMain.handle('db:delete-product-template', async (event, templateId: string) => {
      try {
        await this.database.deleteProductTemplate(templateId);
        return { success: true };
      } catch (error) {
        console.error('Error deleting product template:', error);
        throw error;
      }
    });
  }

  private formatContentForPlatform(post: any, platform: string): string {
    let content = post.content || '';
    
    // Add hashtags if they exist
    if (post.hashtags && post.hashtags.length > 0) {
      content += '\n\n' + post.hashtags.join(' ');
    }
    
    // Add call to action if it exists
    if (post.callToAction) {
      content += '\n\n' + post.callToAction;
    }
    
    return content;
  }
}

// App lifecycle
app.whenReady().then(async () => {
  const app = new IMMMarketingHub();
  await app.initialize();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const app = new IMMMarketingHub();
    app.initialize();
  }
}); 