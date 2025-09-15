import { useState, useEffect, useCallback } from 'react'
import { Post, SearchFilters, SortOptions } from '@/types'
import { databaseService } from '@/services/database/DatabaseService'

export interface UsePostsOptions {
  filters?: SearchFilters
  sort?: SortOptions
  autoRefresh?: boolean
  refreshInterval?: number
}

export function usePosts(options: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())

  const { filters = {}, sort, autoRefresh = false, refreshInterval = 30000 } = options

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const fetchedPosts = await databaseService.getPosts(filters)
      
      // Apply sorting if provided
      if (sort) {
        fetchedPosts.sort((a, b) => {
          const aValue = a[sort.field]
          const bValue = b[sort.field]
          
          // Handle undefined values
          if (aValue === undefined && bValue === undefined) return 0
          if (aValue === undefined) return 1
          if (bValue === undefined) return -1
          
          if (sort.direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
          }
        })
      }
      
      setPosts(fetchedPosts)
      setLastRefresh(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, sort])

  const createPost = useCallback(async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null)
      const newPost = await databaseService.createPost(postData)
      setPosts(prev => [newPost, ...prev])
      return newPost
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
      throw err
    }
  }, [])

  const updatePost = useCallback(async (id: string, updates: Partial<Post>) => {
    try {
      setError(null)
      const updatedPost = await databaseService.updatePost(id, updates)
      if (updatedPost) {
        setPosts(prev => prev.map(post => post.id === id ? updatedPost : post))
      }
      return updatedPost
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post')
      throw err
    }
  }, [])

  const deletePost = useCallback(async (id: string) => {
    try {
      setError(null)
      const success = await databaseService.deletePost(id)
      if (success) {
        setPosts(prev => prev.filter(post => post.id !== id))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post')
      throw err
    }
  }, [])

  const refresh = useCallback(() => {
    fetchPosts()
  }, [fetchPosts])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchPosts, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchPosts])

  // Initial fetch
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    loading,
    error,
    lastRefresh,
    createPost,
    updatePost,
    deletePost,
    refresh,
    refetch: fetchPosts
  }
}
