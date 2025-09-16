import React from 'react'
import { BulkOperations as SharedBulkOperations } from '@/components/shared/BulkOperations'
import { Post } from '@/types'

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
  return (
    <SharedBulkOperations
      posts={[]} // Empty array since this is dialog mode
      selectedPosts={selectedPosts}
      onSelectionChange={() => {}} // Not used in dialog mode
      open={open}
      onOpenChange={onOpenChange}
      onBulkDelete={onBulkDelete}
      onClearSelection={onClearSelection}
    />
  )
}
