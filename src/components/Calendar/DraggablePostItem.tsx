import React from 'react'
import { motion } from 'framer-motion'
import { useDrag } from 'react-dnd'
import { GripVertical, MoreHorizontal, Calendar } from 'lucide-react'
import { Post, Category, Topic } from '@/types'

interface DraggablePostItemProps {
  post: Post
  category?: Category
  topic?: Topic
  isSelected: boolean
  onClick: () => void
}

export function DraggablePostItem({ post, category, topic, isSelected, onClick }: DraggablePostItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'post',
    item: { id: post.id, title: post.title, type: 'post' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [post.id, post.title])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

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
      ref={drag}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDragging ? 0.3 : 1, 
        y: 0,
        scale: isDragging ? 0.95 : 1,
        rotate: isDragging ? 2 : 0
      }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`group cursor-grab active:cursor-grabbing p-3 rounded-lg border border-border transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
      } ${isDragging ? 'opacity-30 shadow-xl border-primary' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="flex-shrink-0 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
        </div>

        {/* Color Indicator */}
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
          style={{ backgroundColor: category?.color || '#3B82F6' }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-medium text-foreground text-sm line-clamp-2">
              {post.title}
            </h4>
            <button className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getPlatformIcon(post.platform)}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {post.platform}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground capitalize">
              {post.type}
            </span>
          </div>

          {/* Category and Topic */}
          <div className="flex items-center gap-2 mb-2">
            {category && (
              <span 
                className="text-xs px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </span>
            )}
            {topic && (
              <span 
                className="text-xs px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: topic.color }}
              >
                {topic.name}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(post.status)}`}>
              {post.status}
            </span>
            
            {post.scheduledAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(post.scheduledAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
