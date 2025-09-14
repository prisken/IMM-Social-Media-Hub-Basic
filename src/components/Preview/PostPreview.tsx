import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { apiService } from '@/services/ApiService'
import { Post } from '@/types'

interface PostPreviewProps {
  postId: string | null
}

export function PostPreview({ postId }: PostPreviewProps) {
  const { organization } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (postId && postId !== 'new') {
      loadPost(postId)
    } else {
      setPost(null)
    }
  }, [postId])

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
              <img
                src={displayPost.media[0].path}
                alt={displayPost.media[0].metadata.alt || ''}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop'
                }}
              />
              {displayPost.media.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  +{displayPost.media.length - 1}
                </div>
              )}
              <div className="absolute top-4 left-4">
                <button className="p-2 bg-black/20 backdrop-blur-sm rounded-full">
                  <Bookmark className="w-5 h-5 text-white" />
                </button>
              </div>
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
