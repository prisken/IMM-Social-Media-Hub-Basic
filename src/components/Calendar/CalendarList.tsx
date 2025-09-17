import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Calendar, Clock, Tag, ChevronDown, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { DraggablePostItem } from './DraggablePostItem'
import { Post, Category, Topic } from '@/types'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface CalendarListProps {
  posts: Post[]
  categories: Category[]
  topics: Topic[]
  selectedPostId: string | null
  loading: boolean
  onPostSelect: (postId: string | null) => void
  onPostSchedule: (postId: string, scheduledAt: string | null) => Promise<void>
}

export function CalendarList({ 
  posts, 
  categories, 
  topics, 
  selectedPostId, 
  loading,
  onPostSelect,
  onPostSchedule 
}: CalendarListProps) {
  const [collapsedSections, setCollapsedSections] = useState<{
    unscheduled: boolean
    scheduled: boolean
  }>({
    unscheduled: false,
    scheduled: false
  })

  const getCategory = (categoryId: string) => 
    categories.find(cat => cat.id === categoryId)
  
  const getTopic = (topicId: string) => 
    topics.find(topic => topic.id === topicId)

  // Separate posts by scheduling status
  const unscheduledPosts = posts.filter(post => !post.scheduledAt)
  const scheduledPosts = posts.filter(post => post.scheduledAt)

  const toggleSection = (section: 'unscheduled' | 'scheduled') => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const expandAll = () => {
    setCollapsedSections({
      unscheduled: false,
      scheduled: false
    })
  }

  const collapseAll = () => {
    setCollapsedSections({
      unscheduled: true,
      scheduled: true
    })
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-foreground">Posts</h3>
            <p className="text-sm text-muted-foreground">Drag to schedule</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="Expand All"
            >
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={collapseAll}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="Collapse All"
            >
              <Minimize2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Total: {posts.length} posts
        </div>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto">
        <DndProvider backend={HTML5Backend}>
          <div className="p-4 space-y-4">
            {/* Unscheduled Posts */}
            {unscheduledPosts.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('unscheduled')}
                  className="w-full text-left text-sm font-medium text-foreground mb-3 flex items-center gap-2 hover:bg-muted p-2 rounded transition-colors"
                >
                  {collapsedSections.unscheduled ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Unscheduled Posts ({unscheduledPosts.length})
                </button>
                <AnimatePresence>
                  {!collapsedSections.unscheduled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2">
                        {unscheduledPosts.map((post) => (
                          <DraggablePostItem
                            key={post.id}
                            post={post}
                            category={getCategory(post.categoryId)}
                            topic={getTopic(post.topicId)}
                            isSelected={selectedPostId === post.id}
                            onClick={() => onPostSelect(post.id)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Scheduled Posts */}
            {scheduledPosts.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('scheduled')}
                  className="w-full text-left text-sm font-medium text-foreground mb-3 flex items-center gap-2 hover:bg-muted p-2 rounded transition-colors"
                >
                  {collapsedSections.scheduled ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Scheduled Posts ({scheduledPosts.length})
                </button>
                <AnimatePresence>
                  {!collapsedSections.scheduled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2">
                        {scheduledPosts.map((post) => (
                          <DraggablePostItem
                            key={post.id}
                            post={post}
                            category={getCategory(post.categoryId)}
                            topic={getTopic(post.topicId)}
                            isSelected={selectedPostId === post.id}
                            onClick={() => onPostSelect(post.id)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {posts.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No posts available</p>
                <p className="text-sm text-muted-foreground mt-1">Create posts to schedule them</p>
              </div>
            )}
          </div>
        </DndProvider>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Drag posts to the calendar to schedule them
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>Unscheduled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Published</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}