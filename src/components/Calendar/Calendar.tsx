import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarList } from './CalendarList'
import { CalendarView } from './CalendarView'
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react'
import { PostService } from '@/services/PostService'
import { Post, Category, Topic } from '@/types'

interface CalendarProps {
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
}

export function Calendar({ selectedPostId, onPostSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const postService = new PostService()
      
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

  useEffect(() => {
    loadData()
  }, [])

  const handlePostMove = async (postId: string, newDate: Date) => {
    try {
      const postService = new PostService()
      const scheduledAt = newDate.toISOString()
      await postService.updatePost(postId, { scheduledAt })
      await loadData() // Refresh data after update
    } catch (error) {
      console.error('Failed to move post:', error)
    }
  }

  const handlePostSchedule = async (postId: string, scheduledAt: string | null) => {
    try {
      const postService = new PostService()
      await postService.updatePost(postId, { scheduledAt })
      await loadData() // Refresh data after update
    } catch (error) {
      console.error('Failed to schedule post:', error)
    }
  }

  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatDateHeader = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Calendar</h2>
            <p className="text-sm text-muted-foreground">
              Schedule and manage your content timeline
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Post
          </motion.button>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousPeriod}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={goToToday}
              className="btn btn-outline btn-sm"
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

          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {formatDateHeader()}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'month' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'week' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'day' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                }`}
              >
                Day
              </button>
            </div>
            
            <button className="btn btn-outline btn-sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Post List */}
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

        {/* Calendar View */}
        <div className="w-2/3">
          <CalendarView
            posts={posts}
            categories={categories}
            topics={topics}
            selectedDate={currentDate}
            selectedPostId={selectedPostId}
            loading={loading}
            viewMode={viewMode}
            onDateSelect={setCurrentDate}
            onPostSelect={onPostSelect}
            onPostMove={handlePostMove}
            onPostSchedule={handlePostSchedule}
          />
        </div>
      </div>
    </div>
  )
}
