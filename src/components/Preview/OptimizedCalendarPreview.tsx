import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, Users, TrendingUp, FileText, Plus } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { Post, Category, Topic } from '@/types'
import { PostEditorForm } from '@/components/PostEditor/PostEditorForm'

interface OptimizedCalendarPreviewProps {
  selectedPostId?: string | null
  onPostSelect?: (postId: string | null) => void
  postRefreshTrigger?: number
}

export function OptimizedCalendarPreview({ selectedPostId, onPostSelect, postRefreshTrigger }: OptimizedCalendarPreviewProps) {
  const { state, refreshData } = useData()
  const { posts, categories, topics, loading } = state

  // Refresh data when refresh trigger changes
  useEffect(() => {
    if (postRefreshTrigger && postRefreshTrigger > 0) {
      refreshData()
    }
  }, [postRefreshTrigger, refreshData])

  // Calculate real stats using memoization - MUST be before conditional return
  const stats = useMemo(() => {
    const scheduledPosts = posts.filter(post => post.scheduledAt && post.status === 'scheduled')
    const draftPosts = posts.filter(post => post.status === 'draft')
    const publishedPosts = posts.filter(post => post.status === 'published')
    
    return {
      scheduled: scheduledPosts.length,
      drafts: draftPosts.length,
      published: publishedPosts.length,
      total: posts.length
    }
  }, [posts])

  // Get upcoming posts (next 7 days) - MUST be before conditional return
  const upcomingPosts = useMemo(() => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return posts
      .filter(post => {
        if (!post.scheduledAt) return false
        const scheduledDate = new Date(post.scheduledAt)
        return scheduledDate >= now && scheduledDate <= nextWeek
      })
      .sort((a, b) => {
        const dateA = new Date(a.scheduledAt!)
        const dateB = new Date(b.scheduledAt!)
        return dateA.getTime() - dateB.getTime()
      })
      .slice(0, 5) // Show only next 5 posts
  }, [posts])

  const handlePostCreated = () => {
    refreshData()
  }

  const handlePostUpdated = () => {
    // Add a small delay to ensure database update is committed before refreshing
    setTimeout(() => {
      refreshData()
    }, 100)
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

  if (loading.posts || loading.categories || loading.topics) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Calendar Overview</h2>
            <p className="text-sm text-muted-foreground">Manage your content schedule</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-lg p-4 border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-lg p-4 border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <FileText className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.drafts}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-lg p-4 border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.published}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-lg p-4 border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h3 className="text-lg font-medium text-foreground mb-3">Quick Actions</h3>
          <div className="flex gap-3">
            <button className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create New Post
            </button>
            <button className="btn btn-outline">
              <CalendarIcon className="w-4 h-4 mr-2" />
              View Calendar
            </button>
          </div>
        </motion.div>

        {/* Upcoming Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <h3 className="text-lg font-medium text-foreground mb-3">Upcoming Posts</h3>
          {upcomingPosts.length > 0 ? (
            <div className="space-y-3">
              {upcomingPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-card rounded-lg p-4 border border-border hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => onPostSelect?.(post.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{post.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {new Date(post.scheduledAt!).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.scheduledAt!).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No upcoming posts scheduled</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create and schedule posts to see them here
              </p>
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-lg font-medium text-foreground mb-3">Recent Activity</h3>
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Activity tracking coming soon</p>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor your content performance and engagement
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
