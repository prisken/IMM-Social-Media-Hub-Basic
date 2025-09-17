import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Grid, List, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { CalendarView } from './CalendarView'
import { CalendarList } from './CalendarList'
import { Post, Category, Topic } from '@/types'
import { PostService } from '@/services/PostService'
import { databaseService } from '@/services/database/DatabaseService'

interface CalendarManagementProps {
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
  postRefreshTrigger?: number
}

export function CalendarManagement({ selectedPostId, onPostSelect, postRefreshTrigger }: CalendarManagementProps) {
  const { currentOrganization } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [draggedPost, setDraggedPost] = useState<Post | null>(null)

  // Initialize services
  const postService = new PostService()

  useEffect(() => {
    if (currentOrganization) {
      initializeServices()
    }
  }, [currentOrganization])

  useEffect(() => {
    if (postRefreshTrigger && postRefreshTrigger > 0) {
      loadData()
    }
  }, [postRefreshTrigger])

  const initializeServices = async () => {
    try {
      // Ensure database is initialized for the current organization
      await databaseService.initializeDatabase(currentOrganization!.id)
      loadData()
    } catch (error) {
      console.error('Failed to initialize services:', error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [postsData, categoriesData, topicsData] = await Promise.all([
        postService.getPosts(),
        postService.getCategories(),
        postService.getTopics()
      ])
      setPosts(postsData)
      setCategories(categoriesData)
      setTopics(topicsData)
    } catch (error) {
      console.error('Failed to load calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostMove = async (postId: string, newDate: Date) => {
    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      console.log('Updating post:', postId, 'with scheduledAt:', newDate.toISOString(), 'and status: scheduled')
      await postService.updatePost(postId, {
        scheduledAt: newDate.toISOString(),
        status: 'scheduled'
      })
      
      await loadData()
    } catch (error) {
      console.error('Failed to move post:', error)
    }
  }

  const handlePostSchedule = async (postId: string, scheduledAt: string | null) => {
    try {
      await postService.updatePost(postId, { 
        scheduledAt,
        status: scheduledAt ? 'scheduled' : 'draft'
      })
      await loadData()
    } catch (error) {
      console.error('Failed to schedule post:', error)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const goToPreviousPeriod = () => {
    const newDate = new Date(selectedDate)
    if (calendarViewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (calendarViewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setSelectedDate(newDate)
  }

  const goToNextPeriod = () => {
    const newDate = new Date(selectedDate)
    if (calendarViewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (calendarViewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const formatDateHeader = () => {
    if (calendarViewMode === 'month') {
      return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (calendarViewMode === 'week') {
      const startOfWeek = new Date(selectedDate)
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
  }

  const getCategory = (categoryId: string) => 
    categories.find(cat => cat.id === categoryId)
  
  const getTopic = (topicId: string) => 
    topics.find(topic => topic.id === topicId)

  // Get posts for the selected date
  const getPostsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return posts.filter(post => {
      if (!post.scheduledAt) return false
      const postDate = new Date(post.scheduledAt).toISOString().split('T')[0]
      return postDate === dateStr
    })
  }

  // Get unscheduled posts - consistent with other components
  const unscheduledPosts = posts.filter(post => !post.scheduledAt)

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Calendar Management</h2>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Post
            </motion.button>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'calendar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>

            <div className="text-sm text-muted-foreground">
              {unscheduledPosts.length} unscheduled posts
            </div>
          </div>

          {/* Calendar Navigation - Only show when in calendar view */}
          {viewMode === 'calendar' && (
            <div className="flex items-center gap-4">
              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousPeriod}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  Today
                </button>
                
                <button
                  onClick={goToNextPeriod}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Date Header */}
              <div className="text-lg font-semibold text-foreground">
                {formatDateHeader()}
              </div>

              {/* Calendar View Mode Controls */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setCalendarViewMode('month')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    calendarViewMode === 'month' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setCalendarViewMode('week')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    calendarViewMode === 'week' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setCalendarViewMode('day')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    calendarViewMode === 'day' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  }`}
                >
                  Day
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'calendar' ? (
          <div className="h-full flex">
            {/* Posts List - Left Side */}
            <div className="w-1/3 border-r border-border">
              <CalendarList
                posts={posts}
                categories={categories}
                topics={topics}
                selectedPostId={selectedPostId}
                loading={loading}
                onPostSelect={onPostSelect}
                onPostSchedule={handlePostSchedule}
              />
            </div>
            
            {/* Calendar View - Right Side */}
            <div className="w-2/3">
              <CalendarView
                posts={posts}
                categories={categories}
                topics={topics}
                selectedDate={selectedDate}
                selectedPostId={selectedPostId}
                loading={loading}
                viewMode={calendarViewMode}
                onDateSelect={handleDateSelect}
                onPostSelect={onPostSelect}
                onPostMove={handlePostMove}
                onPostSchedule={handlePostSchedule}
              />
            </div>
          </div>
        ) : (
          <CalendarList
            posts={posts}
            categories={categories}
            topics={topics}
            selectedPostId={selectedPostId}
            loading={loading}
            onPostSelect={onPostSelect}
            onPostSchedule={handlePostSchedule}
          />
        )}
      </div>
    </div>
  )
}
