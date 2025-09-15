import { useState, useEffect, useCallback } from 'react'
import { Topic } from '@/types'
import { databaseService } from '@/services/database/DatabaseService'

export function useTopics(categoryId?: string) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTopics = useCallback(async () => {
    if (!categoryId) {
      setTopics([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const fetchedTopics = await databaseService.getTopicsByCategory(categoryId)
      setTopics(fetchedTopics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topics')
      console.error('Error fetching topics:', err)
    } finally {
      setLoading(false)
    }
  }, [categoryId])

  const createTopic = useCallback(async (topicData: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null)
      const newTopic = await databaseService.createTopic(topicData)
      setTopics(prev => [...prev, newTopic])
      return newTopic
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create topic')
      throw err
    }
  }, [])

  const updateTopic = useCallback(async (id: string, updates: Partial<Topic>) => {
    try {
      setError(null)
      const updatedTopic = await databaseService.updateTopic(id, updates)
      if (updatedTopic) {
        setTopics(prev => prev.map(topic => topic.id === id ? updatedTopic : topic))
      }
      return updatedTopic
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update topic')
      throw err
    }
  }, [])

  const deleteTopic = useCallback(async (id: string) => {
    try {
      setError(null)
      const success = await databaseService.deleteTopic(id)
      if (success) {
        setTopics(prev => prev.filter(topic => topic.id !== id))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete topic')
      throw err
    }
  }, [])

  const refresh = useCallback(() => {
    fetchTopics()
  }, [fetchTopics])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  return {
    topics,
    loading,
    error,
    createTopic,
    updateTopic,
    deleteTopic,
    refresh,
    refetch: fetchTopics
  }
}
