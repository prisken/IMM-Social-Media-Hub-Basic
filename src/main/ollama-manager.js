import { spawn } from 'child_process';
import * as fs from 'fs';
export class OllamaManager {
    constructor() {
        this.isRunning = false;
        // Check for Ollama installation
        this.ollamaPath = this.findOllamaPath();
    }
    async initialize() {
        // Check if Ollama is running
        this.isRunning = await this.checkStatus();
    }
    findOllamaPath() {
        // Common Ollama installation paths
        const possiblePaths = [
            '/usr/local/bin/ollama',
            '/opt/homebrew/bin/ollama',
            'C:\\Program Files\\Ollama\\ollama.exe',
            process.env.OLLAMA_PATH || ''
        ];
        for (const ollamaPath of possiblePaths) {
            if (ollamaPath && fs.existsSync(ollamaPath)) {
                return ollamaPath;
            }
        }
        // Try to find in PATH
        return 'ollama';
    }
    async checkStatus() {
        try {
            const result = await this.runOllamaCommand(['list']);
            return result.success;
        }
        catch (error) {
            console.error('Ollama not running:', error);
            return false;
        }
    }
    async getModels() {
        try {
            const result = await this.runOllamaCommand(['list']);
            if (result.success && result.output) {
                const lines = result.output.trim().split('\n');
                const models = [];
                // Skip header line
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line) {
                        const parts = line.split(/\s+/);
                        if (parts.length >= 4) {
                            models.push({
                                name: parts[0],
                                size: parseInt(parts[1]) || 0,
                                modified_at: parts[2] + ' ' + parts[3],
                                digest: parts[4] || ''
                            });
                        }
                    }
                }
                return models;
            }
        }
        catch (error) {
            console.error('Error getting models:', error);
        }
        return [];
    }
    async pullModel(modelName) {
        try {
            console.log(`Pulling model: ${modelName}`);
            const result = await this.runOllamaCommand(['pull', modelName]);
            return result.success;
        }
        catch (error) {
            console.error(`Error pulling model ${modelName}:`, error);
            return false;
        }
    }
    async generate(prompt, modelName = 'llama3:8b') {
        try {
            const result = await this.runOllamaCommand(['run', modelName, prompt]);
            if (result.success && result.output) {
                return result.output.trim();
            }
            else {
                throw new Error('Generation failed');
            }
        }
        catch (error) {
            console.error('Error generating content:', error);
            throw error;
        }
    }
    async generateWithBrandVoice(prompt, brandVoiceSettings, modelName = 'llama3:8b') {
        // Create a prompt that incorporates brand voice settings
        const enhancedPrompt = this.createBrandVoicePrompt(prompt, brandVoiceSettings);
        return await this.generate(enhancedPrompt, modelName);
    }
    createBrandVoicePrompt(basePrompt, brandVoice) {
        const voiceInstructions = `
You are a social media content creator with the following brand voice characteristics:
- Tone: ${brandVoice.tone || 'professional'}
- Style: ${brandVoice.style || 'conversational'}
- Vocabulary: ${brandVoice.vocabulary || 'industry-focused'}
- Emoji usage: ${brandVoice.emojiUsage || 'strategic'}
- Call-to-action style: ${brandVoice.callToAction || 'soft'}

Please create content for the following request: ${basePrompt}

Make sure the content matches the brand voice characteristics above.
`;
        return voiceInstructions;
    }
    runOllamaCommand(args) {
        return new Promise((resolve) => {
            const process = spawn(this.ollamaPath, args, {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            let output = '';
            let error = '';
            process.stdout.on('data', (data) => {
                output += data.toString();
            });
            process.stderr.on('data', (data) => {
                error += data.toString();
            });
            process.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, output });
                }
                else {
                    resolve({ success: false, error });
                }
            });
            process.on('error', (err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    // Helper method to check if a specific model is available
    async isModelAvailable(modelName) {
        const models = await this.getModels();
        return models.some(model => model.name === modelName);
    }
    // Helper method to get model size in GB
    async getModelSize(modelName) {
        const models = await this.getModels();
        const model = models.find(m => m.name === modelName);
        return model ? model.size : 0;
    }
    // Method to start Ollama if not running (platform-specific)
    async startOllama() {
        if (this.isRunning) {
            return true;
        }
        try {
            // This is a simplified approach - in production you'd want more robust process management
            const process = spawn(this.ollamaPath, ['serve'], {
                detached: true,
                stdio: 'ignore'
            });
            // Wait a bit for Ollama to start
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.isRunning = await this.checkStatus();
            return this.isRunning;
        }
        catch (error) {
            console.error('Error starting Ollama:', error);
            return false;
        }
    }
}
