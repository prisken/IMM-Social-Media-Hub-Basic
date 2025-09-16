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
  AlertTriangle,
  Hash
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/Auth/AuthProvider'
import { apiService } from '@/services/ApiService'
import { Post, Category, Topic } from '@/types'

interface BulkOperationsProps {
  posts: Post[]
  selectedPosts: string[]
  onSelectionChange: (postIds: string[]) => void
  onPostsUpdate?: (posts: Post[]) => void
  // Dialog mode props
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onBulkDelete?: () => void
  onClearSelection?: () => void
  // Enhanced mode props
  categories?: Category[]
  topics?: Topic[]
  showEnhancedMode?: boolean
}

export function BulkOperations({ 
  posts, 
  selectedPosts, 
  onSelectionChange, 
  onPostsUpdate,
  open,
  onOpenChange,
  onBulkDelete,
  onClearSelection,
  categories = [],
  topics = [],
  showEnhancedMode = false
}: BulkOperationsProps) {
  const { organization } = useAuth()
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const selectedCount = selectedPosts.length
  const isAllSelected = selectedCount === posts.length && posts.length > 0
  const isPartiallySelected = selectedCount > 0 && selectedCount < posts.length

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
    setIsDeleting(true)
    try {
      if (onBulkDelete) {
        await onBulkDelete()
      } else {
        // Delete posts from database
        await Promise.all(selectedPosts.map(postId => apiService.deletePost(postId)))
        if (onPostsUpdate) {
          const remainingPosts = posts.filter(post => !selectedPosts.includes(post.id))
          onPostsUpdate(remainingPosts)
        }
      }
      onSelectionChange([])
      if (onOpenChange) {
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Failed to delete posts:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDuplicate = async () => {
    try {
      const duplicatedPosts: Post[] = []
      
      for (const postId of selectedPosts) {
        const duplicatedPost = await apiService.duplicatePost(postId)
        if (duplicatedPost) {
          duplicatedPosts.push(duplicatedPost)
        }
      }
      
      if (onPostsUpdate) {
        onPostsUpdate([...duplicatedPosts, ...posts])
      }
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
      
      if (onPostsUpdate) {
        onPostsUpdate(updatedPosts)
      }
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
      
      if (onPostsUpdate) {
        onPostsUpdate(updatedPosts)
      }
      onSelectionChange([])
      setShowCategoryDialog(false)
    } catch (error) {
      console.error('Failed to update categories:', error)
    }
  }

  // Simple dialog mode
  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Bulk Operations
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have selected {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''}. 
              Choose an action to perform on all selected posts.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Delete */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 p-3 border border-destructive/20 bg-destructive/5 text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isDeleting ? 'Deleting...' : 'Delete All'}
                </span>
              </motion.button>

              {/* Duplicate */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBulkDuplicate}
                className="flex items-center gap-2 p-3 border border-border bg-muted/50 text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">Duplicate</span>
              </motion.button>

              {/* Schedule */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowScheduleDialog(true)}
                className="flex items-center gap-2 p-3 border border-border bg-muted/50 text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Schedule</span>
              </motion.button>

              {/* Add Tags */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 p-3 border border-border bg-muted/50 text-foreground rounded-lg hover:bg-muted transition-colors"
                disabled
              >
                <Hash className="w-4 h-4" />
                <span className="text-sm font-medium">Add Tags</span>
              </motion.button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={onClearSelection}
                className="text-sm"
              >
                Clear Selection
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Enhanced mode with full functionality
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
              
              {showEnhancedMode && categories.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCategoryDialog(true)}
                  className="btn btn-outline btn-sm"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Category
                </motion.button>
              )}
              
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
      {showCategoryDialog && showEnhancedMode && (
        <CategoryDialog
          categories={categories}
          topics={topics}
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
  categories,
  topics,
  onUpdate, 
  onCancel 
}: { 
  categories: Category[]
  topics: Topic[]
  onUpdate: (categoryId: string, topicId: string) => void
  onCancel: () => void
}) {
  const [categoryId, setCategoryId] = useState('')
  const [topicId, setTopicId] = useState('')

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
