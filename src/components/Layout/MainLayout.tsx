import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useAuth } from '@/components/Auth/AuthProvider'
import { PreviewWindow } from '../Preview/PreviewWindow'
import { WorkingArea } from './WorkingArea'
import { Header } from './Header'

export function MainLayout() {
  const [currentView, setCurrentView] = useState<'posts' | 'calendar' | 'categories' | 'media'>('posts')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [postRefreshTrigger, setPostRefreshTrigger] = useState(0)

  const triggerPostRefresh = () => {
    setPostRefreshTrigger(prev => prev + 1)
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* Main Content - Split Screen Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview Window (40%) */}
          <motion.div
            initial={false}
            animate={{ width: '40%' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-muted/30 border-r border-border flex-shrink-0"
          >
            <PreviewWindow
              selectedPostId={selectedPostId}
              currentView={currentView}
              postRefreshTrigger={postRefreshTrigger}
            />
          </motion.div>

          {/* Working Area (60%) */}
          <motion.div
            initial={false}
            animate={{ width: '60%' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-shrink-0"
          >
            <WorkingArea
              currentView={currentView}
              selectedPostId={selectedPostId}
              onPostSelect={setSelectedPostId}
              onPostRefresh={triggerPostRefresh}
            />
          </motion.div>
        </div>
      </div>
    </DndProvider>
  )
}
