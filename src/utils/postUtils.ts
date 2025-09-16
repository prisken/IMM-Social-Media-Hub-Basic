import { Post, Category, Topic } from '@/types'

// Status utilities
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'draft': 
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    case 'scheduled': 
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    case 'published': 
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    default: 
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
}

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'published':
      return 'CheckCircle'
    case 'scheduled':
      return 'Clock'
    case 'draft':
      return 'AlertCircle'
    default:
      return 'FileText'
  }
}

// Platform utilities
export const getPlatformIcon = (platform: string): string => {
  switch (platform) {
    case 'instagram': return '📷'
    case 'facebook': return '📘'
    case 'twitter': return '🐦'
    case 'linkedin': return '💼'
    default: return '📱'
  }
}

// Media utilities
export const getMediaIcon = (post: Post) => {
  if (post.media && post.media.length > 0) {
    const hasVideo = post.media.some(m => m.mediaFileId && m.mediaFileId.includes('video'))
    return hasVideo ? 'Video' : 'Image'
  }
  return null
}

// Category and Topic utilities
export const getCategory = (categoryId: string, categories: Category[]) => 
  categories.find(cat => cat.id === categoryId)

export const getTopic = (topicId: string, topics: Topic[]) => 
  topics.find(topic => topic.id === topicId)

// Date formatting
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Post filtering utilities
export const filterPosts = (posts: Post[], searchQuery: string): Post[] => {
  if (!searchQuery.trim()) {
    return posts
  }

  const query = searchQuery.toLowerCase()
  return posts.filter(post =>
    post.title.toLowerCase().includes(query) ||
    post.content.toLowerCase().includes(query) ||
    post.hashtags.some(tag => tag.toLowerCase().includes(query))
  )
}

// Post duplication utilities
export const createDuplicatePost = (originalPost: Post): Omit<Post, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    ...originalPost,
    title: `${originalPost.title} (Copy)`,
    status: 'draft' as const,
    scheduledAt: undefined,
    publishedAt: undefined
  }
}

// Validation utilities
export const validatePost = (post: Partial<Post>): string[] => {
  const errors: string[] = []
  
  if (!post.title?.trim()) {
    errors.push('Title is required')
  }
  
  if (!post.content?.trim()) {
    errors.push('Content is required')
  }
  
  if (!post.categoryId) {
    errors.push('Category is required')
  }
  
  if (!post.topicId) {
    errors.push('Topic is required')
  }
  
  if (!post.platform) {
    errors.push('Platform is required')
  }
  
  return errors
}

// Post statistics utilities
export const getPostStatistics = (posts: Post[]) => {
  const stats = {
    total: posts.length,
    draft: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    published: posts.filter(p => p.status === 'published').length,
    byPlatform: {} as Record<string, number>,
    byCategory: {} as Record<string, number>
  }
  
  // Count by platform
  posts.forEach(post => {
    stats.byPlatform[post.platform] = (stats.byPlatform[post.platform] || 0) + 1
  })
  
  // Count by category
  posts.forEach(post => {
    stats.byCategory[post.categoryId] = (stats.byCategory[post.categoryId] || 0) + 1
  })
  
  return stats
}

// Media utilities
export const getMediaStatistics = (posts: Post[]) => {
  const totalMedia = posts.reduce((sum, post) => sum + (post.media?.length || 0), 0)
  const postsWithMedia = posts.filter(post => post.media && post.media.length > 0).length
  
  return {
    totalMedia,
    postsWithMedia,
    postsWithoutMedia: posts.length - postsWithMedia,
    averageMediaPerPost: posts.length > 0 ? totalMedia / posts.length : 0
  }
}

// Search utilities
export const getSearchSuggestions = (posts: Post[]): string[] => {
  const suggestions = new Set<string>()
  
  posts.forEach(post => {
    // Add words from title
    post.title.split(' ').forEach(word => {
      if (word.length > 2) {
        suggestions.add(word.toLowerCase())
      }
    })
    
    // Add hashtags
    post.hashtags.forEach(tag => {
      suggestions.add(tag.toLowerCase())
    })
  })
  
  return Array.from(suggestions).slice(0, 10)
}

// Export utilities
export const exportPostsToCSV = (posts: Post[]): string => {
  const headers = ['Title', 'Content', 'Platform', 'Status', 'Created At', 'Scheduled At', 'Hashtags']
  const rows = posts.map(post => [
    post.title,
    post.content.replace(/\n/g, ' '),
    post.platform,
    post.status,
    post.createdAt,
    post.scheduledAt || '',
    post.hashtags.join(', ')
  ])
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')
  
  return csvContent
}

// Sort utilities
export const sortPosts = (posts: Post[], sortBy: 'title' | 'createdAt' | 'updatedAt' | 'scheduledAt', direction: 'asc' | 'desc' = 'desc'): Post[] => {
  return [...posts].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'createdAt':
      case 'updatedAt':
      case 'scheduledAt':
        aValue = new Date(a[sortBy] || 0).getTime()
        bValue = new Date(b[sortBy] || 0).getTime()
        break
      default:
        return 0
    }
    
    if (direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })
}
