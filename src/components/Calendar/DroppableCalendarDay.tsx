import React from 'react'
import { useDrop } from 'react-dnd'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useModal } from '../ui/modal-provider'

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
  const { openTimePicker } = useModal()

  // Handle null date (empty calendar cells)
  if (!date) {
    return (
      <div className="border-r border-b border-border p-2 min-h-[120px] bg-muted/20" />
    )
  }

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'post',
    drop: (item: { id: string; type: string; title: string }) => {
      console.log('Dropping post:', item.id, 'on date:', date)
      openTimePicker({
        postId: item.id,
        postTitle: item.title,
        selectedDate: date,
        onConfirm: (dateTime: Date) => {
          onPostDrop(item.id, dateTime)
        },
        onCancel: () => {
          // Just close the modal, no action needed
        }
      })
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [date, openTimePicker, onPostDrop])


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
      className={`border-r border-b border-border p-2 min-h-[120px] relative transition-all duration-200 ${
        isCurrentMonth ? 'hover:bg-muted/50' : 'bg-muted/20'
      } ${isToday ? 'bg-primary/10' : ''} ${
        isOver && canDrop ? 'bg-primary/30 border-2 border-primary shadow-lg' : ''
      }`}
      whileHover={{ scale: isOver && canDrop ? 1.05 : 1.02 }}
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
              backgroundColor: (post.category?.color || '#3B82F6') + '20', 
              borderLeft: `3px solid ${post.category?.color || '#3B82F6'}` 
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
          className="absolute inset-0 flex items-center justify-center bg-primary/40 rounded-lg border-2 border-dashed border-primary z-10"
        >
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Drop post here</span>
          </div>
        </motion.div>
      )}

      {children}
    </motion.div>
  )
}
