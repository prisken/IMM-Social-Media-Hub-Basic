import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/components/Auth/AuthProvider'

interface UseOptimizedDataOptions<T> {
  fetchFunction: () => Promise<T>
  dependencies?: any[]
  enabled?: boolean
  cacheKey?: string
  staleTime?: number // milliseconds
}

interface UseOptimizedDataReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Simple in-memory cache
const dataCache = new Map<string, { data: any; timestamp: number; staleTime: number }>()

export function useOptimizedData<T>({
  fetchFunction,
  dependencies = [],
  enabled = true,
  cacheKey,
  staleTime = 30000 // 30 seconds default
}: UseOptimizedDataOptions<T>): UseOptimizedDataReturn<T> {
  const { organization } = useAuth()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastFetchRef = useRef<number>(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  const generateCacheKey = useCallback(() => {
    if (cacheKey) return cacheKey
    return `${organization?.id || 'no-org'}-${JSON.stringify(dependencies)}`
  }, [organization?.id, cacheKey, dependencies])

  const isDataStale = useCallback((cachedData: { data: any; timestamp: number; staleTime: number }) => {
    return Date.now() - cachedData.timestamp > cachedData.staleTime
  }, [])

  const fetchData = useCallback(async (force = false) => {
    if (!enabled || !organization) return

    const key = generateCacheKey()
    const cached = dataCache.get(key)

    // Check cache first
    if (!force && cached && !isDataStale(cached)) {
      setData(cached.data)
      setLoading(false)
      setError(null)
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const result = await fetchFunction()
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      setData(result)
      
      // Cache the result
      dataCache.set(key, {
        data: result,
        timestamp: Date.now(),
        staleTime
      })

    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(errorMessage)
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false)
      }
    }
  }, [enabled, organization, fetchFunction, generateCacheKey, isDataStale, staleTime])

  // Debounced fetch to prevent rapid successive calls
  const debouncedFetch = useCallback(() => {
    const now = Date.now()
    if (now - lastFetchRef.current < 100) { // 100ms debounce
      return
    }
    lastFetchRef.current = now
    fetchData()
  }, [fetchData])

  useEffect(() => {
    debouncedFetch()
  }, [debouncedFetch, ...dependencies])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const refetch = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch
  }
}

// Specialized hooks for common data types
export function useOptimizedPosts(dependencies: any[] = []) {
  return useOptimizedData({
    fetchFunction: async () => {
      const { apiService } = await import('@/services/ApiService')
      return apiService.getPosts()
    },
    dependencies,
    cacheKey: 'posts',
    staleTime: 10000 // 10 seconds for posts
  })
}

export function useOptimizedCategories(dependencies: any[] = []) {
  return useOptimizedData({
    fetchFunction: async () => {
      const { apiService } = await import('@/services/ApiService')
      return apiService.getCategories()
    },
    dependencies,
    cacheKey: 'categories',
    staleTime: 60000 // 1 minute for categories
  })
}

export function useOptimizedTopics(dependencies: any[] = []) {
  return useOptimizedData({
    fetchFunction: async () => {
      const { apiService } = await import('@/services/ApiService')
      return apiService.getTopics()
    },
    dependencies,
    cacheKey: 'topics',
    staleTime: 60000 // 1 minute for topics
  })
}

// Cache management utilities
export const cacheUtils = {
  clearCache: (key?: string) => {
    if (key) {
      dataCache.delete(key)
    } else {
      dataCache.clear()
    }
  },
  
  getCacheSize: () => dataCache.size,
  
  getCacheKeys: () => Array.from(dataCache.keys()),
  
  isCached: (key: string) => dataCache.has(key)
}
