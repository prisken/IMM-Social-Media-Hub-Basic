import { BrowserWindow, app } from 'electron';
import * as path from 'path';
import { AppDatabase } from './database';
import { MediaManager } from './media-manager';
import { OllamaManager } from './ollama-manager';
import { AIManager } from './ai-manager';
import { PostingEngine } from './posting-engine';
import { SocialMediaManager } from './social-connectors';
import { AnalyticsService } from './analytics-service';
import { IPCManager } from './ipc-manager';
import { DatabaseService } from './services/database-service';
import { ConfigManager } from './utils/config-manager';
import { ErrorHandler } from './utils/error-handler';

export class AppManager {
  private mainWindow: BrowserWindow | null = null;
  private database: AppDatabase;
  private databaseService: DatabaseService;
  private mediaManager: MediaManager;
  private ollamaManager: OllamaManager;
  private aiManager: AIManager;
  private postingEngine: PostingEngine;
  private socialMediaManager: SocialMediaManager;
  private analyticsService: AnalyticsService;
  private ipcManager: IPCManager;
  private configManager: ConfigManager;
  private errorHandler: ErrorHandler;

  constructor() {
    this.configManager = ConfigManager.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
    this.database = new AppDatabase();
    this.databaseService = new DatabaseService(this.database);
    this.mediaManager = new MediaManager();
    this.ollamaManager = new OllamaManager();
    this.aiManager = new AIManager(this.database);
    this.postingEngine = new PostingEngine(this.database);
    this.socialMediaManager = new SocialMediaManager();
    this.analyticsService = new AnalyticsService(this.database);
    this.ipcManager = new IPCManager(
      this.database,
      this.mediaManager,
      this.ollamaManager,
      this.aiManager,
      this.postingEngine,
      this.socialMediaManager,
      this.analyticsService
    );
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing IMM Marketing Hub...');
      
      // Initialize core services
      await this.initializeDatabase();
      await this.initializeServices();
      
      // Create window and setup IPC
      this.createWindow();
      this.ipcManager.setupIPC();
      
      console.log('IMM Marketing Hub initialized successfully');
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'AppManager.initialize');
      throw error;
    }
  }

  private async initializeDatabase(): Promise<void> {
    try {
      console.log('Initializing database...');
      await this.databaseService.initialize();
      console.log('Database initialized successfully');
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'AppManager.initializeDatabase');
      // Try to reinitialize the database
      try {
        console.log('Attempting to reinitialize database...');
        this.database = new AppDatabase();
        this.databaseService = new DatabaseService(this.database);
        await this.databaseService.initialize();
        console.log('Database reinitialized successfully');
      } catch (retryError) {
        this.errorHandler.handleError(retryError as Error, 'AppManager.initializeDatabase.retry');
        throw new Error('Failed to initialize database');
      }
    }
  }

  private async initializeServices(): Promise<void> {
    const services = [
      { name: 'Media Manager', service: this.mediaManager, method: 'initialize' },
      { name: 'Ollama Manager', service: this.ollamaManager, method: 'initialize' },
      { name: 'AI Manager', service: this.aiManager, method: 'initialize' },
      { name: 'Posting Engine', service: this.postingEngine, method: 'start' },
      { name: 'Analytics Service', service: this.analyticsService, method: 'scheduleMetricsUpdate' }
    ];

    for (const { name, service, method } of services) {
      try {
        if (method === 'initialize' && 'initialize' in service) {
          await (service as any).initialize();
        } else if (method === 'start' && 'start' in service) {
          await (service as any).start();
        } else if (method === 'scheduleMetricsUpdate' && 'scheduleMetricsUpdate' in service) {
          await (service as any).scheduleMetricsUpdate();
        }
        console.log(`${name} initialized successfully`);
      } catch (error) {
        this.errorHandler.handleError(error as Error, `AppManager.initializeServices.${name}`);
      }
    }
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

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  async shutdown(): Promise<void> {
    try {
      console.log('Shutting down IMM Marketing Hub...');
      
      // Cleanup services
      if ('stop' in this.postingEngine) {
        await (this.postingEngine as any).stop();
      }
      
      // Close database connection
      await this.databaseService.close();
      
      console.log('IMM Marketing Hub shutdown complete');
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'AppManager.shutdown');
    }
  }
}
