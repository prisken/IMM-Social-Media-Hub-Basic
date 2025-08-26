import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  db: {
    initialize: () => ipcRenderer.invoke('db:initialize'),
    getSettings: () => ipcRenderer.invoke('db:get-settings'),
    updateSettings: (settings: any) => ipcRenderer.invoke('db:update-settings', settings),
    addPost: (post: any) => ipcRenderer.invoke('db:add-post', post),
    getPosts: () => ipcRenderer.invoke('db:get-posts'),
    getPostById: (postId: string) => ipcRenderer.invoke('db:get-post-by-id', postId),
    updatePost: (postId: string, updates: any) => ipcRenderer.invoke('db:update-post', postId, updates),
    deletePost: (postId: string) => ipcRenderer.invoke('db:delete-post', postId),
    // Product Library operations
    addProduct: (product: any) => ipcRenderer.invoke('db:add-product', product),
    getProducts: (category?: string, isActive?: boolean) => ipcRenderer.invoke('db:get-products', category, isActive),
    getProduct: (productId: string) => ipcRenderer.invoke('db:get-product', productId),
    updateProduct: (productId: string, updates: any) => ipcRenderer.invoke('db:update-product', productId, updates),
    deleteProduct: (productId: string) => ipcRenderer.invoke('db:delete-product', productId),
    addProductImage: (image: any) => ipcRenderer.invoke('db:add-product-image', image),
    getProductImages: (productId: string) => ipcRenderer.invoke('db:get-product-images', productId),
    deleteProductImage: (imageId: string) => ipcRenderer.invoke('db:delete-product-image', imageId),
    addProductTemplate: (template: any) => ipcRenderer.invoke('db:add-product-template', template),
    getProductTemplates: (category?: string) => ipcRenderer.invoke('db:get-product-templates', category),
    updateProductTemplate: (templateId: string, updates: any) => ipcRenderer.invoke('db:update-product-template', templateId, updates),
    deleteProductTemplate: (templateId: string) => ipcRenderer.invoke('db:delete-product-template', templateId),
  },

  // Media operations
  media: {
    upload: (filePath: string) => ipcRenderer.invoke('media:upload', filePath),
    getFiles: () => ipcRenderer.invoke('media:get-files'),
    deleteFile: (fileId: string) => ipcRenderer.invoke('media:delete-file', fileId),
    searchFiles: (query: string, category?: string) => ipcRenderer.invoke('media:search-files', query, category),
    generateVariants: (fileId: string, selectedVariants: string[]) => ipcRenderer.invoke('media:generate-variants', fileId, selectedVariants),
    getVariants: (fileId: string) => ipcRenderer.invoke('media:get-variants', fileId),
  },

  // Ollama operations
  ollama: {
    checkStatus: () => ipcRenderer.invoke('ollama:check-status'),
    getModels: () => ipcRenderer.invoke('ollama:get-models'),
    pullModel: (modelName: string) => ipcRenderer.invoke('ollama:pull-model', modelName),
    generate: (prompt: string, modelName: string) => ipcRenderer.invoke('ollama:generate', prompt, modelName),
  },

  // Brand Voice operations
  brandVoice: {
    analyze: (content: string[], modelName: string) => ipcRenderer.invoke('brand-voice:analyze', content, modelName),
    analyzeWithLanguage: (content: string[], language: 'english' | 'chinese' | 'bilingual', modelName: string) => ipcRenderer.invoke('brand-voice:analyze-with-language', content, language, modelName),
    train: (trainingContent: string[], feedback: any, modelName: string) => ipcRenderer.invoke('brand-voice:train', trainingContent, feedback, modelName),
    trainWithLanguage: (trainingContent: string[], feedback: any, language: 'english' | 'chinese' | 'bilingual', modelName: string) => ipcRenderer.invoke('brand-voice:train-with-language', trainingContent, feedback, language, modelName),
    generateSamples: (brandVoice: any, platform: string, contentType: string, modelName: string) => ipcRenderer.invoke('brand-voice:generate-samples', brandVoice, platform, contentType, modelName),
    generateSamplesWithLanguage: (brandVoice: any, platform: string, contentType: string, language: 'english' | 'chinese' | 'bilingual', modelName: string) => ipcRenderer.invoke('brand-voice:generate-samples-with-language', brandVoice, platform, contentType, language, modelName),
    generateWithVoice: (prompt: string, brandVoice: any, modelName: string) => ipcRenderer.invoke('brand-voice:generate-with-voice', prompt, brandVoice, modelName),
    generateWithVoiceAndLanguage: (prompt: string, brandVoice: any, language: 'english' | 'chinese' | 'bilingual', modelName: string) => ipcRenderer.invoke('brand-voice:generate-with-voice-and-language', prompt, brandVoice, language, modelName),
    addProfile: (profile: any) => ipcRenderer.invoke('brand-voice:add-profile', profile),
    getProfiles: () => ipcRenderer.invoke('brand-voice:get-profiles'),
    getProfile: (profileId: string) => ipcRenderer.invoke('brand-voice:get-profile', profileId),
    updateProfile: (profileId: string, updates: any) => ipcRenderer.invoke('brand-voice:update-profile', profileId, updates),
    deleteProfile: (profileId: string) => ipcRenderer.invoke('brand-voice:delete-profile', profileId),
    addTrainingData: (profileId: string, content: string, feedback?: string) => ipcRenderer.invoke('brand-voice:add-training-data', profileId, content, feedback),
    getTrainingData: (profileId: string) => ipcRenderer.invoke('brand-voice:get-training-data', profileId),
  },

  // File dialog
  dialog: {
    openFile: () => ipcRenderer.invoke('dialog:open-file'),
  },

  // File path resolution
  filePath: {
    resolve: (fileName: string) => ipcRenderer.invoke('resolve-file-path', fileName),
    openFolder: (folderPath: string) => ipcRenderer.invoke('open-folder', folderPath),
  },

  // Calendar operations
  calendar: {
    getScheduledPosts: () => ipcRenderer.invoke('calendar:get-scheduled-posts'),
  },

  // Scheduler operations
  scheduler: {
    getJobs: () => ipcRenderer.invoke('scheduler:get-jobs'),
    addJob: (job: any) => ipcRenderer.invoke('scheduler:add-job', job),
    updateJob: (jobId: string, updates: any) => ipcRenderer.invoke('scheduler:update-job', jobId, updates),
    deleteJob: (jobId: string) => ipcRenderer.invoke('scheduler:delete-job', jobId),
  },

  // AI operations
  ai: {
    getStatus: () => ipcRenderer.invoke('ai:get-status'),
    researchIndustry: (request: any) => ipcRenderer.invoke('ai:research-industry', request),
    generateContent: (request: any) => ipcRenderer.invoke('ai:generate-content', request),
    generateSchedulingPlan: (industry: string, platforms: string[], startDate: string, endDate: string) => 
      ipcRenderer.invoke('ai:generate-scheduling-plan', industry, platforms, startDate, endDate),
    generateProductImage: (request: any) => ipcRenderer.invoke('ai:generate-product-image', request),
    createProductImageFromTemplate: (request: any) => ipcRenderer.invoke('ai:create-product-image-from-template', request),
  },

  // Social Media operations
  social: {
    addAccount: (account: any) => ipcRenderer.invoke('social:add-account', account),
    getAccounts: () => ipcRenderer.invoke('social:get-accounts'),
    getAccountsForPlatform: (platform: string) => ipcRenderer.invoke('social:get-accounts-for-platform', platform),
    updateAccount: (accountId: string, updates: any) => ipcRenderer.invoke('social:update-account', accountId, updates),
    deleteAccount: (accountId: string) => ipcRenderer.invoke('social:delete-account', accountId),
    testConnection: (account: any) => ipcRenderer.invoke('social:test-connection', account),
  },

  // Posting operations
  posting: {
    createJob: (postId: string, platform: string, accountId: string, content: string, mediaFiles: string[], scheduledTime: string, maxRetries?: number) => 
      ipcRenderer.invoke('posting:create-job', postId, platform, accountId, content, mediaFiles, scheduledTime, maxRetries),
    postNow: (postId: string) => ipcRenderer.invoke('posting:post-now', postId),
    schedulePost: (postId: string, scheduledTime: string) => ipcRenderer.invoke('posting:schedule-post', postId, scheduledTime),
    getJob: (jobId: string) => ipcRenderer.invoke('posting:get-job', jobId),
    cancelJob: (jobId: string) => ipcRenderer.invoke('posting:cancel-job', jobId),
    retryJob: (jobId: string) => ipcRenderer.invoke('posting:retry-job', jobId),
    validateContent: (content: string, platform: string, mediaFiles?: string[]) => 
      ipcRenderer.invoke('posting:validate-content', content, platform, mediaFiles),
    getPlatformFormat: (platform: string) => ipcRenderer.invoke('posting:get-platform-format', platform),
  },

  // Analytics operations
  analytics: {
    getData: () => ipcRenderer.invoke('analytics:get-data'),
    getPendingActions: () => ipcRenderer.invoke('analytics:get-pending-actions'),
    getTodaysSchedule: () => ipcRenderer.invoke('analytics:get-todays-schedule'),
    getPlatformStats: () => ipcRenderer.invoke('analytics:get-platform-stats'),
    getMetrics: (filters?: any) => ipcRenderer.invoke('analytics:get-metrics', filters),
    getTrends: (platform?: string, days?: number) => ipcRenderer.invoke('analytics:get-trends', platform, days),
    getTopPosts: (platform?: string, limit?: number, days?: number) => ipcRenderer.invoke('analytics:get-top-posts', platform, limit, days),
    getBrandVoicePerformance: (filters?: any) => ipcRenderer.invoke('analytics:get-brand-voice-performance', filters),
    saveMetrics: (metrics: any) => ipcRenderer.invoke('analytics:save-metrics', metrics),
    saveTrend: (trend: any) => ipcRenderer.invoke('analytics:save-trend', trend),
    saveBrandVoicePerformance: (performance: any) => ipcRenderer.invoke('analytics:save-brand-voice-performance', performance),
  },

  // Engagement operations
  engagement: {
    getInteractions: (filters?: any) => ipcRenderer.invoke('engagement:get-interactions', filters),
    addInteraction: (interaction: any) => ipcRenderer.invoke('engagement:add-interaction', interaction),
    updateInteraction: (id: string, updates: any) => ipcRenderer.invoke('engagement:update-interaction', id, updates),
    getQuickReplies: (filters?: any) => ipcRenderer.invoke('engagement:get-quick-replies', filters),
    addQuickReply: (quickReply: any) => ipcRenderer.invoke('engagement:add-quick-reply', quickReply),
    sendReply: (replyData: any) => ipcRenderer.invoke('engagement:send-reply', replyData),
    markAsProcessed: (interactionId: string) => ipcRenderer.invoke('engagement:mark-as-processed', interactionId),
  },
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      db: {
        initialize: () => Promise<void>;
        getSettings: () => Promise<any>;
        updateSettings: (settings: any) => Promise<void>;
        addPost: (post: any) => Promise<string>;
        getPosts: () => Promise<any[]>;
        getPostById: (postId: string) => Promise<any>;
        updatePost: (postId: string, updates: any) => Promise<void>;
        deletePost: (postId: string) => Promise<void>;
        // Product Library operations
        addProduct: (product: any) => Promise<string>;
        getProducts: (category?: string, isActive?: boolean) => Promise<any[]>;
        getProduct: (productId: string) => Promise<any>;
        updateProduct: (productId: string, updates: any) => Promise<void>;
        deleteProduct: (productId: string) => Promise<void>;
        addProductImage: (image: any) => Promise<string>;
        getProductImages: (productId: string) => Promise<any[]>;
        deleteProductImage: (imageId: string) => Promise<void>;
        addProductTemplate: (template: any) => Promise<string>;
        getProductTemplates: (category?: string) => Promise<any[]>;
        updateProductTemplate: (templateId: string, updates: any) => Promise<void>;
        deleteProductTemplate: (templateId: string) => Promise<void>;
      };
      media: {
        upload: (filePath: string) => Promise<{ success: boolean; file?: any; error?: string }>;
        getFiles: () => Promise<any[]>;
        deleteFile: (fileId: string) => Promise<{ success: boolean; error?: string }>;
        searchFiles: (query: string, category?: string) => Promise<any[]>;
        generateVariants: (fileId: string, selectedVariants: string[]) => Promise<{ success: boolean; variants?: any; error?: string }>;
        getVariants: (fileId: string) => Promise<{ success: boolean; variants?: any; error?: string }>;
      };
      ollama: {
        checkStatus: () => Promise<boolean>;
        getModels: () => Promise<any[]>;
        pullModel: (modelName: string) => Promise<boolean>;
        generate: (prompt: string, modelName: string) => Promise<string>;
      };
      brandVoice: {
        analyze: (content: string[], modelName: string) => Promise<any>;
        analyzeWithLanguage: (content: string[], language: 'english' | 'chinese' | 'bilingual', modelName: string) => Promise<any>;
        train: (trainingContent: string[], feedback: any, modelName: string) => Promise<any>;
        trainWithLanguage: (trainingContent: string[], feedback: any, language: 'english' | 'chinese' | 'bilingual', modelName: string) => Promise<any>;
        generateSamples: (brandVoice: any, platform: string, contentType: string, modelName: string) => Promise<any>;
        generateSamplesWithLanguage: (brandVoice: any, platform: string, contentType: string, language: 'english' | 'chinese' | 'bilingual', modelName: string) => Promise<any>;
        generateWithVoice: (prompt: string, brandVoice: any, modelName: string) => Promise<string>;
        generateWithVoiceAndLanguage: (prompt: string, brandVoice: any, language: 'english' | 'chinese' | 'bilingual', modelName: string) => Promise<string>;
        addProfile: (profile: any) => Promise<any>;
        getProfiles: () => Promise<any[]>;
        getProfile: (profileId: string) => Promise<any>;
        updateProfile: (profileId: string, updates: any) => Promise<any>;
        deleteProfile: (profileId: string) => Promise<any>;
        addTrainingData: (profileId: string, content: string, feedback?: string) => Promise<any>;
        getTrainingData: (profileId: string) => Promise<any[]>;
      };
      dialog: {
        openFile: () => Promise<string[] | null>;
      };
      filePath: {
        resolve: (fileName: string) => Promise<string | null>;
        openFolder: (folderPath: string) => Promise<{ success: boolean; error?: string }>;
      };
      calendar: {
        getScheduledPosts: () => Promise<any[]>;
      };
      scheduler: {
        getJobs: () => Promise<any[]>;
        addJob: (job: any) => Promise<{ success: boolean; jobId?: string; error?: string }>;
        updateJob: (jobId: string, updates: any) => Promise<{ success: boolean; error?: string }>;
        deleteJob: (jobId: string) => Promise<{ success: boolean; error?: string }>;
      };
      ai: {
        getStatus: () => Promise<{ configured: boolean; status: string }>;
        researchIndustry: (request: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        generateContent: (request: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        generateSchedulingPlan: (industry: string, platforms: string[], startDate: string, endDate: string) => 
          Promise<{ success: boolean; data?: any; error?: string }>;
        generateProductImage: (request: any) => Promise<string>;
        createProductImageFromTemplate: (request: any) => Promise<string>;
      };
      social: {
        addAccount: (account: any) => Promise<{ success: boolean; accountId?: string; error?: string }>;
        getAccounts: () => Promise<any[]>;
        getAccountsForPlatform: (platform: string) => Promise<any[]>;
        updateAccount: (accountId: string, updates: any) => Promise<{ success: boolean; error?: string }>;
        deleteAccount: (accountId: string) => Promise<{ success: boolean; error?: string }>;
        testConnection: (account: any) => Promise<{ success: boolean; connected?: boolean; error?: string }>;
      };
      posting: {
        createJob: (postId: string, platform: string, accountId: string, content: string, mediaFiles: string[], scheduledTime: string, maxRetries?: number) => 
          Promise<{ success: boolean; jobId?: string; error?: string }>;
        postNow: (postId: string) => Promise<{ success: boolean; result?: any; error?: string }>;
        schedulePost: (postId: string, scheduledTime: string) => Promise<{ success: boolean; jobId?: string; error?: string }>;
        getLogs: (limit?: number, offset?: number) => Promise<any[]>;
        getJobs: (limit?: number, offset?: number) => Promise<any[]>;
        getJob: (jobId: string) => Promise<any>;
        cancelJob: (jobId: string) => Promise<{ success: boolean; error?: string }>;
        retryJob: (jobId: string) => Promise<{ success: boolean; error?: string }>;
        validateContent: (content: string, platform: string, mediaFiles?: string[]) => 
          Promise<{ valid: boolean; errors: string[] }>;
        getPlatformFormat: (platform: string) => Promise<any>;
      };
      analytics: {
        getData: () => Promise<{
          facebook: { reach: number; posts: number; engagement: number };
          instagram: { reach: number; posts: number; engagement: number };
          linkedin: { reach: number; posts: number; engagement: number };
          total: { reach: number; posts: number; engagement: number };
        }>;
        getPendingActions: () => Promise<string[]>;
        getTodaysSchedule: () => Promise<Array<{
          time: string;
          platform: string;
          content: string;
          status: string;
        }>>;
        getPlatformStats: () => Promise<{
          facebook: { connected: boolean; accountName?: string };
          instagram: { connected: boolean; accountName?: string };
          linkedin: { connected: boolean; accountName?: string };
        }>;
      };
      engagement: {
        getInteractions: (filters?: any) => Promise<any[]>;
        addInteraction: (interaction: any) => Promise<{ success: boolean; id?: string; error?: string }>;
        updateInteraction: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
        getQuickReplies: (filters?: any) => Promise<any[]>;
        addQuickReply: (quickReply: any) => Promise<{ success: boolean; id?: string; error?: string }>;
        sendReply: (replyData: any) => Promise<{ success: boolean; replyId?: string; error?: string }>;
        markAsProcessed: (interactionId: string) => Promise<{ success: boolean; error?: string }>;
      };
    };
  }
} 