import { 
  AIChatMessage, 
  AIContentPlan, 
  AIPostPreview, 
  AIDirectiveContext, 
  AIClarificationQuestion, 
  AIResponse,
  Post,
  Category,
  Topic,
  SocialPlatform,
  PostType
} from '@/types'
import { apiService } from '@/services/ApiService'

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
    categories: Category[],
    topics: Topic[],
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
    const plan = await this.generateContentPlan(organizationId, categories, topics)
    
    // Generate posts with progress tracking
    const posts = await this.generatePostsWithProgress(
      plan,
      categories,
      topics,
      formData.selectedCategories,
      formData.selectedTopics,
      onProgress
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
    categories: Category[],
    topics: Topic[],
    selectedCategories: string[],
    selectedTopics: string[],
    onProgress?: (current: number, total: number, action: string) => void
  ): Promise<AIPostPreview[]> {
    const posts: AIPostPreview[] = []
    
    const maxPosts = Math.min(plan.totalPosts, this.maxPostsPerGeneration)
    console.log(`Generating ${maxPosts} posts with progress tracking`)
    
    const dates = this.generatePostDates(plan.dateRange, maxPosts)
    
    // Filter categories and topics based on selection
    const filteredCategories = categories.filter(cat => 
      selectedCategories.length === 0 || selectedCategories.includes(cat.id)
    )
    const filteredTopics = topics.filter(topic => 
      selectedTopics.length === 0 || selectedTopics.includes(topic.id)
    )

    for (let i = 0; i < maxPosts; i++) {
      onProgress?.(i, maxPosts, 'Generating post content')
      
      const post: AIPostPreview = {
        id: `post-${Date.now()}-${i}`,
        title: `Generated Post ${i + 1}`,
        content: await this.generatePostContent(plan, i),
        categoryId: this.selectCategory(filteredCategories, i),
        topicId: this.selectTopic(filteredTopics, filteredCategories, i),
        platform: plan.platform,
        type: 'post',
        scheduledAt: dates[i],
        hashtags: this.generateHashtags(plan),
        callToAction: this.generateCallToAction(plan),
        estimatedEngagement: this.estimateEngagement(plan, i),
        reasoning: this.generateReasoning(plan, i)
      }
      posts.push(post)
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    onProgress?.(maxPosts, maxPosts, 'Scheduling posts')
    
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
          return true
        }
      }
      
      // Fallback to external Ollama
      const response = await fetch(`${this.ollamaEndpoint}/api/tags`)
      return response.ok
    } catch (error) {
      console.error('Ollama not available:', error)
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
  public async sendMessage(message: string, context?: any): Promise<string> {
    try {
      // Try bundled Ollama first
      if (window.electronAPI?.ollama?.generate) {
        const bundledResponse = await window.electronAPI.ollama.generate(this.model, this.buildPrompt(message, context))
        if (bundledResponse.response) {
          return bundledResponse.response
        }
      }
      
      // Fallback to external Ollama
      const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: this.buildPrompt(message, context),
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.response || 'Sorry, I encountered an error processing your request.'
    } catch (error) {
      console.error('Error sending message to AI:', error)
      return 'I apologize, but I\'m having trouble connecting to the AI service. Please make sure Ollama is running.'
    }
  }

  /**
   * Process user directive with true conversational AI
   */
  public async processDirective(
    userMessage: string, 
    organizationId: string,
    categories: Category[],
    topics: Topic[]
  ): Promise<AIResponse> {
    // Add user message to conversation history
    this.addMessage('user', userMessage)

    // 🎯 Parse user message to extract business context
    const parsedContext = this.parseDirective(userMessage)
    console.log('🎯 Parsed context from user message:', parsedContext)
    this.currentContext = { ...this.currentContext, ...parsedContext }
    console.log('🎯 Updated current context:', this.currentContext)

    // Build conversation context for the AI
    const conversationContext = this.buildConversationContext(organizationId, categories, topics)
    
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
      action: aiResponse.action || 'clarify'
    }
    
    console.log('AI response processed successfully, returning message')
    return {
      message: aiResponse.message,
      action: aiResponse.action || 'clarify'
    }
  }

  /**
   * Handle user confirmation and create posts
   */
  public async handleConfirmation(
    confirmation: string,
    organizationId: string,
    categories: Category[],
    topics: Topic[]
  ): Promise<AIResponse> {
    this.addMessage('user', confirmation)

    if (confirmation.toLowerCase().includes('create') || confirmation.toLowerCase().includes('yes')) {
      // Create the posts
      const posts = await this.createPostsFromPlan(organizationId, categories, topics)
      const successMessage = this.buildSuccessMessage(posts)
      this.addMessage('ai', successMessage)

      return {
        message: successMessage,
        action: 'create',
        metadata: { posts }
      }
    } else if (confirmation.toLowerCase().includes('edit') || confirmation.toLowerCase().includes('change')) {
      // Handle editing requests
      return this.handleEditRequest(confirmation, organizationId, categories, topics)
    } else if (confirmation.toLowerCase().includes('add')) {
      // Handle adding more posts
      return this.handleAddRequest(confirmation, organizationId, categories, topics)
    } else if (confirmation.toLowerCase().includes('remove')) {
      // Handle removing posts
      return this.handleRemoveRequest(confirmation, organizationId, categories, topics)
    }

    return {
      message: 'I didn\'t understand your request. Please try again.',
      action: 'clarify'
    }
  }

  /**
   * Check if the user message is a response to a clarification question
   */
  private isClarificationResponse(message: string): boolean {
    // Check if the last AI message was a clarification
    const lastMessage = this.conversationHistory[this.conversationHistory.length - 1]
    return lastMessage?.type === 'ai' && lastMessage.metadata?.isClarification === true
  }

  /**
   * Update context based on clarification response
   */
  private updateContextFromClarification(message: string): void {
    const lowerMessage = message.toLowerCase()
    
    // Check for approval responses first
    const approvalPhrases = [
      'ok', 'okay', 'good', 'fine', 'great', 'perfect', 'sounds good', 
      'that works', 'that\'s fine', 'your plan is ok', 'your plan is good',
      'i agree', 'yes', 'sure', 'approved', 'accepted', 'confirmed'
    ]
    
    const isApproval = approvalPhrases.some(phrase => lowerMessage.includes(phrase))
    
    if (isApproval) {
      // User approved the recommendations, use the recommended values
      this.useRecommendedValues()
      return
    }
    
    // Handle multiple choice responses (e.g., "1, 3" or "2")
    const choiceMatch = message.match(/^[\d,\s]+$/)
    if (choiceMatch) {
      this.parseMultipleChoiceResponse(message)
      return
    }
    
    // Extract platform from response
    const platforms: SocialPlatform[] = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok']
    for (const platform of platforms) {
      if (lowerMessage.includes(platform)) {
        this.currentContext.platform = platform
        break
      }
    }
    
    // Extract date range from response
    const datePatterns = [
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
        this.currentContext.dateRange = this.parseDateRange(match[0])
        break
      }
    }
    
    // Extract post count from response (handle various formats)
    const countPatterns = [
      /(\d+)\s+total\s+posts?/i,
      /(\d+)\s+posts?/i,
      /total[:\s]+(\d+)/i,
      /(\d+)\s+for\s+all\s+platforms?/i
    ]
    
    for (const pattern of countPatterns) {
      const match = message.match(pattern)
      if (match) {
        this.currentContext.postCount = parseInt(match[1])
        break
      }
    }
    
    // Handle platform-specific counts like "10 for facebook, 10 for linkedin"
    const platformCountMatch = message.match(/(\d+)\s+for\s+(facebook|instagram|twitter|linkedin|tiktok)/i)
    if (platformCountMatch) {
      // If user provides platform-specific counts, calculate total
      const platformCounts = message.match(/(\d+)\s+for\s+(facebook|instagram|twitter|linkedin|tiktok)/gi)
      if (platformCounts) {
        const total = platformCounts.reduce((sum, match) => {
          const numMatch = match.match(/(\d+)/)
          return sum + (numMatch ? parseInt(numMatch[1]) : 0)
        }, 0)
        this.currentContext.postCount = total
      }
    }
    
    // Extract brand/company name
    if (lowerMessage.includes('brand') || lowerMessage.includes('company')) {
      // Try to extract the brand name from the response
      const brandMatch = message.match(/(?:brand|company)[\s:]+(.+)/i)
      if (brandMatch) {
        this.currentContext.brand = brandMatch[1].trim()
      }
    }
    
    // Extract target audience
    if (lowerMessage.includes('audience') || lowerMessage.includes('target')) {
      const audienceMatch = message.match(/(?:audience|target)[\s:]+(.+)/i)
      if (audienceMatch) {
        this.currentContext.targetAudience = audienceMatch[1].trim()
      }
    }
    
    // Extract content types
    const contentTypes = ['educational', 'promotional', 'motivational', 'behind-the-scenes', 'user-generated', 'tips', 'tutorials']
    const foundTypes = contentTypes.filter(type => lowerMessage.includes(type))
    if (foundTypes.length > 0) {
      this.currentContext.contentTypes = foundTypes
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
   * Get missing information for content creation
   */
  private getMissingInformation(): string[] {
    const missing: string[] = []

    // Only require essential information
    if (!this.currentContext.platform) {
      missing.push('platform')
    }
    if (!this.currentContext.dateRange) {
      missing.push('dateRange')
    }
    if (!this.currentContext.postCount) {
      missing.push('postCount')
    }

    // Make these optional - provide defaults if missing
    if (!this.currentContext.brand) {
      // Don't add to missing - we'll use a default
    }
    if (!this.currentContext.targetAudience) {
      // Don't add to missing - we'll use a default
    }
    if (!this.currentContext.contentTypes || this.currentContext.contentTypes.length === 0) {
      // Don't add to missing - we'll use defaults
    }

    return missing
  }

  /**
   * Build conversation context for AI model (optimized for speed)
   */
  private buildConversationContext(organizationId: string, categories: Category[], topics: Topic[]): string {
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
   * Analyze what the user is trying to accomplish
   */
  private analyzeUserIntent(message: string): {
    intent: 'create_calendar' | 'get_info' | 'modify_plan' | 'generate_posts' | 'clarify'
    confidence: number
    missingInfo: string[]
    hasBusinessContext: boolean
  } {
    const lowerMessage = message.toLowerCase()
    const bc = this.currentContext.businessContext
    const hasBusinessInfo = !!(bc?.companyName || bc?.mission || bc?.vision || bc?.industry || bc?.services?.length)
    
    // Determine intent
    let intent: 'create_calendar' | 'get_info' | 'modify_plan' | 'generate_posts' | 'clarify' = 'get_info'
    let confidence = 0.5

    if (lowerMessage.includes('calendar') || lowerMessage.includes('schedule') || lowerMessage.includes('posts')) {
      intent = 'create_calendar'
      confidence = 0.8
    } else if (lowerMessage.includes('generate') || lowerMessage.includes('create posts')) {
      intent = 'generate_posts'
      confidence = 0.9
    } else if (lowerMessage.includes('change') || lowerMessage.includes('modify') || lowerMessage.includes('edit')) {
      intent = 'modify_plan'
      confidence = 0.7
    } else if (hasBusinessInfo && (this.currentContext.platform || this.currentContext.platforms)) {
      intent = 'create_calendar'
      confidence = 0.9
    }

    // Check what information we have
    const missingInfo: string[] = []
    if (!this.currentContext.platform && !this.currentContext.platforms) missingInfo.push('platforms')
    if (!this.currentContext.dateRange) missingInfo.push('dateRange')
    if (!this.currentContext.postCount) missingInfo.push('postCount')

    return {
      intent,
      confidence,
      missingInfo,
      hasBusinessContext: hasBusinessInfo
    }
  }

  /**
   * Generate intelligent response based on system knowledge
   */
  private async generateIntelligentResponse(
    userIntent: { intent: string; confidence: number; missingInfo: string[]; hasBusinessContext: boolean },
    organizationId: string,
    categories: Category[],
    topics: Topic[]
  ): Promise<AIResponse> {
    
    const { intent, missingInfo, hasBusinessContext } = userIntent

    // If we don't have business context, ask for it naturally
    if (!hasBusinessContext) {
      const message = this.buildNaturalBusinessInfoRequest()
      this.addMessage('ai', message, { isQuestion: true })
      return { message, action: 'clarify' }
    }

    // If we have business context but missing technical details, provide smart defaults
    if (hasBusinessContext && missingInfo.length > 0) {
      this.autoPopulateTechnicalParameters()
      const message = this.buildSmartRecommendationMessage()
      this.addMessage('ai', message, { isQuestion: true, hasRecommendations: true })
      return { message, action: 'clarify' }
    }

    // If we have everything, create the content plan
    if (hasBusinessContext && missingInfo.length === 0) {
      const contentPlan = await this.generateContentPlan(organizationId, categories, topics)
      const message = this.buildContentPlanPreview(contentPlan)
      this.addMessage('ai', message, { isQuestion: true, contentPlan })
      return { message, contentPlan, action: 'preview' }
    }

    // Fallback
    const message = "I'd be happy to help you create a social media content calendar! Could you tell me a bit about your business and what you're looking to accomplish?"
    this.addMessage('ai', message, { isQuestion: true })
    return { message, action: 'clarify' }
  }

  /**
   * Handle user response to previous question
   */
  private async handleUserResponse(
    userMessage: string, 
    organizationId: string,
    categories: Category[],
    topics: Topic[]
  ): Promise<AIResponse> {
    const lowerMessage = userMessage.toLowerCase()
    const lastMessage = this.conversationHistory[this.conversationHistory.length - 1]

    // Check if user is confirming recommendations
    if (lastMessage.metadata?.hasRecommendations && 
        (lowerMessage.includes('yes') || lowerMessage.includes('ok') || lowerMessage.includes('create') || lowerMessage.includes('generate'))) {
      
      const contentPlan = await this.generateContentPlan(organizationId, categories, topics)
      const message = this.buildContentPlanPreview(contentPlan)
      this.addMessage('ai', message, { isQuestion: true, contentPlan })
      return { message, contentPlan, action: 'preview' }
    }

    // Check if user wants to generate posts
    if (lastMessage.metadata?.contentPlan && 
        (lowerMessage.includes('generate') || lowerMessage.includes('create posts') || lowerMessage.includes('yes'))) {
      
      const posts = await this.generatePosts(lastMessage.metadata.contentPlan, categories, topics)
      lastMessage.metadata.contentPlan.posts = posts
      
      const successMessage = this.buildSuccessMessage(posts)
      this.addMessage('ai', successMessage, { posts })
      return { message: successMessage, contentPlan: lastMessage.metadata.contentPlan, action: 'success' }
    }

    // Check if user wants to modify something
    if (lowerMessage.includes('change') || lowerMessage.includes('modify') || lowerMessage.includes('different')) {
      this.parseTechnicalChanges(userMessage)
      this.autoPopulateTechnicalParameters()
      const message = this.buildSmartRecommendationMessage()
      this.addMessage('ai', message, { isQuestion: true, hasRecommendations: true })
      return { message, action: 'clarify' }
    }

    // Default: treat as new business information
    const parsedContext = this.parseDirective(userMessage)
    console.log('🎯 Parsed context from user message:', parsedContext)
    this.currentContext = { ...this.currentContext, ...parsedContext }
    console.log('🎯 Updated current context:', this.currentContext)
    
    const userIntent = this.analyzeUserIntent(userMessage)
    return this.generateIntelligentResponse(userIntent, organizationId, categories, topics)
  }

  /**
   * Step 1: Handle company information collection
   */
  private async handleStep1_CompanyInfo(userMessage: string, categories: Category[], topics: Topic[]): Promise<AIResponse> {
    const bc = this.currentContext.businessContext
    const hasBusinessInfo = !!(bc?.mission || bc?.vision || bc?.industry || bc?.services?.length)

    if (hasBusinessInfo) {
      // Move to step 2 (understanding confirmation)
      return this.handleStep2_UnderstandingConfirmation(userMessage, categories, topics)
    } else {
      // Ask for company information
      const message = `👋 Hi! I'm here to help you create an amazing social media content calendar.

To get started, I'd love to learn about your business! Just tell me about your company in your own words - like you're explaining it to a friend.

**I'm looking for things like:**
- What your company does
- Who you serve
- What makes you special
- Any goals you have

**For example:**
"IMM Limited is a production house that focuses on providing advertising services to business owners. We have a creative approach to online exposure plus seasonal advertising. I want a social media calendar for Facebook, Instagram, LinkedIn, and TikTok that gives my company great online exposure."

Don't worry about being formal - just share what's important about your business! 🚀`

      this.addMessage('ai', message, { step: 1 })
      return {
        message,
        action: 'clarify'
      }
    }
  }

  /**
   * Step 2: AI understanding confirmation
   */
  private async handleStep2_UnderstandingConfirmation(userMessage: string, categories: Category[], topics: Topic[]): Promise<AIResponse> {
    const bc = this.currentContext.businessContext
    const lowerMessage = userMessage.toLowerCase()

    // Check if user is confirming understanding
    if (lowerMessage.includes('yes') || lowerMessage.includes('correct') || lowerMessage.includes('right') || lowerMessage.includes('confirm')) {
      this.currentContext.confirmedUnderstanding = true
      return this.handleStep3_TechnicalForm(categories, topics)
    } else if (lowerMessage.includes('no') || lowerMessage.includes('wrong') || lowerMessage.includes('incorrect')) {
      // User says understanding is wrong, go back to step 1
      this.currentContext.businessContext = undefined
      this.currentContext.confirmedUnderstanding = false
      return this.handleStep1_CompanyInfo(userMessage, categories, topics)
    } else {
      // Show AI's understanding for confirmation
      const understandingMessage = this.buildUnderstandingSummary()
      this.addMessage('ai', understandingMessage, { step: 2 })
      return {
        message: understandingMessage,
        action: 'clarify'
      }
    }
  }

  /**
   * Step 3: Technical form (auto-populated)
   */
  private async handleStep3_TechnicalForm(categories: Category[], topics: Topic[]): Promise<AIResponse> {
    // Auto-populate technical parameters based on company info
    this.autoPopulateTechnicalParameters()

    const technicalForm = this.buildTechnicalForm()
    const message = `📋 **Step 3: Technical Parameters (Auto-Populated)**

Based on your company information, I've pre-filled the technical parameters:

${technicalForm}

**To proceed:**
- Type "CONFIRM" to use these settings
- Or provide specific changes (e.g., "Change platforms to Instagram only" or "Change to 50 posts")`

    this.addMessage('ai', message, { step: 3, technicalForm: true })
    return {
      message,
      action: 'clarify'
    }
  }

  /**
   * Step 4: Handle plan confirmation
   */
  private async handleStep4_PlanConfirmation(userMessage: string, organizationId: string, categories: Category[], topics: Topic[]): Promise<AIResponse> {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes('confirm') || lowerMessage.includes('yes') || lowerMessage.includes('ok')) {
      // User confirmed, generate the plan
      this.currentPlan = await this.generateContentPlan(organizationId, categories, topics)
      const previewMessage = this.buildStep4PreviewMessage(this.currentPlan)
      
      this.addMessage('ai', previewMessage, { step: 4, contentPlan: this.currentPlan })
      return {
        message: previewMessage,
        contentPlan: this.currentPlan,
        action: 'preview'
      }
    } else {
      // User wants to make changes, parse the changes
      this.parseTechnicalChanges(userMessage)
      return this.handleStep3_TechnicalForm(categories, topics)
    }
  }

  /**
   * Step 5: Generate posts
   */
  private async handleStep5_GeneratePosts(organizationId: string, categories: Category[], topics: Topic[]): Promise<AIResponse> {
    if (!this.currentPlan) {
      throw new Error('No content plan available for generation')
    }

    // Generate the actual posts
    const posts = await this.generatePosts(this.currentPlan, categories, topics)
    this.currentPlan.posts = posts

    const successMessage = this.buildSuccessMessage(posts)
    this.addMessage('ai', successMessage, { step: 5, posts })

    return {
      message: successMessage,
      contentPlan: this.currentPlan,
      action: 'success'
    }
  }

  /**
   * Check if we have sufficient business context
   */
  private hasBusinessContext(): boolean {
    const bc = this.currentContext.businessContext
    // More lenient check - if we have any business information, we can proceed
    return !!(bc?.companyName || bc?.mission || bc?.vision || bc?.industry || bc?.services?.length || this.currentContext.targetAudience)
  }

  /**
   * Check if missing info is only technical details
   */
  private needsTechnicalDetails(missingInfo: string[]): boolean {
    const technicalDetails = ['platform', 'dateRange', 'postCount']
    return missingInfo.every(info => technicalDetails.includes(info))
  }

  /**
   * Generate streamlined technical questions with multiple choice
   */
  private generateTechnicalQuestions(missingInfo: string[]): AIClarificationQuestion[] {
    const questions: AIClarificationQuestion[] = []

    if (missingInfo.includes('platform')) {
      const platforms = this.currentContext.platforms || ['instagram', 'facebook', 'linkedin', 'tiktok']
      questions.push({
        id: 'platform',
        question: 'Which platforms would you like me to create content for?',
        type: 'multi-select',
        options: platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)),
        required: true,
        context: 'Platform selection'
      })
    }

    if (missingInfo.includes('dateRange')) {
      questions.push({
        id: 'dateRange',
        question: 'What time period should I plan for?',
        type: 'select',
        options: [
          'This week',
          'Next week', 
          'This month',
          'Next month',
          '3 months (Oct-Dec)',
          '6 months',
          'Custom range'
        ],
        required: true,
        context: 'Time period'
      })
    }

    if (missingInfo.includes('postCount')) {
      const platforms = this.currentContext.platforms || [this.currentContext.platform || 'instagram']
      const dateRange = this.currentContext.dateRange || this.getDefaultDateRange()
      const totalRecommended = platforms.reduce((total, platform) => {
        return total + this.calculateOptimalPostCount(platform, dateRange)
      }, 0)

      questions.push({
        id: 'postCount',
        question: 'How many posts would you like me to create?',
        type: 'select',
        options: [
          `Recommended (${totalRecommended} posts)`,
          'Light (50% of recommended)',
          'Heavy (150% of recommended)',
          'Custom number'
        ],
        required: true,
        context: 'Post volume'
      })
    }

    return questions
  }

  /**
   * Build streamlined technical clarification message
   */
  private buildTechnicalClarificationMessage(questions: AIClarificationQuestion[]): string {
    let message = `🎯 **Great! I understand your business context.**\n\n`
    
    // Show what we understood about their business
    const bc = this.currentContext.businessContext
    if (bc) {
      message += `**I understand:**\n`
      if (bc.industry) message += `- Industry: ${bc.industry}\n`
      if (bc.services) message += `- Services: ${bc.services.join(', ')}\n`
      if (bc.mission) message += `- Mission: ${bc.mission.substring(0, 100)}...\n`
      message += `\n`
    }

    message += `**Now I just need a few quick technical details:**\n\n`

    questions.forEach((question, index) => {
      message += `${index + 1}. **${question.question}**\n`
      if (question.options) {
        question.options.forEach((option, optIndex) => {
          message += `   ${optIndex + 1}. ${option}\n`
        })
      }
      message += `\n`
    })

    message += `Just select the numbers (e.g., "1, 3" or "2") and I'll create your content plan!`
    return message
  }

  /**
   * Parse multiple choice responses (e.g., "1, 3" or "2")
   */
  private parseMultipleChoiceResponse(message: string): void {
    const choices = message.split(/[,\s]+/).map(c => parseInt(c.trim())).filter(n => !isNaN(n))
    
    // Get the last AI message to understand what questions were asked
    const lastMessage = this.conversationHistory[this.conversationHistory.length - 1]
    if (!lastMessage?.metadata?.clarificationQuestions) return
    
    const questions = lastMessage.metadata.clarificationQuestions as AIClarificationQuestion[]
    
    questions.forEach((question, index) => {
      const choiceIndex = choices[index] - 1 // Convert to 0-based index
      if (choiceIndex >= 0 && choiceIndex < (question.options?.length || 0)) {
        const selectedOption = question.options![choiceIndex]
        
        switch (question.id) {
          case 'platform':
            // Handle platform selection
            if (selectedOption === 'All platforms') {
              this.currentContext.platforms = ['instagram', 'facebook', 'linkedin', 'tiktok']
              this.currentContext.platform = 'instagram' // Set primary platform
            } else {
              const platform = selectedOption.toLowerCase() as SocialPlatform
              this.currentContext.platform = platform
              this.currentContext.platforms = [platform]
            }
            break
            
          case 'dateRange':
            // Handle date range selection
            this.currentContext.dateRange = this.parseDateRangeFromOption(selectedOption)
            break
            
          case 'postCount':
            // Handle post count selection
            this.currentContext.postCount = this.parsePostCountFromOption(selectedOption)
            break
        }
      }
    })
  }

  /**
   * Parse date range from multiple choice option
   */
  private parseDateRangeFromOption(option: string): { start: string; end: string } {
    const now = new Date()
    const currentYear = now.getFullYear()
    
    switch (option) {
      case 'This week':
        return {
          start: now.toISOString().split('T')[0],
          end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      case 'Next week':
        const nextWeekStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        return {
          start: nextWeekStart.toISOString().split('T')[0],
          end: new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      case 'This month':
        return {
          start: new Date(currentYear, now.getMonth(), 1).toISOString().split('T')[0],
          end: new Date(currentYear, now.getMonth() + 1, 0).toISOString().split('T')[0]
        }
      case 'Next month':
        return {
          start: new Date(currentYear, now.getMonth() + 1, 1).toISOString().split('T')[0],
          end: new Date(currentYear, now.getMonth() + 2, 0).toISOString().split('T')[0]
        }
      case '3 months (Oct-Dec)':
        return {
          start: new Date(currentYear, 9, 1).toISOString().split('T')[0], // October
          end: new Date(currentYear, 11, 31).toISOString().split('T')[0] // December
        }
      case '6 months':
        return {
          start: now.toISOString().split('T')[0],
          end: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      default:
        return this.getDefaultDateRange()
    }
  }

  /**
   * Parse post count from multiple choice option
   */
  private parsePostCountFromOption(option: string): number {
    const platforms = this.currentContext.platforms || [this.currentContext.platform || 'instagram']
    const dateRange = this.currentContext.dateRange || this.getDefaultDateRange()
    const baseRecommended = platforms.reduce((total, platform) => {
      return total + this.calculateOptimalPostCount(platform, dateRange)
    }, 0)
    
    if (option.includes('Recommended')) {
      return baseRecommended
    } else if (option.includes('Light')) {
      return Math.ceil(baseRecommended * 0.5)
    } else if (option.includes('Heavy')) {
      return Math.ceil(baseRecommended * 1.5)
    } else if (option.includes('Custom')) {
      // For custom, we'll need to ask for the number
      return baseRecommended
    }
    
    return baseRecommended
  }

  /**
   * Auto-populate technical parameters based on company info
   */
  private autoPopulateTechnicalParameters(): void {
    const bc = this.currentContext.businessContext
    
    // Auto-detect platforms based on industry
    if (bc?.industry === 'financial') {
      this.currentContext.platforms = ['linkedin', 'facebook', 'instagram']
      this.currentContext.platform = 'linkedin'
    } else if (bc?.industry === 'technology') {
      this.currentContext.platforms = ['linkedin', 'twitter', 'instagram']
      this.currentContext.platform = 'linkedin'
    } else if (bc?.industry === 'retail' || bc?.industry === 'food') {
      this.currentContext.platforms = ['instagram', 'facebook', 'tiktok']
      this.currentContext.platform = 'instagram'
    } else {
      this.currentContext.platforms = ['instagram', 'facebook', 'linkedin']
      this.currentContext.platform = 'instagram'
    }
    
    // Auto-set date range (default to 3 months)
    this.currentContext.dateRange = {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
    
    // Auto-calculate post count
    const totalRecommended = this.currentContext.platforms.reduce((total, platform) => {
      return total + this.calculateOptimalPostCount(platform, this.currentContext.dateRange!)
    }, 0)
    this.currentContext.postCount = totalRecommended
    
    // Set defaults
    this.provideDefaults()
  }

  /**
   * Build natural business info request
   */
  private buildNaturalBusinessInfoRequest(): string {
    return `👋 Hi! I'm your AI assistant for creating social media content calendars.

I can help you create a comprehensive content strategy that includes:
- **Content Planning**: Generate posts tailored to your business
- **Scheduling**: Optimize posting times for maximum engagement  
- **Multi-Platform**: Support for Facebook, Instagram, LinkedIn, TikTok, and Twitter
- **Business Alignment**: Content that matches your brand voice and goals

To get started, I'd love to learn about your business! Just tell me:
- What your company does
- Who your customers are
- What makes you unique
- Any specific goals you have

For example: "We're a financial planning firm that helps high-net-worth individuals with wealth management and estate planning. We want to build trust and educate our clients about financial strategies."

What can you tell me about your business?`
  }

  /**
   * Build smart recommendation message
   */
  private buildSmartRecommendationMessage(): string {
    const bc = this.currentContext.businessContext
    const platforms = this.currentContext.platforms || [this.currentContext.platform || 'instagram']
    const dateRange = this.currentContext.dateRange
    const postCount = this.currentContext.postCount

    let message = `Perfect! I understand your business now. Based on what you've told me about ${bc?.companyName || 'your company'}, here's what I recommend:

**🎯 Content Strategy for ${bc?.industry || 'your industry'}**
- **Platforms**: ${platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
- **Duration**: ${dateRange?.start} to ${dateRange?.end}
- **Total Posts**: ${postCount} posts
- **Target Audience**: ${this.currentContext.targetAudience || 'Your customers'}

**💡 Why these recommendations?**
- ${platforms.includes('linkedin') ? 'LinkedIn is perfect for professional content and B2B engagement' : ''}
- ${platforms.includes('instagram') ? 'Instagram works great for visual storytelling and brand awareness' : ''}
- ${platforms.includes('facebook') ? 'Facebook helps reach a broad audience and build community' : ''}
- ${platforms.includes('tiktok') ? 'TikTok is excellent for reaching younger demographics' : ''}

**📝 Content Focus:**
Based on your mission "${bc?.mission?.substring(0, 100)}...", I'll create content that:
- Builds trust and credibility
- Educates your audience about ${bc?.industry || 'your industry'}
- Showcases your expertise
- Aligns with your brand values

**Ready to create your content calendar?**
Just say "yes" or "create it" and I'll generate ${postCount} tailored posts for your business!`

    return message
  }

  /**
   * Build content plan preview
   */
  private buildContentPlanPreview(plan: AIContentPlan): string {
    const bc = this.currentContext.businessContext
    let message = `🎉 **Your Content Calendar is Ready!**

I've created a comprehensive content strategy for ${bc?.companyName || 'your business'}:

**📊 Plan Summary:**
- **${plan.totalPosts} posts** across ${plan.platforms?.join(', ') || plan.platform}
- **Duration**: ${plan.dateRange.start} to ${plan.dateRange.end}
- **Focus**: ${plan.contentFocus.join(', ')}

**📝 Content Strategy:**
Based on your mission "${bc?.mission?.substring(0, 80)}...", I've created content that:
- Builds trust through educational posts
- Showcases your expertise in ${bc?.industry || 'your industry'}
- Engages your target audience of ${plan.targetAudience}
- Maintains your brand voice: ${plan.brandVoice}

**📅 Sample Posts Preview:**
${plan.posts.slice(0, 3).map((post, index) => 
  `${index + 1}. **${post.title}** (${post.platform})\n   ${post.content.substring(0, 100)}...`
).join('\n\n')}

**🚀 Ready to generate all ${plan.totalPosts} posts?**
Type "generate" or "create posts" and I'll add them to your calendar!`

    return message
  }

  /**
   * Build technical form display with proper form layout
   */
  private buildTechnicalForm(): string {
    const platforms = this.currentContext.platforms || []
    const dateRange = this.currentContext.dateRange
    const postCount = this.currentContext.postCount
    
    let form = `\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    TECHNICAL PARAMETERS                     │
├─────────────────────────────────────────────────────────────┤
│ 📱 PLATFORMS:                                               │
│    ${platforms.map(p => `☑️ ${p.charAt(0).toUpperCase() + p.slice(1)}`).join('  ')}                    │
│                                                             │
│ 📅 DATE RANGE:                                              │
│    From: ${dateRange?.start || 'Not set'}                    │
│    To:   ${dateRange?.end || 'Not set'}                      │
│                                                             │
│ 📊 TOTAL POSTS:                                             │
│    ${postCount || 'Not set'} posts across all platforms      │
│                                                             │
│ 🎯 TARGET AUDIENCE:                                         │
│    ${this.currentContext.targetAudience || 'Not set'}        │
│                                                             │
│ 💼 INDUSTRY:                                                │
│    ${this.currentContext.businessContext?.industry || 'General'} │
│                                                             │
│ 🎨 BRAND VOICE:                                             │
│    ${this.currentContext.brandVoice || 'Professional and friendly'} │
└─────────────────────────────────────────────────────────────┘
\`\`\`

**📝 EDIT INSTRUCTIONS:**
- **Change platforms:** "Change to Instagram only" or "Add TikTok"
- **Change dates:** "Change to next month" or "From Jan to Mar"
- **Change post count:** "Change to 30 posts" or "Reduce to 20 posts"
- **Change audience:** "Target young professionals" or "Focus on small businesses"`

    return form
  }

  /**
   * Parse technical changes from user input
   */
  private parseTechnicalChanges(userMessage: string): void {
    const lowerMessage = userMessage.toLowerCase()
    
    // Handle platform changes
    if (lowerMessage.includes('platform') || lowerMessage.includes('change platform')) {
      if (lowerMessage.includes('instagram only')) {
        this.currentContext.platforms = ['instagram']
        this.currentContext.platform = 'instagram'
      } else if (lowerMessage.includes('facebook only')) {
        this.currentContext.platforms = ['facebook']
        this.currentContext.platform = 'facebook'
      } else if (lowerMessage.includes('linkedin only')) {
        this.currentContext.platforms = ['linkedin']
        this.currentContext.platform = 'linkedin'
      }
    }
    
    // Handle post count changes
    const postCountMatch = userMessage.match(/(\d+)\s+posts?/i)
    if (postCountMatch) {
      this.currentContext.postCount = parseInt(postCountMatch[1])
    }
    
    // Handle date range changes
    if (lowerMessage.includes('month') || lowerMessage.includes('week')) {
      this.currentContext.dateRange = this.parseDateRange(userMessage)
    }
  }

  /**
   * Build Step 4 preview message
   */
  private buildStep4PreviewMessage(plan: AIContentPlan): string {
    const bc = this.currentContext.businessContext
    let message = `🎯 **Step 4: Content Plan Preview**

**📋 Plan Summary:**
- **Company:** ${bc?.industry || 'Business'} company
- **Platforms:** ${plan.platforms?.join(', ') || plan.platform}
- **Duration:** ${plan.dateRange.start} to ${plan.dateRange.end}
- **Total Posts:** ${plan.totalPosts}
- **Focus:** ${plan.contentFocus.join(', ')}

**📊 AI Recommendations:**
${this.buildSchedulingRecommendations(plan)}

**📝 Content Strategy:**
Based on your mission "${bc?.mission?.substring(0, 100)}...", I'll create content that:
- Builds trust through educational content
- Showcases your expertise in ${bc?.industry}
- Engages your target audience of ${plan.targetAudience}
- Aligns with your brand voice: ${plan.brandVoice}

**Ready to generate ${plan.totalPosts} posts?**
Type "GENERATE" to create your content calendar!`

    return message
  }

  /**
   * Build success message for Step 5
   */
  private buildSuccessMessage(posts: AIPostPreview[]): string {
    const bc = this.currentContext.businessContext
    let message = `🎉 **Step 5: Posts Generated Successfully!**

**✅ What I've Created:**
- **${posts.length} posts** generated and scheduled
- **Platforms:** ${this.currentContext.platforms?.join(', ') || this.currentContext.platform}
- **Date Range:** ${this.currentContext.dateRange?.start} to ${this.currentContext.dateRange?.end}
- **Content Focus:** ${this.currentContext.contentTypes?.join(', ') || 'Educational and engaging'}

**📝 Content Highlights:**
- Posts aligned with your ${bc?.industry || 'business'} industry
- Mission-focused content: "${bc?.mission?.substring(0, 80)}..."
- Target audience: ${this.currentContext.targetAudience}
- Brand voice: ${this.currentContext.brandVoice}

**🎯 Next Steps:**
1. Review your posts in the Post Management section
2. Edit any posts that need adjustments
3. Schedule additional posts as needed
4. Monitor engagement and adjust strategy

Your content calendar is now ready! You can find all posts in your Post Management dashboard.`

    return message
  }

  /**
   * Build scheduling recommendations for preview
   */
  private buildSchedulingRecommendations(plan: AIContentPlan): string {
    const rec = plan.schedulingRecommendation
    return `- **Optimal Frequency:** ${rec.optimalFrequency.weekly} posts/week
- **Best Times:** ${rec.bestTimes.join(', ')}
- **Best Days:** ${rec.bestDays.join(', ')}
- **Strategy:** ${rec.reasoning}`
  }

  /**
   * Use recommended values when user approves the plan
   */
  private useRecommendedValues(): void {
    const platforms = this.currentContext.platforms || [this.currentContext.platform || 'instagram']
    const dateRange = this.currentContext.dateRange || this.getDefaultDateRange()
    
    // Calculate recommended post count for all platforms
    const totalRecommended = platforms.reduce((total, platform) => {
      return total + this.calculateOptimalPostCount(platform, dateRange)
    }, 0)
    
    this.currentContext.postCount = totalRecommended
    
    // Set other defaults if missing
    this.provideDefaults()
  }

  /**
   * Provide default values for missing optional information
   */
  private provideDefaults(): void {
    if (!this.currentContext.brand) {
      this.currentContext.brand = 'Your Brand'
    }
    if (!this.currentContext.targetAudience) {
      this.currentContext.targetAudience = 'General audience'
    }
    if (!this.currentContext.contentTypes || this.currentContext.contentTypes.length === 0) {
      this.currentContext.contentTypes = ['educational', 'engaging']
    }
    if (!this.currentContext.brandVoice) {
      this.currentContext.brandVoice = 'Professional and friendly'
    }
  }

  /**
   * Generate clarification questions
   */
  private generateClarificationQuestions(
    missingInfo: string[], 
    categories: Category[], 
    topics: Topic[]
  ): AIClarificationQuestion[] {
    const questions: AIClarificationQuestion[] = []

    if (missingInfo.includes('platform')) {
      // Check if user mentioned multiple platforms
      const mentionedPlatforms = this.currentContext.platforms || []
      
      if (mentionedPlatforms.length > 1) {
        questions.push({
          id: 'platform',
          question: `I see you mentioned multiple platforms (${mentionedPlatforms.join(', ')}). Would you like me to create content for all of them, or focus on one specific platform?`,
          type: 'select',
          options: ['All platforms', ...mentionedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1))],
          required: true,
          context: 'Multi-platform selection'
        })
      } else {
        questions.push({
          id: 'platform',
          question: 'What social media platform would you like to create content for?',
          type: 'select',
          options: ['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok'],
          required: true,
          context: 'Platform selection'
        })
      }
    }

    if (missingInfo.includes('dateRange')) {
      questions.push({
        id: 'dateRange',
        question: 'What date range should I plan for?',
        type: 'text',
        required: true,
        context: 'Scheduling'
      })
    }

    if (missingInfo.includes('postCount')) {
      const platforms = this.currentContext.platforms || [this.currentContext.platform || 'instagram']
      const dateRange = this.currentContext.dateRange || this.getDefaultDateRange()
      
      if (platforms.length > 1) {
        // Calculate total posts for all platforms
        const totalRecommended = platforms.reduce((total, platform) => {
          return total + this.calculateOptimalPostCount(platform, dateRange)
        }, 0)
        
        questions.push({
          id: 'postCount',
          question: `How many posts would you like me to create across all platforms? (I recommend ${totalRecommended} total posts: ${platforms.map(p => `${this.calculateOptimalPostCount(p, dateRange)} for ${p}`).join(', ')}). You can also just say "ok" or "that's fine" to use my recommendations.`,
          type: 'number',
          required: true,
          context: 'Multi-platform content volume'
        })
      } else {
        const platform = platforms[0]
        const recommendedCount = this.calculateOptimalPostCount(platform, dateRange)
        
        questions.push({
          id: 'postCount',
          question: `How many posts would you like me to create? (I recommend ${recommendedCount} posts for optimal engagement on ${platform}). You can also just say "ok" or "that's fine" to use my recommendations.`,
          type: 'number',
          required: true,
          context: 'Content volume'
        })
      }
    }

    if (missingInfo.includes('brand')) {
      questions.push({
        id: 'brand',
        question: 'What\'s your brand or business name?',
        type: 'text',
        required: true,
        context: 'Branding'
      })
    }

    if (missingInfo.includes('targetAudience')) {
      questions.push({
        id: 'targetAudience',
        question: 'Who is your target audience?',
        type: 'text',
        required: true,
        context: 'Audience targeting'
      })
    }

    if (missingInfo.includes('contentTypes')) {
      questions.push({
        id: 'contentTypes',
        question: 'What type of content would you like?',
        type: 'multi-select',
        options: ['Educational', 'Promotional', 'Motivational', 'Behind-the-scenes', 'Tips & Tutorials', 'User Stories'],
        required: true,
        context: 'Content strategy'
      })
    }

    return questions
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
    organizationId: string,
    categories: Category[],
    topics: Topic[]
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
   * Generate individual posts for the plan
   */
  private async generatePosts(
    plan: AIContentPlan,
    categories: Category[],
    topics: Topic[]
  ): Promise<AIPostPreview[]> {
    const posts: AIPostPreview[] = []
    
    // 🎯 Use configurable limit instead of hardcoded 20
    const maxPosts = Math.min(plan.totalPosts, this.maxPostsPerGeneration)
    console.log(`Generating ${maxPosts} posts (limited from ${plan.totalPosts}, max limit: ${this.maxPostsPerGeneration})`)
    
    const dates = this.generatePostDates(plan.dateRange, maxPosts)

    for (let i = 0; i < maxPosts; i++) {
      console.log(`Generating post ${i + 1}/${maxPosts}`)
      
      const post: AIPostPreview = {
        id: `post-${Date.now()}-${i}`,
        title: `Generated Post ${i + 1}`,
        content: await this.generatePostContent(plan, i),
        categoryId: this.selectCategory(categories, i),
        topicId: this.selectTopic(topics, categories, i),
        platform: plan.platform,
        type: 'post',
        scheduledAt: dates[i],
        hashtags: this.generateHashtags(plan),
        callToAction: this.generateCallToAction(plan),
        estimatedEngagement: this.estimateEngagement(plan, i),
        reasoning: this.generateReasoning(plan, i)
      }
      posts.push(post)
    }

    console.log(`Generated ${posts.length} posts successfully`)
    return posts
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

  private selectCategory(categories: Category[], index: number): string {
    if (categories.length === 0) return ''
    return categories[index % categories.length].id
  }

  private selectTopic(topics: Topic[], categories: Category[], index: number): string {
    if (topics.length === 0) return ''
    const categoryId = this.selectCategory(categories, index)
    const categoryTopics = topics.filter(t => t.categoryId === categoryId)
    if (categoryTopics.length === 0) return topics[index % topics.length].id
    return categoryTopics[index % categoryTopics.length].id
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

  private generateCallToAction(plan: AIContentPlan): string {
    const ctas = [
      'What do you think? Share your thoughts below!',
      'Try this and let me know how it goes!',
      'Save this post for later reference!',
      'Follow for more tips like this!'
    ]
    return ctas[Math.floor(Math.random() * ctas.length)]
  }

  private estimateEngagement(plan: AIContentPlan, index: number): 'low' | 'medium' | 'high' {
    // Simple engagement estimation based on content type and timing
    const highEngagementTypes = ['motivational', 'tips', 'tutorials']
    const isHighEngagement = highEngagementTypes.some(type => 
      plan.contentFocus.some(focus => focus.toLowerCase().includes(type))
    )
    
    return isHighEngagement ? 'high' : index % 2 === 0 ? 'medium' : 'low'
  }

  private generateReasoning(plan: AIContentPlan, index: number): string {
    return `Post ${index + 1} focuses on ${plan.contentFocus[index % plan.contentFocus.length]} content, scheduled for optimal engagement time based on ${plan.platform} best practices.`
  }

  private buildClarificationMessage(questions: AIClarificationQuestion[]): string {
    let message = "I'd love to help you create your social media content! To make sure I create exactly what you need, I have a few questions:\n\n"
    
    questions.forEach((q, index) => {
      message += `${index + 1}. **${q.question}**\n`
      if (q.options) {
        message += `   Options: ${q.options.join(', ')}\n`
      }
      message += '\n'
    })
    
    message += "Please provide your answers and I'll create a detailed content plan for you!"
    return message
  }

  private buildPreviewMessage(plan: AIContentPlan): string {
    const rec = plan.schedulingRecommendation
    const platforms = this.currentContext.platforms || [plan.platform]
    
    let message = `🎯 **Perfect! Here's your detailed content plan:**\n\n`
    message += `**Platform(s):** ${platforms.length > 1 ? platforms.join(', ') : plan.platform}\n`
    message += `**Date Range:** ${plan.dateRange.start} to ${plan.dateRange.end}\n`
    message += `**Total Posts:** ${plan.totalPosts}\n`
    message += `**Target Audience:** ${plan.targetAudience}\n`
    message += `**Content Focus:** ${plan.contentFocus.join(', ')}\n\n`
    
    // Show business context if available
    if (this.currentContext.businessContext) {
      const bc = this.currentContext.businessContext
      message += `**🏢 BUSINESS CONTEXT:**\n`
      if (bc.industry) message += `- Industry: ${bc.industry}\n`
      if (bc.services) message += `- Services: ${bc.services.join(', ')}\n`
      if (bc.mission) message += `- Mission: ${bc.mission}\n`
      message += `\n`
    }
    
    if (platforms.length > 1) {
      message += `**📊 AI RECOMMENDATIONS FOR MULTI-PLATFORM STRATEGY:**\n\n`
      
      platforms.forEach(platform => {
        const platformRec = this.generateSchedulingRecommendation(platform)
        message += `**${platform.toUpperCase()}:**\n`
        message += `- Optimal: ${platformRec.optimalFrequency.weekly} posts/week\n`
        message += `- Best times: ${platformRec.bestTimes.join(', ')}\n`
        message += `- Best days: ${platformRec.bestDays.join(', ')}\n\n`
      })
      
      message += `**💡 CROSS-PLATFORM STRATEGY:**\n`
      message += `- Adapt content format for each platform\n`
      message += `- Maintain consistent messaging across platforms\n`
      message += `- Schedule posts at optimal times for each platform\n`
      message += `- Use platform-specific hashtags and features\n\n`
    } else {
      message += `**📊 AI RECOMMENDATIONS FOR ${plan.platform.toUpperCase()}:**\n\n`
      message += `**Optimal Posting Frequency:**\n`
      message += `- Daily: ${rec.optimalFrequency.daily} posts\n`
      message += `- Weekly: ${rec.optimalFrequency.weekly} posts\n`
      message += `- Monthly: ${rec.optimalFrequency.monthly} posts\n\n`
      
      message += `**Best Times to Post:**\n`
      message += `- ${rec.bestTimes.join(', ')}\n\n`
      
      message += `**Best Days to Post:**\n`
      message += `- ${rec.bestDays.join(', ')}\n\n`
      
      message += `**Why these recommendations?**\n`
      message += `${rec.reasoning}\n\n`
      
      message += `**💡 Engagement Tips:**\n`
      rec.engagementTips.forEach(tip => {
        message += `- ${tip}\n`
      })
      message += `\n`
    }
    
    message += `**📅 DETAILED POST SCHEDULE:**\n\n`
    
    plan.posts.forEach((post, index) => {
      message += `**📱 Post ${index + 1} - ${new Date(post.scheduledAt).toLocaleDateString()}**\n`
      message += `- **Title:** ${post.title}\n`
      message += `- **Content:** ${post.content.substring(0, 100)}...\n`
      message += `- **Hashtags:** ${post.hashtags.join(' ')}\n`
      message += `- **CTA:** ${post.callToAction}\n\n`
    })
    
    message += `**Are you ready to create these posts?** Type "CREATE POSTS" to proceed, or let me know what you'd like to change!`
    
    return message
  }

  private buildSuccessMessage(posts: Post[]): string {
    return `🎉 **Posts created successfully!**\n\nI've created ${posts.length} posts and added them to your calendar. You can review and edit them in your Post Management section.`
  }

  private async createPostsFromPlan(
    organizationId: string,
    categories: Category[],
    topics: Topic[]
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
            aiGenerated: true,
            aiModel: this.model,
            generatedAt: new Date().toISOString(),
            originalPlan: this.currentPlan.id
          }
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

  private async handleEditRequest(
    request: string,
    organizationId: string,
    categories: Category[],
    topics: Topic[]
  ): Promise<AIResponse> {
    // Handle edit requests
    return {
      message: 'I understand you want to edit some posts. Please specify which posts and what changes you\'d like to make.',
      action: 'clarify'
    }
  }

  private async handleAddRequest(
    request: string,
    organizationId: string,
    categories: Category[],
    topics: Topic[]
  ): Promise<AIResponse> {
    // Handle add requests
    return {
      message: 'I understand you want to add more posts. How many additional posts would you like and what type of content?',
      action: 'clarify'
    }
  }

  private async handleRemoveRequest(
    request: string,
    organizationId: string,
    categories: Category[],
    topics: Topic[]
  ): Promise<AIResponse> {
    // Handle remove requests
    return {
      message: 'I understand you want to remove some posts. Please specify which posts you\'d like to remove.',
      action: 'clarify'
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
}
