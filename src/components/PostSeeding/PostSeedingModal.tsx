import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Database, Calendar, Hash, Users, Settings, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { createPostSeedingService } from '@/services/PostSeedingService'
import { Category, Topic, SocialPlatform, PostType, PostStatus } from '@/types'
import { apiService } from '@/services/ApiService'

interface PostSeedingModalProps {
  isOpen: boolean
  onClose: () => void
  onPostsSeeded?: (count: number) => void
}

export function PostSeedingModal({ isOpen, onClose, onPostsSeeded }: PostSeedingModalProps) {
  const { currentOrganization } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [config, setConfig] = useState({
    platforms: ['instagram', 'facebook', 'twitter'] as SocialPlatform[],
    postTypes: ['text', 'image'] as PostType[],
    statuses: ['draft', 'scheduled'] as PostStatus[],
    categoryIds: [] as string[],
    topicIds: [] as string[],
    count: 10,
    includeScheduled: true,
    includePublished: false,
    dateRange: {
      start: new Date(),
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  })

  // Load categories and topics when modal opens
  useEffect(() => {
    if (isOpen && currentOrganization && currentOrganization.id) {
      loadCategoriesAndTopics()
    }
  }, [isOpen, currentOrganization])

  const loadCategoriesAndTopics = async () => {
    try {
      setLoadingData(true)
      const [categoriesData, topicsData] = await Promise.all([
        apiService.getCategories(),
        apiService.getTopics()
      ])
      setCategories(categoriesData)
      setTopics(topicsData)
    } catch (error) {
      console.error('Failed to load categories and topics:', error)
      setError('Failed to load categories and topics')
    } finally {
      setLoadingData(false)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setConfig(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId],
      topicIds: [] // Reset topics when categories change
    }))
  }

  const handleTopicToggle = (topicId: string) => {
    setConfig(prev => ({
      ...prev,
      topicIds: prev.topicIds.includes(topicId)
        ? prev.topicIds.filter(id => id !== topicId)
        : [...prev.topicIds, topicId]
    }))
  }

  const handleSelectAllCategories = () => {
    setConfig(prev => ({
      ...prev,
      categoryIds: categories.map(cat => cat.id),
      topicIds: topics.map(topic => topic.id)
    }))
  }

  const handleDeselectAllCategories = () => {
    setConfig(prev => ({
      ...prev,
      categoryIds: [],
      topicIds: []
    }))
  }

  const handleSelectAllTopics = () => {
    setConfig(prev => ({
      ...prev,
      topicIds: topics.map(topic => topic.id)
    }))
  }

  const handleDeselectAllTopics = () => {
    setConfig(prev => ({
      ...prev,
      topicIds: []
    }))
  }

  const handleSeeding = async () => {
    if (!currentOrganization) {
      setError('No organization selected')
      return
    }

    if (config.categoryIds.length === 0) {
      setError('Please select at least one category')
      return
    }

    if (config.topicIds.length === 0) {
      setError('Please select at least one topic')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const seedingService = createPostSeedingService(currentOrganization.id)
      const seededPosts = await seedingService.seedPosts(config)

      setSuccess(`Successfully seeded ${seededPosts.length} posts!`)
      onPostsSeeded?.(seededPosts.length)
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Failed to seed posts:', error)
      setError(error instanceof Error ? error.message : 'Failed to seed posts')
    } finally {
      setIsLoading(false)
    }
  }

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' }
  ]

  const postTypes = [
    { id: 'text', name: 'Text' },
    { id: 'image', name: 'Image' },
    { id: 'video', name: 'Video' },
    { id: 'carousel', name: 'Carousel' },
    { id: 'story', name: 'Story' }
  ]

  const statuses = [
    { id: 'draft', name: 'Draft' },
    { id: 'scheduled', name: 'Scheduled' },
    { id: 'published', name: 'Published' }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-background border border-border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Seed Posts</h2>
                  <p className="text-sm text-muted-foreground">Generate sample posts for testing</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-6">
              {/* Error/Success Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded-md"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{success}</span>
                </motion.div>
              )}

              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Number of Posts</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={config.count}
                    onChange={(e) => setConfig(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                    className="input"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Start Date</label>
                  <input
                    type="date"
                    value={config.dateRange.start.toISOString().split('T')[0]}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, start: new Date(e.target.value) }
                    }))}
                    className="input"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">End Date</label>
                  <input
                    type="date"
                    value={config.dateRange.end.toISOString().split('T')[0]}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, end: new Date(e.target.value) }
                    }))}
                    className="input"
                  />
                </div>
              </div>

              {/* Platforms */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Platforms</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {platforms.map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        platforms: prev.platforms.includes(platform.id as SocialPlatform)
                          ? prev.platforms.filter(p => p !== platform.id)
                          : [...prev.platforms, platform.id as SocialPlatform]
                      }))}
                      className={`p-3 rounded-lg border border-border text-left transition-colors ${
                        config.platforms.includes(platform.id as SocialPlatform)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{platform.icon}</span>
                        <span className="text-sm font-medium">{platform.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Post Types */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Post Types</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {postTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        postTypes: prev.postTypes.includes(type.id as PostType)
                          ? prev.postTypes.filter(t => t !== type.id)
                          : [...prev.postTypes, type.id as PostType]
                      }))}
                      className={`p-3 rounded-lg border border-border text-left transition-colors ${
                        config.postTypes.includes(type.id as PostType)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="text-sm font-medium">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Statuses */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Statuses</label>
                <div className="grid grid-cols-3 gap-2">
                  {statuses.map(status => (
                    <button
                      key={status.id}
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        statuses: prev.statuses.includes(status.id as PostStatus)
                          ? prev.statuses.filter(s => s !== status.id)
                          : [...prev.statuses, status.id as PostStatus]
                      }))}
                      className={`p-3 rounded-lg border border-border text-left transition-colors ${
                        config.statuses.includes(status.id as PostStatus)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="text-sm font-medium">{status.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Categories</label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAllCategories}
                      className="text-xs text-primary hover:underline"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAllCategories}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                
                {loadingData ? (
                  <div className="text-center py-4 text-muted-foreground">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No categories available</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`p-3 rounded-lg border border-border text-left transition-colors ${
                          config.categoryIds.includes(category.id)
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Topics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Topics</label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAllTopics}
                      className="text-xs text-primary hover:underline"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAllTopics}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                
                {loadingData ? (
                  <div className="text-center py-4 text-muted-foreground">Loading topics...</div>
                ) : topics.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No topics available</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {topics.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => handleTopicToggle(topic.id)}
                        className={`p-3 rounded-lg border border-border text-left transition-colors ${
                          config.topicIds.includes(topic.id)
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: topic.color }}
                          />
                          <span className="text-sm font-medium">{topic.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Selected: {config.categoryIds.length} categories, {config.topicIds.length} topics
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="btn btn-outline"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSeeding}
                  disabled={isLoading || config.categoryIds.length === 0 || config.topicIds.length === 0}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Start Seeding
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
