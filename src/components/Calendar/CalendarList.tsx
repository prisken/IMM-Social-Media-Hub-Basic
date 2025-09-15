import React from 'react'
import { motion } from 'framer-motion'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Calendar, Clock, Tag } from 'lucide-react'
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

  const getCategory = (categoryId: string) => 
    categories.find(cat => cat.id === categoryId)
  
  const getTopic = (topicId: string) => 
    topics.find(topic => topic.id === topicId)

  // Separate posts by status
  const draftPosts = posts.filter(post => !post.scheduledAt || post.status === 'draft')
  const scheduledPosts = posts.filter(post => post.scheduledAt && post.status === 'scheduled')

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
        <h3 className="font-semibold text-foreground">Posts</h3>
        <p className="text-sm text-muted-foreground">Drag to schedule</p>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto">
        <DndProvider backend={HTML5Backend}>
          <div className="p-4 space-y-4">
            {/* Draft Posts */}
            {draftPosts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Draft Posts ({draftPosts.length})
                </h4>
                <div className="space-y-2">
                  {draftPosts.map((post) => (
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
              </div>
            )}

            {/* Scheduled Posts */}
            {scheduledPosts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Scheduled Posts ({scheduledPosts.length})
                </h4>
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
              <span>Draft</span>
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