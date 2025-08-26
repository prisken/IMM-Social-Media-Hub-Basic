import * as dotenv from 'dotenv';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { OllamaManager } from './ollama-manager';

// Load environment variables
dotenv.config();

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface AIResearchRequest {
  industry: string;
  brandVoice: string;
  targetAudience: string;
}

export interface AIContentRequest {
  industry: string;
  platform: string;
  contentType: string;
  brandVoice: string;
  targetAudience?: string;
}

export interface ImageGenerationRequest {
  productId: string;
  prompt: string;
  settings: {
    style: string;
    background: string;
    lighting: string;
    composition: string;
  };
  useCloudGeneration: boolean;
}

export interface TemplateImageRequest {
  productId: string;
  templateId: string;
  settings: {
    width: number;
    height: number;
    format: string;
    quality: number;
  };
}

export class AIManager {
  private apiKey: string | undefined;
  private baseUrl: string = 'https://api.openai.com/v1';
  private ollamaManager: OllamaManager;
  private mediaPath: string;
  private database: any; // Will be properly typed when we import the database type

  constructor(database?: any) {
    this.apiKey = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
    this.ollamaManager = new OllamaManager();
    this.mediaPath = path.join(process.cwd(), 'app', 'media', 'generated');
    this.database = database;
    
    // Ensure media directory exists
    if (!fs.existsSync(this.mediaPath)) {
      fs.mkdirSync(this.mediaPath, { recursive: true });
    }
  }

  async initialize(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. AI features will be limited.');
      return false;
    }

    try {
      // Test the API connection
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ OpenAI API connection successful');
        return true;
      } else {
        console.error('❌ OpenAI API connection failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ OpenAI API connection error:', error);
      return false;
    }
  }

  async researchIndustry(request: AIResearchRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }

    try {
      const prompt = `Research the ${request.industry} industry for social media marketing.

Brand Voice: ${request.brandVoice}
Target Audience: ${request.targetAudience}

Provide a comprehensive analysis including:
1. Current industry trends and market dynamics
2. Top competitors and their social media strategies
3. Optimal posting times for different platforms
4. Content strategy recommendations
5. Trending hashtags and keywords
6. Audience engagement patterns
7. Platform-specific best practices

Format the response as structured data that can be parsed.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a social media marketing expert specializing in industry research and strategy development.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        return {
          success: true,
          data: data.choices[0].message.content
        };
      } else {
        const errorData = await response.json() as any;
        return {
          success: false,
          error: `API Error: ${errorData.error?.message || response.statusText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async generateContent(request: AIContentRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }

    try {
      const prompt = `Generate a ${request.contentType} post for ${request.platform} in the ${request.industry} industry.

Brand Voice: ${request.brandVoice}
${request.targetAudience ? `Target Audience: ${request.targetAudience}` : ''}

Requirements:
- Create engaging, platform-optimized content
- Include relevant hashtags (platform-appropriate number)
- Match the brand voice and tone
- Consider platform-specific best practices
- Include a call-to-action if appropriate
- Keep within platform character limits

Format the response as:
Content: [the main post content]
Hashtags: [relevant hashtags]
Reasoning: [brief explanation of why this content works for this platform/industry]`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a social media content creator specializing in platform-optimized posts and engagement strategies.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.8
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        return {
          success: true,
          data: data.choices[0].message.content
        };
      } else {
        const errorData = await response.json() as any;
        return {
          success: false,
          error: `API Error: ${errorData.error?.message || response.statusText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async generateSchedulingPlan(industry: string, platforms: string[], startDate: string, endDate: string): Promise<AIResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }

    try {
      const prompt = `Create a comprehensive social media scheduling plan for the ${industry} industry.

Platforms: ${platforms.join(', ')}
Campaign Period: ${startDate} to ${endDate}

Provide:
1. Optimal posting frequency for each platform
2. Best posting times for each platform
3. Content mix recommendations (educational, promotional, entertaining, etc.)
4. Weekly content themes
5. Hashtag strategy
6. Engagement tactics
7. Performance metrics to track

Format as structured data that can be parsed.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a social media strategist specializing in campaign planning and scheduling optimization.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.6
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        return {
          success: true,
          data: data.choices[0].message.content
        };
      } else {
        const errorData = await response.json() as any;
        return {
          success: false,
          error: `API Error: ${errorData.error?.message || response.statusText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async generateProductImage(request: ImageGenerationRequest): Promise<string> {
    try {
      if (request.useCloudGeneration) {
        return await this.generateWithCloudService(request);
      } else {
        return await this.generateWithLocalAI(request);
      }
    } catch (error) {
      console.error('Error generating product image:', error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createProductImageFromTemplate(request: TemplateImageRequest): Promise<string> {
    try {
      // Get template and product information
      const template = await this.getTemplate(request.templateId);
      const product = await this.getProduct(request.productId);
      
      if (!template || !product) {
        throw new Error('Template or product not found');
      }

      // Create image using template
      const imagePath = await this.applyTemplateToProduct(template, product, request.settings);
      
      return imagePath;
    } catch (error) {
      console.error('Error creating image from template:', error);
      throw new Error(`Failed to create image from template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateWithLocalAI(request: ImageGenerationRequest): Promise<string> {
    // Check if Ollama is available and has image generation models
    const isRunning = await this.ollamaManager.checkStatus();
    if (!isRunning) {
      throw new Error('Ollama is not running. Please start Ollama to use local AI generation.');
    }

    const models = await this.ollamaManager.getModels();
    const imageModels = models.filter(model => 
      model.name.includes('llava') || 
      model.name.includes('bakllava') || 
      model.name.includes('llava-v2')
    );

    if (imageModels.length === 0) {
      throw new Error('No image generation models found. Please install a model like llava or bakllava.');
    }

    // Use the first available image model
    const model = imageModels[0];
    
    // Create enhanced prompt
    const enhancedPrompt = this.createEnhancedPrompt(request.prompt, request.settings);
    
    // Generate image using Ollama
    const imageData = await this.ollamaManager.generateImage(model.name, enhancedPrompt);
    
    // Save image to file
    const filename = `product_${request.productId}_${Date.now()}.png`;
    const imagePath = path.join(this.mediaPath, filename);
    
    fs.writeFileSync(imagePath, imageData);
    
    return imagePath;
  }

  private async generateWithCloudService(request: ImageGenerationRequest): Promise<string> {
    try {
      // Check if we have API key for cloud services
      if (!this.apiKey) {
        throw new Error('API key required for cloud generation. Please configure your API key in settings.');
      }

      // For now, we'll use local generation as fallback since cloud integration is not fully implemented
      console.warn('Cloud generation not fully implemented yet. Falling back to local generation.');
      return await this.generateWithLocalAI(request);
      
      // TODO: Implement actual cloud service integration
      // This would integrate with services like:
      // - OpenAI DALL-E
      // - Stability AI
      // - Midjourney API
      // - Other cloud-based image generation services
    } catch (error) {
      console.error('Error with cloud generation:', error);
      throw new Error(`Cloud generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async applyTemplateToProduct(template: any, product: any, settings: any): Promise<string> {
    try {
      // Use the template settings if provided, otherwise use default settings
      const templateSettings = template.settings ? JSON.parse(template.settings) : settings;
      
      const filename = `template_${product.id}_${Date.now()}.png`;
      const imagePath = path.join(this.mediaPath, filename);
      
      // Create a template-based image using the product information
      await this.createTemplateBasedImage(
        imagePath, 
        templateSettings.width || settings.width, 
        templateSettings.height || settings.height, 
        product.name,
        template.name,
        template.category
      );
      
      return imagePath;
    } catch (error) {
      console.error('Error applying template to product:', error);
      throw new Error(`Failed to apply template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createEnhancedPrompt(basePrompt: string, settings: any): string {
    const stylePrompts = {
      realistic: 'photorealistic, high quality, professional photography',
      minimalist: 'minimalist design, clean, simple, elegant',
      vintage: 'vintage style, retro, classic, nostalgic',
      modern: 'modern design, contemporary, sleek, sophisticated',
      artistic: 'artistic, creative, stylized, expressive',
      commercial: 'commercial photography, product showcase, professional',
      lifestyle: 'lifestyle photography, natural, authentic, relatable',
      studio: 'studio photography, controlled lighting, professional setup',
      outdoor: 'outdoor photography, natural lighting, environmental',
      dramatic: 'dramatic lighting, high contrast, cinematic'
    };

    const backgroundPrompts = {
      studio: 'studio background, clean, professional',
      white: 'white background, clean, minimal',
      gradient: 'gradient background, modern, elegant',
      nature: 'natural background, organic, environmental',
      urban: 'urban background, cityscape, modern',
      abstract: 'abstract background, artistic, creative',
      texture: 'textured background, interesting, detailed',
      pattern: 'patterned background, geometric, modern',
      solid: 'solid color background, clean, simple',
      transparent: 'transparent background, isolated product'
    };

    const lightingPrompts = {
      professional: 'professional lighting, well-lit, clear',
      natural: 'natural lighting, soft, warm',
      dramatic: 'dramatic lighting, high contrast, moody',
      soft: 'soft lighting, gentle, flattering',
      harsh: 'harsh lighting, bold, striking',
      warm: 'warm lighting, golden, inviting',
      cool: 'cool lighting, blue tones, modern',
      studio: 'studio lighting, controlled, perfect',
      outdoor: 'outdoor lighting, natural, authentic',
      mixed: 'mixed lighting, dynamic, interesting'
    };

    const compositionPrompts = {
      centered: 'centered composition, balanced, symmetrical',
      'rule-of-thirds': 'rule of thirds composition, dynamic, interesting',
      asymmetric: 'asymmetric composition, modern, artistic',
      symmetrical: 'symmetrical composition, balanced, formal',
      'close-up': 'close-up shot, detailed, intimate',
      'wide-angle': 'wide-angle shot, environmental, context',
      overhead: 'overhead shot, top-down view, flat lay',
      'low-angle': 'low-angle shot, dramatic, powerful',
      dynamic: 'dynamic composition, movement, energy'
    };

    const enhancedPrompt = `
      ${basePrompt}
      Style: ${stylePrompts[settings.style as keyof typeof stylePrompts] || stylePrompts.realistic}
      Background: ${backgroundPrompts[settings.background as keyof typeof backgroundPrompts] || backgroundPrompts.studio}
      Lighting: ${lightingPrompts[settings.lighting as keyof typeof lightingPrompts] || lightingPrompts.professional}
      Composition: ${compositionPrompts[settings.composition as keyof typeof compositionPrompts] || compositionPrompts.centered}
      High quality, professional product photography, 4K resolution, detailed, sharp focus
    `.trim();

    return enhancedPrompt;
  }

  private async createPlaceholderImage(imagePath: string, width: number, height: number, productName: string): Promise<void> {
    // Create a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#666" text-anchor="middle" dy=".3em">
          ${productName}
        </text>
        <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="16" fill="#999" text-anchor="middle">
          Template Generated
        </text>
      </svg>
    `;

    fs.writeFileSync(imagePath, svg);
  }

  private async createTemplateBasedImage(
    imagePath: string, 
    width: number, 
    height: number, 
    productName: string,
    templateName: string,
    templateCategory: string
  ): Promise<void> {
    // Create a more sophisticated template-based image
    const backgroundColor = this.getTemplateBackgroundColor(templateCategory);
    const textColor = this.getTemplateTextColor(templateCategory);
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${this.adjustColor(backgroundColor, -20)};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)"/>
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2" rx="10"/>
        <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="${textColor}" text-anchor="middle">
          ${productName}
        </text>
        <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" opacity="0.8">
          ${templateName}
        </text>
        <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="14" fill="${textColor}" text-anchor="middle" opacity="0.6">
          ${templateCategory} Template
        </text>
        <circle cx="${width * 0.2}" cy="${height * 0.8}" r="30" fill="rgba(255,255,255,0.2)"/>
        <circle cx="${width * 0.8}" cy="${height * 0.2}" r="20" fill="rgba(255,255,255,0.1)"/>
      </svg>
    `;

    fs.writeFileSync(imagePath, svg);
  }

  private getTemplateBackgroundColor(category: string): string {
    const colors: { [key: string]: string } = {
      'social_media': '#4A90E2',
      'ecommerce': '#50C878',
      'lifestyle': '#FF6B6B',
      'minimalist': '#F8F9FA',
      'banner': '#6C5CE7'
    };
    return colors[category] || '#4A90E2';
  }

  private getTemplateTextColor(category: string): string {
    const colors: { [key: string]: string } = {
      'social_media': '#FFFFFF',
      'ecommerce': '#FFFFFF',
      'lifestyle': '#FFFFFF',
      'minimalist': '#2C3E50',
      'banner': '#FFFFFF'
    };
    return colors[category] || '#FFFFFF';
  }

  private adjustColor(color: string, amount: number): string {
    // Simple color adjustment - in a real implementation, you'd use a proper color library
    return color;
  }

  private async getTemplate(templateId: string): Promise<any> {
    try {
      // Fetch template from database
      const templates = await this.database.getProductTemplates();
      const template = templates.find((t: any) => t.id === templateId);
      
      if (!template) {
        throw new Error(`Template with ID ${templateId} not found`);
      }
      
      return template;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw new Error(`Failed to fetch template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getProduct(productId: string): Promise<any> {
    try {
      // Fetch product from database
      const products = await this.database.getProducts();
      const product = products.find((p: any) => p.id === productId);
      
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error(`Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getStatus(): string {
    if (!this.apiKey) {
      return 'not-configured';
    }
    return 'configured';
  }
} 