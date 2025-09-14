import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { apiService } from '@/services/ApiService'
import { DroppableCalendarDay } from './DroppableCalendarDay'
import { Post } from '@/types'

interface CalendarViewProps {
  currentDate: Date
  viewMode: 'month' | 'week' | 'day'
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
}

export function CalendarView({ currentDate, viewMode, selectedPostId, onPostSelect }: CalendarViewProps) {
  const { organization } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (organization) {
      loadPosts()
    }
  }, [organization])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const posts = await apiService.getPosts()
      setPosts(posts)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostDrop = async (postId: string, date: Date) => {
    try {
      console.log('Scheduling post:', postId, 'for date:', date)
      
      // Update the post in the database
      const updatedPost = await apiService.updatePost(postId, {
        scheduledAt: date.toISOString(),
        status: 'scheduled'
      })
      
      // Update the local state
      setPosts(prev => prev.map(post => 
        post.id === postId ? updatedPost : post
      ))
    } catch (error) {
      console.error('Failed to schedule post:', error)
    }
  }

  // Get scheduled posts from the loaded posts
  const scheduledPosts = posts.filter(post => post.scheduledAt && post.status === 'scheduled')

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getPostsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return scheduledPosts.filter(post => 
      post.scheduledAt.startsWith(dateStr)
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
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

  if (viewMode === 'month') {
    const days = getDaysInMonth(currentDate)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
      <DndProvider backend={HTML5Backend}>
        <div className="h-full flex flex-col">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 grid grid-cols-7 grid-rows-6">
            {days.map((day, index) => (
              <DroppableCalendarDay
                key={index}
                date={day}
                posts={day ? getPostsForDate(day).map(post => ({
                  ...post,
                  selected: selectedPostId === post.id
                })) : []}
                isToday={day ? isToday(day) : false}
                isCurrentMonth={day ? isCurrentMonth(day) : false}
                onPostDrop={handlePostDrop}
                onPostClick={onPostSelect}
              />
            ))}
          </div>
        </div>
      </DndProvider>
    )
  }

  if (viewMode === 'week') {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      return day
    })

    return (
      <div className="h-full flex flex-col">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map(day => (
            <div key={day.toISOString()} className="p-3 text-center border-r border-border last:border-r-0">
              <div className={`text-sm font-medium ${
                isToday(day) ? 'text-primary' : 'text-foreground'
              }`}>
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-semibold ${
                isToday(day) ? 'text-primary' : 'text-foreground'
              }`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Week Grid */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map(day => (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`border-r border-border last:border-r-0 p-3 ${
                isToday(day) ? 'bg-primary/5' : 'hover:bg-muted/50'
              }`}
            >
              <div className="space-y-2">
                {getPostsForDate(day).map(post => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onPostSelect(post.id)}
                    className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                      selectedPostId === post.id ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: post.color + '20', borderLeft: `3px solid ${post.color}` }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{getPlatformIcon(post.platform)}</span>
                      <span className="font-medium truncate">{post.title}</span>
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(post.scheduledAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // Day view
  const dayPosts = getPostsForDate(currentDate)
  
  return (
    <div className="h-full flex flex-col">
      {/* Day Header */}
      <div className="p-4 border-b border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="text-sm text-muted-foreground">
            {dayPosts.length} posts scheduled
          </div>
        </div>
      </div>

      {/* Day Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {dayPosts.length > 0 ? (
          <div className="space-y-3">
            {dayPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => onPostSelect(post.id)}
                className={`p-4 rounded-lg border border-border cursor-pointer transition-colors hover:shadow-md ${
                  selectedPostId === post.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-4 h-4 rounded-full mt-1"
                    style={{ backgroundColor: post.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                      <span className="font-medium text-foreground">{post.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(post.scheduledAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              No posts scheduled for this day
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
