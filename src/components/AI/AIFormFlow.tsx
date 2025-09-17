import React, { useState, useEffect } from 'react'
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
  Sparkles,
  Plus,
  X,
  Check,
  Search,
  Filter
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
  // Food & Beverage
  'Beverage', 'Food & Restaurant', 'Coffee & Tea', 'Wine & Spirits', 'Craft Beer', 'Dairy Products',
  'Organic Food', 'Fast Food', 'Fine Dining', 'Catering', 'Food Delivery', 'Food Manufacturing',
  
  // Healthcare & Wellness
  'Healthcare', 'Mental Health', 'Dental', 'Veterinary', 'Pharmaceuticals', 'Medical Devices',
  'Fitness & Wellness', 'Yoga & Meditation', 'Nutrition', 'Alternative Medicine', 'Senior Care',
  'Physical Therapy', 'Chiropractic', 'Optometry', 'Dermatology', 'Pediatrics',
  
  // Technology & Digital
  'Technology', 'Software Development', 'Mobile Apps', 'E-commerce', 'Cybersecurity', 'AI & Machine Learning',
  'Cloud Computing', 'Gaming', 'Social Media', 'Digital Marketing', 'Web Development', 'IT Services',
  'Telecommunications', 'Electronics', 'Robotics', 'Blockchain', 'IoT', 'SaaS',
  
  // Financial & Professional Services
  'Financial Services', 'Banking', 'Insurance', 'Investment', 'Accounting', 'Tax Services',
  'Legal Services', 'Consulting', 'Business Coaching', 'HR Services', 'Recruitment',
  'Real Estate', 'Property Management', 'Mortgage', 'Financial Planning', 'Credit Services',
  
  // Retail & Consumer Goods
  'Retail', 'Fashion', 'Beauty & Cosmetics', 'Jewelry', 'Home & Garden', 'Furniture',
  'Books & Media', 'Toys & Games', 'Sports & Outdoor', 'Automotive',
  'Pet Supplies', 'Baby Products', 'Gifts & Accessories', 'Luxury Goods', 'Thrift & Vintage',
  
  // Education & Training
  'Education', 'Online Learning', 'Language Learning', 'Professional Training', 'Tutoring',
  'Early Childhood', 'Higher Education', 'Vocational Training', 'Corporate Training',
  'Music & Arts Education', 'STEM Education', 'Special Education',
  
  // Entertainment & Media
  'Entertainment', 'Film & TV', 'Theater & Performing Arts',
  'Video Production', 'Podcasting', 'Streaming', 'Event Planning',
  'Wedding Planning', 'Party Planning', 'Concert Promotion', 'Art & Design',
  
  // Travel & Hospitality
  'Travel', 'Tourism', 'Hotels & Accommodation', 'Restaurants', 'Cafes', 'Bars & Nightlife',
  'Cruise Lines', 'Airlines', 'Car Rental', 'Travel Agency', 'Vacation Rentals',
  'Adventure Travel', 'Luxury Travel', 'Business Travel', 'Group Travel',
  
  // Manufacturing & Industrial
  'Manufacturing', 'Textiles', 'Automotive Manufacturing', 'Aerospace', 'Construction',
  'Architecture', 'Engineering', 'Mining', 'Oil & Gas',
  'Packaging', 'Printing', 'Chemical', 'Plastics', 'Metals', 'Wood Products',
  
  // Agriculture & Environment
  'Agriculture', 'Farming', 'Livestock', 'Crop Production', 'Organic Farming',
  'Environmental Services', 'Sustainability', 'Renewable Energy', 'Waste Management',
  'Water Treatment', 'Green Technology', 'Conservation', 'Forestry',
  
  // Non-Profit & Government
  'Non-Profit', 'Charity', 'Religious Organizations', 'Government', 'Public Services',
  'Community Services', 'Social Services', 'Advocacy', 'Environmental Organizations',
  'Animal Welfare', 'Humanitarian Aid', 'Education Non-Profit',
  
  // Personal Services
  'Personal Care', 'Hair & Beauty', 'Spa & Wellness', 'Massage Therapy', 'Personal Training',
  'Life Coaching', 'Pet Services', 'Pet Grooming', 'Pet Training', 'Pet Sitting',
  'Cleaning Services', 'Laundry Services', 'Moving Services', 'Home Maintenance',
  
  // Creative & Professional
  'Graphic Design', 'Web Design', 'Interior Design', 'Fashion Design',
  'Videography', 'Writing & Editing', 'Translation', 'Marketing', 'Advertising',
  'Public Relations', 'Branding', 'Content Creation', 'Social Media Management',
  
  // Other
  'Other', 'Custom/Unique Business'
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

const TARGET_AUDIENCE_OPTIONS = [
  // Age-based demographics
  'Gen Z (18-26)', 'Millennials (27-42)', 'Gen X (43-58)', 'Baby Boomers (59-77)', 'Seniors (78+)',
  'Teens (13-17)', 'Young Adults (18-25)', 'Adults (26-40)', 'Middle-aged (41-55)', 'Mature Adults (56+)',
  
  // Gender demographics
  'Women', 'Men', 'Non-binary', 'All genders',
  'Ladies in their 20s', 'Ladies in their 30s', 'Ladies in their 40s', 'Ladies in their 50s+',
  'Men in their 20s', 'Men in their 30s', 'Men in their 40s', 'Men in their 50s+',
  
  // Professional demographics
  'Young professionals', 'Mid-career professionals', 'Senior executives', 'Entrepreneurs',
  'Small business owners', 'Corporate employees', 'Freelancers', 'Remote workers',
  'Students', 'Recent graduates', 'Career changers', 'Retirees',
  
  // Income-based demographics
  'High-income earners', 'Middle-class families', 'Budget-conscious consumers',
  'Luxury consumers', 'Value seekers', 'Premium buyers', 'Cost-conscious buyers',
  
  // Lifestyle demographics
  'Health-conscious consumers', 'Fitness enthusiasts', 'Wellness seekers', 'Busy parents',
  'Empty nesters', 'New parents', 'Pet owners', 'Travel enthusiasts',
  'Food lovers', 'Tech enthusiasts', 'Creative professionals', 'Art lovers',
  
  // Interest-based demographics
  'Fashion-forward individuals', 'Beauty enthusiasts', 'Home decor lovers', 'Gardeners',
  'Sports fans', 'Gamers', 'Music lovers', 'Book readers', 'Movie buffs',
  'Outdoor enthusiasts', 'Adventure seekers', 'Luxury lifestyle seekers',
  
  // Geographic demographics
  'Urban dwellers', 'Suburban families', 'Rural communities', 'International audience',
  'Local community', 'National audience', 'Global audience',
  
  // Industry-specific demographics
  'Healthcare professionals', 'Tech workers', 'Finance professionals', 'Educators',
  'Legal professionals', 'Manufacturing workers',
  'Retail employees', 'Service industry workers', 'Government employees',
  
  // Psychographic demographics
  'Early adopters', 'Trend followers', 'Traditional consumers', 'Innovation seekers',
  'Quality-focused buyers', 'Convenience seekers', 'Eco-conscious consumers',
  'Socially responsible buyers', 'Brand loyalists', 'Price-sensitive shoppers',
  
  // Specialized demographics
  'B2B decision makers', 'B2C consumers', 'Influencers', 'Content creators',
  'Enterprise clients', 'Non-profit organizations',
  'Educational institutions', 'Government agencies', 'Healthcare organizations',
  
  // Custom/Other
  'Custom audience', 'Multiple demographics', 'Niche market', 'Specific community'
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

  // 🏢 Company Information Storage
  const COMPANY_INFO_KEY = 'ai-company-info'
  
  const saveCompanyInfo = (data: BasicFormData) => {
    try {
      localStorage.setItem(COMPANY_INFO_KEY, JSON.stringify(data))
      console.log('💾 Company information saved to localStorage')
    } catch (error) {
      console.error('❌ Failed to save company information:', error)
    }
  }
  
  const loadCompanyInfo = (): BasicFormData | null => {
    try {
      const saved = localStorage.getItem(COMPANY_INFO_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log('📂 Company information loaded from localStorage:', parsed)
        return parsed
      }
    } catch (error) {
      console.error('❌ Failed to load company information:', error)
    }
    return null
  }
  
  const clearCompanyInfo = () => {
    try {
      localStorage.removeItem(COMPANY_INFO_KEY)
      console.log('🗑️ Company information cleared from localStorage')
    } catch (error) {
      console.error('❌ Failed to clear company information:', error)
    }
  }

  // 🔄 Load saved company information on component mount
  useEffect(() => {
    if (isOpen) {
      const savedInfo = loadCompanyInfo()
      if (savedInfo) {
        setBasicFormData(savedInfo)
        setShowDataRestored(true)
        console.log('✅ Company information restored from previous session')
        
        // Hide notification after 3 seconds
        setTimeout(() => setShowDataRestored(false), 3000)
      }
    }
  }, [isOpen])
  
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
  
  // Search and filter states for categories and topics
  const [categorySearch, setCategorySearch] = useState('')
  const [topicSearch, setTopicSearch] = useState('')
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)
  const [showDataRestored, setShowDataRestored] = useState(false)

  const handleBasicFormChange = (field: keyof BasicFormData, value: any) => {
    const updatedData = {
      ...basicFormData,
      [field]: value
    }
    setBasicFormData(updatedData)
    
    // 💾 Auto-save company information
    saveCompanyInfo(updatedData)
  }

  const handlePlatformToggle = (platform: SocialPlatform) => {
    const updatedData = {
      ...basicFormData,
      primaryPlatforms: basicFormData.primaryPlatforms.includes(platform)
        ? basicFormData.primaryPlatforms.filter(p => p !== platform)
        : [...basicFormData.primaryPlatforms, platform]
    }
    setBasicFormData(updatedData)
    
    // 💾 Auto-save company information
    saveCompanyInfo(updatedData)
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

  // Quick selection functions
  const handleSelectAllCategories = () => {
    const allCategoryIds = categories.map(cat => cat.id)
    setExtendedFormData(prev => ({
      ...prev,
      selectedCategories: allCategoryIds
    }))
  }

  const handleSelectAllTopics = () => {
    const allTopicIds = topics.map(topic => topic.id)
    setExtendedFormData(prev => ({
      ...prev,
      selectedTopics: allTopicIds
    }))
  }

  const handleClearAllCategories = () => {
    setExtendedFormData(prev => ({
      ...prev,
      selectedCategories: []
    }))
  }

  const handleClearAllTopics = () => {
    setExtendedFormData(prev => ({
      ...prev,
      selectedTopics: []
    }))
  }

  // Filter functions
  const filteredCategories = categories.filter(category => {
    const matchesSearch = !categorySearch || 
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    const matchesFilter = !showSelectedOnly || 
      extendedFormData.selectedCategories.includes(category.id)
    return matchesSearch && matchesFilter
  })

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = !topicSearch || 
      topic.name.toLowerCase().includes(topicSearch.toLowerCase())
    const matchesFilter = !showSelectedOnly || 
      extendedFormData.selectedTopics.includes(topic.id)
    return matchesSearch && matchesFilter
  })

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
      
      // Set the AI service post limit to the user's selected value
      aiService.setMaxPostsPerGeneration(extendedFormData.totalPosts)
      
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
        const createdPosts = await aiService.createPostsFromPlan(currentOrganization.id)
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
           basicFormData.targetAudience !== '' &&
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
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .post-limit-slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #8b5cf6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .post-limit-slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #8b5cf6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .post-limit-slider::-webkit-slider-track {
            height: 8px;
            border-radius: 4px;
          }
          
          .post-limit-slider::-moz-range-track {
            height: 8px;
            border-radius: 4px;
          }
        `
      }} />
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

                {/* Data Restored Notification */}
                {showDataRestored && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
                  >
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Company Information Restored</h4>
                        <p className="text-sm text-green-700">Your previously saved company details have been loaded automatically.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

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
                    <select
                      value={basicFormData.targetAudience}
                      onChange={(e) => handleBasicFormChange('targetAudience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select target audience</option>
                      {TARGET_AUDIENCE_OPTIONS.map(audience => (
                        <option key={audience} value={audience}>{audience}</option>
                      ))}
                    </select>
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
                        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {extendedFormData.totalPosts}
                        </span>
                      </label>
                      <div className="space-y-3">
                        <input
                          type="range"
                          min="1"
                          max="40"
                          value={extendedFormData.totalPosts}
                          onChange={(e) => handleExtendedFormChange('totalPosts', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer post-limit-slider"
                          style={{
                            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((extendedFormData.totalPosts - 1) / 39) * 100}%, #e5e7eb ${((extendedFormData.totalPosts - 1) / 39) * 100}%, #e5e7eb 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>1 post</span>
                          <span className="font-medium text-purple-600">{extendedFormData.totalPosts} posts</span>
                          <span>40 posts</span>
                        </div>
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          💡 <strong>Tip:</strong> More posts = more content variety, but longer generation time
                        </div>
                      </div>
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
                    {/* Categories Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Building2 className="w-4 h-4 mr-2" />
                          Categories
                          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {extendedFormData.selectedCategories.length}
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSelectAllCategories}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            title="Select All Categories"
                          >
                            <Check className="w-3 h-3 inline mr-1" />
                            All
                          </button>
                          <button
                            onClick={handleClearAllCategories}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            title="Clear All Categories"
                          >
                            <X className="w-3 h-3 inline mr-1" />
                            Clear
                          </button>
                        </div>
                      </div>
                      
                      {/* Search and Filter */}
                      <div className="mb-3 space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                              showSelectedOnly 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Filter className="w-3 h-3" />
                            Selected Only
                          </button>
                        </div>
                      </div>

                      {/* Categories List */}
                      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md bg-white">
                        {filteredCategories.length > 0 ? (
                          <div className="p-2 space-y-1">
                            {filteredCategories.map(category => (
                              <motion.label 
                                key={category.id} 
                                className={`flex items-center space-x-3 cursor-pointer p-2 rounded-md transition-colors hover:bg-gray-50 ${
                                  extendedFormData.selectedCategories.includes(category.id) 
                                    ? 'bg-purple-50 border border-purple-200' 
                                    : ''
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <input
                                  type="checkbox"
                                  checked={extendedFormData.selectedCategories.includes(category.id)}
                                  onChange={() => handleCategoryToggle(category.id)}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700 flex-1">
                                  {category.name}
                                </span>
                                {extendedFormData.selectedCategories.includes(category.id) && (
                                  <Check className="w-4 h-4 text-purple-600" />
                                )}
                              </motion.label>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-sm text-gray-500">
                              {categorySearch ? 'No categories match your search' : 'No categories available'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Topics Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Target className="w-4 h-4 mr-2" />
                          Topics
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {extendedFormData.selectedTopics.length}
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSelectAllTopics}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            title="Select All Topics"
                          >
                            <Check className="w-3 h-3 inline mr-1" />
                            All
                          </button>
                          <button
                            onClick={handleClearAllTopics}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            title="Clear All Topics"
                          >
                            <X className="w-3 h-3 inline mr-1" />
                            Clear
                          </button>
                        </div>
                      </div>
                      
                      {/* Search and Filter */}
                      <div className="mb-3 space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search topics..."
                            value={topicSearch}
                            onChange={(e) => setTopicSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                              showSelectedOnly 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Filter className="w-3 h-3" />
                            Selected Only
                          </button>
                        </div>
                      </div>

                      {/* Topics List */}
                      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md bg-white">
                        {filteredTopics.length > 0 ? (
                          <div className="p-2 space-y-1">
                            {filteredTopics.map(topic => (
                              <motion.label 
                                key={topic.id} 
                                className={`flex items-center space-x-3 cursor-pointer p-2 rounded-md transition-colors hover:bg-gray-50 ${
                                  extendedFormData.selectedTopics.includes(topic.id) 
                                    ? 'bg-blue-50 border border-blue-200' 
                                    : ''
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <input
                                  type="checkbox"
                                  checked={extendedFormData.selectedTopics.includes(topic.id)}
                                  onChange={() => handleTopicToggle(topic.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700 flex-1">
                                  {topic.name}
                                </span>
                                {extendedFormData.selectedTopics.includes(topic.id) && (
                                  <Check className="w-4 h-4 text-blue-600" />
                                )}
                              </motion.label>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-sm text-gray-500">
                              {topicSearch ? 'No topics match your search' : 'No topics available'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Focus */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Content Focus
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            {extendedFormData.contentFocus.length}
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setExtendedFormData(prev => ({
                                ...prev,
                                contentFocus: CONTENT_FOCUS_OPTIONS
                              }))
                            }}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            title="Select All Content Types"
                          >
                            <Check className="w-3 h-3 inline mr-1" />
                            All
                          </button>
                          <button
                            onClick={() => {
                              setExtendedFormData(prev => ({
                                ...prev,
                                contentFocus: []
                              }))
                            }}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            title="Clear All Content Types"
                          >
                            <X className="w-3 h-3 inline mr-1" />
                            Clear
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {CONTENT_FOCUS_OPTIONS.map(focus => (
                          <motion.label 
                            key={focus} 
                            className={`flex items-center space-x-3 cursor-pointer p-2 rounded-md transition-colors hover:bg-gray-50 ${
                              extendedFormData.contentFocus.includes(focus) 
                                ? 'bg-green-50 border border-green-200' 
                                : ''
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <input
                              type="checkbox"
                              checked={extendedFormData.contentFocus.includes(focus)}
                              onChange={() => handleContentFocusToggle(focus)}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm font-medium text-gray-700 flex-1">
                              {focus}
                            </span>
                            {extendedFormData.contentFocus.includes(focus) && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </motion.label>
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
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            
            {currentStep === 1 && (
              <button
                onClick={() => {
                  clearCompanyInfo()
                  setBasicFormData({
                    companyName: '',
                    industry: '',
                    targetAudience: '',
                    primaryPlatforms: [],
                    keyMessage: '',
                    brandVoice: ''
                  })
                }}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 text-sm"
                title="Clear saved company information"
              >
                <X className="w-4 h-4" />
                <span>Clear Saved Data</span>
              </button>
            )}
          </div>

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
    </>
  )
}
