import { databaseService } from './database/DatabaseService'
import { Category, Topic } from '@/types'

export class DataInitializationService {
  private static initializedOrganizations = new Set<string>()

  static async initializeDefaultData(organizationId?: string): Promise<void> {
    // If no organization ID provided, try to get it from the current context
    if (!organizationId) {
      const authSession = localStorage.getItem('auth_session')
      if (authSession) {
        try {
          const session = JSON.parse(authSession)
          organizationId = session.organizationId
        } catch (error) {
          console.error('Failed to parse auth session for initialization:', error)
          return
        }
      }
    }

    if (!organizationId) {
      console.log('DataInitializationService: No organization ID available, skipping')
      return
    }

    if (this.initializedOrganizations.has(organizationId)) {
      console.log(`DataInitializationService: Already initialized for organization ${organizationId}, skipping`)
      return
    }

    try {
      console.log('DataInitializationService: Starting initialization...')
      
      // Check if categories already exist
      const existingCategories = await databaseService.getCategories()
      console.log(`DataInitializationService: Found ${existingCategories.length} existing categories`)
      
      if (existingCategories.length === 0) {
        console.log('DataInitializationService: Creating default categories...')
        await this.createDefaultCategories()
        this.initializedOrganizations.add(organizationId)
        console.log(`DataInitializationService: Initialization completed successfully for organization ${organizationId}`)
        
        // Demo posts creation disabled - users will start with empty post list
        console.log('DataInitializationService: Demo posts creation disabled - starting with clean slate')
      } else {
        this.initializedOrganizations.add(organizationId)
        console.log(`DataInitializationService: Categories already exist, marking as initialized for organization ${organizationId}`)
        
        // Demo posts creation disabled - users will start with empty post list
        console.log('DataInitializationService: Demo posts creation disabled - starting with clean slate')
      }
    } catch (error) {
      console.error('Failed to initialize default data:', error)
      // Don't mark as initialized if there was an error
    }
  }

  private static async createDefaultCategories(): Promise<void> {
    const defaultCategories: Array<{
      name: string
      color: string
      description: string
      topics: Array<{
        name: string
        color: string
        description: string
      }>
    }> = [
      {
        name: 'Marketing',
        color: '#3B82F6',
        description: 'Marketing and promotional content',
        topics: [
          { name: 'Product Launch', color: '#1D4ED8', description: 'New product announcements' },
          { name: 'Sales Promotion', color: '#1E40AF', description: 'Special offers and discounts' },
          { name: 'Brand Awareness', color: '#1E3A8A', description: 'Brand building content' }
        ]
      },
      {
        name: 'Content',
        color: '#10B981',
        description: 'Educational and informative content',
        topics: [
          { name: 'Tutorials', color: '#059669', description: 'How-to guides and tutorials' },
          { name: 'Tips & Tricks', color: '#047857', description: 'Helpful tips and advice' },
          { name: 'Industry News', color: '#065F46', description: 'Latest industry updates' }
        ]
      },
      {
        name: 'Community',
        color: '#F59E0B',
        description: 'Community engagement and interaction',
        topics: [
          { name: 'User Stories', color: '#D97706', description: 'Customer testimonials' },
          { name: 'Behind the Scenes', color: '#B45309', description: 'Company culture and process' },
          { name: 'Events', color: '#92400E', description: 'Company events and meetups' }
        ]
      },
      {
        name: 'Entertainment',
        color: '#EF4444',
        description: 'Fun and entertaining content',
        topics: [
          { name: 'Memes', color: '#DC2626', description: 'Humor and memes' },
          { name: 'Challenges', color: '#B91C1C', description: 'Interactive challenges' },
          { name: 'Trending', color: '#991B1B', description: 'Current trends and viral content' }
        ]
      }
    ]

    for (const categoryData of defaultCategories) {
      // Create category
      const category = await databaseService.createCategory({
        name: categoryData.name,
        color: categoryData.color,
        description: categoryData.description
      })

      // Create topics for this category
      for (const topicData of categoryData.topics) {
        await databaseService.createTopic({
          categoryId: category.id,
          name: topicData.name,
          color: topicData.color,
          description: topicData.description
        })
      }
    }

    console.log('✅ Default categories and topics created successfully')
  }

  private static async createDemoPosts(organizationId: string): Promise<void> {
    try {
      // Check if posts already exist
      const existingPosts = await databaseService.getPosts()
      if (existingPosts.length > 0) {
        console.log(`DataInitializationService: ${existingPosts.length} posts already exist, skipping demo post creation`)
        return
      }

      console.log('DataInitializationService: Creating demo posts...')
      
      // Get categories and topics
      const categories = await databaseService.getCategories()
      const topics = await databaseService.getTopics()
      
      if (categories.length === 0 || topics.length === 0) {
        console.log('DataInitializationService: No categories or topics available for demo posts')
        return
      }

      // Create a few demo posts
      const demoPosts = [
        {
          title: 'Welcome to Social Media Manager! 🚀',
          content: 'We\'re excited to help you manage your social media content. This platform makes it easy to create, schedule, and organize your posts across multiple platforms.\n\nKey features:\n• Create engaging posts\n• Schedule content in advance\n• Organize with categories and topics\n• Track your content calendar\n\nGet started by creating your first post!',
          categoryId: categories[0].id,
          topicId: topics[0].id,
          platform: 'instagram',
          type: 'text',
          status: 'draft',
          hashtags: ['#welcome', '#socialmedia', '#management', '#productivity']
        },
        {
          title: 'New Feature: Calendar View 📅',
          content: 'Check out our new calendar view! You can now drag and drop posts to schedule them easily. This makes content planning much more intuitive and visual.',
          categoryId: categories[1]?.id || categories[0].id,
          topicId: topics[1]?.id || topics[0].id,
          platform: 'facebook',
          type: 'text',
          status: 'scheduled',
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          hashtags: ['#feature', '#calendar', '#planning']
        },
        {
          title: 'Content Organization Tips 💡',
          content: 'Organize your content with categories and topics for better management. This helps you maintain consistency and makes it easier to find specific posts later.',
          categoryId: categories[2]?.id || categories[0].id,
          topicId: topics[2]?.id || topics[0].id,
          platform: 'twitter',
          type: 'text',
          status: 'published',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          hashtags: ['#tips', '#organization', '#content']
        }
      ]

      // Create the demo posts
      for (const postData of demoPosts) {
        await databaseService.createPost({
          organizationId,
          ...postData,
          metadata: {
            characterCount: postData.content.length,
            wordCount: postData.content.split(/\s+/).filter(word => word.length > 0).length,
            readingTime: Math.ceil(postData.content.split(/\s+/).filter(word => word.length > 0).length / 200),
            lastEditedBy: 'system',
            version: 1
          }
        })
      }

      console.log(`✅ Created ${demoPosts.length} demo posts`)
    } catch (error) {
      console.error('Failed to create demo posts:', error)
    }
  }

  static async resetToDefaults(): Promise<void> {
    try {
      // Get all categories
      const categories = await databaseService.getCategories()
      
      // Delete all topics first (foreign key constraint)
      for (const category of categories) {
        const topics = await databaseService.getTopicsByCategory(category.id)
        for (const topic of topics) {
          await databaseService.deleteTopic(topic.id)
        }
      }

      // Delete all categories
      for (const category of categories) {
        await databaseService.deleteCategory(category.id)
      }

      // Recreate defaults
      this.initializedOrganizations.clear()
      await this.createDefaultCategories()
      // Mark as initialized for current organization
      const authSession = localStorage.getItem('auth_session')
      if (authSession) {
        try {
          const session = JSON.parse(authSession)
          if (session.organizationId) {
            this.initializedOrganizations.add(session.organizationId)
          }
        } catch (error) {
          console.error('Failed to parse auth session for reset:', error)
        }
      }

      console.log('✅ Data reset to defaults successfully')
    } catch (error) {
      console.error('Failed to reset data:', error)
      throw error
    }
  }
}
