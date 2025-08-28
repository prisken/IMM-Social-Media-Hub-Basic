declare global {
    interface Window {
        electronAPI: {
            db: {
                initialize: () => Promise<void>;
                getSettings: () => Promise<any>;
                updateSettings: (settings: any) => Promise<void>;
            };
            media: {
                upload: (filePath: string) => Promise<any>;
                getFiles: () => Promise<any[]>;
                deleteFile: (fileId: string) => Promise<void>;
                searchFiles: (query: string, category?: string) => Promise<any[]>;
            };
            ollama: {
                checkStatus: () => Promise<boolean>;
                getModels: () => Promise<any[]>;
                pullModel: (modelName: string) => Promise<boolean>;
                generate: (prompt: string, modelName: string) => Promise<string>;
            };
            dialog: {
                openFile: () => Promise<string[] | null>;
            };
            analytics: {
                getData: () => Promise<any>;
                getPlatformStats: () => Promise<any>;
                getPendingActions: () => Promise<any[]>;
                getTodaysSchedule: () => Promise<any[]>;
                getMetrics: (filters: any) => Promise<any[]>;
                getTrends: (platform?: string, days?: number) => Promise<any[]>;
                getTopPosts: (platform?: string, limit?: number, days?: number) => Promise<any[]>;
                getBrandVoicePerformance: (filters: any) => Promise<any[]>;
                saveMetrics: (metrics: any) => Promise<any>;
                saveTrend: (trend: any) => Promise<boolean>;
                saveBrandVoicePerformance: (performance: any) => Promise<boolean>;
                fetchFacebookData: () => Promise<{ success: boolean; message?: string; error?: string }>;
                fetchInstagramData: () => Promise<{ success: boolean; message?: string; error?: string }>;
                clearData: () => Promise<{ success: boolean; message?: string; error?: string }>;
            };
        };
    }
}
export {};
