import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useAuth } from '@/components/Auth/AuthProvider'
import { Sidebar } from './Sidebar'
import { PreviewWindow } from '../Preview/PreviewWindow'
import { WorkingArea } from './WorkingArea'
import { Header } from './Header'

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentView, setCurrentView] = useState<'posts' | 'calendar'>('posts')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const { organization } = useAuth()

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          organization={organization}
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: sidebarCollapsed ? 60 : 280 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-card border-r border-border flex-shrink-0"
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            currentView={currentView}
            onViewChange={setCurrentView}
            selectedPostId={selectedPostId}
            onPostSelect={setSelectedPostId}
          />
        </motion.div>

        {/* Main Content Area */}
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
            />
          </motion.div>
        </div>
      </div>
      </div>
    </DndProvider>
  )
}
