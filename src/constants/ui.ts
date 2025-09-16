// UI Constants
export const UI_CONSTANTS = {
  // Animation durations
  ANIMATION_DURATION: {
    FAST: 0.2,
    NORMAL: 0.3,
    SLOW: 0.5
  },
  
  // Layout dimensions
  LAYOUT: {
    HEADER_HEIGHT: 60,
    SIDEBAR_WIDTH: 280,
    SIDEBAR_COLLAPSED_WIDTH: 60,
    PREVIEW_PANEL_WIDTH: '40%',
    WORKING_PANEL_WIDTH: '60%'
  },
  
  // Grid configurations
  GRID: {
    POSTS_PER_PAGE: 20,
    MEDIA_ITEMS_PER_ROW: 4,
    CALENDAR_DAYS_PER_ROW: 7
  },
  
  // File upload limits
  UPLOAD: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_FILES_PER_UPLOAD: 10,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
    ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/aac']
  },
  
  // Search and filtering
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_SUGGESTIONS: 10,
    DEBOUNCE_DELAY: 300
  },
  
  // Validation
  VALIDATION: {
    MAX_TITLE_LENGTH: 100,
    MAX_CONTENT_LENGTH: 2000,
    MAX_HASHTAGS: 30,
    MAX_HASHTAG_LENGTH: 50
  }
} as const

// Platform configurations
export const PLATFORM_CONFIG = {
  instagram: {
    name: 'Instagram',
    icon: '📷',
    maxCharacters: 2200,
    supportsImages: true,
    supportsVideos: true,
    supportsCarousel: true,
    supportsStories: true
  },
  facebook: {
    name: 'Facebook',
    icon: '📘',
    maxCharacters: 63206,
    supportsImages: true,
    supportsVideos: true,
    supportsCarousel: true,
    supportsStories: false
  },
  twitter: {
    name: 'Twitter',
    icon: '🐦',
    maxCharacters: 280,
    supportsImages: true,
    supportsVideos: true,
    supportsCarousel: false,
    supportsStories: false
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    maxCharacters: 3000,
    supportsImages: true,
    supportsVideos: true,
    supportsCarousel: false,
    supportsStories: false
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    maxCharacters: 2200,
    supportsImages: false,
    supportsVideos: true,
    supportsCarousel: false,
    supportsStories: false
  }
} as const

// Post status configurations
export const POST_STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    color: 'yellow',
    icon: 'AlertCircle',
    description: 'Post is being worked on'
  },
  scheduled: {
    label: 'Scheduled',
    color: 'blue',
    icon: 'Clock',
    description: 'Post is scheduled for future publication'
  },
  published: {
    label: 'Published',
    color: 'green',
    icon: 'CheckCircle',
    description: 'Post has been published'
  },
  archived: {
    label: 'Archived',
    color: 'gray',
    icon: 'Archive',
    description: 'Post has been archived'
  }
} as const

// Post type configurations
export const POST_TYPE_CONFIG = {
  text: {
    label: 'Text',
    icon: 'FileText',
    description: 'Text-only post'
  },
  image: {
    label: 'Image',
    icon: 'Image',
    description: 'Single image post'
  },
  video: {
    label: 'Video',
    icon: 'Video',
    description: 'Single video post'
  },
  carousel: {
    label: 'Carousel',
    icon: 'Images',
    description: 'Multiple media carousel'
  },
  story: {
    label: 'Story',
    icon: 'Clock',
    description: 'Temporary story post'
  }
} as const

// Color palette for categories and topics
export const COLOR_PALETTE = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7'  // Violet
] as const

// Default category colors
export const DEFAULT_CATEGORY_COLORS = {
  'Announcements': '#3B82F6',
  'Product': '#10B981',
  'Community': '#F59E0B',
  'Company': '#8B5CF6',
  'Marketing': '#EC4899',
  'News': '#06B6D4'
} as const

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'File type is not supported.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  SAVE_FAILED: 'Failed to save changes. Please try again.',
  DELETE_FAILED: 'Failed to delete item. Please try again.'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  DELETED: 'Item deleted successfully.',
  UPLOADED: 'File uploaded successfully.',
  CREATED: 'Item created successfully.',
  UPDATED: 'Item updated successfully.',
  SCHEDULED: 'Post scheduled successfully.',
  PUBLISHED: 'Post published successfully.'
} as const

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_SESSION: 'auth_session',
  USER_PREFERENCES: 'user_preferences',
  UI_STATE: 'ui_state',
  DRAFT_POSTS: 'draft_posts',
  RECENT_SEARCHES: 'recent_searches'
} as const

// API endpoints (for future use)
export const API_ENDPOINTS = {
  POSTS: '/api/posts',
  CATEGORIES: '/api/categories',
  TOPICS: '/api/topics',
  MEDIA: '/api/media',
  CALENDAR: '/api/calendar',
  AUTH: '/api/auth',
  ORGANIZATIONS: '/api/organizations'
} as const
