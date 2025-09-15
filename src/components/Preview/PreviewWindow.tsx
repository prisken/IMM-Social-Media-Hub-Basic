import React from 'react'
import { motion } from 'framer-motion'
import { PostPreview } from './PostPreview'
import { CalendarPreview } from './CalendarPreview'
import { EmptyPreview } from './EmptyPreview'
import { FileText, Calendar as CalendarIcon } from 'lucide-react'

interface PreviewWindowProps {
  selectedPostId: string | null
  currentView: 'posts' | 'calendar' | 'categories' | 'media'
  postRefreshTrigger?: number // Add refresh trigger for post updates
}

export function PreviewWindow({ selectedPostId, currentView, postRefreshTrigger }: PreviewWindowProps) {
  const getPreviewMode = () => {
    if (currentView === 'calendar') return 'calendar'
    if (selectedPostId) return 'post'
    return 'empty'
  }

  const previewMode = getPreviewMode()

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          {previewMode === 'post' && <FileText className="w-5 h-5 text-primary" />}
          {previewMode === 'calendar' && <CalendarIcon className="w-5 h-5 text-primary" />}
          <h2 className="font-semibold text-foreground">
            {previewMode === 'post' && 'Post Preview'}
            {previewMode === 'calendar' && 'Calendar Preview'}
            {previewMode === 'empty' && 'Preview'}
          </h2>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        {previewMode === 'post' && (
          <motion.div
            key="post-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <PostPreview postId={selectedPostId} refreshTrigger={postRefreshTrigger} />
          </motion.div>
        )}

        {previewMode === 'calendar' && (
          <motion.div
            key="calendar-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <CalendarPreview />
          </motion.div>
        )}

        {previewMode === 'empty' && (
          <motion.div
            key="empty-preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <EmptyPreview currentView={currentView} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
