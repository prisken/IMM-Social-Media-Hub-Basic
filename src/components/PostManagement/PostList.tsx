import React from 'react'
import { PostListWithData } from '@/components/shared/PostListWithData'
import { Post, Category, Topic } from '@/types'

interface PostListProps {
  posts: Post[]
  categories: Category[]
  topics: Topic[]
  selectedPostId: string | null
  viewMode: 'grid' | 'list'
  loading: boolean
  selectedPosts: string[]
  onPostSelect: (postId: string) => void
  onEditPost: (post: Post) => void
  onDeletePost: (postId: string) => void
  onToggleSelection: (postId: string) => void
}

export function PostList({
  posts,
  categories,
  topics,
  selectedPostId,
  viewMode,
  loading,
  selectedPosts,
  onPostSelect,
  onEditPost,
  onDeletePost,
  onToggleSelection
}: PostListProps) {
  return (
    <PostListWithData
      posts={posts}
      categories={categories}
      topics={topics}
      selectedPostId={selectedPostId}
      viewMode={viewMode}
      loading={loading}
      selectedPosts={selectedPosts}
      onPostSelect={onPostSelect}
      onEditPost={onEditPost}
      onDeletePost={onDeletePost}
      onToggleSelection={onToggleSelection}
      searchQuery=""
    />
  )
}
