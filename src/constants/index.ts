// App constants
export const APP_NAME = 'Social Media Management'
export const APP_VERSION = '1.0.0'
export const APP_DESCRIPTION = 'Local desktop application for organizing social media posts and assets'

// API constants
export const API_TIMEOUT = 10000
export const MAX_RETRY_ATTEMPTS = 3
export const RETRY_DELAY = 1000

// UI constants
export const SIDEBAR_WIDTH = 280
export const SIDEBAR_COLLAPSED_WIDTH = 60
export const HEADER_HEIGHT = 64
export const PREVIEW_WIDTH_PERCENTAGE = 30
export const WORKING_AREA_WIDTH_PERCENTAGE = 70

// Animation constants
export const ANIMATION_DURATION = 300
export const ANIMATION_EASING = 'easeInOut'

// Storage constants
export const STORAGE_KEYS = {
  AUTH_SESSION: 'auth_session',
  USER_PREFERENCES: 'user_preferences',
  APP_SETTINGS: 'app_settings',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebar_state'
} as const

// File upload constants
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
] as const

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/wmv',
  'video/flv',
  'video/webm'
] as const

export const ALLOWED_AUDIO_TYPES = [
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/m4a',
  'audio/aac'
] as const

// Post constants
export const MAX_POST_LENGTH = 2000
export const MAX_HASHTAGS = 30
export const MAX_MENTIONS = 10
export const DEFAULT_POST_STATUS = 'draft' as const

// Platform constants
export const SUPPORTED_PLATFORMS = [
  'instagram',
  'facebook',
  'twitter',
  'linkedin',
  'tiktok'
] as const

export const PLATFORM_LIMITS = {
  instagram: {
    caption: 2200,
    hashtags: 30,
    mentions: 20
  },
  facebook: {
    caption: 63206,
    hashtags: 30,
    mentions: 50
  },
  twitter: {
    caption: 280,
    hashtags: 10,
    mentions: 10
  },
  linkedin: {
    caption: 3000,
    hashtags: 5,
    mentions: 20
  },
  tiktok: {
    caption: 2200,
    hashtags: 100,
    mentions: 20
  }
} as const

// Post types
export const POST_TYPES = [
  'text',
  'image',
  'video',
  'carousel',
  'story'
] as const

export const POST_STATUSES = [
  'draft',
  'scheduled',
  'published',
  'archived'
] as const

// Calendar constants
export const CALENDAR_VIEWS = [
  'day',
  'week',
  'month',
  'year'
] as const

export const DEFAULT_TIMEZONE = 'UTC'

// Theme constants
export const THEMES = [
  'light',
  'dark',
  'system'
] as const

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  UPLOAD_FAILED: 'File upload failed.',
  SAVE_FAILED: 'Failed to save changes.',
  DELETE_FAILED: 'Failed to delete item.',
  LOAD_FAILED: 'Failed to load data.'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  DELETED: 'Item deleted successfully.',
  UPLOADED: 'File uploaded successfully.',
  CREATED: 'Item created successfully.',
  UPDATED: 'Item updated successfully.',
  LOGGED_IN: 'Logged in successfully.',
  LOGGED_OUT: 'Logged out successfully.',
  ACCOUNT_CREATED: 'Account created successfully.',
  ORGANIZATION_CREATED: 'Organization created successfully.'
} as const

// Validation rules
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  ORGANIZATION_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  POST_TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200
  },
  POST_CONTENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 2000
  },
  CATEGORY_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50
  },
  TOPIC_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50
  }
} as const

// Default values
export const DEFAULT_VALUES = {
  CATEGORY_COLOR: '#3B82F6',
  TOPIC_COLOR: '#10B981',
  POST_PLATFORM: 'instagram',
  POST_TYPE: 'text',
  POST_STATUS: 'draft',
  CALENDAR_VIEW: 'month',
  THEME: 'system',
  TIMEZONE: 'UTC',
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  REFRESH_INTERVAL: 30000, // 30 seconds
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100
} as const

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  NEW_POST: 'Ctrl+N',
  SAVE: 'Ctrl+S',
  DELETE: 'Delete',
  SEARCH: 'Ctrl+F',
  ESCAPE: 'Escape',
  TOGGLE_SIDEBAR: 'Ctrl+B',
  SWITCH_VIEW: 'Ctrl+Tab'
} as const

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_BULK_OPERATIONS: true,
  ENABLE_DRAG_AND_DROP: true,
  ENABLE_KEYBOARD_SHORTCUTS: true,
  ENABLE_AUTO_SAVE: true,
  ENABLE_REAL_TIME_PREVIEW: true,
  ENABLE_ANALYTICS: false,
  ENABLE_EXPORT: true,
  ENABLE_IMPORT: true
} as const
