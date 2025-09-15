import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MoreHorizontal, Calendar, Eye, Edit, Trash2, Copy, Search, Filter } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { apiService } from '@/services/ApiService'
import { Post } from '@/types'

interface PostListProps {
  viewMode: 'grid' | 'list'
  searchQuery: string
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
  refreshTrigger?: number
}

export function PostList({ viewMode, searchQuery, selectedPostId, onPostSelect, refreshTrigger }: PostListProps) {
  const { organization } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])

  useEffect(() => {
    if (organization) {
      loadPosts()
    }
  }, [organization])

  useEffect(() => {
    if (refreshTrigger && organization) {
      loadPosts()
    }
  }, [refreshTrigger, organization])

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const posts = await apiService.getPosts()
      setPosts(posts)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts)
      return
    }

    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredPosts(filtered)
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await apiService.deletePost(postId)
      setPosts(prev => prev.filter(post => post.id !== postId))
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const handleDuplicatePost = async (post: Post) => {
    try {
      const duplicatedPost: Post = {
        ...post,
        id: Date.now().toString(),
        title: `${post.title} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scheduledAt: null,
        publishedAt: null
      }
      
      const savedPost = await apiService.createPost(duplicatedPost)
      setPosts(prev => [savedPost, ...prev])
    } catch (error) {
      console.error('Failed to duplicate post:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷'
      case 'facebook': return '📘'
      case 'twitter': return '🐦'
      case 'linkedin': return '💼'
      default: return '📱'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
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
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => onPostSelect(post.id)}
              className={`bg-card rounded-lg border border-border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                selectedPostId === post.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              {/* Media Preview */}
              {post.media && post.media.length > 0 && (
                <div className="h-32 bg-muted relative">
                  <img
                    src={post.media[0].path}
                    alt={post.media[0].metadata.alt || ''}
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

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {searchQuery ? 'No posts match your search' : 'No posts yet'}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {searchQuery ? 'Try a different search term' : 'Create your first post to get started'}
            </p>
          </div>
        )}
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
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => onPostSelect(post.id)}
            className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedPostId === post.id ? 'bg-primary/5 border-r-2 border-primary' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Media Thumbnail */}
              <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                {post.media && post.media.length > 0 ? (
                  <img
                    src={post.media[0].path}
                    alt={post.media[0].metadata.alt || ''}
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

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery ? 'No posts match your search' : 'No posts yet'}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {searchQuery ? 'Try a different search term' : 'Create your first post to get started'}
          </p>
        </div>
      )}
    </div>
  )
}