import React from 'react'
import { CentralizedPostList as SharedPostList } from '@/components/shared/CentralizedPostList'

interface PostListProps {
  viewMode: 'grid' | 'list'
  searchQuery: string
  selectedPostId: string | null
  onPostSelect: (postId: string | null) => void
  refreshTrigger?: number
}

export function PostList({ viewMode, searchQuery, selectedPostId, onPostSelect, refreshTrigger }: PostListProps) {
  return (
    <SharedPostList
      viewMode={viewMode}
      searchQuery={searchQuery}
      selectedPostId={selectedPostId}
      onPostSelect={onPostSelect}
      refreshTrigger={refreshTrigger}
    />
  )
}