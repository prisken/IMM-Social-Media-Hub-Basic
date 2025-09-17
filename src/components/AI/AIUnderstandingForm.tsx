import React, { useState, useEffect } from 'react'
import { SocialPlatform, Category, Topic, AIContentPlan, AIDirectiveContext } from '@/types'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useCategories } from '@/hooks/useCategories'
import { useTopics } from '@/hooks/useTopics'

interface AIUnderstandingFormProps {
  businessContext: {
    companyName?: string
    mission?: string
    vision?: string
    industry?: string
    services?: string[]
    targetAudience?: string
  }
  aiFormData?: Partial<FormData> // 🎯 AI-generated form data
  onConfirm: (formData: FormData) => void
  onCancel: () => void
}

interface FormData {
  totalPosts: number
  dateRange: {
    start: string
    end: string
  }
  platforms: SocialPlatform[]
  selectedCategories: string[]
  selectedTopics: string[]
  brandVoice: string
  contentFocus: string[]
}

const PLATFORMS: SocialPlatform[] = ['facebook', 'instagram', 'linkedin', 'tiktok', 'twitter']
const CONTENT_FOCUS_OPTIONS = [
  'Educational', 'Promotional', 'Behind-the-scenes', 'User-generated content',
  'Industry insights', 'Company news', 'Tips and tricks', 'Inspirational'
]

export const AIUnderstandingForm: React.FC<AIUnderstandingFormProps> = ({
  businessContext,
  aiFormData,
  onConfirm,
  onCancel
}) => {
  const { currentOrganization } = useAuth()
  const { categories } = useCategories()
  const { topics } = useTopics()
  
  const [formData, setFormData] = useState<FormData>({
    totalPosts: aiFormData?.totalPosts || 20,
    dateRange: aiFormData?.dateRange || {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    },
    platforms: aiFormData?.platforms || ['instagram'],
    selectedCategories: aiFormData?.selectedCategories || [],
    selectedTopics: aiFormData?.selectedTopics || [],
    brandVoice: aiFormData?.brandVoice || 'Professional and friendly',
    contentFocus: aiFormData?.contentFocus || ['Educational']
  })

  // 🎯 Update form when AI provides new data
  useEffect(() => {
    console.log('🎯 AIUnderstandingForm received aiFormData:', aiFormData)
    if (aiFormData) {
      console.log('🎯 Updating form with AI data:', aiFormData)
      setFormData(prev => ({
        ...prev,
        ...aiFormData
      }))
    }
  }, [aiFormData])

  // Auto-populate form based on business context
  useEffect(() => {
    if (businessContext.industry) {
      // Smart defaults based on industry
      const industryDefaults = {
        'financial': { posts: 30, platforms: ['linkedin', 'facebook'], focus: ['Educational', 'Industry insights'] },
        'technology': { posts: 25, platforms: ['linkedin', 'twitter'], focus: ['Educational', 'Industry insights'] },
        'retail': { posts: 40, platforms: ['instagram', 'facebook'], focus: ['Promotional', 'Behind-the-scenes'] },
        'healthcare': { posts: 20, platforms: ['linkedin', 'facebook'], focus: ['Educational', 'Tips and tricks'] },
        'default': { posts: 20, platforms: ['instagram'], focus: ['Educational'] }
      }
      
      const defaults = industryDefaults[businessContext.industry.toLowerCase() as keyof typeof industryDefaults] || industryDefaults.default
      
      setFormData(prev => ({
        ...prev,
        totalPosts: defaults.posts,
        platforms: defaults.platforms as SocialPlatform[],
        contentFocus: defaults.focus
      }))
    }
  }, [businessContext.industry])

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }))
  }

  const handleTopicToggle = (topicId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTopics: prev.selectedTopics.includes(topicId)
        ? prev.selectedTopics.filter(id => id !== topicId)
        : [...prev.selectedTopics, topicId]
    }))
  }

  const handleContentFocusToggle = (focus: string) => {
    setFormData(prev => ({
      ...prev,
      contentFocus: prev.contentFocus.includes(focus)
        ? prev.contentFocus.filter(f => f !== focus)
        : [...prev.contentFocus, focus]
    }))
  }

  const calculateEstimatedTime = () => {
    const postsPerMinute = 2 // Rough estimate
    const estimatedMinutes = Math.ceil(formData.totalPosts / postsPerMinute)
    return estimatedMinutes
  }

  const handleSubmit = () => {
    onConfirm(formData)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 AI Understanding & Configuration</h2>
        <p className="text-gray-600">Review and adjust the AI's understanding of your business and campaign parameters</p>
      </div>

      {/* Business Context Summary */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">🏢 AI's Understanding of Your Business</h3>
        <div className="space-y-2 text-sm">
          {businessContext.companyName && (
            <div><span className="font-medium">Company:</span> {businessContext.companyName}</div>
          )}
          {businessContext.industry && (
            <div><span className="font-medium">Industry:</span> {businessContext.industry}</div>
          )}
          {businessContext.mission && (
            <div><span className="font-medium">Mission:</span> {businessContext.mission}</div>
          )}
          {businessContext.vision && (
            <div><span className="font-medium">Vision:</span> {businessContext.vision}</div>
          )}
          {businessContext.services && businessContext.services.length > 0 && (
            <div><span className="font-medium">Services:</span> {businessContext.services.join(', ')}</div>
          )}
          {businessContext.targetAudience && (
            <div><span className="font-medium">Target Audience:</span> {businessContext.targetAudience}</div>
          )}
        </div>
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
              value={formData.totalPosts}
              onChange={(e) => handleInputChange('totalPosts', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Estimated generation time: ~{calculateEstimatedTime()} minutes
            </p>
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
                  value={formData.dateRange.start}
                  onChange={(e) => handleInputChange('dateRange', { ...formData.dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.dateRange.end}
                  onChange={(e) => handleInputChange('dateRange', { ...formData.dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    checked={formData.platforms.includes(platform)}
                    onChange={() => handlePlatformToggle(platform)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Voice */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎭 Brand Voice
            </label>
            <input
              type="text"
              value={formData.brandVoice}
              onChange={(e) => handleInputChange('brandVoice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Professional and friendly, Casual and fun, Authoritative and expert"
            />
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
                      checked={formData.selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                      checked={formData.selectedTopics.includes(topic.id)}
                      onChange={() => handleTopicToggle(topic.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                    checked={formData.contentFocus.includes(focus)}
                    onChange={() => handleContentFocusToggle(focus)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{focus}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          🚀 Create Posts ({formData.totalPosts} posts)
        </button>
      </div>
    </div>
  )
}
