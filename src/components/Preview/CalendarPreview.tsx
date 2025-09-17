import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, Users, TrendingUp, FileText, Plus } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { PostService } from '@/services/PostService'
import { Post, Category, Topic } from '@/types'
import { PostEditorForm } from '@/components/PostEditor/PostEditorForm'

interface CalendarPreviewProps {
  selectedPostId?: string | null
  onPostSelect?: (postId: string | null) => void
  postRefreshTrigger?: number
}

export function CalendarPreview({ selectedPostId, onPostSelect, postRefreshTrigger }: CalendarPreviewProps) {
  const { organization } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('CalendarPreview: Organization changed:', organization)
    // Always try to load data, let PostService handle organization context
    loadData()
  }, [organization?.id])

  useEffect(() => {
    if (postRefreshTrigger && postRefreshTrigger > 0) {
      loadData()
    }
  }, [postRefreshTrigger])

  const handlePostCreated = () => {
    loadData()
  }

  const handlePostUpdated = () => {
    // Add a small delay to ensure database update is committed before refreshing
    setTimeout(() => {
      loadData()
    }, 100)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('CalendarPreview: Loading data...')
      const postService = new PostService()
      
      const [postsData, categoriesData, topicsData] = await Promise.all([
        postService.getPosts(),
        postService.getCategories(),
        postService.getTopics()
      ])
      
      console.log('CalendarPreview: Data loaded:', {
        posts: postsData.length,
        categories: categoriesData.length,
        topics: topicsData.length
      })
      
      setPosts(postsData)
      setCategories(categoriesData)
      setTopics(topicsData)
    } catch (error) {
      console.error('Failed to load calendar preview data:', error)
    } finally {
      setLoading(false)
    }
  }

  // If a post is selected, show the editor
  if (selectedPostId) {
    return (
      <PostEditorForm
        selectedPostId={selectedPostId}
        onPostSelect={onPostSelect || (() => {})}
        onPostCreated={handlePostCreated}
        onPostUpdated={handlePostUpdated}
        showCloseButton={true}
        mode="edit"
      />
    )
  }

  // Calculate real stats - use same logic as CalendarList
  const scheduledPosts = posts.filter(post => post.scheduledAt)
  const draftPosts = posts.filter(post => !post.scheduledAt)
  const publishedPosts = posts.filter(post => post.status === 'published')
  
  // Get upcoming posts (next 7 days)
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingPosts = scheduledPosts
    .filter(post => {
      const scheduledDate = new Date(post.scheduledAt!)
      return scheduledDate >= today && scheduledDate <= nextWeek
    })
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
    .slice(0, 5) // Show next 5 posts

  const stats = {
    totalPosts: posts.length,
    scheduledPosts: scheduledPosts.length,
    draftPosts: draftPosts.length,
    publishedPosts: publishedPosts.length
  }

  const getCategory = (categoryId: string) => 
    categories.find(cat => cat.id === categoryId)
  
  const getTopic = (topicId: string) => 
    topics.find(topic => topic.id === topicId)

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷'
      case 'facebook': return '📘'
      case 'twitter': return '🐦'
      case 'linkedin': return '💼'
      default: return '📱'
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar preview...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalPosts}</p>
                <p className="text-sm text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.scheduledPosts}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.draftPosts}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.publishedPosts}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card rounded-lg border border-border"
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Upcoming Posts</h3>
            <p className="text-sm text-muted-foreground">Next {upcomingPosts.length} scheduled posts</p>
          </div>
          
          <div className="p-4 space-y-3">
            {upcomingPosts.length > 0 ? (
              upcomingPosts.map((post, index) => {
                const category = getCategory(post.categoryId)
                const topic = getTopic(post.topicId)
                
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: category?.color || '#3B82F6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate mb-1">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {post.platform}
                        </span>
                        {category && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.scheduledAt!).toLocaleDateString()} at{' '}
                        {new Date(post.scheduledAt!).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-6">
                <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming posts</p>
                <p className="text-xs text-muted-foreground">Schedule some posts to see them here</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card rounded-lg border border-border"
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Quick Actions</h3>
          </div>
          
          <div className="p-4 space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Create New Post</p>
                <p className="text-xs text-muted-foreground">Start writing content</p>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Schedule Post</p>
                <p className="text-xs text-muted-foreground">Plan your content calendar</p>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">View All Posts</p>
                <p className="text-xs text-muted-foreground">Manage your content library</p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
