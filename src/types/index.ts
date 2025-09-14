// Core application types
export interface Organization {
  id: string
  name: string
  description?: string
  website?: string
  logo?: string
  createdAt: string
  updatedAt: string
  settings: OrganizationSettings
}

export interface OrganizationSettings {
  branding: {
    logo?: string
    primaryColor: string
    secondaryColor: string
  }
  preferences: {
    defaultTimezone: string
    autoSave: boolean
    theme: 'light' | 'dark' | 'system'
  }
  storage: {
    maxStorageGB: number
    currentUsageGB: number
  }
}

// Post related types
export interface Post {
  id: string
  organizationId: string
  categoryId: string
  topicId: string
  title: string
  content: string
  media: PostMedia[]
  hashtags: string[]
  platform: SocialPlatform
  type: PostType
  status: PostStatus
  scheduledAt?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  metadata: PostMetadata
}

export interface PostMetadata {
  characterCount: number
  wordCount: number
  readingTime: number
  lastEditedBy: string
  version: number
}

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived'
export type PostType = 'text' | 'image' | 'video' | 'carousel' | 'story'
export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok'

// Category and Topic types
export interface Category {
  id: string
  organizationId: string
  name: string
  color: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: string
  categoryId: string
  name: string
  color: string
  description?: string
  createdAt: string
  updatedAt: string
}

// Media types
export interface MediaFile {
  id: string
  organizationId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  width?: number
  height?: number
  duration?: number
  path: string
  thumbnailPath?: string
  createdAt: string
  metadata: MediaMetadata
}

export interface MediaMetadata {
  alt?: string
  caption?: string
  tags: string[]
  isOptimized: boolean
  compressionRatio?: number
}

// Post-Media relationship types
export interface PostMedia {
  id: string
  postId: string
  mediaFileId: string
  orderIndex: number
  createdAt: string
  mediaFile?: MediaFile // Optional populated field
}

// Calendar types
export interface CalendarEvent {
  id: string
  postId: string
  organizationId: string
  scheduledAt: string
  status: 'scheduled' | 'published' | 'failed'
  createdAt: string
}

export interface CalendarView {
  type: 'day' | 'week' | 'month' | 'year'
  date: string
  timezone: string
}

// Post Template types
export interface PostTemplate {
  id: string
  organizationId: string
  name: string
  content: string
  mediaTemplate?: string // JSON array of media placeholders
  hashtags?: string[] // JSON array of default hashtags
  platform: SocialPlatform
  type: PostType
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// User and Authentication types
export interface User {
  id: string
  email: string
  name: string
  organizationId: string
  role: UserRole
  createdAt: string
  lastLoginAt?: string
}

export type UserRole = 'admin' | 'editor' | 'viewer'

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  organization: Organization | null
  loading: boolean
  error: string | null
}

// UI State types
export interface UIState {
  sidebarCollapsed: boolean
  currentView: 'posts' | 'calendar'
  selectedPostId: string | null
  selectedCategoryId: string | null
  selectedTopicId: string | null
  previewMode: 'post' | 'calendar' | 'empty'
  theme: 'light' | 'dark' | 'system'
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Form types
export interface PostFormData {
  title: string
  content: string
  categoryId: string
  topicId: string
  media: File[]
  hashtags: string[]
  platform: SocialPlatform
  type: PostType
  scheduledAt?: string
}

export interface CategoryFormData {
  name: string
  color: string
  description?: string
}

export interface TopicFormData {
  name: string
  color: string
  description?: string
  categoryId: string
}

// Search and Filter types
export interface SearchFilters {
  query?: string
  categoryId?: string
  topicId?: string
  status?: PostStatus
  platform?: SocialPlatform
  type?: PostType
  dateFrom?: string
  dateTo?: string
  hasMedia?: boolean
}

export interface SortOptions {
  field: 'createdAt' | 'updatedAt' | 'title' | 'scheduledAt'
  direction: 'asc' | 'desc'
}

// Storage types
export interface StorageInfo {
  totalSpace: number
  usedSpace: number
  availableSpace: number
  organizationUsage: number
  mediaUsage: number
  databaseUsage: number
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// Event types for IPC
export interface IpcEvents {
  'post-created': Post
  'post-updated': Post
  'post-deleted': { id: string }
  'category-created': Category
  'category-updated': Category
  'category-deleted': { id: string }
  'media-uploaded': MediaFile
  'media-deleted': { id: string }
  'calendar-event-created': CalendarEvent
  'calendar-event-updated': CalendarEvent
  'calendar-event-deleted': { id: string }
}
