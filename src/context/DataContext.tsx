import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { apiService } from '@/services/ApiService'
import { Post, Category, Topic } from '@/types'

interface DataState {
  posts: Post[]
  categories: Category[]
  topics: Topic[]
  loading: {
    posts: boolean
    categories: boolean
    topics: boolean
  }
  error: string | null
  lastUpdated: {
    posts: number | null
    categories: number | null
    topics: number | null
  }
}

type DataAction =
  | { type: 'SET_LOADING'; payload: { dataType: keyof DataState['loading']; loading: boolean } }
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_TOPICS'; payload: Topic[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_POST'; payload: Post }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'RESET_DATA' }

const initialState: DataState = {
  posts: [],
  categories: [],
  topics: [],
  loading: {
    posts: false,
    categories: false,
    topics: false
  },
  error: null,
  lastUpdated: {
    posts: null,
    categories: null,
    topics: null
  }
}

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.dataType]: action.payload.loading
        }
      }
    
    case 'SET_POSTS':
      return {
        ...state,
        posts: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          posts: Date.now()
        }
      }
    
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          categories: Date.now()
        }
      }
    
    case 'SET_TOPICS':
      return {
        ...state,
        topics: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          topics: Date.now()
        }
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      }
    
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(post => 
          post.id === action.payload.id ? action.payload : post
        ),
        lastUpdated: {
          ...state.lastUpdated,
          posts: Date.now()
        }
      }
    
    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload),
        lastUpdated: {
          ...state.lastUpdated,
          posts: Date.now()
        }
      }
    
    case 'ADD_POST':
      return {
        ...state,
        posts: [...state.posts, action.payload],
        lastUpdated: {
          ...state.lastUpdated,
          posts: Date.now()
        }
      }
    
    case 'RESET_DATA':
      return initialState
    
    default:
      return state
  }
}

interface DataContextType {
  state: DataState
  loadPosts: () => Promise<void>
  loadCategories: () => Promise<void>
  loadTopics: () => Promise<void>
  loadAllData: () => Promise<void>
  updatePost: (post: Post) => void
  deletePost: (postId: string) => void
  addPost: (post: Post) => void
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentOrganization } = useAuth()
  const [state, dispatch] = useReducer(dataReducer, initialState)
  const [lastOrganizationId, setLastOrganizationId] = React.useState<string | null>(null)

  // Load posts
  const loadPosts = useCallback(async () => {
    if (!currentOrganization) return
    
    try {
      dispatch({ type: 'SET_LOADING', payload: { dataType: 'posts', loading: true } })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const posts = await apiService.getPosts()
      dispatch({ type: 'SET_POSTS', payload: posts })
    } catch (error) {
      console.error('Failed to load posts:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load posts' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { dataType: 'posts', loading: false } })
    }
  }, [currentOrganization])

  // Load categories
  const loadCategories = useCallback(async () => {
    if (!currentOrganization) return
    
    try {
      dispatch({ type: 'SET_LOADING', payload: { dataType: 'categories', loading: true } })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const categories = await apiService.getCategories()
      dispatch({ type: 'SET_CATEGORIES', payload: categories })
    } catch (error) {
      console.error('Failed to load categories:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load categories' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { dataType: 'categories', loading: false } })
    }
  }, [currentOrganization])

  // Load topics
  const loadTopics = useCallback(async () => {
    if (!currentOrganization) return
    
    try {
      dispatch({ type: 'SET_LOADING', payload: { dataType: 'topics', loading: true } })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const topics = await apiService.getTopics()
      dispatch({ type: 'SET_TOPICS', payload: topics })
    } catch (error) {
      console.error('Failed to load topics:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load topics' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { dataType: 'topics', loading: false } })
    }
  }, [currentOrganization])

  // Load all data
  const loadAllData = useCallback(async () => {
    if (!currentOrganization) return
    
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      
      // Load all data in parallel
      await Promise.all([
        loadPosts(),
        loadCategories(),
        loadTopics()
      ])
    } catch (error) {
      console.error('Failed to load all data:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' })
    }
  }, [currentOrganization, loadPosts, loadCategories, loadTopics])

  // Update post
  const updatePost = useCallback((post: Post) => {
    dispatch({ type: 'UPDATE_POST', payload: post })
  }, [])

  // Delete post
  const deletePost = useCallback((postId: string) => {
    dispatch({ type: 'DELETE_POST', payload: postId })
  }, [])

  // Add post
  const addPost = useCallback((post: Post) => {
    dispatch({ type: 'ADD_POST', payload: post })
  }, [])

  // Refresh all data
  const refreshData = useCallback(async () => {
    await loadAllData()
  }, [loadAllData])

  // Load data when organization changes
  useEffect(() => {
    if (currentOrganization && currentOrganization.id !== lastOrganizationId) {
      setLastOrganizationId(currentOrganization.id)
      dispatch({ type: 'RESET_DATA' })
      loadAllData()
    }
  }, [currentOrganization, lastOrganizationId, loadAllData])

  const contextValue: DataContextType = {
    state,
    loadPosts,
    loadCategories,
    loadTopics,
    loadAllData,
    updatePost,
    deletePost,
    addPost,
    refreshData
  }

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
