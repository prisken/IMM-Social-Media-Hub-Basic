import * as path from 'path';
import * as fs from 'fs';
import { ErrorHandler, createCommonError } from './error-handler';

export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'test';
  };
  database: {
    path: string;
    backupPath: string;
    autoBackup: boolean;
    backupInterval: number; // in hours
  };
  media: {
    uploadPath: string;
    maxFileSize: number; // in bytes
    allowedTypes: string[];
    thumbnailSize: {
      width: number;
      height: number;
    };
  };
  ai: {
    ollamaUrl: string;
    defaultModel: string;
    maxTokens: number;
    temperature: number;
  };
  social: {
    facebook: {
      apiVersion: string;
      timeout: number;
    };
    instagram: {
      apiVersion: string;
      timeout: number;
    };
    linkedin: {
      apiVersion: string;
      timeout: number;
    };
  };
  analytics: {
    enabled: boolean;
    collectionInterval: number; // in minutes
    retentionDays: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    filePath: string;
    maxSize: number; // in MB
    maxFiles: number;
  };
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;
  private configPath: string;
  private errorHandler: ErrorHandler;

  private constructor() {
    this.errorHandler = ErrorHandler.getInstance();
    this.configPath = this.getConfigPath();
    this.config = this.loadDefaultConfig();
    this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private getConfigPath(): string {
    const userDataPath = process.env.APPDATA || 
      (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config');
    
    const appName = 'IMM Marketing Hub';
    const configDir = path.join(userDataPath, appName);
    
    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    return path.join(configDir, 'config.json');
  }

  private loadDefaultConfig(): AppConfig {
    const userDataPath = process.env.APPDATA || 
      (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config');
    
    const appName = 'IMM Marketing Hub';
    const appDataDir = path.join(userDataPath, appName);

    return {
      app: {
        name: 'IMM Marketing Hub',
        version: '1.0.0',
        environment: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development'
      },
      database: {
        path: path.join(appDataDir, 'database', 'imm_marketing_hub.db'),
        backupPath: path.join(appDataDir, 'backups'),
        autoBackup: true,
        backupInterval: 24 // 24 hours
      },
      media: {
        uploadPath: path.join(appDataDir, 'media'),
        maxFileSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'pdf', 'doc', 'docx'],
        thumbnailSize: {
          width: 300,
          height: 300
        }
      },
      ai: {
        ollamaUrl: 'http://localhost:11434',
        defaultModel: 'llama3.2',
        maxTokens: 2048,
        temperature: 0.7
      },
      social: {
        facebook: {
          apiVersion: 'v18.0',
          timeout: 30000
        },
        instagram: {
          apiVersion: 'v18.0',
          timeout: 30000
        },
        linkedin: {
          apiVersion: 'v2',
          timeout: 30000
        }
      },
      analytics: {
        enabled: true,
        collectionInterval: 60, // 60 minutes
        retentionDays: 90
      },
      logging: {
        level: 'info',
        filePath: path.join(appDataDir, 'logs'),
        maxSize: 10, // 10MB
        maxFiles: 5
      }
    };
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        const loadedConfig = JSON.parse(configData);
        this.config = this.mergeConfig(this.config, loadedConfig);
      } else {
        this.saveConfig();
      }
    } catch (error) {
      this.errorHandler.handleError(
        createCommonError(
          'DATABASE_QUERY_FAILED',
          'Failed to load configuration file',
          'high',
          { configPath: this.configPath, error }
        )
      );
    }
  }

  private mergeConfig(defaultConfig: AppConfig, loadedConfig: Partial<AppConfig>): AppConfig {
    return {
      ...defaultConfig,
      ...loadedConfig,
      app: { ...defaultConfig.app, ...loadedConfig.app },
      database: { ...defaultConfig.database, ...loadedConfig.database },
      media: { ...defaultConfig.media, ...loadedConfig.media },
      ai: { ...defaultConfig.ai, ...loadedConfig.ai },
      social: {
        facebook: { ...defaultConfig.social.facebook, ...loadedConfig.social?.facebook },
        instagram: { ...defaultConfig.social.instagram, ...loadedConfig.social?.instagram },
        linkedin: { ...defaultConfig.social.linkedin, ...loadedConfig.social?.linkedin }
      },
      analytics: { ...defaultConfig.analytics, ...loadedConfig.analytics },
      logging: { ...defaultConfig.logging, ...loadedConfig.logging }
    };
  }

  private saveConfig(): void {
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
    } catch (error) {
      this.errorHandler.handleError(
        createCommonError(
          'DATABASE_QUERY_FAILED',
          'Failed to save configuration file',
          'high',
          { configPath: this.configPath, error }
        )
      );
    }
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  getSection<K extends keyof AppConfig>(section: K): AppConfig[K] {
    return { ...this.config[section] };
  }

  updateConfig(updates: Partial<AppConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
    this.saveConfig();
  }

  updateSection<K extends keyof AppConfig>(section: K, updates: Partial<AppConfig[K]>): void {
    this.config[section] = { ...this.config[section], ...updates };
    this.saveConfig();
  }

  resetToDefaults(): void {
    this.config = this.loadDefaultConfig();
    this.saveConfig();
  }
}
