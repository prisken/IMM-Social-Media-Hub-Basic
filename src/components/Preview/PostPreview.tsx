import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { apiService } from '@/services/ApiService'
import { Post } from '@/types'

interface PostPreviewProps {
  postId: string | null
  refreshTrigger?: number // Add refresh trigger to force reload
}

export function PostPreview({ postId, refreshTrigger }: PostPreviewProps) {
  const { organization } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  // Function to get proper image URL for Electron using base64 data URLs
  const getImageUrl = async (mediaFile: any) => {
    if (!mediaFile?.path) return ''
    
    try {
      // Use the new secure media serving method
      return await window.electronAPI.fs.serveMediaFile(mediaFile.path)
    } catch (error) {
      console.error('Failed to get image URL:', error)
      return ''
    }
  }

  useEffect(() => {
    if (postId && postId !== 'new') {
      loadPost(postId)
    } else {
      setPost(null)
    }
  }, [postId])

  // Refresh post data when refreshTrigger changes
  useEffect(() => {
    if (postId && postId !== 'new' && refreshTrigger !== undefined) {
      console.log('PostPreview: Refreshing post data due to refresh trigger')
      loadPost(postId)
    }
  }, [refreshTrigger, postId])

  // Load image URLs when post changes
  useEffect(() => {
    if (post?.media && post.media.length > 0) {
      const loadImageUrls = async () => {
        const urls: Record<string, string> = {}
        for (const mediaRelation of post.media) {
          if (mediaRelation.mediaFile) {
            const url = await getImageUrl(mediaRelation.mediaFile)
            urls[mediaRelation.mediaFile.id] = url
          }
        }
        setImageUrls(urls)
      }
      loadImageUrls()
    } else {
      setImageUrls({})
    }
  }, [post, organization])

  // Reset media index when post changes
  useEffect(() => {
    setCurrentMediaIndex(0)
  }, [post?.id])

  const loadPost = async (id: string) => {
    try {
      setLoading(true)
      const postData = await apiService.getPost(id)
      setPost(postData || null)
    } catch (error) {
      console.error('Failed to load post:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Post Selected
          </h3>
          <p className="text-muted-foreground">
            Select a post from the list to see a live preview
          </p>
        </div>
      </div>
    )
  }

  // Use the actual post data
  const displayPost = post

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  // Media navigation functions
  const goToPreviousMedia = () => {
    if (displayPost?.media && displayPost.media.length > 0) {
      setCurrentMediaIndex((prev) => 
        prev === 0 ? displayPost.media.length - 1 : prev - 1
      )
    }
  }

  const goToNextMedia = () => {
    if (displayPost?.media && displayPost.media.length > 0) {
      setCurrentMediaIndex((prev) => 
        prev === displayPost.media.length - 1 ? 0 : prev + 1
      )
    }
  }

  // Get current media item
  const currentMedia = displayPost?.media?.[currentMediaIndex]?.mediaFile
  const currentMediaUrl = currentMedia ? imageUrls[currentMedia.id] : null

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        {/* Platform Selector */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">IG</span>
          </div>
          <span className="text-sm font-medium text-foreground">Instagram</span>
          <div className="ml-auto flex items-center gap-1">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {post.status}
            </span>
          </div>
        </div>

        {/* Post Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">SM</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Social Media Manager</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">2h ago</p>
              </div>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-gray-900 dark:text-white leading-relaxed">
              {formatContent(displayPost.content)}
            </p>
            
            
            {/* Hashtags */}
            <div className="flex flex-wrap gap-1 mt-3">
              {displayPost.hashtags.map((hashtag, index) => (
                <span key={index} className="text-blue-500 text-sm">
                  {hashtag}
                </span>
              ))}
            </div>
          </div>

          {/* Media */}
          {displayPost.media && displayPost.media.length > 0 && (
            <div className="relative">
              {/* Main Media Display */}
              {currentMediaUrl ? (
                <img
                  src={currentMediaUrl}
                  alt={currentMedia?.metadata?.alt || currentMedia?.originalName || 'Post image'}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    console.error('Image failed to load in preview:', currentMediaUrl)
                    e.currentTarget.style.display = 'none'
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully in preview:', currentMedia?.originalName)
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}

              {/* Media Counter */}
              {displayPost.media.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {currentMediaIndex + 1} / {displayPost.media.length}
                </div>
              )}

              {/* Bookmark Button */}
              <div className="absolute top-4 left-4">
                <button className="p-2 bg-black/20 backdrop-blur-sm rounded-full">
                  <Bookmark className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Navigation Arrows (only show if more than 1 media) */}
              {displayPost.media.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={goToPreviousMedia}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={goToNextMedia}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              )}

              {/* Media Dots Indicator */}
              {displayPost.media.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {displayPost.media.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentMediaIndex 
                          ? 'bg-white' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                  <Heart className="w-6 h-6" />
                  <span className="text-sm">24</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm">8</span>
                </button>
                <button className="hover:text-green-500 transition-colors">
                  <Share className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Post Metadata */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Title:</span>
              <span className="ml-2 font-medium text-foreground">{displayPost.title}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <span className="ml-2 font-medium text-foreground capitalize">{displayPost.status}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 font-medium text-foreground capitalize">{displayPost.type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Platform:</span>
              <span className="ml-2 font-medium text-foreground capitalize">{displayPost.platform}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2 font-medium text-foreground">
                {new Date(displayPost.createdAt).toLocaleDateString()}
              </span>
            </div>
            {displayPost.scheduledAt && (
              <div>
                <span className="text-muted-foreground">Scheduled:</span>
                <span className="ml-2 font-medium text-foreground">
                  {new Date(displayPost.scheduledAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
