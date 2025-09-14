import React from 'react'
import { useDrop } from 'react-dnd'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

interface DroppableCalendarDayProps {
  date: Date | null
  posts: any[]
  isToday: boolean
  isCurrentMonth: boolean
  onPostDrop: (postId: string, date: Date) => void
  onPostClick: (postId: string) => void
  children?: React.ReactNode
}

export function DroppableCalendarDay({ 
  date, 
  posts, 
  isToday, 
  isCurrentMonth, 
  onPostDrop, 
  onPostClick,
  children 
}: DroppableCalendarDayProps) {
  // Handle null date (empty calendar cells)
  if (!date) {
    return (
      <div className="border-r border-b border-border p-2 min-h-[120px] bg-muted/20" />
    )
  }

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'post',
    drop: (item: { id: string; type: string }) => {
      onPostDrop(item.id, date)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷'
      case 'facebook': return '📘'
      case 'twitter': return '🐦'
      case 'linkedin': return '💼'
      default: return '📱'
    }
  }

  return (
    <motion.div
      ref={drop}
      className={`border-r border-b border-border p-2 min-h-[120px] relative ${
        isCurrentMonth ? 'hover:bg-muted/50' : 'bg-muted/20'
      } ${isToday ? 'bg-primary/10' : ''} ${
        isOver && canDrop ? 'bg-primary/20 border-primary' : ''
      }`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Day Number */}
      <div className={`text-sm font-medium mb-2 ${
        isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
      } ${isToday ? 'text-primary' : ''}`}>
        {date.getDate()}
      </div>
      
      {/* Posts */}
      <div className="space-y-1">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => onPostClick(post.id)}
            className={`p-1 rounded text-xs cursor-pointer transition-colors ${
              post.selected ? 'ring-2 ring-primary' : ''
            }`}
            style={{ 
              backgroundColor: post.color + '20', 
              borderLeft: `3px solid ${post.color}` 
            }}
          >
            <div className="flex items-center gap-1">
              <span>{getPlatformIcon(post.platform)}</span>
              <span className="truncate">{post.title}</span>
            </div>
            <div className="text-xs opacity-75">
              {new Date(post.scheduledAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Drop Indicator */}
      {isOver && canDrop && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-lg border-2 border-dashed border-primary"
        >
          <div className="flex items-center gap-2 text-primary">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Drop post here</span>
          </div>
        </motion.div>
      )}

      {children}
    </motion.div>
  )
}
