import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Copy, Calendar, Hash, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface BulkOperationsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPosts: string[]
  onBulkDelete: () => void
  onClearSelection: () => void
}

export function BulkOperations({
  open,
  onOpenChange,
  selectedPosts,
  onBulkDelete,
  onClearSelection
}: BulkOperationsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    try {
      await onBulkDelete()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete posts:', error)
    } finally {
      setIsDeleting(false)
    }
  }

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
              className="flex items-center gap-2 p-3 border border-border bg-muted/50 text-foreground rounded-lg hover:bg-muted transition-colors"
              disabled
            >
              <Copy className="w-4 h-4" />
              <span className="text-sm font-medium">Duplicate</span>
            </motion.button>

            {/* Schedule */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 p-3 border border-border bg-muted/50 text-foreground rounded-lg hover:bg-muted transition-colors"
              disabled
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
