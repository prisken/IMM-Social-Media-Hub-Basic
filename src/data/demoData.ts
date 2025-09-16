// Demo data for testing the application
import { Organization, User, Category, Topic, Post, MediaFile } from '@/types'

export const demoOrganization: Organization = {
  id: 'demo-org-1',
  name: 'Demo Organization',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  settings: {
    branding: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF'
    },
    preferences: {
      defaultTimezone: 'UTC',
      autoSave: true,
      theme: 'system'
    },
    storage: {
      maxStorageGB: 10,
      currentUsageGB: 2.5
    }
  }
}

export const demoUser: User = {
  id: 'demo-user-1',
  email: 'demo@example.com',
  name: 'Demo User',
  organizationId: 'demo-org-1',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-01-15T10:30:00Z'
}

export const demoCategories: Category[] = [
  {
    id: 'cat-1',
    organizationId: 'demo-org-1',
    name: 'Announcements',
    color: '#3B82F6',
    description: 'Company announcements and news',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-2',
    organizationId: 'demo-org-1',
    name: 'Product',
    color: '#10B981',
    description: 'Product updates and features',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-3',
    organizationId: 'demo-org-1',
    name: 'Community',
    color: '#F59E0B',
    description: 'Community highlights and user stories',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-4',
    organizationId: 'demo-org-1',
    name: 'Company',
    color: '#EF4444',
    description: 'Behind the scenes and company culture',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

export const demoTopics: Topic[] = [
  {
    id: 'topic-1',
    categoryId: 'cat-1',
    name: 'Product Launch',
    color: '#3B82F6',
    description: 'New product announcements',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'topic-2',
    categoryId: 'cat-2',
    name: 'Feature Update',
    color: '#10B981',
    description: 'New features and improvements',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'topic-3',
    categoryId: 'cat-3',
    name: 'User Stories',
    color: '#F59E0B',
    description: 'Customer success stories',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'topic-4',
    categoryId: 'cat-4',
    name: 'Team Spotlight',
    color: '#EF4444',
    description: 'Meet the team',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

export const demoPosts: Post[] = [
  {
    id: 'post-1',
    organizationId: 'demo-org-1',
    categoryId: 'cat-1',
    topicId: 'topic-1',
    title: 'Welcome to our platform!',
    content: 'We\'re excited to announce the launch of our new social media management platform. This tool will help you organize, schedule, and manage all your social media content in one place. 🚀\n\nKey features include:\n• Intuitive post creation\n• Calendar scheduling\n• Media management\n• Analytics tracking\n\nGet started today and transform your social media strategy!',
    media: [
      {
        id: 'media-1',
        organizationId: 'demo-org-1',
        filename: 'welcome-image.jpg',
        originalName: 'welcome-image.jpg',
        mimeType: 'image/jpeg',
        size: 1024000,
        width: 1200,
        height: 630,
        path: '/demo/media/welcome-image.jpg',
        createdAt: '2024-01-15T10:30:00Z',
        metadata: {
          alt: 'Welcome to our platform',
          caption: 'New platform launch',
          tags: ['launch', 'announcement'],
          isOptimized: true,
          compressionRatio: 0.85
        }
      }
    ],
    hashtags: ['#socialmedia', '#management', '#productivity', '#launch'],
    platform: 'instagram',
    type: 'image',
    status: 'draft',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    metadata: {
      characterCount: 450,
      wordCount: 75,
      readingTime: 1,
      lastEditedBy: 'demo-user-1',
      version: 1
    }
  },
  {
    id: 'post-2',
    organizationId: 'demo-org-1',
    categoryId: 'cat-2',
    topicId: 'topic-2',
    title: 'New feature release',
    content: 'Check out our latest feature that will revolutionize how you manage your content. The new drag-and-drop calendar makes scheduling posts incredibly intuitive.',
    media: [],
    hashtags: ['#feature', '#update', '#productivity'],
    platform: 'facebook',
    type: 'text',
    status: 'scheduled',
    scheduledAt: '2024-01-20T10:00:00Z',
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-14T15:45:00Z',
    metadata: {
      characterCount: 180,
      wordCount: 30,
      readingTime: 1,
      lastEditedBy: 'demo-user-1',
      version: 1
    }
  },
  {
    id: 'post-3',
    organizationId: 'demo-org-1',
    categoryId: 'cat-3',
    topicId: 'topic-3',
    title: 'Community highlights',
    content: 'Amazing community stories and user-generated content from this week. Thank you to all our users for sharing their experiences!',
    media: [
      {
        id: 'media-2',
        organizationId: 'demo-org-1',
        filename: 'community-1.jpg',
        originalName: 'community-1.jpg',
        mimeType: 'image/jpeg',
        size: 2048000,
        width: 1080,
        height: 1080,
        path: '/demo/media/community-1.jpg',
        createdAt: '2024-01-13T09:20:00Z',
        metadata: {
          alt: 'Community highlights',
          caption: 'User stories',
          tags: ['community', 'users'],
          isOptimized: true,
          compressionRatio: 0.80
        }
      },
      {
        id: 'media-3',
        organizationId: 'demo-org-1',
        filename: 'community-2.jpg',
        originalName: 'community-2.jpg',
        mimeType: 'image/jpeg',
        size: 1800000,
        width: 1080,
        height: 1080,
        path: '/demo/media/community-2.jpg',
        createdAt: '2024-01-13T09:20:00Z',
        metadata: {
          alt: 'Community highlights 2',
          caption: 'More user stories',
          tags: ['community', 'users'],
          isOptimized: true,
          compressionRatio: 0.80
        }
      }
    ],
    hashtags: ['#community', '#users', '#stories'],
    platform: 'twitter',
    type: 'carousel',
    status: 'published',
    publishedAt: '2024-01-13T09:20:00Z',
    createdAt: '2024-01-13T09:20:00Z',
    updatedAt: '2024-01-13T09:20:00Z',
    metadata: {
      characterCount: 120,
      wordCount: 20,
      readingTime: 1,
      lastEditedBy: 'demo-user-1',
      version: 1
    }
  }
]

export const demoMediaFiles: MediaFile[] = [
  {
    id: 'media-1',
    organizationId: 'demo-org-1',
    filename: 'welcome-image.jpg',
    originalName: 'welcome-image.jpg',
    mimeType: 'image/jpeg',
    size: 1024000,
    width: 1200,
    height: 630,
    path: '/demo/media/welcome-image.jpg',
    thumbnailPath: '/demo/media/thumbnails/welcome-image.jpg',
    createdAt: '2024-01-15T10:30:00Z',
    metadata: {
      alt: 'Welcome to our platform',
      caption: 'New platform launch',
      tags: ['launch', 'announcement'],
      isOptimized: true,
      compressionRatio: 0.85
    }
  },
  {
    id: 'media-2',
    organizationId: 'demo-org-1',
    filename: 'community-1.jpg',
    originalName: 'community-1.jpg',
    mimeType: 'image/jpeg',
    size: 2048000,
    width: 1080,
    height: 1080,
    path: '/demo/media/community-1.jpg',
    thumbnailPath: '/demo/media/thumbnails/community-1.jpg',
    createdAt: '2024-01-13T09:20:00Z',
    metadata: {
      alt: 'Community highlights',
      caption: 'User stories',
      tags: ['community', 'users'],
      isOptimized: true,
      compressionRatio: 0.80
    }
  }
]

// Function to get all demo data
export function getDemoData() {
  return {
    organization: demoOrganization,
    user: demoUser,
    categories: demoCategories,
    topics: demoTopics,
    posts: demoPosts,
    mediaFiles: demoMediaFiles
  }
}

// Seeding presets for common scenarios
export const seedingPresets = {
  basic: {
    platforms: ['instagram', 'facebook', 'twitter'] as const,
    postTypes: ['text', 'image'] as const,
    statuses: ['draft', 'scheduled'] as const,
    count: 10
  },
  comprehensive: {
    platforms: ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'] as const,
    postTypes: ['text', 'image', 'video', 'carousel', 'story'] as const,
    statuses: ['draft', 'scheduled', 'published'] as const,
    count: 25
  },
  testing: {
    platforms: ['instagram', 'facebook'] as const,
    postTypes: ['text', 'image'] as const,
    statuses: ['draft'] as const,
    count: 5
  }
}
