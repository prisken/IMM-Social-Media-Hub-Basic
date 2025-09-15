import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Hash, 
  Image, 
  Video, 
  FileText, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Post, Category, Topic } from '@/types'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface PostListProps {
  posts: Post[]
  categories: Category[]
  topics: Topic[]
  selectedPostId: string | null
  viewMode: 'grid' | 'list'
  loading: boolean
  selectedPosts: string[]
  onPostSelect: (postId: string) => void
  onEditPost: (post: Post) => void
  onDeletePost: (postId: string) => void
  onToggleSelection: (postId: string) => void
}

export function PostList({
  posts,
  categories,
  topics,
  selectedPostId,
  viewMode,
  loading,
  selectedPosts,
  onPostSelect,
  onEditPost,
  onDeletePost,
  onToggleSelection
}: PostListProps) {
  const getCategory = (categoryId: string) => 
    categories.find(cat => cat.id === categoryId)
  
  const getTopic = (topicId: string) => 
    topics.find(topic => topic.id === topicId)

  const getStatusIcon = (status: string) => {
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
  }

  const getMediaIcon = (post: Post) => {
    if (post.media && post.media.length > 0) {
      const hasVideo = post.media.some(m => m.mediaFileId && m.mediaFileId.includes('video'))
      return hasVideo ? 
        <Video className="w-4 h-4 text-blue-500" /> : 
        <Image className="w-4 h-4 text-green-500" />
    }
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No posts found</h3>
        <p className="text-muted-foreground mb-4">
          Create your first post to get started with social media management.
        </p>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-card border border-border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedPostId === post.id ? 'ring-2 ring-primary' : ''
              } ${selectedPosts.includes(post.id) ? 'bg-primary/5 border-primary/50' : ''}`}
              onClick={() => onPostSelect(post.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      onToggleSelection(post.id)
                    }}
                    className="rounded border-border"
                  />
                  <div className="flex items-center gap-1">
                    {getStatusIcon(post.status)}
                    {getMediaIcon(post)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditPost(post)
                    }}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <Edit className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeletePost(post.id)
                    }}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Category & Topic */}
              <div className="flex items-center gap-2 mb-3">
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

              {/* Title */}
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                {post.title}
              </h3>

              {/* Content Preview */}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                {post.content}
              </p>

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex items-center gap-1 mb-3">
                  <Hash className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {post.hashtags.slice(0, 3).join(', ')}
                    {post.hashtags.length > 3 && ` +${post.hashtags.length - 3} more`}
                  </span>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{post.platform}</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedPostId === post.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
            } ${selectedPosts.includes(post.id) ? 'bg-primary/5' : ''}`}
            onClick={() => onPostSelect(post.id)}
          >
            <div className="flex items-center gap-4">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedPosts.includes(post.id)}
                onChange={(e) => {
                  e.stopPropagation()
                  onToggleSelection(post.id)
                }}
                className="rounded border-border"
              />

              {/* Status & Media Icons */}
              <div className="flex items-center gap-2">
                {getStatusIcon(post.status)}
                {getMediaIcon(post)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {post.title}
                  </h3>
                  {getCategory(post.categoryId) && (
                    <span 
                      className="px-2 py-1 text-xs rounded-full text-white flex-shrink-0"
                      style={{ backgroundColor: getCategory(post.categoryId)?.color }}
                    >
                      {getCategory(post.categoryId)?.name}
                    </span>
                  )}
                  {getTopic(post.topicId) && (
                    <span 
                      className="px-2 py-1 text-xs rounded-full text-white flex-shrink-0"
                      style={{ backgroundColor: getTopic(post.topicId)?.color }}
                    >
                      {getTopic(post.topicId)?.name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {post.content}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{post.platform}</span>
                  <span>{post.type}</span>
                  <span>{formatDate(post.createdAt)}</span>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {post.hashtags.length} tags
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditPost(post)
                  }}
                  className="p-2 hover:bg-muted rounded transition-colors"
                >
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeletePost(post.id)
                  }}
                  className="p-2 hover:bg-muted rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
