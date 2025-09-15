import { useState, useEffect, useCallback } from 'react'
import { Category } from '@/types'
import { databaseService } from '@/services/database/DatabaseService'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedCategories = await databaseService.getCategories()
      setCategories(fetchedCategories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCategory = useCallback(async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null)
      const newCategory = await databaseService.createCategory(categoryData)
      setCategories(prev => [...prev, newCategory])
      return newCategory
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
      throw err
    }
  }, [])

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    try {
      setError(null)
      const updatedCategory = await databaseService.updateCategory(id, updates)
      if (updatedCategory) {
        setCategories(prev => prev.map(category => category.id === id ? updatedCategory : category))
      }
      return updatedCategory
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
      throw err
    }
  }, [])

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setError(null)
      const success = await databaseService.deleteCategory(id)
      if (success) {
        setCategories(prev => prev.filter(category => category.id !== id))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
      throw err
    }
  }, [])

  const refresh = useCallback(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh,
    refetch: fetchCategories
  }
}
