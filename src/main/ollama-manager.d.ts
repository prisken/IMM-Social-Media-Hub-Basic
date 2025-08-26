export interface OllamaModel {
    name: string;
    size: number;
    modified_at: string;
    digest: string;
}
export interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
}
export declare class OllamaManager {
    private ollamaPath;
    private isRunning;
    constructor();
    initialize(): Promise<void>;
    private findOllamaPath;
    checkStatus(): Promise<boolean>;
    getModels(): Promise<OllamaModel[]>;
    pullModel(modelName: string): Promise<boolean>;
    generate(prompt: string, modelName?: string): Promise<string>;
    generateWithBrandVoice(prompt: string, brandVoiceSettings: any, modelName?: string): Promise<string>;
    private createBrandVoicePrompt;
    private runOllamaCommand;
    isModelAvailable(modelName: string): Promise<boolean>;
    getModelSize(modelName: string): Promise<number>;
    startOllama(): Promise<boolean>;
}
