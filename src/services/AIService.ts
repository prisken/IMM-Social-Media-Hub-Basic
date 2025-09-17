import { 
  AIChatMessage, 
  AIContentPlan, 
  AIPostPreview, 
  AIDirectiveContext, 
  AIResponse,
  Post,
  SocialPlatform,
  PostType,
  AISchedulingRecommendation,
  PostMetadata
} from '@/types'
import { apiService } from '@/services/ApiService'

// Extend Window interface for electronAPI
declare global {
  interface Window {
    electronAPI?: {
      ollama?: {
        checkStatus: () => Promise<{ available: boolean; error?: string }>
        getModels: () => Promise<{ models: any[]; error?: string }>
        generate: (model: string, prompt: string) => Promise<{ response: string; error?: string }>
      }
    }
  }
}

export class AIService {
  private static instance: AIService
  private ollamaEndpoint: string = 'http://localhost:11434'
  private model: string = 'llama3:8b' // Default model, can be changed
  private conversationHistory: AIChatMessage[] = []
  private currentContext: AIDirectiveContext = {}
  private currentPlan: AIContentPlan | null = null
  
  // 🎯 Configurable post generation limit
  public maxPostsPerGeneration: number = 20 // Easy to change!

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  /**
   * Set the maximum number of posts to generate per AI request
   * @param limit - Maximum posts (default: 20)
   */
  public setMaxPostsPerGeneration(limit: number): void {
    this.maxPostsPerGeneration = Math.max(1, limit) // Ensure at least 1
    console.log(`AI post generation limit set to: ${this.maxPostsPerGeneration}`)
  }

  /**
   * Get the current maximum posts per generation limit
   */
  public getMaxPostsPerGeneration(): number {
    return this.maxPostsPerGeneration
  }

  /**
   * Get current business context for form display
   */
  public getBusinessContext() {
    return this.currentContext.businessContext || {}
  }

  /**
   * Generate AI understanding and reasoning for business context
   */
  public async generateAIUnderstanding(businessContext: any): Promise<{
    understanding: string
    reasoning: string
  }> {
    try {
      const prompt = `You are a social media marketing expert. Analyze this business information and provide:

1. A clear understanding summary of the business
2. Detailed reasoning for your social media recommendations

Business Information:
- Company: ${businessContext.companyName}
- Industry: ${businessContext.industry}
- Target Audience: ${businessContext.targetAudience}
- Key Message: ${businessContext.keyMessage}
- Brand Voice: ${businessContext.brandVoice}
- Primary Platforms: ${businessContext.primaryPlatforms.join(', ')}

Please provide:
1. UNDERSTANDING: A natural, conversational summary showing you understand their business
2. REASONING: Detailed explanation of why you recommend specific strategies for their industry, audience, and goals

Format your response as:
UNDERSTANDING: [your understanding here]
REASONING: [your detailed reasoning here]`

      const response = await this.sendMessage(prompt)
      
      // Parse the response to extract understanding and reasoning
      const understandingMatch = response.match(/UNDERSTANDING:\s*(.+?)(?=REASONING:|$)/s)
      const reasoningMatch = response.match(/REASONING:\s*(.+?)$/s)
      
      return {
        understanding: understandingMatch ? understandingMatch[1].trim() : `I understand that ${businessContext.companyName} is a ${businessContext.industry} company targeting ${businessContext.targetAudience}.`,
        reasoning: reasoningMatch ? reasoningMatch[1].trim() : `Based on your ${businessContext.industry} industry and ${businessContext.targetAudience} audience, I recommend this approach for optimal engagement.`
      }
    } catch (error) {
      console.error('Error generating AI understanding:', error)
      
      // Fallback to basic understanding
      return {
        understanding: `I understand that ${businessContext.companyName} is a ${businessContext.industry} company targeting ${businessContext.targetAudience}. Your key message "${businessContext.keyMessage}" and brand voice "${businessContext.brandVoice}" will guide our content strategy.`,
        reasoning: `Based on your ${businessContext.industry} industry and ${businessContext.targetAudience} audience, I recommend this approach for optimal engagement.`
      }
    }
  }

  /**
   * Generate form data based on AI's understanding from conversation or provided context
   */
  public generateFormDataFromContext(businessContext?: any): {
    totalPosts: number
    dateRange: { start: string; end: string }
    platforms: SocialPlatform[]
    selectedCategories: string[]
    selectedTopics: string[]
    brandVoice: string
    contentFocus: string[]
  } {
    const bc = businessContext || this.currentContext.businessContext
    const context = this.currentContext
    
    console.log('🎯 Generating form data from context:', { bc, context })
    
    // Smart defaults based on industry and context
    let totalPosts = 20
    let platforms: SocialPlatform[] = ['instagram']
    let contentFocus = ['Educational']
    let brandVoice = 'Professional and friendly'
    
    // Industry-based recommendations
    if (bc?.industry) {
      const industryDefaults: Record<string, { posts: number; platforms: SocialPlatform[]; focus: string[]; voice: string }> = {
        'beverage': { posts: 35, platforms: ['instagram', 'facebook'], focus: ['Behind-the-scenes', 'User-generated content', 'Promotional'], voice: 'Fresh and inspiring' },
        'food': { posts: 40, platforms: ['instagram', 'facebook'], focus: ['Behind-the-scenes', 'User-generated content', 'Promotional'], voice: 'Delicious and inviting' },
        'financial': { posts: 30, platforms: ['linkedin', 'facebook'], focus: ['Educational', 'Industry insights'], voice: 'Professional and trustworthy' },
        'technology': { posts: 25, platforms: ['linkedin', 'twitter'], focus: ['Educational', 'Industry insights'], voice: 'Innovative and expert' },
        'retail': { posts: 40, platforms: ['instagram', 'facebook'], focus: ['Promotional', 'Behind-the-scenes'], voice: 'Friendly and engaging' },
        'healthcare': { posts: 20, platforms: ['linkedin', 'facebook'], focus: ['Educational', 'Tips and tricks'], voice: 'Caring and professional' },
        'consulting': { posts: 25, platforms: ['linkedin', 'twitter'], focus: ['Educational', 'Industry insights'], voice: 'Expert and authoritative' },
        'creative': { posts: 35, platforms: ['instagram', 'tiktok'], focus: ['Behind-the-scenes', 'User-generated content'], voice: 'Creative and inspiring' }
      }
      
      const defaults = industryDefaults[bc.industry.toLowerCase() as keyof typeof industryDefaults]
      if (defaults) {
        totalPosts = defaults.posts
        platforms = defaults.platforms
        contentFocus = defaults.focus
        brandVoice = defaults.voice
      }
    }
    
    // Override with user-specified values if available
    if (context.postCount) totalPosts = context.postCount
    if (context.platforms && context.platforms.length > 0) platforms = context.platforms
    if (context.contentTypes && context.contentTypes.length > 0) contentFocus = context.contentTypes
    if (context.brandVoice) brandVoice = context.brandVoice
    
    // Use provided business context if available
    if (businessContext) {
      if (businessContext.primaryPlatforms && businessContext.primaryPlatforms.length > 0) {
        platforms = businessContext.primaryPlatforms
      }
      if (businessContext.brandVoice) {
        brandVoice = businessContext.brandVoice
      }
      
      // Adjust post count based on target audience and industry
      if (businessContext.targetAudience) {
        if (businessContext.targetAudience.toLowerCase().includes('young') || 
            businessContext.targetAudience.toLowerCase().includes('millennial')) {
          totalPosts = Math.min(totalPosts + 10, 50) // More posts for younger audiences
        }
      }
      
      // Adjust content focus based on key message
      if (businessContext.keyMessage) {
        const message = businessContext.keyMessage.toLowerCase()
        if (message.includes('healthy') || message.includes('wellness')) {
          contentFocus = ['Educational', 'Tips and tricks', 'Behind-the-scenes']
        } else if (message.includes('beautiful') || message.includes('aesthetic')) {
          contentFocus = ['Behind-the-scenes', 'User-generated content', 'Inspirational']
        }
      }
    }
    
    // Generate date range
    const dateRange = context.dateRange || {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
    
    const formData = {
      totalPosts,
      dateRange,
      platforms,
      selectedCategories: [], // Will be populated by user selection
      selectedTopics: [], // Will be populated by user selection
      brandVoice,
      contentFocus
    }
    
    console.log('🎯 Generated form data:', formData)
    return formData
  }

  /**
   * Generate posts from form data with progress callback
   */
  public async generatePostsFromForm(
    formData: {
      totalPosts: number
      dateRange: { start: string; end: string }
      platforms: SocialPlatform[]
      selectedCategories: string[]
      selectedTopics: string[]
      brandVoice: string
      contentFocus: string[]
    },
    organizationId: string,
    onProgress?: (current: number, total: number, action: string) => void
  ): Promise<AIContentPlan> {
    console.log('🚀 Starting form-based post generation', formData)
    
    // Update context with form data
    this.currentContext = {
      ...this.currentContext,
      postCount: formData.totalPosts,
      dateRange: formData.dateRange,
      platforms: formData.platforms,
      brandVoice: formData.brandVoice,
      contentTypes: formData.contentFocus
    }

    // Create content plan
    const plan = await this.generateContentPlan(organizationId)
    
    // Normalize progress callback to avoid runtime TypeError if a non-function is passed
    const progressCallback = typeof onProgress === 'function' ? onProgress : undefined
    
    // Generate posts with progress tracking
    const posts = await this.generatePostsWithProgress(
      plan,
      progressCallback
    )
    
    plan.posts = posts
    plan.status = 'confirmed'
    
    console.log(`✅ Generated ${posts.length} posts from form data`)
    return plan
  }

  /**
   * Generate posts with progress tracking
   */
  private async generatePostsWithProgress(
    plan: AIContentPlan,
    onProgress?: (current: number, total: number, action: string) => void
  ): Promise<AIPostPreview[]> {
    const posts: AIPostPreview[] = []
    
    const maxPosts = Math.min(plan.totalPosts, this.maxPostsPerGeneration)
    console.log(`Generating ${maxPosts} posts with progress tracking`)
    
    const dates = this.generatePostDates(plan.dateRange, maxPosts)

    for (let i = 0; i < maxPosts; i++) {
      if (typeof onProgress === 'function') {
        onProgress(i, maxPosts, 'Generating post content')
      }
      
      const post: AIPostPreview = {
        id: `post-${Date.now()}-${i}`,
        title: `Generated Post ${i + 1}`,
        content: await this.generatePostContent(plan, i),
        categoryId: '',
        topicId: '',
        platform: plan.platform,
        type: 'post' as PostType,
        scheduledAt: dates[i],
        hashtags: this.generateHashtags(plan),
        callToAction: this.generateCallToAction(),
        estimatedEngagement: this.estimateEngagement(i),
        reasoning: this.generateReasoning(plan, i)
      }
      posts.push(post)
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    if (typeof onProgress === 'function') {
      onProgress(maxPosts, maxPosts, 'Scheduling posts')
    }
    
    return posts
  }

  /**
   * Check if Ollama is running and available
   */
  public async checkOllamaStatus(): Promise<boolean> {
    try {
      // Try bundled Ollama first
      if (window.electronAPI?.ollama?.checkStatus) {
        const bundledStatus = await window.electronAPI.ollama.checkStatus()
        if (bundledStatus?.available) {
          console.log('✅ Bundled Ollama is available')
          return true
        }
        console.log('⚠️ Bundled Ollama not available, checking external...')
      }
      
      // Fallback to external Ollama
      console.log('🔍 Checking external Ollama at:', this.ollamaEndpoint)
      const response = await fetch(`${this.ollamaEndpoint}/api/tags`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ External Ollama is available with models:', data.models?.length || 0)
        return true
      } else {
        console.log('❌ External Ollama not responding:', response.status)
        return false
      }
    } catch (error) {
      console.error('❌ Ollama not available:', error)
      return false
    }
  }

  /**
   * Pull/download a model if not available
   */
  public async pullModel(modelName: string = this.model): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaEndpoint}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
          stream: false
        })
      })
      return response.ok
    } catch (error) {
      console.error('Failed to pull model:', error)
      return false
    }
  }

  /**
   * Send a message to the AI model
   */
  public async sendMessage(
    message: string,
    context?: any,
    overrides?: {
      model?: string
      temperature?: number
      top_p?: number
      max_tokens?: number
    }
  ): Promise<string> {
    try {
      // Try bundled Ollama first
      if (window.electronAPI?.ollama?.generate) {
        console.log('🔄 Trying bundled Ollama...')
        const bundledResponse = await window.electronAPI.ollama.generate(this.model, this.buildPrompt(message, context))
        if (bundledResponse.response) {
          console.log('✅ Bundled Ollama response received')
          return bundledResponse.response
        }
        console.log('⚠️ Bundled Ollama no response, trying external...')
      }
      
      // Fallback to external Ollama
      console.log('🔄 Using external Ollama at:', this.ollamaEndpoint)
      const prompt = this.buildPrompt(message, context)
      console.log('📝 Sending prompt (length:', prompt.length, 'chars)')
      
      const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: overrides?.model || this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: overrides?.temperature ?? 0.7,
            top_p: overrides?.top_p ?? 0.9,
            max_tokens: overrides?.max_tokens ?? 2000
          }
        })
      })
 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
 
      const data = await response.json()
      console.log('✅ External Ollama response received (length:', data.response?.length || 0, 'chars)')
      return data.response || 'Sorry, I encountered an error processing your request.'
    } catch (error) {
      console.error('❌ Error sending message to AI:', error)
      return 'I apologize, but I\'m having trouble connecting to the AI service. Please make sure Ollama is running.'
    }
  }

  /**
   * Process user directive with true conversational AI
   */
  public async processDirective(
    userMessage: string
  ): Promise<AIResponse> {
    // Add user message to conversation history
    this.addMessage('user', userMessage)

    // 🎯 Parse user message to extract business context
    const parsedContext = this.parseDirective(userMessage)
    console.log('🎯 Parsed context from user message:', parsedContext)
    this.currentContext = { ...this.currentContext, ...parsedContext }
    console.log('🎯 Updated current context:', this.currentContext)

    // Build conversation context for the AI
    const conversationContext = this.buildConversationContext()
    
    // Send to AI model for natural response
    const aiResponse = await this.getAIResponse(conversationContext, userMessage)
    
    // Add AI response to conversation history
    this.addMessage('ai', aiResponse.message, aiResponse.metadata)
    
    // 🎯 NEVER generate posts during conversation phase!
    // Posts should only be generated after user confirms the form
    // The AI should only understand and show the form when ready
    
    console.log('AI response processed successfully, returning message')
    return {
      message: aiResponse.message,
      action: (aiResponse.action || 'clarify') as 'clarify' | 'preview' | 'confirm' | 'create' | 'error' | 'success'
    }
  }

  /**
   * Handle user confirmation and create posts
   */
  public async handleConfirmation(
    confirmation: string,
    organizationId: string
  ): Promise<AIResponse> {
    this.addMessage('user', confirmation)

    if (confirmation.toLowerCase().includes('create') || confirmation.toLowerCase().includes('yes')) {
      // Create the posts
      const posts = await this.createPostsFromPlan(organizationId)
      const successMessage = `🎉 **Posts created successfully!**\n\nI've created ${posts.length} posts and added them to your calendar. You can review and edit them in your Post Management section.`
      this.addMessage('ai', successMessage)

      return {
        message: successMessage,
        action: 'create',
        metadata: { posts }
      }
    } else if (confirmation.toLowerCase().includes('edit') || confirmation.toLowerCase().includes('change')) {
      // Handle editing requests
      return {
        message: 'I understand you want to edit some posts. Please specify which posts and what changes you\'d like to make.',
        action: 'clarify'
      }
    } else if (confirmation.toLowerCase().includes('add')) {
      // Handle adding more posts
      return {
        message: 'I understand you want to add more posts. How many additional posts would you like and what type of content?',
        action: 'clarify'
      }
    } else if (confirmation.toLowerCase().includes('remove')) {
      // Handle removing posts
      return {
        message: 'I understand you want to remove some posts. Please specify which posts you\'d like to remove.',
        action: 'clarify'
      }
    }

    return {
      message: 'I didn\'t understand your request. Please try again.',
      action: 'clarify'
    }
  }

  /**
   * Parse user directive to extract context
   */
  private parseDirective(message: string): Partial<AIDirectiveContext> {
    const context: Partial<AIDirectiveContext> = {}
    const lowerMessage = message.toLowerCase()

    // Extract multiple platforms
    const platforms: SocialPlatform[] = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok']
    const foundPlatforms: SocialPlatform[] = []
    
    for (const platform of platforms) {
      if (lowerMessage.includes(platform) || lowerMessage.includes(platform.substring(0, 3))) {
        foundPlatforms.push(platform)
      }
    }
    
    // Handle common abbreviations
    if (lowerMessage.includes('ig') || lowerMessage.includes('insta')) {
      foundPlatforms.push('instagram')
    }
    if (lowerMessage.includes('fb')) {
      foundPlatforms.push('facebook')
    }
    if (lowerMessage.includes('li')) {
      foundPlatforms.push('linkedin')
    }
    if (lowerMessage.includes('tt')) {
      foundPlatforms.push('tiktok')
    }
    
    // Set primary platform (first one found) and store all platforms
    if (foundPlatforms.length > 0) {
      context.platform = foundPlatforms[0]
      context.platforms = foundPlatforms // Store all platforms for multi-platform support
    }

    // Extract date range with improved patterns
    const datePatterns = [
      /from\s+(\w+)\s+to\s+(\w+)/i, // "from Oct to Dec"
      /(\w+)\s+to\s+(\w+)/i, // "Oct to Dec"
      /from\s+(\w+\s+\d+)\s+to\s+(\w+\s+\d+)/i,
      /(\w+\s+\d+)\s+to\s+(\w+\s+\d+)/i,
      /next\s+week/i,
      /this\s+week/i,
      /next\s+month/i,
      /(\d+)\s+days/i
    ]

    for (const pattern of datePatterns) {
      const match = message.match(pattern)
      if (match) {
        context.dateRange = this.parseDateRange(match[0])
        break
      }
    }
    
    // Enhanced business context extraction
    const businessContext: any = {}
    
    // Extract company name with improved patterns
    const companyNamePatterns = [
      /([A-Z][a-zA-Z0-9\s\/\-]+(?:Limited|Ltd|Company|Corp|Inc|LLC|Group|House|Services|Agency|Studio|Media|Marketing|Advertising|Production|Entertainment|Consulting|Solutions|Technologies|Systems|Digital|Creative|Design|Brand))/i,
      /([A-Z][a-zA-Z0-9\s\/\-]+)\s+(?:is|are)\s+(?:a|an|the)/i, // "1/2 Drink is a healthy drink"
      /([A-Z][a-zA-Z0-9\s\/\-]+)\s+(?:company|business|brand|drink|product)/i, // "1/2 Drink company"
      /([A-Z][a-zA-Z0-9\s\/\-]+)\s+(?:that|which)/i, // "1/2 Drink that kills people"
      /([A-Z][a-zA-Z0-9\s\/\-]+)\s+(?:drink|beverage)/i, // "1/2 Drink beverage"
      /([A-Z][a-zA-Z0-9\s\/\-]+)\s+(?:healthy|homemade)/i // "1/2 Drink healthy"
    ]
    
    // Special case for "1/2 Drink" pattern
    if (message.includes('1/2') && message.includes('drink')) {
      businessContext.companyName = '1/2 Drink'
    } else {
      for (const pattern of companyNamePatterns) {
        const match = message.match(pattern)
        if (match) {
          businessContext.companyName = match[1].trim()
          break
        }
      }
    }
    
    // Extract industry with more comprehensive patterns
    const industryPatterns = [
      { keywords: ['drink', 'beverage', 'drinks', 'beverages', 'homemade drink', 'healthy drink', 'juice', 'smoothie', 'cocktail', 'mocktail'], industry: 'beverage' },
      { keywords: ['food', 'restaurant', 'cafe', 'catering', 'culinary', 'cooking', 'recipe', 'meal'], industry: 'food' },
      { keywords: ['healthcare', 'medical', 'health', 'hospital', 'clinic', 'wellness', 'healthy'], industry: 'healthcare' },
      { keywords: ['financial', 'finance', 'banking', 'investment', 'planning', 'planner'], industry: 'financial' },
      { keywords: ['technology', 'tech', 'software', 'digital', 'IT', 'app', 'platform'], industry: 'technology' },
      { keywords: ['education', 'school', 'university', 'learning', 'training', 'course'], industry: 'education' },
      { keywords: ['retail', 'store', 'shop', 'ecommerce', 'commerce', 'selling', 'sales'], industry: 'retail' },
      { keywords: ['travel', 'tourism', 'hotel', 'vacation', 'trip', 'booking'], industry: 'travel' },
      { keywords: ['fitness', 'gym', 'workout', 'exercise', 'sports'], industry: 'fitness' },
      { keywords: ['real estate', 'property', 'housing', 'construction', 'home'], industry: 'real estate' },
      { keywords: ['consulting', 'consultant', 'advisory', 'strategy', 'business'], industry: 'consulting' },
      { keywords: ['entertainment', 'media', 'film', 'tv', 'music', 'content'], industry: 'entertainment' },
      { keywords: ['production house', 'production', 'advertising', 'marketing', 'creative'], industry: 'advertising' }
    ]
    
    for (const pattern of industryPatterns) {
      if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
        businessContext.industry = pattern.industry
        break
      }
    }
    
    // Extract mission/vision with better patterns
    const missionPatterns = [
      /(?:mission|vision|goal|purpose|aim)[\s:]+(.+?)(?:\n|\.|$)/i,
      /(?:we|our|the company|our company)[\s]+(?:mission|vision|goal|purpose|aim)[\s]+(?:is|are)[\s:]+(.+?)(?:\n|\.|$)/i,
      /(?:focuses?|specializes?|provides?)[\s]+(.+?)(?:\n|\.|$)/i
    ]
    
    for (const pattern of missionPatterns) {
      const match = message.match(pattern)
      if (match) {
        businessContext.mission = match[1].trim()
        break
      }
    }
    
    // Extract target audience
    const audiencePatterns = [
      /(?:target|targeting|audience|customers?|clients?)[\s:]+(.+?)(?:\.|$|\n)/i,
      /(?:for|to)\s+(?:ladies?|women?|men?|people?|customers?|clients?)\s+(?:in|aged|of)\s+(?:their\s+)?(\d+[s]?)/i,
      /(?:ladies?|women?|men?|people?)\s+(?:in|aged|of)\s+(?:their\s+)?(\d+[s]?)/i
    ]
    
    for (const pattern of audiencePatterns) {
      const match = message.match(pattern)
      if (match) {
        businessContext.targetAudience = match[1] || match[0]
        break
      }
    }
    
    // Extract key message/brand message
    const messagePatterns = [
      /(?:key\s+message|brand\s+message|message|slogan)[\s:]+(.+?)(?:\.|$|\n)/i,
      /(?:healthy\s+can\s+be\s+beautiful|beautiful\s+and\s+healthy)/i,
      /(?:we\s+believe|our\s+message|our\s+philosophy)[\s:]+(.+?)(?:\.|$|\n)/i
    ]
    
    for (const pattern of messagePatterns) {
      const match = message.match(pattern)
      if (match) {
        businessContext.keyMessage = match[1] || match[0]
        break
      }
    }
    
    // Extract services with comprehensive patterns
    const services: string[] = []
    const servicePatterns = [
      { keywords: ['drink', 'beverage', 'drinks', 'beverages', 'homemade drink', 'healthy drink', 'juice', 'smoothie'], service: 'beverage production' },
      { keywords: ['healthy', 'wellness', 'nutrition', 'wellness drinks'], service: 'health & wellness' },
      { keywords: ['beautiful', 'aesthetic', 'visual', 'presentation'], service: 'aesthetic presentation' },
      { keywords: ['homemade', 'craft', 'artisanal', 'handmade'], service: 'artisanal production' },
      { keywords: ['advertising', 'advertisement', 'ads', 'marketing'], service: 'advertising' },
      { keywords: ['production', 'video', 'film', 'content creation'], service: 'production' },
      { keywords: ['creative', 'design', 'branding', 'visual'], service: 'creative services' },
      { keywords: ['online exposure', 'digital presence', 'social media'], service: 'digital marketing' },
      { keywords: ['seasonal', 'campaign', 'promotional'], service: 'campaign management' },
      { keywords: ['financial planning', 'financial advice', 'investment'], service: 'financial planning' },
      { keywords: ['event', 'events', 'conference', 'meeting'], service: 'events' },
      { keywords: ['consultation', 'consulting', 'advisory'], service: 'consultation' },
      { keywords: ['web design', 'website', 'development'], service: 'web development' },
      { keywords: ['seo', 'search engine', 'optimization'], service: 'SEO' }
    ]
    
    for (const pattern of servicePatterns) {
      if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
        services.push(pattern.service)
      }
    }
    
    if (services.length > 0) { businessContext.services = services }
    
    
    // Set business context if we found any business information
    if (Object.keys(businessContext).length > 0) { 
      context.businessContext = businessContext 
    }

    // Extract post count
    const countMatch = message.match(/(\d+)\s+posts?/i)
    if (countMatch) {
      context.postCount = parseInt(countMatch[1])
    }

    // Extract content types
    const contentTypes = ['educational', 'promotional', 'motivational', 'behind-the-scenes', 'user-generated', 'tips', 'tutorials']
    context.contentTypes = contentTypes.filter(type => 
      message.toLowerCase().includes(type)
    )

    return context
  }


  /**
   * Build conversation context for AI model (optimized for speed)
   */
  private buildConversationContext(): string {
    // Keep context minimal for faster responses
    let context = `You are an AI social media assistant. Help users create content calendars.

CAPABILITIES: Create posts for Facebook, Instagram, LinkedIn, TikTok, Twitter. Schedule posts. Provide recommendations.

RECENT CONVERSATION:`

    // Only include last 3 messages to keep context small
    const recentMessages = this.conversationHistory.slice(-3)
    recentMessages.forEach(msg => {
      const role = msg.type === 'user' ? 'User' : 'Assistant'
      context += `\n${role}: ${msg.content}`
    })

    // Add minimal business context
    const bc = this.currentContext.businessContext
    if (bc?.companyName || bc?.industry) {
      context += `\n\nBUSINESS: ${bc.companyName || 'Company'} (${bc.industry || 'business'})`
    }

    context += `\n\nBe helpful and conversational. Focus on understanding the user's business and needs. Ask clarifying questions to better understand their goals, target audience, and content preferences.`

    return context
  }

  /**
   * Get AI response using true conversational AI with timeout
   */
  private async getAIResponse(context: string, userMessage: string): Promise<{
    message: string
    action?: string
    shouldCreatePosts?: boolean
    metadata?: any
  }> {
    try {
      const prompt = `${context}\n\nUser: ${userMessage}\n\nAssistant:`
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('AI response timeout')), 30000) // 30 second timeout
      })
      
      console.log('Sending prompt to AI (length:', prompt.length, 'characters)')
      const responsePromise = this.sendMessage(prompt)
      const response = await Promise.race([responsePromise, timeoutPromise])
      console.log('AI response received (length:', response.length, 'characters)')
      
      // 🎯 AI should only have conversations, never decide to create posts
      // Posts are only created after user confirms the form
      
      console.log('AI response analysis:', {
        responseLength: response.length,
        action: 'clarify'
      })
      
      return {
        message: response,
        action: 'clarify',
        shouldCreatePosts: false, // Never create posts during conversation
        metadata: { isQuestion: true }
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      if (error instanceof Error && error.message === 'AI response timeout') {
        return {
          message: "I'm taking a bit longer than usual to respond. This might be because I'm processing a complex request. Could you try asking something simpler, or would you like me to help you with a specific part of your social media strategy?",
          action: 'error',
          metadata: { isQuestion: true }
        }
      }
      
      return {
        message: "I apologize, but I'm having trouble processing your request right now. Could you please try again?",
        action: 'error',
        metadata: { isQuestion: true }
      }
    }
  }





















  /**
   * Generate scheduling recommendations based on platform and context
   */
  private generateSchedulingRecommendation(platform: SocialPlatform): AISchedulingRecommendation {
    const recommendations: Record<SocialPlatform, AISchedulingRecommendation> = {
      instagram: {
        platform: 'instagram',
        optimalFrequency: {
          daily: 1,
          weekly: 7,
          monthly: 30
        },
        bestTimes: ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'],
        bestDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        reasoning: 'Instagram performs best with daily posting. Peak engagement occurs during lunch breaks and after work hours.',
        engagementTips: [
          'Use high-quality visuals and stories',
          'Post consistently at the same time daily',
          'Engage with comments within the first hour',
          'Use relevant hashtags (5-10 per post)'
        ]
      },
      facebook: {
        platform: 'facebook',
        optimalFrequency: {
          daily: 1,
          weekly: 5,
          monthly: 20
        },
        bestTimes: ['9:00 AM', '1:00 PM', '3:00 PM'],
        bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
        reasoning: 'Facebook works well with 5 posts per week. Tuesday-Thursday show highest engagement rates.',
        engagementTips: [
          'Share valuable, informative content',
          'Ask questions to encourage comments',
          'Use native video for better reach',
          'Post when your audience is most active'
        ]
      },
      twitter: {
        platform: 'twitter',
        optimalFrequency: {
          daily: 3,
          weekly: 15,
          monthly: 60
        },
        bestTimes: ['9:00 AM', '12:00 PM', '5:00 PM'],
        bestDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        reasoning: 'Twitter requires more frequent posting due to fast-moving timeline. 3-5 tweets per day is optimal.',
        engagementTips: [
          'Share timely, relevant content',
          'Engage in conversations and trending topics',
          'Use hashtags strategically (1-2 per tweet)',
          'Retweet and reply to build community'
        ]
      },
      linkedin: {
        platform: 'linkedin',
        optimalFrequency: {
          daily: 1,
          weekly: 5,
          monthly: 20
        },
        bestTimes: ['8:00 AM', '12:00 PM', '5:00 PM'],
        bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
        reasoning: 'LinkedIn performs best with professional content during business hours. Tuesday-Thursday are optimal.',
        engagementTips: [
          'Share professional insights and industry news',
          'Write longer, thoughtful posts',
          'Engage with comments professionally',
          'Use professional hashtags'
        ]
      },
      tiktok: {
        platform: 'tiktok',
        optimalFrequency: {
          daily: 1,
          weekly: 7,
          monthly: 30
        },
        bestTimes: ['6:00 AM', '10:00 AM', '7:00 PM', '9:00 PM'],
        bestDays: ['Tuesday', 'Thursday', 'Friday'],
        reasoning: 'TikTok thrives on daily posting. Early morning and evening posts perform best with younger audiences.',
        engagementTips: [
          'Create short, engaging videos (15-60 seconds)',
          'Use trending sounds and hashtags',
          'Post consistently to build algorithm favor',
          'Engage with comments quickly'
        ]
      }
    }

    return recommendations[platform]
  }

  /**
   * Calculate optimal post count based on date range and platform
   */
  private calculateOptimalPostCount(platform: SocialPlatform, dateRange: { start: string; end: string }): number {
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    const recommendations = this.generateSchedulingRecommendation(platform)
    const weeklyFrequency = recommendations.optimalFrequency.weekly
    
    // Calculate posts based on weekly frequency
    const weeks = Math.ceil(daysDiff / 7)
    const calculatedPosts = Math.ceil((weeks * weeklyFrequency) * (daysDiff / (weeks * 7)))
    
    // Ensure minimum of 1 post and maximum of 2 posts per day
    const minPosts = Math.max(1, Math.ceil(daysDiff * 0.1)) // At least 10% of days
    const maxPosts = Math.min(daysDiff * 2, 100) // Max 2 posts per day, cap at 100
    
    return Math.max(minPosts, Math.min(calculatedPosts, maxPosts))
  }

  /**
   * Generate content plan based on context
   */
  private async generateContentPlan(
    organizationId: string
  ): Promise<AIContentPlan> {
    const platform = this.currentContext.platform || 'instagram'
    const dateRange = this.currentContext.dateRange || this.getDefaultDateRange()
    const recommendedPostCount = this.calculateOptimalPostCount(platform, dateRange)
    const userPostCount = this.currentContext.postCount || recommendedPostCount
    
    const plan: AIContentPlan = {
      id: `plan-${Date.now()}`,
      organizationId,
      platform,
      dateRange,
      totalPosts: userPostCount,
      postingSchedule: this.generatePostingSchedule(),
      targetAudience: this.currentContext.targetAudience || 'General audience',
      contentFocus: this.currentContext.contentTypes || ['Educational'],
      brandVoice: this.currentContext.brandVoice || 'Professional and friendly',
      posts: [],
      schedulingRecommendation: this.generateSchedulingRecommendation(platform),
      createdAt: new Date().toISOString(),
      status: 'draft'
    }

    // Don't generate posts here - they'll be generated separately
    plan.posts = []

    // Store the current plan
    this.currentPlan = plan

    return plan
  }


  /**
   * Generate post content using AI
   */
  private async generatePostContent(plan: AIContentPlan, index: number): Promise<string> {
    const prompt = `
Create a social media post for ${plan.platform} with the following requirements:
- Brand: ${this.currentContext.brand || 'Your Brand'}
- Target Audience: ${plan.targetAudience}
- Content Type: ${plan.contentFocus[index % plan.contentFocus.length]}
- Brand Voice: ${plan.brandVoice}
- Platform: ${plan.platform}
- Post Number: ${index + 1} of ${plan.totalPosts}

Make it engaging, platform-appropriate, and include relevant hashtags. Keep it under 2,200 characters for Instagram.
`

    try {
      return await this.sendMessage(prompt)
    } catch (error) {
      return `This is a sample post for your ${plan.platform} content. Customize this content to match your brand voice and target audience.`
    }
  }

  /**
   * Helper methods for content generation
   */
  private buildPrompt(message: string, context?: any): string {
    const systemPrompt = `You are a social media content creation assistant. Help users create engaging, platform-appropriate content for their social media campaigns. Be conversational, helpful, and ask clarifying questions when needed.`
    
    return `${systemPrompt}\n\nUser: ${message}\n\nContext: ${JSON.stringify(context || {})}\n\nAssistant:`
  }

  private addMessage(type: 'user' | 'ai', content: string, metadata?: any) {
    const message: AIChatMessage = {
      id: `msg-${Date.now()}`,
      type,
      content,
      timestamp: new Date().toISOString(),
      metadata
    }
    this.conversationHistory.push(message)
  }

  private parseDateRange(dateString: string): { start: string; end: string } {
    const now = new Date()
    const currentYear = now.getFullYear()
    
    // Month name mapping
    const monthMap: Record<string, number> = {
      'jan': 0, 'january': 0,
      'feb': 1, 'february': 1,
      'mar': 2, 'march': 2,
      'apr': 3, 'april': 3,
      'may': 4,
      'jun': 5, 'june': 5,
      'jul': 6, 'july': 6,
      'aug': 7, 'august': 7,
      'sep': 8, 'september': 8,
      'oct': 9, 'october': 9,
      'nov': 10, 'november': 10,
      'dec': 11, 'december': 11
    }
    
    const lowerDateString = dateString.toLowerCase()
    
    // Handle month ranges like "Oct to Dec"
    const monthRangeMatch = lowerDateString.match(/(\w+)\s+to\s+(\w+)/)
    if (monthRangeMatch) {
      const startMonth = monthMap[monthRangeMatch[1]]
      const endMonth = monthMap[monthRangeMatch[2]]
      
      if (startMonth !== undefined && endMonth !== undefined) {
        const startDate = new Date(currentYear, startMonth, 1)
        const endDate = new Date(currentYear, endMonth + 1, 0) // Last day of end month
        
        return {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      }
    }
    
    // Handle "next week"
    if (lowerDateString.includes('next week')) {
      const start = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const end = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }
    
    // Handle "this week"
    if (lowerDateString.includes('this week')) {
      const start = new Date(now)
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }
    
    // Handle "next month"
    if (lowerDateString.includes('next month')) {
      const start = new Date(currentYear, now.getMonth() + 1, 1)
      const end = new Date(currentYear, now.getMonth() + 2, 0)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }
    
    // Handle "X days"
    const daysMatch = lowerDateString.match(/(\d+)\s+days?/)
    if (daysMatch) {
      const days = parseInt(daysMatch[1])
      const start = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const end = new Date(now.getTime() + (days + 1) * 24 * 60 * 60 * 1000)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }
    
    // Default: 2 weeks from tomorrow
    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const end = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  }

  private getDefaultDateRange(): { start: string; end: string } {
    const now = new Date()
    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  }

  private generatePostingSchedule(): string[] {
    return ['Monday 9:00 AM', 'Wednesday 1:00 PM', 'Friday 6:00 PM']
  }

  private generatePostDates(dateRange: { start: string; end: string }, count: number): string[] {
    const dates: string[] = []
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const interval = Math.floor(diffDays / count)

    for (let i = 0; i < count; i++) {
      const date = new Date(start.getTime() + (i * interval * 24 * 60 * 60 * 1000))
      dates.push(date.toISOString())
    }

    return dates
  }


  private generateHashtags(plan: AIContentPlan): string[] {
    const baseHashtags = ['#SocialMedia', '#Content', '#Marketing']
    const platformHashtags = {
      instagram: ['#Instagram', '#InstaGood'],
      facebook: ['#Facebook', '#Social'],
      twitter: ['#Twitter', '#Tweet'],
      linkedin: ['#LinkedIn', '#Professional'],
      tiktok: ['#TikTok', '#Viral']
    }
    
    return [...baseHashtags, ...(platformHashtags[plan.platform] || [])]
  }

  private generateCallToAction(): string {
    const ctas = [
      'What do you think? Share your thoughts below!',
      'Try this and let me know how it goes!',
      'Save this post for later reference!',
      'Follow for more tips like this!'
    ]
    return ctas[Math.floor(Math.random() * ctas.length)]
  }

  private estimateEngagement(index: number): 'low' | 'medium' | 'high' {
    // Simple engagement estimation based on content type and timing
    return index % 3 === 0 ? 'high' : index % 2 === 0 ? 'medium' : 'low'
  }

  private generateReasoning(plan: AIContentPlan, index: number): string {
    return `Post ${index + 1} focuses on ${plan.contentFocus[index % plan.contentFocus.length]} content, scheduled for optimal engagement time based on ${plan.platform} best practices.`
  }




  private async createPostsFromPlan(
    organizationId: string
  ): Promise<Post[]> {
    if (!this.currentPlan) {
      throw new Error('No content plan available')
    }

    const createdPosts: Post[] = []
    
    try {
      // Set the organization ID for the API service
      apiService.setOrganizationId(organizationId)
      
      for (const postPreview of this.currentPlan.posts) {
        const postData = {
          organizationId,
          categoryId: postPreview.categoryId,
          topicId: postPreview.topicId,
          title: postPreview.title,
          content: postPreview.content,
          media: [], // No media for AI-generated posts initially
          hashtags: postPreview.hashtags,
          platform: postPreview.platform,
          type: postPreview.type,
          status: 'draft' as const,
          scheduledAt: postPreview.scheduledAt,
          metadata: {
            characterCount: postPreview.content.length,
            wordCount: postPreview.content.split(/\s+/).length,
            readingTime: Math.ceil(postPreview.content.split(/\s+/).length / 200), // 200 words per minute
            lastEditedBy: 'AI Assistant',
            version: 1,
            aiGenerated: true,
            aiModel: this.model,
            generatedAt: new Date().toISOString(),
            originalPlan: this.currentPlan.id
          } as PostMetadata
        }

        const createdPost = await apiService.createPost(postData)
        createdPosts.push(createdPost)
      }

      // Update the plan status
      this.currentPlan.status = 'created'
      
      return createdPosts
    } catch (error) {
      console.error('Error creating posts from plan:', error)
      throw new Error('Failed to create posts. Please try again.')
    }
  }


  /**
   * Get conversation history
   */
  public getConversationHistory(): AIChatMessage[] {
    return this.conversationHistory
  }

  /**
   * Clear conversation history
   */
  public clearConversation(): void {
    this.conversationHistory = []
    this.currentContext = {}
    this.currentPlan = null
  }

  /**
   * Set AI model
   */
  public setModel(modelName: string): void {
    this.model = modelName
  }

  /**
   * Get available models
   */
  public async getAvailableModels(): Promise<string[]> {
    try {
      // Try bundled Ollama first
      if (window.electronAPI?.ollama?.getModels) {
        const bundledResponse = await window.electronAPI.ollama.getModels()
        if (bundledResponse.models) {
          return bundledResponse.models.map((model: any) => model.name)
        }
      }
      
      // Fallback to external Ollama
      const response = await fetch(`${this.ollamaEndpoint}/api/tags`)
      const data = await response.json()
      return data.models?.map((model: any) => model.name) || []
    } catch (error) {
      console.error('Error fetching models:', error)
      return []
    }
  }

  /**
   * Translate text between Chinese and English using AI
   */
  public async translateText(text: string, targetLanguage: 'chinese' | 'english'): Promise<string> {
    try {
      // Check if AI service is available first
      const isAvailable = await this.checkOllamaStatus()
      if (!isAvailable) {
        throw new Error('AI service is not available')
      }

      const sourceLanguage = targetLanguage === 'chinese' ? 'English' : 'Chinese'
      const targetLang = targetLanguage === 'chinese' ? 'Chinese' : 'English'
      
      const prompt = `You are a translation machine. Your ONLY job is to translate text.

SOURCE LANGUAGE: ${sourceLanguage}
TARGET LANGUAGE: ${targetLang}

TEXT TO TRANSLATE: "${text}"

RULES:
1. Translate the text from ${sourceLanguage} to ${targetLang}
2. Return ONLY the translated text
3. Do NOT add explanations, comments, or extra text
4. Do NOT repeat the original text
5. Do NOT say "I'd be happy to help" or similar phrases

TRANSLATION:`

      console.log(`🔄 Translating text from ${sourceLanguage} to ${targetLang}`)
      const response = await this.sendMessage(prompt, undefined, {
        model: 'llama3.2:3b',
        temperature: 0.0,
        top_p: 0.1,
        max_tokens: 500
      })
      
      // Clean up the response to remove any extra formatting
      let translatedText = response.trim()
      
      // Remove common AI response patterns
      const unwantedPatterns = [
        'I\'d be happy to help',
        'I can help you',
        'Let me translate',
        'Here\'s the translation',
        'Here is the translation',
        'The translation is',
        'Content Organization',
        'Organize your content'
      ]
      
      // Special patterns that indicate the AI is not translating properly
      const badResponsePatterns = [
        'Categories: {}',
        'Topics: {}',
        'Important Note:',
        'Translation:',
        'Let me know if you need any further assistance',
        'I\'d be happy to help',
        'Content Organization Tips',
        'Organize your content'
      ]
      
      // Check if response contains bad patterns that indicate poor AI response
      const hasBadResponse = badResponsePatterns.some(pattern => 
        translatedText.includes(pattern)
      )
      
      // Check if AI returned the exact same text (no translation happened)
      const isSameText = translatedText.trim().toLowerCase() === text.trim().toLowerCase()
      
      if (hasBadResponse || isSameText) {
        console.log('⚠️ AI returned poor response or no translation, using fallback')
        console.log('Original text:', text)
        console.log('AI response:', translatedText)
        console.log('Is same text:', isSameText)
        translatedText = this.getFallbackTranslation(text, targetLanguage)
      } else {
        // Check if response contains unwanted conversational patterns
        const hasUnwantedPattern = unwantedPatterns.some(pattern => 
          translatedText.toLowerCase().includes(pattern.toLowerCase())
        )
        
        if (hasUnwantedPattern) {
          // Try to extract the actual translation
          const lines = translatedText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
          
          // Look for lines that don't contain unwanted patterns
          const cleanLines = lines.filter(line => 
            !unwantedPatterns.some(pattern => 
              line.toLowerCase().includes(pattern.toLowerCase())
            )
          )
          
          if (cleanLines.length > 0) {
            // Take the first clean line that looks like a translation
            translatedText = cleanLines[0]
          } else {
            // If no clean lines found, try to extract from the original text
            // Look for content after common separators
            const separators = ['Translation:', 'translation:', ':', '：']
            for (const separator of separators) {
              const parts = translatedText.split(separator)
              if (parts.length > 1) {
                const candidate = parts[1].trim()
                if (candidate.length > 0 && !unwantedPatterns.some(pattern => 
                  candidate.toLowerCase().includes(pattern.toLowerCase())
                )) {
                  translatedText = candidate
                  break
                }
              }
            }
          }
        }
      }
      
      // Final cleanup - remove quotes if the entire response is wrapped in quotes
      if (translatedText.startsWith('"') && translatedText.endsWith('"')) {
        translatedText = translatedText.slice(1, -1)
      }
      
      console.log(`✅ Translation completed: ${translatedText.substring(0, 100)}...`)
      return translatedText
      
    } catch (error) {
      console.error('Error translating text:', error)
      
      // Fallback message
      const fallbackMessage = targetLanguage === 'chinese' 
        ? '翻译服务暂时不可用，请稍后重试。' 
        : 'Translation service is temporarily unavailable. Please try again later.'
      
      return fallbackMessage
    }
  }

  /**
   * Fallback translation using simple rules for common phrases
   */
  private getFallbackTranslation(text: string, targetLanguage: 'chinese' | 'english'): string {
    const commonTranslations: Record<string, { chinese: string; english: string }> = {
      'Content Organization Tips': {
        chinese: '内容组织建议',
        english: 'Content Organization Tips'
      },
      'Important Note:': {
        chinese: '重要说明：',
        english: 'Important Note:'
      },
      'Let me know if you need any further assistance!': {
        chinese: '如果您需要任何进一步的帮助，请告诉我！',
        english: 'Let me know if you need any further assistance!'
      },
      'Organize your content with categories and topics for better management. This helps you maintain consistency and makes it easier to find specific posts later.': {
        chinese: '使用类别和主题来组织您的内容，以便更好地管理。这有助于您保持一致性，并更容易找到特定的帖子。',
        english: 'Organize your content with categories and topics for better management. This helps you maintain consistency and makes it easier to find specific posts later.'
      },
      'Categories:': {
        chinese: '类别：',
        english: 'Categories:'
      },
      'Topics:': {
        chinese: '话题：',
        english: 'Topics:'
      },
      'Hello': {
        chinese: '你好',
        english: 'Hello'
      },
      'Thank you': {
        chinese: '谢谢',
        english: 'Thank you'
      },
      'Welcome': {
        chinese: '欢迎',
        english: 'Welcome'
      },
      'Good morning': {
        chinese: '早上好',
        english: 'Good morning'
      },
      'Good afternoon': {
        chinese: '下午好',
        english: 'Good afternoon'
      },
      'Good evening': {
        chinese: '晚上好',
        english: 'Good evening'
      }
    }

    // Check for exact matches first
    if (commonTranslations[text]) {
      return commonTranslations[text][targetLanguage]
    }

    // Check for partial matches
    for (const [key, translations] of Object.entries(commonTranslations)) {
      if (text.includes(key)) {
        return translations[targetLanguage]
      }
    }

    // If no match found, return the original text
    return text
  }

}
