import { BaseService } from './BaseService'
import { Post, Category, Topic, ApiResponse } from '@/types'
import { databaseService } from './database/DatabaseService'

export class PostService extends BaseService {
  private async initializeDatabase() {
    if (!databaseService) {
      throw new Error('Database service not initialized')
    }
  }

  async getPosts(filters?: {
    categoryId?: string
    topicId?: string
    status?: string
    platform?: string
  }): Promise<Post[]> {
    await this.initializeDatabase()
    
    return await this.handleRequest(
      () => databaseService.getPosts(filters),
      'Failed to fetch posts'
    ).then(response => {
      if (response.success) {
        return response.data || []
      }
      throw new Error(response.error || 'Failed to fetch posts')
    })
  }

  async getPost(id: string): Promise<Post | null> {
    await this.initializeDatabase()
    
    return await this.handleRequest(
      () => databaseService.getPost(id),
      'Failed to fetch post'
    ).then(response => {
      if (response.success) {
        return response.data || null
      }
      throw new Error(response.error || 'Failed to fetch post')
    })
  }

  async createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    await this.initializeDatabase()
    
    // Validate required fields
    const validation = this.validateRequired(postData, ['title', 'content', 'categoryId', 'platform'])
    if (!validation.isValid) {
      throw new Error(`Missing required fields: ${validation.missingFields.join(', ')}`)
    }

    return await this.handleRequest(
      () => databaseService.createPost(postData),
      'Failed to create post'
    ).then(response => {
      if (response.success) {
        return response.data!
      }
      throw new Error(response.error || 'Failed to create post')
    })
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    await this.initializeDatabase()
    
    const sanitizedUpdates = this.sanitizeData(updates)
    
    return await this.handleRequest(
      () => databaseService.updatePost(id, sanitizedUpdates),
      'Failed to update post'
    ).then(response => {
      if (response.success && response.data) {
        return response.data
      }
      throw new Error(response.error || 'Failed to update post')
    })
  }

  async deletePost(id: string): Promise<boolean> {
    await this.initializeDatabase()
    
    return await this.handleRequest(
      () => databaseService.deletePost(id),
      'Failed to delete post'
    ).then(response => {
      if (response.success) {
        return response.data || false
      }
      throw new Error(response.error || 'Failed to delete post')
    })
  }

  async getCategories(): Promise<Category[]> {
    await this.initializeDatabase()
    
    return await this.handleRequest(
      () => databaseService.getCategories(),
      'Failed to fetch categories'
    ).then(response => {
      if (response.success) {
        return response.data || []
      }
      throw new Error(response.error || 'Failed to fetch categories')
    })
  }

  async createCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    await this.initializeDatabase()
    
    const validation = this.validateRequired(categoryData, ['name', 'color'])
    if (!validation.isValid) {
      throw new Error(`Missing required fields: ${validation.missingFields.join(', ')}`)
    }

    return await this.handleRequest(
      () => databaseService.createCategory(categoryData),
      'Failed to create category'
    ).then(response => {
      if (response.success) {
        return response.data!
      }
      throw new Error(response.error || 'Failed to create category')
    })
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    await this.initializeDatabase()
    
    const sanitizedUpdates = this.sanitizeData(updates)
    
    return await this.handleRequest(
      () => databaseService.updateCategory(id, sanitizedUpdates),
      'Failed to update category'
    ).then(response => {
      if (response.success) {
        return response.data || null
      }
      throw new Error(response.error || 'Failed to update category')
    })
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.initializeDatabase()
    
    return await this.handleRequest(
      () => databaseService.deleteCategory(id),
      'Failed to delete category'
    ).then(response => {
      if (response.success) {
        return response.data || false
      }
      throw new Error(response.error || 'Failed to delete category')
    })
  }

  async getTopics(): Promise<Topic[]> {
    await this.initializeDatabase()
    
    return await this.handleRequest(
      () => databaseService.getTopicsByCategory(''),
      'Failed to fetch topics'
    ).then(response => {
      if (response.success) {
        return response.data || []
      }
      throw new Error(response.error || 'Failed to fetch topics')
    })
  }

  async getTopicsByCategory(categoryId: string): Promise<Topic[]> {
    await this.initializeDatabase()
    
    return await this.handleRequest(
      () => databaseService.getTopicsByCategory(categoryId),
      'Failed to fetch topics by category'
    ).then(response => {
      if (response.success) {
        return response.data || []
      }
      throw new Error(response.error || 'Failed to fetch topics by category')
    })
  }

  async createTopic(topicData: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>): Promise<Topic> {
    await this.initializeDatabase()
    
    const validation = this.validateRequired(topicData, ['name', 'color', 'categoryId'])
    if (!validation.isValid) {
      throw new Error(`Missing required fields: ${validation.missingFields.join(', ')}`)
    }

    return await this.handleRequest(
      () => databaseService.createTopic(topicData),
      'Failed to create topic'
    ).then(response => {
      if (response.success) {
        return response.data!
      }
      throw new Error(response.error || 'Failed to create topic')
    })
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic | null> {
    await this.initializeDatabase()
    
    const sanitizedUpdates = this.sanitizeData(updates)
    
    return await this.handleRequest(
      () => databaseService.updateTopic(id, sanitizedUpdates),
      'Failed to update topic'
    ).then(response => {
      if (response.success) {
        return response.data || null
      }
      throw new Error(response.error || 'Failed to update topic')
    })
  }

  async deleteTopic(id: string): Promise<boolean> {
    await this.initializeDatabase()
    
    return await this.handleRequest(
      () => databaseService.deleteTopic(id),
      'Failed to delete topic'
    ).then(response => {
      if (response.success) {
        return response.data || false
      }
      throw new Error(response.error || 'Failed to delete topic')
    })
  }

  async searchPosts(query: string): Promise<Post[]> {
    await this.initializeDatabase()
    
    const allPosts = await this.getPosts()
    const lowercaseQuery = query.toLowerCase()
    
    return allPosts.filter(post => 
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery) ||
      (post.hashtags && post.hashtags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    )
  }

  async getPostsByDateRange(startDate: Date, endDate: Date): Promise<Post[]> {
    await this.initializeDatabase()
    
    const allPosts = await this.getPosts()
    
    return allPosts.filter(post => {
      if (!post.scheduledAt) return false
      
      const postDate = new Date(post.scheduledAt)
      return postDate >= startDate && postDate <= endDate
    })
  }

  async duplicatePost(id: string): Promise<Post> {
    const originalPost = await this.getPost(id)
    if (!originalPost) {
      throw new Error('Post not found')
    }

    const duplicateData = {
      ...originalPost,
      title: `${originalPost.title} (Copy)`,
      status: 'draft' as const,
      scheduledAt: null,
      publishedAt: null
    }

    delete (duplicateData as any).id
    delete (duplicateData as any).createdAt
    delete (duplicateData as any).updatedAt

    return await this.createPost(duplicateData)
  }
}
