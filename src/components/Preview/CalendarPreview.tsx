import React from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, Users, TrendingUp } from 'lucide-react'

export function CalendarPreview() {
  // Mock calendar data
  const upcomingPosts = [
    {
      id: '1',
      title: 'New feature announcement',
      scheduledAt: '2024-01-20T10:00:00Z',
      platform: 'instagram',
      status: 'scheduled'
    },
    {
      id: '2',
      title: 'Community highlights',
      scheduledAt: '2024-01-21T14:30:00Z',
      platform: 'facebook',
      status: 'scheduled'
    },
    {
      id: '3',
      title: 'Behind the scenes',
      scheduledAt: '2024-01-22T09:15:00Z',
      platform: 'twitter',
      status: 'scheduled'
    }
  ]

  const stats = {
    totalPosts: 24,
    scheduledPosts: 8,
    publishedThisWeek: 12,
    engagementRate: 4.2
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalPosts}</p>
                <p className="text-sm text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.scheduledPosts}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.publishedThisWeek}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.engagementRate}%</p>
                <p className="text-sm text-muted-foreground">Engagement</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card rounded-lg border border-border"
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Upcoming Posts</h3>
            <p className="text-sm text-muted-foreground">Next scheduled content</p>
          </div>
          
          <div className="p-4 space-y-3">
            {upcomingPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.scheduledAt).toLocaleDateString()} at{' '}
                    {new Date(post.scheduledAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    post.platform === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                    post.platform === 'facebook' ? 'bg-blue-500' :
                    'bg-blue-400'
                  }`} />
                  <span className="text-xs text-muted-foreground capitalize">
                    {post.platform}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Calendar Mini View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card rounded-lg border border-border"
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">This Week</h3>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`day-header-${index}`} className="text-xs text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <div
                  key={day}
                  className={`text-sm py-2 rounded-md ${
                    day === 20 ? 'bg-primary text-primary-foreground' :
                    day === 21 ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                    day === 22 ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                    'hover:bg-muted'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
