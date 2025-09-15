import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Save, Eye, Send, AlertCircle, Trash2 } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useCategories } from '@/hooks/useCategories'
import { useTopics } from '@/hooks/useTopics'
import { PostFormData, Post } from '@/types'
import { MediaUpload } from '@/components/MediaUpload/MediaUpload'
import { LoadingSpinner, SkeletonForm } from '@/components/LoadingSpinner'
import { 
  getWordCount, 
  getCharacterCount, 
  getReadingTime,
  extractHashtags,
  validatePostContent
} from '@/utils/helpers'

interface PostFormProps {
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
  onPostCreated?: (postData: any) => void
  onPostUpdated?: (id: string, updates: Partial<Post>) => void
  onPostDeleted?: (id: string) => void
}

export function PostForm({ 
  selectedPostId, 
  onPostSelect, 
  onPostCreated,
  onPostUpdated,
  onPostDeleted 
}: PostFormProps) {
  const { user, currentOrganization } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  
  // Use the new hooks
  const { categories } = useCategories()
  const { topics } = useTopics()

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
  const watchedPlatform = watch('platform')

  // Get filtered topics based on selected category
  const filteredTopics = topics.filter(topic => topic.categoryId === watchedCategoryId)

  // Auto-extract hashtags from content
  useEffect(() => {
    if (watchedContent) {
      const hashtags = extractHashtags(watchedContent)
      setValue('hashtags', hashtags)
    }
  }, [watchedContent, setValue])

  // Reset form when creating new post
  useEffect(() => {
    if (selectedPostId === 'new') {
      reset()
      setUploadedFiles([])
      setError(null)
    }
  }, [selectedPostId, reset])

  const onSubmit = async (data: PostFormData) => {
    if (!currentOrganization || !user) {
      setError('No organization or user found')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const postData = {
        ...data,
        organizationId: currentOrganization.id,
        categoryId: data.categoryId,
        topicId: data.topicId,
        hashtags: data.hashtags || [],
        media: uploadedFiles.map((file, index) => ({
          id: `temp-${index}`,
          postId: 'temp',
          mediaFileId: file.name, // This would be the actual media file ID
          orderIndex: index,
          createdAt: new Date().toISOString()
        })),
        status: (data.scheduledAt ? 'scheduled' : 'draft') as 'draft' | 'scheduled' | 'published' | 'archived',
        scheduledAt: data.scheduledAt || undefined,
        metadata: {
          characterCount: getCharacterCount(data.content),
          wordCount: getWordCount(data.content),
          readingTime: getReadingTime(data.content),
          lastEditedBy: user.id,
          version: 1
        }
      }

      if (selectedPostId && selectedPostId !== 'new' && onPostUpdated) {
        await onPostUpdated(selectedPostId, postData)
      } else if (onPostCreated) {
        await onPostCreated(postData)
      }

      // Reset form after successful submission
      reset()
      setUploadedFiles([])
      onPostSelect(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPostId || selectedPostId === 'new' || !onPostDeleted) return

    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await onPostDeleted(selectedPostId)
        onPostSelect(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete post')
      }
    }
  }

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files])
  }

  const handleFileRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const contentStats = {
    characters: getCharacterCount(watchedContent || ''),
    words: getWordCount(watchedContent || ''),
    readingTime: getReadingTime(watchedContent || ''),
    hashtags: extractHashtags(watchedContent || '').length
  }

  const validation = validatePostContent(watchedContent || '')

  if (false) { // Loading states removed for now
    return (
      <div className="h-full flex items-center justify-center">
        <SkeletonForm />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {selectedPostId === 'new' ? 'Create New Post' : 'Edit Post'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedPostId === 'new' ? 'Create a new social media post' : 'Edit your post'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`btn btn-sm ${isPreviewMode ? 'btn-primary' : 'btn-outline'}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            
            {selectedPostId && selectedPostId !== 'new' && (
              <button
                onClick={handleDelete}
                className="btn btn-sm btn-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-destructive text-sm">{error}</p>
            </motion.div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              placeholder="Enter post title..."
              className="input w-full"
            />
            {errors.title && (
              <p className="text-destructive text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Content</label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              placeholder="Write your post content..."
              rows={8}
              className="textarea w-full resize-none"
            />
            {errors.content && (
              <p className="text-destructive text-sm">{errors.content.message}</p>
            )}
            
            {/* Content Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>{contentStats.characters} characters</span>
                <span>{contentStats.words} words</span>
                <span>{contentStats.readingTime} min read</span>
                <span>{contentStats.hashtags} hashtags</span>
              </div>
              {!validation.isValid && (
                <span className="text-destructive">
                  {validation.errors.join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Category and Topic */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                {...register('categoryId', { required: 'Category is required' })}
                className="select w-full"
              >
                <option value="">Select category...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-destructive text-sm">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Topic</label>
              <select
                {...register('topicId')}
                className="select w-full"
                disabled={!watchedCategoryId}
              >
                <option value="">Select topic...</option>
                {filteredTopics.map(topic => (
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
              <select
                {...register('platform', { required: 'Platform is required' })}
                className="select w-full"
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Type</label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="select w-full"
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="carousel">Carousel</option>
                <option value="story">Story</option>
              </select>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Media</label>
            <MediaUpload
              onUpload={handleFileUpload}
              maxFiles={10}
              acceptedTypes={['image/*', 'video/*']}
            />
            
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleFileRemove(index)}
                      className="text-destructive hover:bg-destructive/10 p-1 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scheduled Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Schedule (Optional)</label>
            <input
              {...register('scheduledAt')}
              type="datetime-local"
              className="input w-full"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <motion.button
              type="submit"
              disabled={isLoading || !validation.isValid}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary flex-1"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {selectedPostId === 'new' ? 'Create Post' : 'Update Post'}
                </>
              )}
            </motion.button>

            {watchedPlatform && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-outline"
                title={`Publish to ${watchedPlatform}`}
              >
                <Send className="w-4 h-4 mr-2" />
                Publish
              </motion.button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
