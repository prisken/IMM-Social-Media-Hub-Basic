import { databaseService } from './database/DatabaseService'
import { Category, Topic } from '@/types'

export class DataInitializationService {
  private static initialized = false

  static async initializeDefaultData(): Promise<void> {
    if (this.initialized) {
      console.log('DataInitializationService: Already initialized, skipping')
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
        this.initialized = true
        console.log('DataInitializationService: Initialization completed successfully')
      } else {
        this.initialized = true
        console.log('DataInitializationService: Categories already exist, marking as initialized')
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
      this.initialized = false
      await this.createDefaultCategories()
      this.initialized = true

      console.log('✅ Data reset to defaults successfully')
    } catch (error) {
      console.error('Failed to reset data:', error)
      throw error
    }
  }
}
