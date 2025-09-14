import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Calendar, Plus, ArrowRight } from 'lucide-react'

interface EmptyPreviewProps {
  currentView: 'posts' | 'calendar'
}

export function EmptyPreview({ currentView }: EmptyPreviewProps) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {currentView === 'posts' ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <FileText className="w-8 h-8 text-muted-foreground" />
            </motion.div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Post Selected
            </h3>
            
            <p className="text-muted-foreground mb-6">
              Select a post from the sidebar to see a live preview here. 
              You can also create a new post to get started.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Post
            </motion.button>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </motion.div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Calendar Overview
            </h3>
            
            <p className="text-muted-foreground mb-6">
              Your calendar view shows scheduled posts and content timeline. 
              Drag and drop posts to schedule them.
            </p>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-outline w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Post
              </motion.button>
            </div>
          </>
        )}
        
        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 bg-muted/50 rounded-lg text-left"
        >
          <h4 className="text-sm font-medium text-foreground mb-2">Quick Tips:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <ArrowRight className="w-3 h-3" />
              Use the sidebar to navigate between posts
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="w-3 h-3" />
              Drag posts to the calendar to schedule them
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="w-3 h-3" />
              Preview how posts will look on different platforms
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  )
}
