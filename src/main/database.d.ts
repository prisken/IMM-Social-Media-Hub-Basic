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
export declare class AppDatabase {
    private db;
    private dbPath;
    constructor();
    initialize(): Promise<void>;
    private createTables;
    private seedInitialData;
    getSettings(): Promise<AppSettings>;
    updateSettings(settings: Partial<AppSettings>): Promise<void>;
    addMediaFile(file: Omit<MediaFile, 'id'>): Promise<string>;
    getMediaFiles(): Promise<MediaFile[]>;
    deleteMediaFile(fileId: string): Promise<void>;
    
    // Analytics methods
    getAnalyticsData(): Promise<{
        facebook: { reach: number; posts: number; engagement: number };
        instagram: { reach: number; posts: number; engagement: number };
        linkedin: { reach: number; posts: number; engagement: number };
        total: { reach: number; posts: number; engagement: number };
    }>;
    saveAnalyticsMetrics(metrics: Omit<AnalyticsMetrics, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
    getAnalyticsMetrics(postId?: string, platform?: string, startDate?: string, endDate?: string): Promise<AnalyticsMetrics[]>;
    getAnalyticsTrends(platform?: string, days?: number): Promise<AnalyticsTrend[]>;
    saveAnalyticsTrend(trend: Omit<AnalyticsTrend, 'id' | 'createdAt'>): Promise<string>;
    getBrandVoicePerformance(voiceProfileId?: string, startDate?: string, endDate?: string): Promise<BrandVoicePerformance[]>;
    saveBrandVoicePerformance(performance: Omit<BrandVoicePerformance, 'id' | 'createdAt'>): Promise<string>;
    getTopPosts(platform?: string, limit?: number, days?: number): Promise<TopPost[]>;
    getPosts(): Promise<Post[]>;
    getBrandVoiceProfiles(): Promise<Array<{
        id: string;
        name: string;
        tone: string;
        style: string;
        vocabulary: string[];
        emojiUsage: string;
        callToAction: string;
        examples: string[];
        createdAt: string;
        updatedAt: string;
    }>>;
    getSocialMediaAccounts(): Promise<Array<{
        platform: string;
        isActive: boolean;
        accountName: string | null;
        accessToken: string | null;
    }>>;
    getPendingActions(): Promise<string[]>;
    getTodaysSchedule(): Promise<Array<{
        time: string;
        platform: string;
        content: string;
        status: string;
    }>>;
    
    // Product Library methods
    addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
    getProducts(category?: string, isActive?: boolean): Promise<Product[]>;
    getProduct(productId: string): Promise<Product | null>;
    updateProduct(productId: string, updates: Partial<Product>): Promise<void>;
    deleteProduct(productId: string): Promise<void>;
    addProductImage(image: Omit<ProductImage, 'id' | 'createdAt'>): Promise<string>;
    getProductImages(productId: string): Promise<ProductImage[]>;
    deleteProductImage(imageId: string): Promise<void>;
    addProductTemplate(template: Omit<ProductTemplate, 'id' | 'createdAt'>): Promise<string>;
    getProductTemplates(category?: string): Promise<ProductTemplate[]>;
    updateProductTemplate(templateId: string, updates: Partial<ProductTemplate>): Promise<void>;
    deleteProductTemplate(templateId: string): Promise<void>;
    
    close(): void;
}
