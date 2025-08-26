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
        };
    }
}
export {};
