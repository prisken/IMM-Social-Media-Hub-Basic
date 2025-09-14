import React from 'react'
import { motion } from 'framer-motion'
import { PostEditor } from '../PostEditor/PostEditor'
import { Calendar } from '../Calendar/Calendar'

interface WorkingAreaProps {
  currentView: 'posts' | 'calendar'
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
}

export function WorkingArea({ currentView, selectedPostId, onPostSelect }: WorkingAreaProps) {
  return (
    <div className="h-full flex flex-col">
      {currentView === 'posts' ? (
        <motion.div
          key="posts"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          <PostEditor
            selectedPostId={selectedPostId}
            onPostSelect={onPostSelect}
          />
        </motion.div>
      ) : (
        <motion.div
          key="calendar"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          <Calendar
            selectedPostId={selectedPostId}
            onPostSelect={onPostSelect}
          />
        </motion.div>
      )}
    </div>
  )
}
