import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Save, Eye, Calendar, Hash, Image, Video, Type, Send, AlertCircle, Plus, X } from 'lucide-react'
import { apiService } from '@/services/ApiService'
import { createMediaService } from '@/services/media/MediaService'
import { useAuth } from '@/components/Auth/AuthProvider'
import { PostFormData, Category, Topic, Post } from '@/types'
import { MediaUpload } from '@/components/MediaUpload/MediaUpload'

interface PostEditorFormProps {
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
  onPostCreated?: () => void
  onPostUpdated?: () => void
  showCloseButton?: boolean
  mode: 'create' | 'edit'
}

export function PostEditorForm({ 
  selectedPostId, 
  onPostSelect, 
  onPostCreated, 
  onPostUpdated,
  showCloseButton = false,
  mode
}: PostEditorFormProps) {
  const { user, currentOrganization } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<PostFormData>({
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
      topicId: '',
      platform: 'instagram',
      type: 'text',
      hashtags: [],
      media: [],
      scheduledAt: ''
    }
  })

  const watchedCategoryId = watch('categoryId')
  const watchedContent = watch('content')
  const watchedTitle = watch('title')

  // Load categories and topics
  useEffect(() => {
    if (currentOrganization) {
      loadCategories()
    }
  }, [currentOrganization])

  useEffect(() => {
    if (watchedCategoryId) {
      loadTopics(watchedCategoryId)
    } else {
      setTopics([])
    }
  }, [watchedCategoryId])

  // Load post data when selectedPostId changes
  useEffect(() => {
    if (selectedPostId && selectedPostId !== 'new') {
      loadPostData(selectedPostId)
    } else {
      resetForm()
    }
  }, [selectedPostId])

  const loadCategories = async () => {
    try {
      const categories = await apiService.getCategories()
      setCategories(categories)
    } catch (error) {
      console.error('Failed to load categories:', error)
      setError('Failed to load categories')
    }
  }

  const loadTopics = async (categoryId: string) => {
    try {
      const topics = await apiService.getTopics(categoryId)
      setTopics(topics)
    } catch (error) {
      console.error('Failed to load topics:', error)
      setError('Failed to load topics')
    }
  }

  const loadPostData = async (postId: string) => {
    try {
      setIsLoading(true)
      const post = await apiService.getPost(postId)
      
      if (post) {
        setValue('title', post.title)
        setValue('content', post.content)
        setValue('categoryId', post.categoryId)
        setValue('topicId', post.topicId)
        setValue('platform', post.platform)
        setValue('type', post.type)
        setValue('hashtags', post.hashtags)
        // Convert ISO date to datetime-local format
        const scheduledDate = post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : ''
        setValue('scheduledAt', scheduledDate)
        
        // Load topics for the post's category
        if (post.categoryId) {
          await loadTopics(post.categoryId)
        }
        
        // Note: Media files are not loaded back into the form for re-uploading in this simplified example
      }
      
    } catch (error) {
      setError('Failed to load post data')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    reset({
      title: '',
      content: '',
      categoryId: '',
      topicId: '',
      platform: 'instagram',
      type: 'text',
      hashtags: [],
      media: [],
      scheduledAt: ''
    })
    setUploadedFiles([])
    setError(null)
  }

  const handleMediaUpload = async (files: File[]) => {
    try {
      setUploadedFiles(files)
      setValue('media', files)
    } catch (error) {
      setError('Failed to upload media files')
    }
  }

  const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g
    return content.match(hashtagRegex) || []
  }

  const onSubmit = async (data: PostFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      // Extract hashtags from content
      const hashtags = extractHashtags(data.content)
      setValue('hashtags', hashtags)

      // Upload media files if any
      let mediaFiles: any[] = []
      if (uploadedFiles.length > 0 && currentOrganization) {
        const mediaService = createMediaService(currentOrganization.id)
        const uploadPromises = uploadedFiles.map(file => mediaService.uploadFile(file))
        mediaFiles = await Promise.all(uploadPromises)
      }

      const postData = {
        ...data,
        hashtags,
        media: mediaFiles.map(mf => ({ mediaFileId: mf.id, orderIndex: 0 })) // Map to PostMedia structure
      }

      let savedPost: Post
      if (selectedPostId && selectedPostId !== 'new') {
        // Update existing post
        savedPost = await apiService.updatePost(selectedPostId, {
          ...postData,
          status: data.scheduledAt ? 'scheduled' : 'draft' // Update status based on scheduling
        }) as Post
        console.log('Post updated successfully:', savedPost)
        // Add a small delay to ensure database update is committed before refreshing
        setTimeout(() => {
          onPostUpdated?.()
        }, 100)
      } else {
        // Create new post
        savedPost = await apiService.createPost({
          ...postData,
          status: data.scheduledAt ? 'scheduled' : 'draft' // Set status based on scheduling
        })
        onPostCreated?.()
        console.log('Post created successfully:', savedPost)
      }
      
      resetForm()
      onPostSelect(null) // Clear selection after save
      
    } catch (error) {
      console.error('Failed to save post:', error)
      setError('Failed to save post')
    } finally {
      setIsLoading(false)
    }
  }

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' }
  ]

  const postTypes = [
    { id: 'text', name: 'Text', icon: Type },
    { id: 'image', name: 'Image', icon: Image },
    { id: 'video', name: 'Video', icon: Video },
    { id: 'carousel', name: 'Carousel', icon: Image }
  ]

  if (!selectedPostId || selectedPostId === '') {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Type className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Create New Post
          </h3>
          <p className="text-muted-foreground mb-6">
            Start creating your social media content
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPostSelect('new')}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">
              {mode === 'create' ? 'Create New Post' : 'Edit Post'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {mode === 'create' ? 'Start creating your social media content' : 'Edit and update your content'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {showCloseButton && (
              <button
                onClick={() => onPostSelect(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                title="Close Editor"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`btn ${isPreviewMode ? 'btn-primary' : 'btn-outline'} btn-sm`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Error Display */}
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

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Post Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter post title..."
              className="input"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Category and Topic */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                {...register('categoryId', { required: 'Category is required' })}
                className="input"
                disabled={isLoading}
              >
                <option value="">Select category...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Topic</label>
              <select
                {...register('topicId')}
                className="input"
                disabled={isLoading || !watchedCategoryId}
              >
                <option value="">Select topic...</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Platform and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map(platform => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setValue('platform', platform.id as any)}
                    className={`p-3 rounded-lg border border-border text-left transition-colors ${
                      watch('platform') === platform.id
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Post Type</label>
              <div className="grid grid-cols-2 gap-2">
                {postTypes.map(type => {
                  const IconComponent = type.icon
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setValue('type', type.id as any)}
                      className={`p-3 rounded-lg border border-border text-left transition-colors ${
                        watch('type') === type.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm font-medium">{type.name}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Content</label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              placeholder="Write your post content..."
              rows={12}
              className="input resize-y min-h-[200px]"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{watchedContent?.length || 0} characters</span>
              <span>280 max</span>
            </div>
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Media Files</label>
            <MediaUpload
              onUpload={handleMediaUpload}
              maxFiles={5}
              maxSize={10}
              acceptedTypes={['image/*', 'video/*']}
            />
          </div>

          {/* Hashtags Preview */}
          {watchedContent && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Hashtags (auto-detected)
              </label>
              <div className="flex flex-wrap gap-2">
                {extractHashtags(watchedContent).map((hashtag, index) => (
                  <span key={index} className="text-blue-500 text-sm bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                    {hashtag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Schedule */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule (Optional)
            </label>
            <input
              type="datetime-local"
              {...register('scheduledAt')}
              className="input"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" // Changed to submit to trigger form validation
              disabled={isLoading}
              className="btn btn-outline flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" // Changed to submit to trigger form validation
              disabled={isLoading}
              className="btn btn-primary flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              {watch('scheduledAt') ? 'Schedule Post' : 'Publish Now'}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  )
}
