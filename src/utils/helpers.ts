import { Post, Category, Topic, MediaFile } from '@/types'

// Date utilities
export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatRelativeTime = (date: string | Date): string => {
  const d = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(d)
}

// Text utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g
  return text.match(hashtagRegex) || []
}

export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@[\w\u0590-\u05ff]+/g
  return text.match(mentionRegex) || []
}

export const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export const getCharacterCount = (text: string): number => {
  return text.length
}

export const getReadingTime = (text: string): number => {
  const wordsPerMinute = 200
  const wordCount = getWordCount(text)
  return Math.ceil(wordCount / wordsPerMinute)
}

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/')
}

export const isVideoFile = (mimeType: string): boolean => {
  return mimeType.startsWith('video/')
}

export const isAudioFile = (mimeType: string): boolean => {
  return mimeType.startsWith('audio/')
}

// Color utilities
export const generateRandomColor = (): string => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export const getContrastColor = (hexColor: string): string => {
  // Remove # if present
  const color = hexColor.replace('#', '')
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// Search utilities
export const searchPosts = (posts: Post[], query: string): Post[] => {
  if (!query.trim()) return posts
  
  const searchTerm = query.toLowerCase()
  return posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm) ||
    post.content.toLowerCase().includes(searchTerm) ||
    post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    post.platform.toLowerCase().includes(searchTerm) ||
    post.type.toLowerCase().includes(searchTerm)
  )
}

export const searchCategories = (categories: Category[], query: string): Category[] => {
  if (!query.trim()) return categories
  
  const searchTerm = query.toLowerCase()
  return categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm) ||
    (category.description && category.description.toLowerCase().includes(searchTerm))
  )
}

export const searchTopics = (topics: Topic[], query: string): Topic[] => {
  if (!query.trim()) return topics
  
  const searchTerm = query.toLowerCase()
  return topics.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm) ||
    (topic.description && topic.description.toLowerCase().includes(searchTerm))
  )
}

export const searchMediaFiles = (mediaFiles: MediaFile[], query: string): MediaFile[] => {
  if (!query.trim()) return mediaFiles
  
  const searchTerm = query.toLowerCase()
  return mediaFiles.filter(media =>
    media.originalName.toLowerCase().includes(searchTerm) ||
    media.filename.toLowerCase().includes(searchTerm) ||
    media.mimeType.toLowerCase().includes(searchTerm)
  )
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validatePostContent = (content: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!content.trim()) {
    errors.push('Post content cannot be empty')
  }
  
  if (content.length > 2000) {
    errors.push('Post content cannot exceed 2000 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Platform utilities
export const getPlatformIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    instagram: '📷',
    facebook: '📘',
    twitter: '🐦',
    linkedin: '💼',
    tiktok: '🎵'
  }
  return icons[platform] || '📱'
}

export const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    instagram: '#E4405F',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    tiktok: '#000000'
  }
  return colors[platform] || '#6B7280'
}

// Status utilities
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: '#6B7280',
    scheduled: '#F59E0B',
    published: '#10B981',
    archived: '#EF4444'
  }
  return colors[status] || '#6B7280'
}

export const getStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    draft: '📝',
    scheduled: '⏰',
    published: '✅',
    archived: '🗄️'
  }
  return icons[status] || '❓'
}

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// ID generation
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// Local storage utilities
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to remove from localStorage:', error)
  }
}
