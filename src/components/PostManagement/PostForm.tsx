import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X, Hash, Image, Video, Calendar, Globe, Languages } from 'lucide-react'
import { Post, Category, Topic, MediaFile } from '@/types'
import { MediaManagement } from '@/components/MediaUpload/MediaManagement'
import { AIService } from '@/services/AIService'

interface PostFormProps {
  post?: Post | null
  categories: Category[]
  topics: Topic[]
  onSave: (postData: Partial<Post>) => Promise<void>
  onCancel: () => void
}

export function PostForm({ post, categories, topics, onSave, onCancel }: PostFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    topicId: '',
    platform: 'instagram',
    type: 'post',
    status: 'draft',
    hashtags: [] as string[],
    scheduledAt: '',
    metadata: {} as Record<string, any>
  })

  const [hashtagInput, setHashtagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([])
  const [isTranslating, setIsTranslating] = useState(false)

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        categoryId: post.categoryId || '',
        topicId: post.topicId || '',
        platform: post.platform || 'instagram',
        type: post.type || 'post',
        status: post.status || 'draft',
        hashtags: post.hashtags || [],
        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
        metadata: post.metadata || {}
      })
      
      // Load existing media files for editing
      if (post.media && post.media.length > 0) {
        const existingMediaFiles = post.media
          .map(mediaRelation => mediaRelation.mediaFile)
          .filter(mediaFile => mediaFile !== null) as MediaFile[]
        setSelectedMedia(existingMediaFiles)
      } else {
        setSelectedMedia([])
      }
    } else {
      // Reset form when creating new post
      setSelectedMedia([])
    }
  }, [post])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSave({
        ...formData,
        scheduledAt: formData.scheduledAt || null,
        media: selectedMedia.map((media, index) => ({
          id: `postmedia_${Date.now()}_${index}`, // Generate unique ID for PostMedia relationship
          postId: post?.id || '', // Will be set after post creation
          mediaFileId: media.id, // Use the MediaFile ID
          orderIndex: index,
          createdAt: new Date().toISOString()
        }))
      })
    } catch (error) {
      console.error('Failed to save post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !formData.hashtags.includes(hashtagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, hashtagInput.trim()]
      }))
      setHashtagInput('')
    }
  }

  const handleRemoveHashtag = (hashtag: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && hashtagInput.trim()) {
      e.preventDefault()
      handleAddHashtag()
    }
  }

  const getFilteredTopics = () => {
    if (!formData.categoryId) return topics
    return topics.filter(topic => topic.categoryId === formData.categoryId)
  }

  const handleTranslateToChinese = async () => {
    if (!formData.content.trim()) return
    
    setIsTranslating(true)
    try {
      const aiService = AIService.getInstance()
      const translatedContent = await aiService.translateText(formData.content, 'chinese')
      
      // Check if we got an error message instead of translation
      if (translatedContent.includes('Translation service is temporarily unavailable') || 
          translatedContent.includes('翻译服务暂时不可用')) {
        alert('AI translation service is not available. Please make sure Ollama is running or try again later.')
        return
      }
      
      setFormData(prev => ({ ...prev, content: translatedContent }))
    } catch (error) {
      console.error('Translation error:', error)
      alert('Translation failed. Please try again later.')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleTranslateToEnglish = async () => {
    if (!formData.content.trim()) return
    
    setIsTranslating(true)
    try {
      const aiService = AIService.getInstance()
      const translatedContent = await aiService.translateText(formData.content, 'english')
      
      // Check if we got an error message instead of translation
      if (translatedContent.includes('Translation service is temporarily unavailable') || 
          translatedContent.includes('翻译服务暂时不可用')) {
        alert('AI translation service is not available. Please make sure Ollama is running or try again later.')
        return
      }
      
      setFormData(prev => ({ ...prev, content: translatedContent }))
    } catch (error) {
      console.error('Translation error:', error)
      alert('Translation failed. Please try again later.')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleTranslateTitleToChinese = async () => {
    if (!formData.title.trim()) return
    
    setIsTranslating(true)
    try {
      const aiService = AIService.getInstance()
      const translatedTitle = await aiService.translateText(formData.title, 'chinese')
      
      // Check if we got an error message instead of translation
      if (translatedTitle.includes('Translation service is temporarily unavailable') || 
          translatedTitle.includes('翻译服务暂时不可用')) {
        alert('AI translation service is not available. Please make sure Ollama is running or try again later.')
        return
      }
      
      setFormData(prev => ({ ...prev, title: translatedTitle }))
    } catch (error) {
      console.error('Translation error:', error)
      alert('Translation failed. Please try again later.')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleTranslateTitleToEnglish = async () => {
    if (!formData.title.trim()) return
    
    setIsTranslating(true)
    try {
      const aiService = AIService.getInstance()
      const translatedTitle = await aiService.translateText(formData.title, 'english')
      
      // Check if we got an error message instead of translation
      if (translatedTitle.includes('Translation service is temporarily unavailable') || 
          translatedTitle.includes('翻译服务暂时不可用')) {
        alert('AI translation service is not available. Please make sure Ollama is running or try again later.')
        return
      }
      
      setFormData(prev => ({ ...prev, title: translatedTitle }))
    } catch (error) {
      console.error('Translation error:', error)
      alert('Translation failed. Please try again later.')
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {post ? 'Edit Post' : 'Create New Post'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {post ? 'Update your post content and settings' : 'Create a new social media post'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
            
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">
                  Post Title *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTranslateTitleToChinese}
                    disabled={!formData.title.trim() || isTranslating}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Languages className="w-3 h-3" />
                    {isTranslating ? '...' : '中文'}
                  </button>
                  <button
                    type="button"
                    onClick={handleTranslateTitleToEnglish}
                    disabled={!formData.title.trim() || isTranslating}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Languages className="w-3 h-3" />
                    {isTranslating ? '...' : 'EN'}
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter post title..."
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">
                  Content *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTranslateToChinese}
                    disabled={!formData.content.trim() || isTranslating}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Languages className="w-3 h-3" />
                    {isTranslating ? '...' : '中文'}
                  </button>
                  <button
                    type="button"
                    onClick={handleTranslateToEnglish}
                    disabled={!formData.content.trim() || isTranslating}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Languages className="w-3 h-3" />
                    {isTranslating ? '...' : 'EN'}
                  </button>
                </div>
              </div>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your post content..."
                rows={6}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                required
              />
            </div>
          </div>

          {/* Organization */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Organization</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    categoryId: e.target.value,
                    topicId: '' // Reset topic when category changes
                  }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Topic
                </label>
                <select
                  value={formData.topicId}
                  onChange={(e) => setFormData(prev => ({ ...prev, topicId: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!formData.categoryId}
                >
                  <option value="">Select a topic</option>
                  {getFilteredTopics().map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Platform Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Platform Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="post">Post</option>
                  <option value="story">Story</option>
                  <option value="reel">Reel</option>
                  <option value="video">Video</option>
                  <option value="carousel">Carousel</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hashtags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Hashtags</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Add Hashtags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter hashtag (without #)"
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddHashtag}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Hashtag List */}
            {formData.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.hashtags.map((hashtag, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    <Hash className="w-3 h-3" />
                    {hashtag}
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(hashtag)}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Media</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <MediaManagement
                onMediaSelect={setSelectedMedia}
                selectedMedia={selectedMedia}
                allowMultiple={true}
                maxFiles={10}
              />
            </div>
          </div>

          {/* Scheduling */}
          {formData.status === 'scheduled' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Scheduling</h3>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Schedule Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.content || !formData.categoryId}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : (post ? 'Update Post' : 'Create Post')}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  )
}
