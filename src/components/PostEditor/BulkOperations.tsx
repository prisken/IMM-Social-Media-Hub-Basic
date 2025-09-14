import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trash2, 
  Copy, 
  Calendar, 
  Tag, 
  Filter, 
  CheckSquare, 
  Square,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { apiService } from '@/services/ApiService'
import { Post } from '@/types'

interface BulkOperationsProps {
  posts: Post[]
  selectedPosts: string[]
  onSelectionChange: (postIds: string[]) => void
  onPostsUpdate: (posts: Post[]) => void
}

export function BulkOperations({ 
  posts, 
  selectedPosts, 
  onSelectionChange, 
  onPostsUpdate 
}: BulkOperationsProps) {
  const { organization } = useAuth()
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)

  const handleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(posts.map(post => post.id))
    }
  }

  const handleSelectPost = (postId: string) => {
    if (selectedPosts.includes(postId)) {
      onSelectionChange(selectedPosts.filter(id => id !== postId))
    } else {
      onSelectionChange([...selectedPosts, postId])
    }
  }

  const handleBulkDelete = async () => {
    try {
      // Delete posts from database
      await Promise.all(selectedPosts.map(postId => apiService.deletePost(postId)))
      const remainingPosts = posts.filter(post => !selectedPosts.includes(post.id))
      onPostsUpdate(remainingPosts)
      onSelectionChange([])
    } catch (error) {
      console.error('Failed to delete posts:', error)
    }
  }

  const handleBulkDuplicate = async () => {
    try {
      const duplicatedPosts: Post[] = []
      
      selectedPosts.forEach(postId => {
        const originalPost = posts.find(post => post.id === postId)
        if (originalPost) {
          const duplicatedPost: Post = {
            ...originalPost,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: `${originalPost.title} (Copy)`,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            scheduledAt: null,
            publishedAt: null
          }
          duplicatedPosts.push(duplicatedPost)
        }
      })
      
      onPostsUpdate([...duplicatedPosts, ...posts])
      onSelectionChange([])
    } catch (error) {
      console.error('Failed to duplicate posts:', error)
    }
  }

  const handleBulkSchedule = async (scheduledAt: string) => {
    try {
      const updatedPosts = posts.map(post => {
        if (selectedPosts.includes(post.id)) {
          return {
            ...post,
            scheduledAt,
            status: 'scheduled' as const,
            updatedAt: new Date().toISOString()
          }
        }
        return post
      })
      
      onPostsUpdate(updatedPosts)
      onSelectionChange([])
      setShowScheduleDialog(false)
    } catch (error) {
      console.error('Failed to schedule posts:', error)
    }
  }

  const handleBulkCategoryChange = async (categoryId: string, topicId: string) => {
    try {
      const updatedPosts = posts.map(post => {
        if (selectedPosts.includes(post.id)) {
          return {
            ...post,
            categoryId,
            topicId,
            updatedAt: new Date().toISOString()
          }
        }
        return post
      })
      
      onPostsUpdate(updatedPosts)
      onSelectionChange([])
      setShowCategoryDialog(false)
    } catch (error) {
      console.error('Failed to update categories:', error)
    }
  }

  const selectedCount = selectedPosts.length
  const isAllSelected = selectedCount === posts.length && posts.length > 0
  const isPartiallySelected = selectedCount > 0 && selectedCount < posts.length

  return (
    <div className="space-y-4">
      {/* Bulk Selection Header */}
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">
                {selectedCount} post{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkDuplicate}
                className="btn btn-outline btn-sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowScheduleDialog(true)}
                className="btn btn-outline btn-sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCategoryDialog(true)}
                className="btn btn-outline btn-sm"
              >
                <Tag className="w-4 h-4 mr-2" />
                Category
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkDelete}
                className="btn btn-destructive btn-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </motion.button>
              
              <button
                onClick={() => onSelectionChange([])}
                className="p-1 hover:bg-muted rounded"
              >
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Select All Header */}
      <div className="flex items-center gap-3 p-2 border-b border-border">
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 hover:bg-muted rounded p-1 transition-colors"
        >
          {isAllSelected ? (
            <CheckSquare className="w-5 h-5 text-primary" />
          ) : isPartiallySelected ? (
            <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded" />
            </div>
          ) : (
            <Square className="w-5 h-5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </span>
        </button>
        
        {posts.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {posts.length} total posts
          </span>
        )}
      </div>

      {/* Schedule Dialog */}
      {showScheduleDialog && (
        <ScheduleDialog
          onSchedule={handleBulkSchedule}
          onCancel={() => setShowScheduleDialog(false)}
        />
      )}

      {/* Category Dialog */}
      {showCategoryDialog && (
        <CategoryDialog
          onUpdate={handleBulkCategoryChange}
          onCancel={() => setShowCategoryDialog(false)}
        />
      )}
    </div>
  )
}

// Schedule Dialog Component
function ScheduleDialog({ 
  onSchedule, 
  onCancel 
}: { 
  onSchedule: (scheduledAt: string) => void
  onCancel: () => void
}) {
  const [scheduledAt, setScheduledAt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (scheduledAt) {
      onSchedule(scheduledAt)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background rounded-lg border border-border p-6 w-full max-w-md"
      >
        <h3 className="font-semibold text-foreground mb-4">Schedule Posts</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Schedule Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="input mt-1"
              required
            />
          </div>
          
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="btn btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Schedule
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Category Dialog Component
function CategoryDialog({ 
  onUpdate, 
  onCancel 
}: { 
  onUpdate: (categoryId: string, topicId: string) => void
  onCancel: () => void
}) {
  const [categoryId, setCategoryId] = useState('')
  const [topicId, setTopicId] = useState('')

  const categories = [
    { id: '1', name: 'Announcements' },
    { id: '2', name: 'Product' },
    { id: '3', name: 'Community' },
    { id: '4', name: 'Company' }
  ]

  const topics = [
    { id: '1', name: 'Product Launch', categoryId: '1' },
    { id: '2', name: 'Feature Update', categoryId: '2' },
    { id: '3', name: 'User Stories', categoryId: '3' },
    { id: '4', name: 'Team Spotlight', categoryId: '4' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (categoryId && topicId) {
      onUpdate(categoryId, topicId)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background rounded-lg border border-border p-6 w-full max-w-md"
      >
        <h3 className="font-semibold text-foreground mb-4">Update Categories</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value)
                setTopicId('')
              }}
              className="input mt-1"
              required
            >
              <option value="">Select category...</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground">Topic</label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="input mt-1"
              required
              disabled={!categoryId}
            >
              <option value="">Select topic...</option>
              {topics
                .filter(topic => topic.categoryId === categoryId)
                .map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
            </select>
          </div>
          
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="btn btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Update
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
