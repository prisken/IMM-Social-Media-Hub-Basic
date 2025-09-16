import React from 'react'
import { BulkOperations as SharedBulkOperations } from '@/components/shared/BulkOperations'
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
  return (
    <SharedBulkOperations
      posts={posts}
      selectedPosts={selectedPosts}
      onSelectionChange={onSelectionChange}
      onPostsUpdate={onPostsUpdate}
      showEnhancedMode={true}
    />
  )
}
