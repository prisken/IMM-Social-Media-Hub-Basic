import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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

export class OllamaManager {
  private ollamaPath: string;
  private isRunning: boolean = false;

  constructor() {
    this.ollamaPath = 'ollama';
  }

  async initialize(): Promise<void> {
    // Check if Ollama is running
    this.isRunning = await this.checkStatus();
  }

  private findOllamaPath(): string {
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

  async checkStatus(): Promise<boolean> {
    try {
      const result = await this.runOllamaCommand(['list']);
      return result.success;
    } catch (error) {
      console.error('Ollama not running:', error);
      return false;
    }
  }

  async getModels(): Promise<OllamaModel[]> {
    try {
      const result = await this.runOllamaCommand(['list']);
      if (result.success && result.output) {
        const lines = result.output.trim().split('\n');
        const models: OllamaModel[] = [];
        
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
    } catch (error) {
      console.error('Error getting models:', error);
    }
    
    return [];
  }

  async pullModel(modelName: string): Promise<boolean> {
    try {
      console.log(`Pulling model: ${modelName}`);
      const result = await this.runOllamaCommand(['pull', modelName]);
      return result.success;
    } catch (error) {
      console.error(`Error pulling model ${modelName}:`, error);
      return false;
    }
  }

  async generate(prompt: string, modelName: string = 'llama3:8b'): Promise<string> {
    try {
      const result = await this.runOllamaCommand(['run', modelName, prompt]);
      if (result.success && result.output) {
        return result.output.trim();
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  async generateWithLanguage(
    prompt: string, 
    language: 'english' | 'chinese' | 'bilingual' = 'english',
    modelName: string = 'llama3:8b'
  ): Promise<string> {
    try {
      const languagePrompt = this.createLanguagePrompt(prompt, language);
      return await this.generate(languagePrompt, modelName);
    } catch (error) {
      console.error('Error generating content with language:', error);
      throw error;
    }
  }

  async generateWithBrandVoice(
    prompt: string, 
    brandVoiceSettings: any, 
    modelName: string = 'llama3:8b'
  ): Promise<string> {
    // Create a prompt that incorporates brand voice settings
    const enhancedPrompt = this.createBrandVoicePrompt(prompt, brandVoiceSettings);
    return await this.generate(enhancedPrompt, modelName);
  }

  async generateWithBrandVoiceAndLanguage(
    prompt: string, 
    brandVoiceSettings: any, 
    language: 'english' | 'chinese' | 'bilingual' = 'english',
    modelName: string = 'llama3:8b'
  ): Promise<string> {
    try {
      const enhancedPrompt = this.createBrandVoiceAndLanguagePrompt(prompt, brandVoiceSettings, language);
      return await this.generate(enhancedPrompt, modelName);
    } catch (error) {
      console.error('Error generating content with brand voice and language:', error);
      throw error;
    }
  }

  async analyzeBrandVoice(content: string[], modelName: string = 'llama3:8b'): Promise<any> {
    try {
      const analysisPrompt = this.createAnalysisPrompt(content);
      const result = await this.generate(analysisPrompt, modelName);
      
      // Parse the analysis result
      return this.parseAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing brand voice:', error);
      throw error;
    }
  }

  async analyzeBrandVoiceWithLanguage(
    content: string[], 
    language: 'english' | 'chinese' | 'bilingual' = 'english',
    modelName: string = 'llama3:8b'
  ): Promise<any> {
    try {
      const analysisPrompt = this.createLanguageAnalysisPrompt(content, language);
      const result = await this.generate(analysisPrompt, modelName);
      return this.parseAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing brand voice with language:', error);
      throw error;
    }
  }

  async trainBrandVoice(
    trainingContent: string[], 
    feedback: { positive: string[], negative: string[] },
    modelName: string = 'llama3:8b'
  ): Promise<any> {
    try {
      const trainingPrompt = this.createTrainingPrompt(trainingContent, feedback);
      const result = await this.generate(trainingPrompt, modelName);
      
      // Parse the training result
      return this.parseTrainingResult(result);
    } catch (error) {
      console.error('Error training brand voice:', error);
      throw error;
    }
  }

  async trainBrandVoiceWithLanguage(
    trainingContent: string[], 
    feedback: { positive: string[], negative: string[] },
    language: 'english' | 'chinese' | 'bilingual' = 'english',
    modelName: string = 'llama3:8b'
  ): Promise<any> {
    try {
      const trainingPrompt = this.createLanguageTrainingPrompt(trainingContent, feedback, language);
      const result = await this.generate(trainingPrompt, modelName);
      
      // Parse the training result
      return this.parseTrainingResult(result);
    } catch (error) {
      console.error('Error training brand voice with language:', error);
      throw error;
    }
  }

  async generateSampleContent(
    brandVoiceSettings: any,
    platform: string,
    contentType: string,
    modelName: string = 'llama3:8b'
  ): Promise<string> {
    try {
      const prompt = this.createSampleContentPrompt(brandVoiceSettings, platform, contentType);
      const result = await this.generate(prompt, modelName);
      
      // Parse and return the first sample
      const samples = this.parseSampleContent(result);
      return samples[0] || 'No content generated';
    } catch (error) {
      console.error('Error generating sample content:', error);
      throw error;
    }
  }

  async generateSampleContentWithLanguage(
    brandVoiceSettings: any,
    platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter',
    contentType: string,
    language: 'english' | 'chinese' | 'bilingual' = 'english',
    modelName: string = 'llama3:8b'
  ): Promise<string> {
    try {
      const prompt = this.createSampleContentPromptWithLanguage(brandVoiceSettings, platform, contentType, language);
      const result = await this.generate(prompt, modelName);
      
      // Parse and return the first sample
      const samples = this.parseSampleContent(result);
      return samples[0] || 'No content generated';
    } catch (error) {
      console.error('Error generating sample content with language:', error);
      throw error;
    }
  }

  private createAnalysisPrompt(content: string[]): string {
    const contentText = content.join('\n\n---\n\n');
    
    return `Analyze the following social media content and provide a detailed brand voice analysis in JSON format:

Content to analyze:
${contentText}

Please provide analysis in the following JSON structure:
{
  "tone": "primary tone (professional/friendly/casual/authoritative)",
  "style": "writing style (conversational/formal/creative/technical/storytelling)",
  "vocabulary": ["key", "words", "phrases", "used"],
  "emojiUsage": "emoji style (none/minimal/strategic/abundant)",
  "callToAction": "CTA style (soft/moderate/strong/aggressive)",
  "sentenceStructure": "sentence patterns",
  "emotionalRange": "emotional tone range",
  "uniquePhrases": ["unique", "phrases", "identified"],
  "contentThemes": ["main", "themes", "topics"],
  "confidence": 0.85
}

Focus on identifying patterns, tone consistency, and unique characteristics.`;
  }

  private createTrainingPrompt(content: string[], feedback: { positive: string[], negative: string[] }): string {
    const contentText = content.join('\n\n---\n\n');
    const positiveText = feedback.positive.join('\n\n---\n\n');
    const negativeText = feedback.negative.join('\n\n---\n\n');
    
    return `Based on the following training content and feedback, create an improved brand voice profile:

Training Content:
${contentText}

Positive Feedback (content that sounds like the brand):
${positiveText}

Negative Feedback (content that doesn't sound like the brand):
${negativeText}

Please provide an improved brand voice profile in JSON format:
{
  "tone": "refined tone",
  "style": "refined style",
  "vocabulary": ["refined", "vocabulary", "list"],
  "emojiUsage": "refined emoji style",
  "callToAction": "refined CTA style",
  "improvements": ["list", "of", "improvements"],
  "avoidPatterns": ["patterns", "to", "avoid"],
  "confidence": 0.90
}`;
  }

  private createLanguageTrainingPrompt(
    content: string[], 
    feedback: { positive: string[], negative: string[] },
    language: 'english' | 'chinese' | 'bilingual'
  ): string {
    const contentText = content.join('\n\n---\n\n');
    const positiveText = feedback.positive.join('\n\n---\n\n');
    const negativeText = feedback.negative.join('\n\n---\n\n');
    
    const languageInstructions = {
      english: 'Based on the following training content and feedback, create an improved brand voice profile in English:',
      chinese: '基于以下训练内容和反馈，创建改进的中文品牌声音配置文件：',
      bilingual: 'Based on the following training content and feedback, create an improved brand voice profile in both English and Chinese:'
    };

    const responseFormat = {
      english: `Please provide an improved brand voice profile in JSON format:
{
  "tone": "refined tone",
  "style": "refined style",
  "vocabulary": ["refined", "vocabulary", "list"],
  "emojiUsage": "refined emoji style",
  "callToAction": "refined CTA style",
  "improvements": ["list", "of", "improvements"],
  "avoidPatterns": ["patterns", "to", "avoid"],
  "confidence": 0.90
}`,
      chinese: `请按以下JSON格式提供改进的品牌声音配置文件：
{
  "tone": "改进的语调",
  "style": "改进的风格",
  "vocabulary": ["改进的", "词汇", "列表"],
  "emojiUsage": "改进的表情符号使用",
  "callToAction": "改进的行动号召风格",
  "improvements": ["改进", "列表"],
  "avoidPatterns": ["避免", "的模式"],
  "confidence": 0.90
}`,
      bilingual: `Please provide an improved brand voice profile in both English and Chinese JSON format:
{
  "tone": {
    "english": "refined tone",
    "chinese": "改进的语调"
  },
  "style": {
    "english": "refined style", 
    "chinese": "改进的风格"
  },
  "vocabulary": {
    "english": ["refined", "vocabulary"],
    "chinese": ["改进的", "词汇"]
  },
  "emojiUsage": {
    "english": "refined emoji style",
    "chinese": "改进的表情符号使用"
  },
  "callToAction": {
    "english": "refined CTA style",
    "chinese": "改进的行动号召风格"
  },
  "confidence": 0.90
}`
    };

    return `${languageInstructions[language]}

Training Content:
${contentText}

Positive Feedback (content that sounds like the brand):
${positiveText}

Negative Feedback (content that doesn't sound like the brand):
${negativeText}

${responseFormat[language]}`;
  }

  private createSampleContentPrompt(brandVoice: any, platform: string, contentType: string): string {
    return `Generate 3 sample ${contentType} posts for ${platform} using the following brand voice:

Brand Voice Settings:
- Tone: ${brandVoice.tone}
- Style: ${brandVoice.style}
- Vocabulary: ${brandVoice.vocabulary?.join(', ') || 'industry-appropriate'}
- Emoji Usage: ${brandVoice.emojiUsage}
- Call to Action: ${brandVoice.callToAction}

Platform: ${platform}
Content Type: ${contentType}

Generate 3 different variations that showcase the brand voice. Each should be clearly separated with "---" and include appropriate hashtags for the platform.

Format each post as:
[Post Content]
#hashtag1 #hashtag2 #hashtag3

---`;
  }

  private createSampleContentPromptWithLanguage(
    brandVoice: any, 
    platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter', 
    contentType: string, 
    language: 'english' | 'chinese' | 'bilingual'
  ): string {
    const languageInstructions = {
      english: 'Generate the content in English only.',
      chinese: '请用中文生成内容。',
      bilingual: 'Generate the content in both English and Chinese. Provide the English version first, followed by the Chinese translation.'
    };

    const platformNames = {
      english: {
        facebook: 'Facebook',
        instagram: 'Instagram',
        linkedin: 'LinkedIn',
        twitter: 'Twitter'
      },
      chinese: {
        facebook: '脸书',
        instagram: 'Instagram',
        linkedin: '领英',
        twitter: '推特'
      }
    };

    const platformName = language === 'chinese' ? platformNames.chinese[platform] : platformNames.english[platform];

    return `Generate 3 sample ${contentType} posts for ${platformName} using the following brand voice:

Brand Voice Settings:
- Tone: ${brandVoice.tone}
- Style: ${brandVoice.style}
- Vocabulary: ${brandVoice.vocabulary?.join(', ') || 'industry-appropriate'}
- Emoji Usage: ${brandVoice.emojiUsage}
- Call to Action: ${brandVoice.callToAction}

Platform: ${platformName}
Content Type: ${contentType}
Language: ${languageInstructions[language]}

Generate 3 different variations that showcase the brand voice. Each should be clearly separated with "---" and include appropriate hashtags for the platform.

Format each post as:
[Post Content]
#hashtag1 #hashtag2 #hashtag3

---`;
  }

  private parseAnalysisResult(result: string): any {
    try {
      // Try to extract JSON from the result
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing
      return {
        tone: this.extractTone(result),
        style: this.extractStyle(result),
        vocabulary: this.extractVocabulary(result),
        emojiUsage: this.extractEmojiUsage(result),
        callToAction: this.extractCallToAction(result),
        confidence: 0.7
      };
    } catch (error) {
      console.error('Error parsing analysis result:', error);
      return {
        tone: 'professional',
        style: 'conversational',
        vocabulary: [],
        emojiUsage: 'strategic',
        callToAction: 'soft',
        confidence: 0.5
      };
    }
  }

  private parseTrainingResult(result: string): any {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        tone: 'professional',
        style: 'conversational',
        vocabulary: [],
        emojiUsage: 'strategic',
        callToAction: 'soft',
        confidence: 0.7
      };
    } catch (error) {
      console.error('Error parsing training result:', error);
      return {
        tone: 'professional',
        style: 'conversational',
        vocabulary: [],
        emojiUsage: 'strategic',
        callToAction: 'soft',
        confidence: 0.5
      };
    }
  }

  private parseSampleContent(result: string): string[] {
    const samples = result.split('---').map(sample => sample.trim()).filter(sample => sample.length > 0);
    return samples.slice(0, 3); // Return up to 3 samples
  }

  private extractTone(text: string): string {
    const tones = ['professional', 'friendly', 'casual', 'authoritative', 'conversational'];
    for (const tone of tones) {
      if (text.toLowerCase().includes(tone)) {
        return tone;
      }
    }
    return 'professional';
  }

  private extractStyle(text: string): string {
    const styles = ['conversational', 'formal', 'creative', 'technical', 'storytelling'];
    for (const style of styles) {
      if (text.toLowerCase().includes(style)) {
        return style;
      }
    }
    return 'conversational';
  }

  private extractVocabulary(text: string): string[] {
    const vocabMatch = text.match(/vocabulary["\s]*:["\s]*\[([^\]]+)\]/i);
    if (vocabMatch) {
      return vocabMatch[1].split(',').map(word => word.trim().replace(/"/g, ''));
    }
    return [];
  }

  private extractEmojiUsage(text: string): string {
    const emojiStyles = ['none', 'minimal', 'strategic', 'abundant'];
    for (const style of emojiStyles) {
      if (text.toLowerCase().includes(style)) {
        return style;
      }
    }
    return 'strategic';
  }

  private extractCallToAction(text: string): string {
    const ctaStyles = ['soft', 'moderate', 'strong', 'aggressive'];
    for (const style of ctaStyles) {
      if (text.toLowerCase().includes(style)) {
        return style;
      }
    }
    return 'soft';
  }

  private createBrandVoicePrompt(basePrompt: string, brandVoice: any): string {
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

  private createBrandVoiceAndLanguagePrompt(
    basePrompt: string, 
    brandVoice: any, 
    language: 'english' | 'chinese' | 'bilingual'
  ): string {
    const languageInstructions = {
      english: 'Please respond in English only.',
      chinese: '请用中文回答。',
      bilingual: 'Please respond in both English and Chinese. Provide the English version first, followed by the Chinese translation.'
    };

    const voiceInstructions = `
You are a social media content creator with the following brand voice characteristics:
- Tone: ${brandVoice.tone || 'professional'}
- Style: ${brandVoice.style || 'conversational'}
- Vocabulary: ${brandVoice.vocabulary || 'industry-focused'}
- Emoji usage: ${brandVoice.emojiUsage || 'strategic'}
- Call-to-action style: ${brandVoice.callToAction || 'soft'}

${languageInstructions[language]}

Please create content for the following request: ${basePrompt}

Make sure the content matches the brand voice characteristics above and uses the specified language.
`;

    return voiceInstructions;
  }

  private createLanguagePrompt(basePrompt: string, language: 'english' | 'chinese' | 'bilingual'): string {
    const languageInstructions = {
      english: 'Please respond in English only.',
      chinese: '请用中文回答。',
      bilingual: 'Please respond in both English and Chinese. Provide the English version first, followed by the Chinese translation.'
    };

    return `${languageInstructions[language]}

${basePrompt}`;
  }

  private createLanguageAnalysisPrompt(content: string[], language: 'english' | 'chinese' | 'bilingual'): string {
    const contentText = content.join('\n\n---\n\n');
    
    const languageInstructions = {
      english: 'Analyze the following social media content and provide a detailed brand voice analysis in English:',
      chinese: '请分析以下社交媒体内容，并提供详细的中文品牌声音分析：',
      bilingual: 'Analyze the following social media content and provide a detailed brand voice analysis in both English and Chinese:'
    };

    const responseFormat = {
      english: `Please provide analysis in the following JSON structure:
{
  "tone": "primary tone (professional/friendly/casual/authoritative)",
  "style": "writing style (conversational/formal/creative/technical/storytelling)",
  "vocabulary": ["key", "words", "phrases", "used"],
  "emojiUsage": "emoji style (none/minimal/strategic/abundant)",
  "callToAction": "CTA style (soft/moderate/strong/aggressive)",
  "sentenceStructure": "sentence patterns",
  "emotionalRange": "emotional tone range",
  "uniquePhrases": ["unique", "phrases", "identified"],
  "contentThemes": ["main", "themes", "topics"],
  "confidence": 0.85
}`,
      chinese: `请按以下JSON结构提供分析：
{
  "tone": "主要语调 (专业/友好/随意/权威)",
  "style": "写作风格 (对话式/正式/创意/技术/讲故事)",
  "vocabulary": ["关键词", "短语", "用语"],
  "emojiUsage": "表情符号使用 (无/最少/策略性/丰富)",
  "callToAction": "行动号召风格 (温和/中等/强烈/激进)",
  "sentenceStructure": "句子模式",
  "emotionalRange": "情感语调范围",
  "uniquePhrases": ["独特", "短语", "识别"],
  "contentThemes": ["主要", "主题", "话题"],
  "confidence": 0.85
}`,
      bilingual: `Please provide analysis in both English and Chinese JSON structure:
{
  "tone": {
    "english": "primary tone",
    "chinese": "主要语调"
  },
  "style": {
    "english": "writing style",
    "chinese": "写作风格"
  },
  "vocabulary": {
    "english": ["key", "words"],
    "chinese": ["关键词", "用语"]
  },
  "emojiUsage": {
    "english": "emoji style",
    "chinese": "表情符号使用"
  },
  "callToAction": {
    "english": "CTA style",
    "chinese": "行动号召风格"
  },
  "confidence": 0.85
}`
    };

    return `${languageInstructions[language]}

Content to analyze:
${contentText}

${responseFormat[language]}

Focus on identifying patterns, tone consistency, and unique characteristics.`;
  }

  private runOllamaCommand(args: string[]): Promise<{ success: boolean; output?: string; error?: string }> {
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
        } else {
          resolve({ success: false, error });
        }
      });

      process.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  }

  // Helper method to check if a specific model is available
  async isModelAvailable(modelName: string): Promise<boolean> {
    const models = await this.getModels();
    return models.some(model => model.name === modelName);
  }

  // Helper method to get model size in GB
  async getModelSize(modelName: string): Promise<number> {
    const models = await this.getModels();
    const model = models.find(m => m.name === modelName);
    return model ? model.size : 0;
  }

  // Method to start Ollama if not running (platform-specific)
  async startOllama(): Promise<boolean> {
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
    } catch (error) {
      console.error('Error starting Ollama:', error);
      return false;
    }
  }

  // Generate image using Ollama
  async generateImage(modelName: string, prompt: string): Promise<Buffer> {
    try {
      const result = await this.runOllamaCommand(['run', modelName, prompt, '--image']);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate image');
      }

      // For now, return a placeholder image buffer
      // In a real implementation, this would return the actual generated image
      const placeholderSvg = `
        <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f0f0f0"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#666" text-anchor="middle" dy=".3em">
            AI Generated Image
          </text>
          <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="12" fill="#999" text-anchor="middle">
            ${prompt.substring(0, 50)}...
          </text>
        </svg>
      `;

      return Buffer.from(placeholderSvg, 'utf-8');
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 