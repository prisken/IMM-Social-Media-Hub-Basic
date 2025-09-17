import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  Users, 
  Smartphone, 
  MessageSquare,
  Calendar,
  Target,
  Sparkles
} from 'lucide-react'
import { SocialPlatform, Category, Topic } from '@/types'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useCategories } from '@/hooks/useCategories'
import { useTopics } from '@/hooks/useTopics'
import { AIService } from '@/services/AIService'
import { AIGenerationProgress } from './AIGenerationProgress'

interface AIFormFlowProps {
  isOpen: boolean
  onClose: () => void
  onPostsCreated?: (posts: any[]) => void
}

interface BasicFormData {
  companyName: string
  industry: string
  targetAudience: string
  primaryPlatforms: SocialPlatform[]
  keyMessage: string
  brandVoice: string
}

interface ExtendedFormData {
  totalPosts: number
  dateRange: {
    start: string
    end: string
  }
  platforms: SocialPlatform[]
  selectedCategories: string[]
  selectedTopics: string[]
  contentFocus: string[]
}

const INDUSTRIES = [
  'Beverage', 'Food & Restaurant', 'Healthcare', 'Technology', 'Financial Services',
  'Retail', 'Fashion', 'Beauty', 'Fitness', 'Education', 'Real Estate', 'Consulting',
  'Entertainment', 'Travel', 'Automotive', 'Other'
]

const PLATFORMS: SocialPlatform[] = ['facebook', 'instagram', 'linkedin', 'tiktok', 'twitter']

const CONTENT_FOCUS_OPTIONS = [
  'Educational', 'Promotional', 'Behind-the-scenes', 'User-generated content',
  'Industry insights', 'Company news', 'Tips and tricks', 'Inspirational'
]

const BRAND_VOICE_OPTIONS = [
  'Professional and friendly',
  'Fresh and inspiring',
  'Caring and professional',
  'Innovative and expert',
  'Professional and trustworthy',
  'Friendly and engaging',
  'Trendy and stylish',
  'Beautiful and confident',
  'Motivating and energetic',
  'Expert and authoritative',
  'Creative and inspiring',
  'Delicious and inviting',
  'Warm and approachable',
  'Bold and confident',
  'Elegant and sophisticated',
  'Playful and fun',
  'Serious and informative',
  'Casual and relatable',
  'Luxury and premium',
  'Authentic and genuine'
]

export const AIFormFlow: React.FC<AIFormFlowProps> = ({
  isOpen,
  onClose,
  onPostsCreated
}) => {
  const { currentOrganization } = useAuth()
  const { categories } = useCategories()
  const { topics } = useTopics()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [aiSummary, setAiSummary] = useState<{
    understanding: string
    plan: {
      totalPosts: number
      platforms: SocialPlatform[]
      contentFocus: string[]
      brandVoice: string
      reasoning: string
    }
  } | null>(null)
  const [basicFormData, setBasicFormData] = useState<BasicFormData>({
    companyName: '',
    industry: '',
    targetAudience: '',
    primaryPlatforms: [],
    keyMessage: '',
    brandVoice: ''
  })
  
  const [extendedFormData, setExtendedFormData] = useState<ExtendedFormData>({
    totalPosts: 20,
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    platforms: [],
    selectedCategories: [],
    selectedTopics: [],
    contentFocus: []
  })
  
  const [showGenerationProgress, setShowGenerationProgress] = useState(false)
  const [generationProgress, setGenerationProgress] = useState({
    current: 0,
    total: 0,
    action: 'Preparing...',
    estimatedTime: 0
  })
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)

  const handleBasicFormChange = (field: keyof BasicFormData, value: any) => {
    setBasicFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setBasicFormData(prev => ({
      ...prev,
      primaryPlatforms: prev.primaryPlatforms.includes(platform)
        ? prev.primaryPlatforms.filter(p => p !== platform)
        : [...prev.primaryPlatforms, platform]
    }))
  }

  const handleExtendedFormChange = (field: keyof ExtendedFormData, value: any) => {
    setExtendedFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleExtendedPlatformToggle = (platform: SocialPlatform) => {
    setExtendedFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleCategoryToggle = (categoryId: string) => {
    setExtendedFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }))
  }

  const handleTopicToggle = (topicId: string) => {
    setExtendedFormData(prev => ({
      ...prev,
      selectedTopics: prev.selectedTopics.includes(topicId)
        ? prev.selectedTopics.filter(id => id !== topicId)
        : [...prev.selectedTopics, topicId]
    }))
  }

  const handleContentFocusToggle = (focus: string) => {
    setExtendedFormData(prev => ({
      ...prev,
      contentFocus: prev.contentFocus.includes(focus)
        ? prev.contentFocus.filter(f => f !== focus)
        : [...prev.contentFocus, focus]
    }))
  }

  const generateAISummary = async () => {
    const aiService = AIService.getInstance()
    
    setIsGeneratingRecommendations(true)
    
    try {
      // Create a comprehensive business context from the form data
      const businessContext = {
        companyName: basicFormData.companyName,
        industry: basicFormData.industry,
        targetAudience: basicFormData.targetAudience,
        keyMessage: basicFormData.keyMessage,
        brandVoice: basicFormData.brandVoice,
        primaryPlatforms: basicFormData.primaryPlatforms
      }
      
      console.log('🤖 Generating AI summary and plan for:', businessContext)
      
      // Use AI to analyze the business context and generate understanding + plan
      const aiRecommendations = await aiService.generateFormDataFromContext(businessContext)
      
      // Generate real AI understanding and reasoning
      const aiUnderstanding = await aiService.generateAIUnderstanding(businessContext)
      
      // Enhance reasoning with specific recommendations
      const enhancedReasoning = `${aiUnderstanding.reasoning} Specifically, I recommend ${aiRecommendations.totalPosts} posts using ${aiRecommendations.platforms.join(' and ')} platforms with ${aiRecommendations.contentFocus.join(', ')} content types.`
      
      const summary = {
        understanding: aiUnderstanding.understanding,
        plan: {
          totalPosts: aiRecommendations.totalPosts,
          platforms: aiRecommendations.platforms,
          contentFocus: aiRecommendations.contentFocus,
          brandVoice: aiRecommendations.brandVoice,
          reasoning: enhancedReasoning
        }
      }
      
      console.log('✅ AI summary generated:', summary)
      setAiSummary(summary)
      
    } catch (error) {
      console.error('Error generating AI summary:', error)
      
      // Fallback summary if AI fails - try to get basic AI understanding
      let fallbackUnderstanding = `I understand that ${basicFormData.companyName} is a ${basicFormData.industry} company targeting ${basicFormData.targetAudience}.`
      let fallbackReasoning = 'Based on industry standards and your target audience, I recommend this approach for optimal engagement.'
      
      try {
        // Try to get at least basic AI understanding even if the main call failed
        const basicAI = await aiService.generateAIUnderstanding(businessContext)
        fallbackUnderstanding = basicAI.understanding
        fallbackReasoning = basicAI.reasoning
      } catch (fallbackError) {
        console.log('Using fallback understanding due to AI error')
      }
      
      const fallbackSummary = {
        understanding: fallbackUnderstanding,
        plan: {
          totalPosts: 25,
          platforms: basicFormData.primaryPlatforms.length > 0 ? basicFormData.primaryPlatforms : ['instagram', 'facebook'],
          contentFocus: ['Educational', 'Behind-the-scenes'],
          brandVoice: basicFormData.brandVoice || 'Professional and friendly',
          reasoning: fallbackReasoning
        }
      }
      
      setAiSummary(fallbackSummary)
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }

  const generateAIDefaults = async () => {
    const aiService = AIService.getInstance()
    
    setIsGeneratingRecommendations(true)
    
    try {
      // Create a comprehensive business context from the form data
      const businessContext = {
        companyName: basicFormData.companyName,
        industry: basicFormData.industry,
        targetAudience: basicFormData.targetAudience,
        keyMessage: basicFormData.keyMessage,
        brandVoice: basicFormData.brandVoice,
        primaryPlatforms: basicFormData.primaryPlatforms
      }
      
      console.log('🤖 Generating AI recommendations for:', businessContext)
      
      // Use AI to analyze the business context and generate smart recommendations
      const aiRecommendations = await aiService.generateFormDataFromContext(businessContext)
      
      console.log('✅ AI recommendations generated:', aiRecommendations)
      
      // Update the extended form with AI-generated recommendations
      setExtendedFormData(prev => ({
        ...prev,
        totalPosts: aiRecommendations.totalPosts,
        platforms: aiRecommendations.platforms,
        contentFocus: aiRecommendations.contentFocus,
        selectedCategories: aiRecommendations.selectedCategories,
        selectedTopics: aiRecommendations.selectedTopics,
        dateRange: aiRecommendations.dateRange
      }))
      
    } catch (error) {
      console.error('Error generating AI recommendations:', error)
      
      // Fallback to basic industry defaults if AI fails
      const industryDefaults = {
        'beverage': { posts: 35, platforms: ['instagram', 'facebook'], focus: ['Behind-the-scenes', 'User-generated content', 'Promotional'] },
        'food & restaurant': { posts: 40, platforms: ['instagram', 'facebook'], focus: ['Behind-the-scenes', 'User-generated content', 'Promotional'] },
        'healthcare': { posts: 20, platforms: ['linkedin', 'facebook'], focus: ['Educational', 'Tips and tricks'] },
        'technology': { posts: 25, platforms: ['linkedin', 'twitter'], focus: ['Educational', 'Industry insights'] },
        'financial services': { posts: 30, platforms: ['linkedin', 'facebook'], focus: ['Educational', 'Industry insights'] },
        'retail': { posts: 40, platforms: ['instagram', 'facebook'], focus: ['Promotional', 'Behind-the-scenes'] },
        'fashion': { posts: 45, platforms: ['instagram', 'tiktok'], focus: ['Behind-the-scenes', 'User-generated content'] },
        'beauty': { posts: 50, platforms: ['instagram', 'tiktok'], focus: ['Behind-the-scenes', 'User-generated content'] },
        'fitness': { posts: 35, platforms: ['instagram', 'facebook'], focus: ['Educational', 'Behind-the-scenes'] },
        'default': { posts: 25, platforms: ['instagram', 'facebook'], focus: ['Educational', 'Behind-the-scenes'] }
      }
      
      const defaults = industryDefaults[basicFormData.industry.toLowerCase() as keyof typeof industryDefaults] || industryDefaults.default
      
      setExtendedFormData(prev => ({
        ...prev,
        totalPosts: defaults.posts,
        platforms: basicFormData.primaryPlatforms.length > 0 ? basicFormData.primaryPlatforms : defaults.platforms,
        contentFocus: defaults.focus
      }))
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }

  const handleNextToSummary = async () => {
    setCurrentStep(2)
    await generateAISummary()
  }

  const handleNextToExtended = async () => {
    if (!aiSummary) return
    
    // Use the AI summary to populate the extended form
    setExtendedFormData(prev => ({
      ...prev,
      totalPosts: aiSummary.plan.totalPosts,
      platforms: aiSummary.plan.platforms,
      contentFocus: aiSummary.plan.contentFocus,
      selectedCategories: [],
      selectedTopics: []
    }))
    
    setCurrentStep(3)
  }

  const handleGeneratePosts = async () => {
    if (!currentOrganization) return
    
    setCurrentStep(4)
    setShowGenerationProgress(true)
    
    try {
      const aiService = AIService.getInstance()
      
      // Create form data for AI service
      const formData = {
        totalPosts: extendedFormData.totalPosts,
        dateRange: extendedFormData.dateRange,
        platforms: extendedFormData.platforms,
        selectedCategories: extendedFormData.selectedCategories,
        selectedTopics: extendedFormData.selectedTopics,
        brandVoice: basicFormData.brandVoice,
        contentFocus: extendedFormData.contentFocus
      }
      
      const plan = await aiService.generatePostsFromForm(
        formData,
        currentOrganization.id,
        categories,
        topics,
        (current, total, action) => {
          setGenerationProgress({
            current,
            total,
            action,
            estimatedTime: Math.max(0, Math.ceil((total - current) * 0.5))
          })
        }
      )
      
      // Create actual posts in the database
      if (plan.posts && plan.posts.length > 0) {
        const createdPosts = await aiService.createPostsFromPlan(plan, currentOrganization.id)
        onPostsCreated?.(createdPosts)
      }
      
    } catch (error) {
      console.error('Error generating posts:', error)
    } finally {
      setShowGenerationProgress(false)
    }
  }

  const isBasicFormValid = () => {
    return basicFormData.companyName.trim() !== '' &&
           basicFormData.industry !== '' &&
           basicFormData.targetAudience.trim() !== '' &&
           basicFormData.primaryPlatforms.length > 0 &&
           basicFormData.keyMessage.trim() !== '' &&
           basicFormData.brandVoice !== ''
  }

  const isExtendedFormValid = () => {
    return extendedFormData.totalPosts > 0 &&
           extendedFormData.platforms.length > 0 &&
           extendedFormData.contentFocus.length > 0
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold">AI Post Generation</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Building2 className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h3>
                  <p className="text-gray-600">Tell us about your business to get started</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={basicFormData.companyName}
                      onChange={(e) => handleBasicFormChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 1/2 Drink"
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Target className="w-4 h-4 inline mr-2" />
                      Industry
                    </label>
                    <select
                      value={basicFormData.industry}
                      onChange={(e) => handleBasicFormChange('industry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>

                  {/* Target Audience */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={basicFormData.targetAudience}
                      onChange={(e) => handleBasicFormChange('targetAudience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Ladies in their 30s, Young professionals, Health-conscious consumers"
                    />
                  </div>

                  {/* Primary Platforms */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Smartphone className="w-4 h-4 inline mr-2" />
                      Primary Platforms
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {PLATFORMS.map(platform => (
                        <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={basicFormData.primaryPlatforms.includes(platform)}
                            onChange={() => handlePlatformToggle(platform)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm capitalize">{platform}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Key Message */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Key Message / Brand Slogan
                    </label>
                    <input
                      type="text"
                      value={basicFormData.keyMessage}
                      onChange={(e) => handleBasicFormChange('keyMessage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Healthy can be beautiful, Quality you can trust"
                    />
                  </div>

                  {/* Brand Voice */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Brand Voice
                    </label>
                    <select
                      value={basicFormData.brandVoice}
                      onChange={(e) => handleBasicFormChange('brandVoice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select brand voice</option>
                      {BRAND_VOICE_OPTIONS.map(voice => (
                        <option key={voice} value={voice}>{voice}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Understanding & Plan</h3>
                  {isGeneratingRecommendations ? (
                    <div className="flex items-center justify-center space-x-2 text-purple-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <p className="text-gray-600">AI is analyzing your company info and creating a plan...</p>
                    </div>
                  ) : (
                    <p className="text-gray-600">Review the AI's understanding and proposed social media plan</p>
                  )}
                </div>

                {aiSummary && (
                  <div className="space-y-6">
                    {/* AI Understanding */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        AI's Understanding
                      </h4>
                      <p className="text-blue-800 leading-relaxed">{aiSummary.understanding}</p>
                    </div>

                    {/* AI Plan */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        Proposed Social Media Plan
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <h5 className="font-medium text-green-800 mb-2">📊 Content Volume</h5>
                          <p className="text-green-700">{aiSummary.plan.totalPosts} posts recommended</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <h5 className="font-medium text-green-800 mb-2">📱 Platforms</h5>
                          <p className="text-green-700">{aiSummary.plan.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <h5 className="font-medium text-green-800 mb-2">🎯 Content Focus</h5>
                          <p className="text-green-700">{aiSummary.plan.contentFocus.join(', ')}</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <h5 className="font-medium text-green-800 mb-2">🎭 Brand Voice</h5>
                          <p className="text-green-700">{aiSummary.plan.brandVoice}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <h5 className="font-medium text-green-800 mb-2">💡 AI Reasoning</h5>
                        <p className="text-green-700 leading-relaxed">{aiSummary.plan.reasoning}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Calendar className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Campaign Configuration</h3>
                  <p className="text-gray-600">Review and adjust the AI-generated campaign settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Number of Posts */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📊 Number of Posts
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={extendedFormData.totalPosts}
                        onChange={(e) => handleExtendedFormChange('totalPosts', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📅 Campaign Duration
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={extendedFormData.dateRange.start}
                            onChange={(e) => handleExtendedFormChange('dateRange', { ...extendedFormData.dateRange, start: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">End Date</label>
                          <input
                            type="date"
                            value={extendedFormData.dateRange.end}
                            onChange={(e) => handleExtendedFormChange('dateRange', { ...extendedFormData.dateRange, end: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Platforms */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📱 Social Media Platforms
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {PLATFORMS.map(platform => (
                          <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={extendedFormData.platforms.includes(platform)}
                              onChange={() => handleExtendedPlatformToggle(platform)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm capitalize">{platform}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Categories */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📂 Categories
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                        {categories.length > 0 ? (
                          categories.map(category => (
                            <label key={category.id} className="flex items-center space-x-2 cursor-pointer py-1">
                              <input
                                type="checkbox"
                                checked={extendedFormData.selectedCategories.includes(category.id)}
                                onChange={() => handleCategoryToggle(category.id)}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm">{category.name}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No categories available</p>
                        )}
                      </div>
                    </div>

                    {/* Topics */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🏷️ Topics
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                        {topics.length > 0 ? (
                          topics.map(topic => (
                            <label key={topic.id} className="flex items-center space-x-2 cursor-pointer py-1">
                              <input
                                type="checkbox"
                                checked={extendedFormData.selectedTopics.includes(topic.id)}
                                onChange={() => handleTopicToggle(topic.id)}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm">{topic.name}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No topics available</p>
                        )}
                      </div>
                    </div>

                    {/* Content Focus */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🎯 Content Focus
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {CONTENT_FOCUS_OPTIONS.map(focus => (
                          <label key={focus} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={extendedFormData.contentFocus.includes(focus)}
                              onChange={() => handleContentFocusToggle(focus)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm">{focus}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && showGenerationProgress && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <AIGenerationProgress
                  totalPosts={generationProgress.total}
                  currentPost={generationProgress.current}
                  isGenerating={showGenerationProgress}
                  estimatedTimeRemaining={generationProgress.estimatedTime}
                  currentAction={generationProgress.action}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex space-x-3">
            {currentStep === 1 && (
              <button
                onClick={handleNextToSummary}
                disabled={!isBasicFormValid()}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Generate AI Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 2 && aiSummary && (
              <button
                onClick={handleNextToExtended}
                className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <span>Generate Social Calendar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={handleGeneratePosts}
                disabled={!isExtendedFormValid()}
                className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Posts ({extendedFormData.totalPosts} posts)</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
