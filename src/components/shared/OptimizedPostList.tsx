import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  MoreHorizontal, 
  Calendar, 
  Edit, 
  Trash2, 
  Copy, 
  Hash, 
  Image, 
  Video, 
  FileText, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useOptimizedPosts } from '@/hooks/shared'
import { Post, Category, Topic } from '@/types'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { filterPosts, getStatusColor, getPlatformIcon, formatDate } from '@/utils/postUtils'

interface OptimizedPostListProps {
  viewMode: 'grid' | 'list'
  searchQuery?: string
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
  refreshTrigger?: number
  // Optional props for enhanced functionality
  categories?: Category[]
  topics?: Topic[]
  selectedPosts?: string[]
  onEditPost?: (post: Post) => void
  onDeletePost?: (postId: string) => void
  onToggleSelection?: (postId: string) => void
  showBulkSelection?: boolean
}

export function OptimizedPostList({ 
  viewMode, 
  searchQuery = '', 
  selectedPostId, 
  onPostSelect, 
  refreshTrigger,
  categories = [],
  topics = [],
  selectedPosts = [],
  onEditPost,
  onDeletePost,
  onToggleSelection,
  showBulkSelection = false
}: OptimizedPostListProps) {
  const { organization } = useAuth()
  const { data: posts, loading, error, refetch } = useOptimizedPosts([organization?.id, refreshTrigger])

  // Memoized filtered posts to prevent unnecessary recalculations
  const filteredPosts = useMemo(() => {
    if (!posts) return []
    return filterPosts(posts, searchQuery)
  }, [posts, searchQuery])

  // Memoized helper functions
  const getCategory = useMemo(() => (categoryId: string) => 
    categories.find(cat => cat.id === categoryId), [categories])
  
  const getTopic = useMemo(() => (topicId: string) => 
    topics.find(topic => topic.id === topicId), [topics])

  const getMediaIcon = useMemo(() => (post: Post) => {
    if (post.media && post.media.length > 0) {
      const hasVideo = post.media.some(m => m.mediaFileId && m.mediaFileId.includes('video'))
      return hasVideo ? 
        <Video className="w-4 h-4 text-blue-500" /> : 
        <Image className="w-4 h-4 text-green-500" />
    }
    return null
  }, [])

  const getStatusIcon = useMemo(() => (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'draft':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />
    }
  }, [])

  const handleDeletePost = async (postId: string) => {
    try {
      if (onDeletePost) {
        onDeletePost(postId)
      } else {
        const { apiService } = await import('@/services/ApiService')
        await apiService.deletePost(postId)
        // Refetch data after deletion
        refetch()
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const handleDuplicatePost = async (post: Post) => {
    try {
      const { apiService } = await import('@/services/ApiService')
      const duplicatedPost = await apiService.duplicatePost(post.id)
      if (duplicatedPost) {
        // Refetch data after duplication
        refetch()
      }
    } catch (error) {
      console.error('Failed to duplicate post:', error)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner text="Loading posts..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">Failed to load posts</div>
          <button 
            onClick={refetch}
            className="btn btn-outline btn-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!filteredPosts || filteredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          {searchQuery ? 'No posts match your search' : 'No posts yet'}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {searchQuery ? 'Try a different search term' : 'Create your first post to get started'}
        </p>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="h-full overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => onPostSelect(post.id)}
              className={`bg-card rounded-lg border border-border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                selectedPostId === post.id ? 'ring-2 ring-primary' : ''
              } ${selectedPosts.includes(post.id) ? 'bg-primary/5 border-primary/50' : ''}`}
            >
              {/* Media Preview */}
              {post.media && post.media.length > 0 && (
                <div className="h-32 bg-muted relative">
                  <img
                    src={post.media[0].path}
                    alt={post.media[0].metadata?.alt || ''}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop'
                    }}
                  />
                  {post.media.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      +{post.media.length - 1}
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-foreground line-clamp-2">{post.title}</h3>
                  <div className="flex items-center gap-1">
                    {showBulkSelection && onToggleSelection && (
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          onToggleSelection(post.id)
                        }}
                        className="rounded border-border"
                      />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicatePost(post)
                      }}
                      className="p-1 hover:bg-muted rounded"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePost(post.id)
                      }}
                      className="p-1 hover:bg-destructive/10 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded">
                      <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                
                {/* Category & Topic */}
                {(categories.length > 0 || topics.length > 0) && (
                  <div className="flex items-center gap-2 mb-2">
                    {getCategory(post.categoryId) && (
                      <span 
                        className="px-2 py-1 text-xs rounded-full text-white"
                        style={{ backgroundColor: getCategory(post.categoryId)?.color }}
                      >
                        {getCategory(post.categoryId)?.name}
                      </span>
                    )}
                    {getTopic(post.topicId) && (
                      <span 
                        className="px-2 py-1 text-xs rounded-full text-white"
                        style={{ backgroundColor: getTopic(post.topicId)?.color }}
                      >
                        {getTopic(post.topicId)?.name}
                      </span>
                    )}
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {post.content}
                </p>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                    <span className="text-xs text-muted-foreground capitalize">{post.platform}</span>
                  </div>
                  
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(post.status)}`}>
                    {post.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(post.createdAt)}</span>
                  {post.scheduledAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.scheduledAt)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y divide-border">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onPostSelect(post.id)}
            className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedPostId === post.id ? 'bg-primary/5 border-r-2 border-primary' : ''
            } ${selectedPosts.includes(post.id) ? 'bg-primary/5' : ''}`}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox for bulk selection */}
              {showBulkSelection && onToggleSelection && (
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post.id)}
                  onChange={(e) => {
                    e.stopPropagation()
                    onToggleSelection(post.id)
                  }}
                  className="rounded border-border mt-1"
                />
              )}

              {/* Media Thumbnail */}
              <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                {post.media && post.media.length > 0 ? (
                  <img
                    src={post.media[0].path}
                    alt={post.media[0].metadata?.alt || ''}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicatePost(post)
                      }}
                      className="p-1 hover:bg-muted rounded"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePost(post.id)
                      }}
                      className="p-1 hover:bg-destructive/10 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded">
                      <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {post.content}
                </p>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span>{getPlatformIcon(post.platform)}</span>
                    {post.platform}
                  </span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full ${getStatusColor(post.status)}`}>
                    {post.status}
                  </span>
                  <span>•</span>
                  <span>{formatDate(post.createdAt)}</span>
                  {post.scheduledAt && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.scheduledAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
