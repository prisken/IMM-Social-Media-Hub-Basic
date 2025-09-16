import { databaseService } from './database/DatabaseService'
import { Post, Category, Topic, MediaFile, CalendarEvent, Organization, User, PostTemplate } from '@/types'

export class ApiService {
  private organizationId: string | null = null

  constructor() {
    // Get organization ID from localStorage synchronously
    this.initializeOrganization()
  }

  private initializeOrganization() {
    // Get organization ID from localStorage
    const authSession = localStorage.getItem('auth_session')
    if (authSession) {
      try {
        const session = JSON.parse(authSession)
        this.organizationId = session.organizationId
      } catch (error) {
        console.error('Failed to parse auth session:', error)
      }
    }
  }

  setOrganizationId(organizationId: string) {
    this.organizationId = organizationId
  }

  // Method to reinitialize from localStorage (useful when auth state changes)
  reinitializeFromStorage() {
    this.initializeOrganization()
  }

  getCurrentOrganizationId(): string | null {
    return this.organizationId
  }

  private ensureOrganizationSet(): void {
    if (!this.organizationId) {
      // Try to reinitialize from localStorage as a fallback
      this.reinitializeFromStorage()
      
      if (!this.organizationId) {
        throw new Error('Organization not set')
      }
    }
  }

  // Organization API
  async getOrganizations(): Promise<Organization[]> {
    // In a real multi-tenant system, this would return all organizations
    // For now, we'll return the current organization
    if (this.organizationId) {
      const org = await databaseService.getOrganization(this.organizationId)
      return org ? [org] : []
    }
    return []
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return await databaseService.getAllOrganizations()
  }

  async getOrganization(id: string): Promise<Organization | null> {
    return await databaseService.getOrganization(id)
  }

  async createOrganization(data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    return await databaseService.createOrganization(data)
  }

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization | null> {
    return await databaseService.updateOrganization(id, data)
  }

  // User API
  async getUsers(): Promise<User[]> {
    // This would typically be restricted to admin users
    // For now, we'll return empty array as we don't have a multi-user system yet
    return []
  }

  async getUser(id: string): Promise<User | null> {
    // Implementation would depend on your user management system
    return null
  }

  async createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return await databaseService.createUser(data)
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    return await databaseService.updateUser(id, data)
  }

  // Category API
  async getCategories(): Promise<Category[]> {
    this.ensureOrganizationSet()
    
    // Ensure database is initialized for this organization
    await databaseService.initializeDatabase(this.organizationId!)
    
    const categories = await databaseService.getCategories()
    return categories
  }

  async getCategory(id: string): Promise<Category | null> {
    const categories = await this.getCategories()
    return categories.find(cat => cat.id === id) || null
  }

  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    this.ensureOrganizationSet()
    return await databaseService.createCategory({
      ...data,
      organizationId: this.organizationId!
    })
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
    return await databaseService.updateCategory(id, data)
  }

  async deleteCategory(id: string): Promise<boolean> {
    return await databaseService.deleteCategory(id)
  }

  // Topic API
  async getTopics(categoryId?: string): Promise<Topic[]> {
    this.ensureOrganizationSet()
    
    if (categoryId) {
      // Ensure database is initialized for this organization
      await databaseService.initializeDatabase(this.organizationId!)
      return await databaseService.getTopicsByCategory(categoryId)
    }
    
    // Get all topics for all categories in the organization
    const categories = await this.getCategories()
    const allTopics: Topic[] = []
    
    for (const category of categories) {
      const topics = await databaseService.getTopicsByCategory(category.id)
      allTopics.push(...topics)
    }
    
    return allTopics
  }

  async getTopic(id: string): Promise<Topic | null> {
    const topics = await this.getTopics()
    return topics.find(topic => topic.id === id) || null
  }

  async createTopic(data: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>): Promise<Topic> {
    return await databaseService.createTopic(data)
  }

  async updateTopic(id: string, data: Partial<Topic>): Promise<Topic | null> {
    return await databaseService.updateTopic(id, data)
  }

  async deleteTopic(id: string): Promise<boolean> {
    return await databaseService.deleteTopic(id)
  }

  // Post API
  async getPosts(filters: {
    categoryId?: string
    topicId?: string
    status?: string
    platform?: string
    type?: string
    search?: string
  } = {}): Promise<Post[]> {
    this.ensureOrganizationSet()
    
    let posts = await databaseService.getPosts(filters, this.organizationId!)
    
    // Apply search filter if provided
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }
    
    return posts
  }

  async getPost(id: string): Promise<Post | null> {
    return await databaseService.getPost(id)
  }

  async createPost(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    this.ensureOrganizationSet()
    return await databaseService.createPost({
      ...data,
      organizationId: this.organizationId!
    })
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post | null> {
    return await databaseService.updatePost(id, data)
  }

  async deletePost(id: string): Promise<boolean> {
    return await databaseService.deletePost(id)
  }

  async duplicatePost(id: string): Promise<Post | null> {
    const originalPost = await this.getPost(id)
    if (!originalPost) return null
    
    const duplicatedPost = {
      ...originalPost,
      title: `${originalPost.title} (Copy)`,
      status: 'draft' as const,
      scheduledAt: undefined,
      publishedAt: undefined
    }
    
    delete (duplicatedPost as any).id
    delete (duplicatedPost as any).createdAt
    delete (duplicatedPost as any).updatedAt
    
    return await this.createPost(duplicatedPost)
  }

  // Media API
  async getMediaFiles(): Promise<MediaFile[]> {
    this.ensureOrganizationSet()
    return await databaseService.getMediaFiles()
  }

  async getMediaFile(id: string): Promise<MediaFile | null> {
    const mediaFiles = await this.getMediaFiles()
    return mediaFiles.find(file => file.id === id) || null
  }

  async createMediaFile(data: Omit<MediaFile, 'id' | 'createdAt'>): Promise<MediaFile> {
    this.ensureOrganizationSet()
    return await databaseService.createMediaFile({
      ...data,
      organizationId: this.organizationId!
    })
  }

  async deleteMediaFile(id: string): Promise<boolean> {
    return await databaseService.deleteMediaFile(id)
  }

  // Calendar API
  async getCalendarEvents(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    this.ensureOrganizationSet()
    return await databaseService.getCalendarEvents(startDate, endDate)
  }

  async getCalendarEvent(id: string): Promise<CalendarEvent | null> {
    const events = await this.getCalendarEvents()
    return events.find(event => event.id === id) || null
  }

  async createCalendarEvent(data: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent> {
    this.ensureOrganizationSet()
    return await databaseService.createCalendarEvent({
      ...data,
      organizationId: this.organizationId!
    })
  }

  async updateCalendarEvent(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    return await databaseService.updateCalendarEvent(id, data)
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    return await databaseService.deleteCalendarEvent(id)
  }

  // Bulk operations
  async bulkUpdatePosts(postIds: string[], updates: Partial<Post>): Promise<boolean> {
    try {
      for (const postId of postIds) {
        await this.updatePost(postId, updates)
      }
      return true
    } catch (error) {
      console.error('Bulk update failed:', error)
      return false
    }
  }

  async bulkDeletePosts(postIds: string[]): Promise<boolean> {
    try {
      for (const postId of postIds) {
        await this.deletePost(postId)
      }
      return true
    } catch (error) {
      console.error('Bulk delete failed:', error)
      return false
    }
  }

  // Analytics and statistics
  async getPostStatistics(): Promise<{
    total: number
    draft: number
    scheduled: number
    published: number
    byPlatform: Record<string, number>
    byCategory: Record<string, number>
  }> {
    const posts = await this.getPosts()
    
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

  async getMediaStatistics(): Promise<{
    total: number
    totalSize: number
    byType: Record<string, number>
  }> {
    const mediaFiles = await this.getMediaFiles()
    
    const stats = {
      total: mediaFiles.length,
      totalSize: mediaFiles.reduce((sum, file) => sum + file.size, 0),
      byType: {} as Record<string, number>
    }
    
    // Count by MIME type
    mediaFiles.forEach(file => {
      const type = file.mimeType.split('/')[0]
      stats.byType[type] = (stats.byType[type] || 0) + 1
    })
    
    return stats
  }

  // Post Template API
  async getPostTemplates(): Promise<PostTemplate[]> {
    this.ensureOrganizationSet()
    return await databaseService.getPostTemplates(this.organizationId!)
  }

  async getPostTemplate(id: string): Promise<PostTemplate | null> {
    return await databaseService.getPostTemplate(id)
  }

  async createPostTemplate(data: Omit<PostTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PostTemplate> {
    this.ensureOrganizationSet()
    return await databaseService.createPostTemplate({
      ...data,
      organizationId: this.organizationId!
    })
  }

  async updatePostTemplate(id: string, data: Partial<PostTemplate>): Promise<PostTemplate | null> {
    return await databaseService.updatePostTemplate(id, data)
  }

  async deletePostTemplate(id: string): Promise<boolean> {
    return await databaseService.deletePostTemplate(id)
  }
}

// Singleton instance
export const apiService = new ApiService()
