import { 
  Organization, 
  User, 
  Post, 
  Category, 
  Topic, 
  MediaFile, 
  CalendarEvent,
  PostTemplate,
  PostMedia,
  ApiResponse 
} from '@/types'

export class DatabaseService {
  private organizationId: string | null = null

  constructor() {
    this.initializeDatabase = this.initializeDatabase.bind(this)
    this.close = this.close.bind(this)
  }

  async initializeDatabase(organizationId: string): Promise<void> {
    try {
      this.organizationId = organizationId
      console.log('Database initialized for organization:', organizationId)
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }

  private async query(sql: string, params: any[] = []): Promise<any[]> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.db.query(sql, params)
    } else {
      // Fallback for development (browser environment)
      console.warn('Running in browser mode - database operations not available')
      return []
    }
  }

  private async execute(sql: string, params: any[] = []): Promise<any> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.db.execute(sql, params)
    } else {
      // Fallback for development (browser environment)
      console.warn('Running in browser mode - database operations not available')
      return { changes: 0, lastID: Math.random().toString(36).substr(2, 9) }
    }
  }

  private async transaction(operations: Array<{ sql: string; params?: any[] }>): Promise<any[]> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.db.transaction(operations)
    } else {
      // Fallback for development (browser environment)
      console.warn('Running in browser mode - database operations not available')
      return operations.map(() => ({ changes: 1 }))
    }
  }

  // Organization operations
  async createOrganization(organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    await this.execute(
      'INSERT INTO organizations (id, name, description, website, logo, settings, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, organization.name, organization.description || null, organization.website || null, organization.logo || null, JSON.stringify(organization.settings), now, now]
    )
    
    return {
      id,
      ...organization,
      createdAt: now,
      updatedAt: now
    }
  }

  async getOrganization(id: string): Promise<Organization | null> {
    const rows = await this.query('SELECT * FROM organizations WHERE id = ?', [id])
    if (rows.length === 0) return null
    
    const row = rows[0]
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      website: row.website,
      logo: row.logo,
      settings: row.settings ? JSON.parse(row.settings) : {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  async getAllOrganizations(): Promise<Organization[]> {
    const rows = await this.query('SELECT * FROM organizations ORDER BY name')
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      website: row.website,
      logo: row.logo,
      settings: row.settings ? JSON.parse(row.settings) : {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    const existing = await this.getOrganization(id)
    if (!existing) return null
    
    const updated = { ...existing, ...updates }
    await this.execute(
      'UPDATE organizations SET name = ?, description = ?, website = ?, logo = ?, settings = ?, updated_at = ? WHERE id = ?',
      [updated.name, updated.description || null, updated.website || null, updated.logo || null, JSON.stringify(updated.settings), new Date().toISOString(), id]
    )
    
    return updated
  }

  // User operations
  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    await this.execute(
      'INSERT INTO users (id, email, name, organization_id, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, user.email, user.name, user.organizationId, user.role, 'hashed_password', now]
    )
    
    return {
      id,
      ...user,
      createdAt: now
    }
  }

  async getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const rows = await this.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) return null
    
    const row = rows[0]
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      organizationId: row.organization_id,
      role: row.role,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
      passwordHash: row.password_hash
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const existing = await this.query('SELECT * FROM users WHERE id = ?', [id])
    if (existing.length === 0) return null
    
    const user = existing[0]
    const updated = { ...user, ...updates }
    await this.execute(
      'UPDATE users SET name = ?, role = ?, last_login_at = ? WHERE id = ?',
      [updated.name, updated.role, updated.lastLoginAt || null, id]
    )
    
    return {
      id: user.id,
      email: user.email,
      name: updated.name,
      organizationId: user.organization_id,
      role: updated.role,
      createdAt: user.created_at,
      lastLoginAt: updated.lastLoginAt
    }
  }

  // Category operations
  async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    await this.execute(
      'INSERT INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, category.organizationId, category.name, category.color, category.description || null, now, now]
    )
    
    return {
      id,
      ...category,
      createdAt: now,
      updatedAt: now
    }
  }

  async getCategories(organizationId?: string): Promise<Category[]> {
    const orgId = organizationId || this.organizationId
    if (!orgId) {
      console.error('DatabaseService.getCategories: Organization not set. organizationId param:', organizationId, 'this.organizationId:', this.organizationId)
      throw new Error('Organization not set')
    }
    
    console.log('DatabaseService.getCategories: Querying categories for organization:', orgId)
    const rows = await this.query('SELECT * FROM categories WHERE organization_id = ? ORDER BY name', [orgId])
    console.log('DatabaseService.getCategories: Raw rows from database:', rows)
    
    const mappedRows = rows.map(row => {
      console.log('DatabaseService.getCategories: Mapping row:', row)
      return {
        id: row.id,
        organizationId: row.organization_id,
        name: row.name,
        color: row.color,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    })
    
    console.log('DatabaseService.getCategories: Mapped rows:', mappedRows)
    return mappedRows
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const existing = await this.query('SELECT * FROM categories WHERE id = ?', [id])
    if (existing.length === 0) return null
    
    const category = existing[0]
    const updated = { ...category, ...updates }
    await this.execute(
      'UPDATE categories SET name = ?, color = ?, description = ?, updated_at = ? WHERE id = ?',
      [updated.name, updated.color, updated.description, new Date().toISOString(), id]
    )
    
    return {
      id: category.id,
      organizationId: category.organization_id,
      name: updated.name,
      color: updated.color,
      description: updated.description,
      createdAt: category.created_at,
      updatedAt: new Date().toISOString()
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await this.execute('DELETE FROM categories WHERE id = ?', [id])
    return result.changes > 0
  }

  // Topic operations
  async createTopic(topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>): Promise<Topic> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    await this.execute(
      'INSERT INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, topic.categoryId, topic.name, topic.color, topic.description || null, now, now]
    )
    
    return {
      id,
      ...topic,
      createdAt: now,
      updatedAt: now
    }
  }

  async getTopicsByCategory(categoryId: string): Promise<Topic[]> {
    const rows = await this.query('SELECT * FROM topics WHERE category_id = ? ORDER BY name', [categoryId])
    
    return rows.map(row => ({
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      color: row.color,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic | null> {
    const existing = await this.query('SELECT * FROM topics WHERE id = ?', [id])
    if (existing.length === 0) return null
    
    const topic = existing[0]
    const updated = { ...topic, ...updates }
    await this.execute(
      'UPDATE topics SET name = ?, color = ?, description = ?, updated_at = ? WHERE id = ?',
      [updated.name, updated.color, updated.description, new Date().toISOString(), id]
    )
    
    return {
      id: topic.id,
      categoryId: topic.category_id,
      name: updated.name,
      color: updated.color,
      description: updated.description,
      createdAt: topic.created_at,
      updatedAt: new Date().toISOString()
    }
  }

  async deleteTopic(id: string): Promise<boolean> {
    const result = await this.execute('DELETE FROM topics WHERE id = ?', [id])
    return result.changes > 0
  }

  // Post operations
  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    await this.execute(
      `INSERT INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, scheduled_at, published_at, metadata, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, post.organizationId, post.categoryId, post.topicId, post.title, post.content,
        JSON.stringify(post.hashtags), post.platform, post.type,
        post.status, post.scheduledAt || null, post.publishedAt || null,
        JSON.stringify(post.metadata), now, now
      ]
    )
    
    // Create post-media relationships
    if (post.media && post.media.length > 0) {
      for (let i = 0; i < post.media.length; i++) {
        const postMedia = post.media[i]
        const postMediaId = this.generateId()
        await this.execute(
          'INSERT INTO post_media (id, post_id, media_file_id, order_index) VALUES (?, ?, ?, ?)',
          [postMediaId, id, postMedia.mediaFileId, postMedia.orderIndex || i]
        )
      }
    }
    
    return {
      id,
      ...post,
      createdAt: now,
      updatedAt: now
    }
  }

  async getPosts(filters: any = {}, organizationId?: string): Promise<Post[]> {
    const orgId = organizationId || this.organizationId
    if (!orgId) {
      console.error('DatabaseService.getPosts: Organization not set. organizationId param:', organizationId, 'this.organizationId:', this.organizationId)
      throw new Error('Organization not set')
    }
    
    console.log('DatabaseService.getPosts: Querying posts for organization:', orgId)
    let sql = 'SELECT * FROM posts WHERE organization_id = ?'
    const params: any[] = [orgId]
    
    if (filters.categoryId) {
      sql += ' AND category_id = ?'
      params.push(filters.categoryId)
    }
    
    if (filters.topicId) {
      sql += ' AND topic_id = ?'
      params.push(filters.topicId)
    }
    
    if (filters.status) {
      sql += ' AND status = ?'
      params.push(filters.status)
    }
    
    sql += ' ORDER BY created_at DESC'
    
    const rows = await this.query(sql, params)
    console.log('DatabaseService.getPosts: Raw rows from database:', rows)
    
    const mappedRows = await Promise.all(rows.map(async (row) => {
      console.log('DatabaseService.getPosts: Mapping row:', row)
      
      // Get media relationships for this post
      const mediaRelations = await this.query(
        'SELECT * FROM post_media WHERE post_id = ? ORDER BY order_index',
        [row.id]
      )
      
      const media = mediaRelations.map(rel => ({
        id: rel.id,
        postId: rel.post_id,
        mediaFileId: rel.media_file_id,
        orderIndex: rel.order_index,
        createdAt: rel.created_at
      }))
      
      return {
        id: row.id,
        organizationId: row.organization_id,
        categoryId: row.category_id,
        topicId: row.topic_id,
        title: row.title,
        content: row.content,
        media: media,
        hashtags: row.hashtags ? JSON.parse(row.hashtags) : [],
        platform: row.platform,
        type: row.type,
        status: row.status,
        scheduledAt: row.scheduled_at,
        publishedAt: row.published_at,
        metadata: row.metadata ? JSON.parse(row.metadata) : {},
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    }))
    
    console.log('DatabaseService.getPosts: Mapped rows:', mappedRows)
    return mappedRows
  }

  async getPost(id: string): Promise<Post | null> {
    const rows = await this.query('SELECT * FROM posts WHERE id = ?', [id])
    if (rows.length === 0) return null
    
    const row = rows[0]
    
    // Get media relationships for this post
    const mediaRelations = await this.query(
      'SELECT * FROM post_media WHERE post_id = ? ORDER BY order_index',
      [id]
    )
    
    const media = mediaRelations.map(rel => ({
      id: rel.id,
      postId: rel.post_id,
      mediaFileId: rel.media_file_id,
      orderIndex: rel.order_index,
      createdAt: rel.created_at
    }))
    
    return {
      id: row.id,
      organizationId: row.organization_id,
      categoryId: row.category_id,
      topicId: row.topic_id,
      title: row.title,
      content: row.content,
      media: media,
      hashtags: row.hashtags ? JSON.parse(row.hashtags) : [],
      platform: row.platform,
      type: row.type,
      status: row.status,
      scheduledAt: row.scheduled_at,
      publishedAt: row.published_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
    const existing = await this.getPost(id)
    if (!existing) return null
    
    const updated = { ...existing, ...updates }
    await this.execute(
      `UPDATE posts SET title = ?, content = ?, hashtags = ?, platform = ?, type = ?, status = ?, scheduled_at = ?, published_at = ?, metadata = ?, updated_at = ? WHERE id = ?`,
      [
        updated.title, updated.content, JSON.stringify(updated.hashtags),
        updated.platform, updated.type, updated.status, updated.scheduledAt || null, updated.publishedAt || null,
        JSON.stringify(updated.metadata), new Date().toISOString(), id
      ]
    )
    
    // Update media relationships if provided
    if (updates.media !== undefined) {
      // Delete existing relationships
      await this.execute('DELETE FROM post_media WHERE post_id = ?', [id])
      
      // Create new relationships
      if (updated.media && updated.media.length > 0) {
        for (let i = 0; i < updated.media.length; i++) {
          const postMedia = updated.media[i]
          const postMediaId = this.generateId()
          await this.execute(
            'INSERT INTO post_media (id, post_id, media_file_id, order_index) VALUES (?, ?, ?, ?)',
            [postMediaId, id, postMedia.mediaFileId, postMedia.orderIndex || i]
          )
        }
      }
    }
    
    return updated
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await this.execute('DELETE FROM posts WHERE id = ?', [id])
    return result.changes > 0
  }

  // Media operations
  async createMediaFile(mediaFile: Omit<MediaFile, 'id' | 'createdAt'>): Promise<MediaFile> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    await this.execute(
      `INSERT INTO media_files (id, organization_id, filename, original_name, mime_type, size, width, height, duration, path, thumbnail_path, metadata, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, mediaFile.organizationId, mediaFile.filename, mediaFile.originalName, mediaFile.mimeType,
        mediaFile.size, mediaFile.width || null, mediaFile.height || null, mediaFile.duration || null,
        mediaFile.path, mediaFile.thumbnailPath || null, JSON.stringify(mediaFile.metadata), now
      ]
    )
    
    return {
      id,
      ...mediaFile,
      createdAt: now
    }
  }

  async getMediaFiles(): Promise<MediaFile[]> {
    if (!this.organizationId) throw new Error('Organization not set')
    
    const rows = await this.query('SELECT * FROM media_files WHERE organization_id = ? ORDER BY created_at DESC', [this.organizationId])
    
    return rows.map(row => ({
      id: row.id,
      organizationId: row.organization_id,
      filename: row.filename,
      originalName: row.original_name,
      mimeType: row.mime_type,
      size: row.size,
      width: row.width,
      height: row.height,
      duration: row.duration,
      path: row.path,
      thumbnailPath: row.thumbnail_path,
      metadata: JSON.parse(row.metadata),
      createdAt: row.created_at
    }))
  }

  async deleteMediaFile(id: string): Promise<boolean> {
    const result = await this.execute('DELETE FROM media_files WHERE id = ?', [id])
    return result.changes > 0
  }

  // Calendar operations
  async createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    await this.execute(
      'INSERT INTO calendar_events (id, post_id, organization_id, scheduled_at, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, event.postId, event.organizationId, event.scheduledAt, event.status, now]
    )
    
    return {
      id,
      ...event,
      createdAt: now
    }
  }

  async getCalendarEvents(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    if (!this.organizationId) throw new Error('Organization not set')
    
    let sql = 'SELECT * FROM calendar_events WHERE organization_id = ?'
    const params: any[] = [this.organizationId]
    
    if (startDate && endDate) {
      sql += ' AND scheduled_at BETWEEN ? AND ?'
      params.push(startDate, endDate)
    }
    
    sql += ' ORDER BY scheduled_at ASC'
    
    const rows = await this.query(sql, params)
    
    return rows.map(row => ({
      id: row.id,
      postId: row.post_id,
      organizationId: row.organization_id,
      scheduledAt: row.scheduled_at,
      status: row.status,
      createdAt: row.created_at
    }))
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const existing = await this.query('SELECT * FROM calendar_events WHERE id = ?', [id])
    if (existing.length === 0) return null
    
    const event = existing[0]
    const updated = { ...event, ...updates }
    await this.execute(
      'UPDATE calendar_events SET scheduled_at = ?, status = ? WHERE id = ?',
      [updated.scheduledAt, updated.status, id]
    )
    
    return {
      id: event.id,
      postId: event.post_id,
      organizationId: event.organization_id,
      scheduledAt: updated.scheduledAt,
      status: updated.status,
      createdAt: event.created_at
    }
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    const result = await this.execute('DELETE FROM calendar_events WHERE id = ?', [id])
    return result.changes > 0
  }

  // Post Template operations
  async createPostTemplate(template: Omit<PostTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PostTemplate> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    await this.execute(
      `INSERT INTO post_templates (id, organization_id, name, content, media_template, hashtags, platform, type, is_default, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, template.organizationId, template.name, template.content,
        template.mediaTemplate ? JSON.stringify(template.mediaTemplate) : null,
        template.hashtags ? JSON.stringify(template.hashtags) : null,
        template.platform, template.type, template.isDefault, now, now
      ]
    )
    
    return {
      id,
      ...template,
      createdAt: now,
      updatedAt: now
    }
  }

  async getPostTemplates(organizationId?: string): Promise<PostTemplate[]> {
    const orgId = organizationId || this.organizationId
    if (!orgId) throw new Error('Organization not set')
    
    const rows = await this.query('SELECT * FROM post_templates WHERE organization_id = ? ORDER BY name', [orgId])
    
    return rows.map(row => ({
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      content: row.content,
      mediaTemplate: row.media_template ? JSON.parse(row.media_template) : undefined,
      hashtags: row.hashtags ? JSON.parse(row.hashtags) : undefined,
      platform: row.platform,
      type: row.type,
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  }

  async getPostTemplate(id: string): Promise<PostTemplate | null> {
    const rows = await this.query('SELECT * FROM post_templates WHERE id = ?', [id])
    if (rows.length === 0) return null
    
    const row = rows[0]
    return {
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      content: row.content,
      mediaTemplate: row.media_template ? JSON.parse(row.media_template) : undefined,
      hashtags: row.hashtags ? JSON.parse(row.hashtags) : undefined,
      platform: row.platform,
      type: row.type,
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  async updatePostTemplate(id: string, updates: Partial<PostTemplate>): Promise<PostTemplate | null> {
    const existing = await this.getPostTemplate(id)
    if (!existing) return null
    
    const updated = { ...existing, ...updates }
    await this.execute(
      `UPDATE post_templates SET name = ?, content = ?, media_template = ?, hashtags = ?, platform = ?, type = ?, is_default = ?, updated_at = ? WHERE id = ?`,
      [
        updated.name, updated.content,
        updated.mediaTemplate ? JSON.stringify(updated.mediaTemplate) : null,
        updated.hashtags ? JSON.stringify(updated.hashtags) : null,
        updated.platform, updated.type, updated.isDefault,
        new Date().toISOString(), id
      ]
    )
    
    return updated
  }

  async deletePostTemplate(id: string): Promise<boolean> {
    const result = await this.execute('DELETE FROM post_templates WHERE id = ?', [id])
    return result.changes > 0
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  async close(): Promise<void> {
    // Database connection is managed by the main process
    console.log('Database service closed')
  }

}

// Singleton instance
export const databaseService = new DatabaseService()