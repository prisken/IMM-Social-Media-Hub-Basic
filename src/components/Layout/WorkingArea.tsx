import React from 'react'
import { motion } from 'framer-motion'
import { PostManagement } from '../PostManagement/PostManagement'
import { CalendarManagement } from '../Calendar/CalendarManagement'
import { CategoryManagement } from '../CategoryManager/CategoryManagement'
import { MediaManagement } from '../MediaUpload/MediaManagement'

interface WorkingAreaProps {
  currentView: 'posts' | 'calendar' | 'categories' | 'media'
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
  onPostRefresh?: () => void
}

export function WorkingArea({ currentView, selectedPostId, onPostSelect, onPostRefresh }: WorkingAreaProps) {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'posts' ? (
          <motion.div
            key="posts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <PostManagement
              selectedPostId={selectedPostId}
              onPostSelect={onPostSelect}
              onPostRefresh={onPostRefresh}
            />
          </motion.div>
        ) : currentView === 'calendar' ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <CalendarManagement
              selectedPostId={selectedPostId}
              onPostSelect={onPostSelect}
            />
          </motion.div>
        ) : currentView === 'media' ? (
          <motion.div
            key="media"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <MediaManagement />
          </motion.div>
        ) : (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <CategoryManagement />
          </motion.div>
        )}
      </div>
    </div>
  )
}
