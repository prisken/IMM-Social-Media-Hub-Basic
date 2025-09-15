import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Post, Category, Topic, MediaFile } from '@/types'

// App State Types
export interface AppState {
  // UI State
  sidebarCollapsed: boolean
  currentView: 'posts' | 'calendar'
  selectedPostId: string | null
  selectedCategoryId: string | null
  selectedTopicId: string | null
  previewMode: 'post' | 'calendar' | 'empty'
  
  // Data State
  posts: Post[]
  categories: Category[]
  topics: Topic[]
  mediaFiles: MediaFile[]
  
  // Loading States
  loading: {
    posts: boolean
    categories: boolean
    topics: boolean
    media: boolean
  }
  
  // Error States
  errors: {
    posts: string | null
    categories: string | null
    topics: string | null
    media: string | null
  }
}

// Action Types
export type AppAction =
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_CURRENT_VIEW'; payload: 'posts' | 'calendar' }
  | { type: 'SET_SELECTED_POST'; payload: string | null }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'SET_SELECTED_TOPIC'; payload: string | null }
  | { type: 'SET_PREVIEW_MODE'; payload: 'post' | 'calendar' | 'empty' }
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'UPDATE_POST'; payload: { id: string; updates: Partial<Post> } }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<Category> } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_TOPICS'; payload: Topic[] }
  | { type: 'ADD_TOPIC'; payload: Topic }
  | { type: 'UPDATE_TOPIC'; payload: { id: string; updates: Partial<Topic> } }
  | { type: 'DELETE_TOPIC'; payload: string }
  | { type: 'SET_MEDIA_FILES'; payload: MediaFile[] }
  | { type: 'ADD_MEDIA_FILE'; payload: MediaFile }
  | { type: 'DELETE_MEDIA_FILE'; payload: string }
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof AppState['errors']; value: string | null } }

// Initial State
const initialState: AppState = {
  sidebarCollapsed: false,
  currentView: 'posts',
  selectedPostId: null,
  selectedCategoryId: null,
  selectedTopicId: null,
  previewMode: 'empty',
  posts: [],
  categories: [],
  topics: [],
  mediaFiles: [],
  loading: {
    posts: false,
    categories: false,
    topics: false,
    media: false
  },
  errors: {
    posts: null,
    categories: null,
    topics: null,
    media: null
  }
}

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload }
    
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload }
    
    case 'SET_SELECTED_POST':
      return { ...state, selectedPostId: action.payload }
    
    case 'SET_SELECTED_CATEGORY':
      return { 
        ...state, 
        selectedCategoryId: action.payload,
        selectedTopicId: null // Reset topic when category changes
      }
    
    case 'SET_SELECTED_TOPIC':
      return { ...state, selectedTopicId: action.payload }
    
    case 'SET_PREVIEW_MODE':
      return { ...state, previewMode: action.payload }
    
    case 'SET_POSTS':
      return { ...state, posts: action.payload }
    
    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] }
    
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.id
            ? { ...post, ...action.payload.updates }
            : post
        )
      }
    
    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload),
        selectedPostId: state.selectedPostId === action.payload ? null : state.selectedPostId
      }
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload }
    
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id
            ? { ...category, ...action.payload.updates }
            : category
        )
      }
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
        selectedCategoryId: state.selectedCategoryId === action.payload ? null : state.selectedCategoryId
      }
    
    case 'SET_TOPICS':
      return { ...state, topics: action.payload }
    
    case 'ADD_TOPIC':
      return { ...state, topics: [...state.topics, action.payload] }
    
    case 'UPDATE_TOPIC':
      return {
        ...state,
        topics: state.topics.map(topic =>
          topic.id === action.payload.id
            ? { ...topic, ...action.payload.updates }
            : topic
        )
      }
    
    case 'DELETE_TOPIC':
      return {
        ...state,
        topics: state.topics.filter(topic => topic.id !== action.payload),
        selectedTopicId: state.selectedTopicId === action.payload ? null : state.selectedTopicId
      }
    
    case 'SET_MEDIA_FILES':
      return { ...state, mediaFiles: action.payload }
    
    case 'ADD_MEDIA_FILE':
      return { ...state, mediaFiles: [action.payload, ...state.mediaFiles] }
    
    case 'DELETE_MEDIA_FILE':
      return {
        ...state,
        mediaFiles: state.mediaFiles.filter(media => media.id !== action.payload)
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value }
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.value }
      }
    
    default:
      return state
  }
}

// Context
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider
interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// Hook
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Selector hooks for better performance
export function useAppState() {
  const { state } = useApp()
  return state
}

export function useAppDispatch() {
  const { dispatch } = useApp()
  return dispatch
}

export function useSelectedPost() {
  const { state } = useApp()
  return state.posts.find(post => post.id === state.selectedPostId) || null
}

export function useSelectedCategory() {
  const { state } = useApp()
  return state.categories.find(category => category.id === state.selectedCategoryId) || null
}

export function useSelectedTopic() {
  const { state } = useApp()
  return state.topics.find(topic => topic.id === state.selectedTopicId) || null
}
