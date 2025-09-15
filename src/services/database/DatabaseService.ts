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
    if (!this.organizationId) {
      throw new Error('Organization not set')
    }
    
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.orgDb.query(this.organizationId, sql, params)
    } else {
      // Fallback for development (browser environment)
      console.warn('Running in browser mode - database operations not available')
      return []
    }
  }

  private async execute(sql: string, params: any[] = []): Promise<any> {
    if (!this.organizationId) {
      throw new Error('Organization not set')
    }
    
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.orgDb.execute(this.organizationId, sql, params)
    } else {
      // Fallback for development (browser environment)
      console.warn('Running in browser mode - database operations not available')
      return { changes: 0, lastID: Math.random().toString(36).substr(2, 9) }
    }
  }



  // Category operations
  async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    await this.execute(
      'INSERT INTO categories (id, name, color, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, category.name, category.color, category.description || null, now, now]
    )
    
    return {
      id,
      ...category,
      createdAt: now,
      updatedAt: now
    }
  }

  async getCategories(): Promise<Category[]> {
    if (!this.organizationId) {
      throw new Error('Organization not set')
    }
    
    const rows = await this.query('SELECT * FROM categories ORDER BY name')
    
    return rows.map(row => ({
      id: row.id,
      organizationId: this.organizationId!,
      name: row.name,
      color: row.color,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
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
      organizationId: this.organizationId!,
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

  async getTopics(): Promise<Topic[]> {
    const rows = await this.query('SELECT * FROM topics ORDER BY name')
    
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

  async getTopicsByCategory(categoryId: string): Promise<Topic[]> {
    if (categoryId === '') {
      return this.getTopics()
    }
    
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
    
    // Ensure status has a default value
    const status = post.status || 'draft'
    
    await this.execute(
      `INSERT INTO posts (id, category_id, topic_id, title, content, hashtags, platform, type, status, scheduled_at, published_at, metadata, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, post.categoryId, post.topicId, post.title, post.content,
        JSON.stringify(post.hashtags), post.platform, post.type,
        status, post.scheduledAt || null, post.publishedAt || null,
        JSON.stringify(post.metadata || {}), now, now
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
      organizationId: this.organizationId!,
      createdAt: now,
      updatedAt: now
    }
  }

  async getPosts(filters: any = {}): Promise<Post[]> {
    if (!this.organizationId) {
      throw new Error('Organization not set')
    }
    
    let sql = 'SELECT * FROM posts WHERE 1=1'
    const params: any[] = []
    
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
    
    return await Promise.all(rows.map(async (row) => {
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
        organizationId: this.organizationId!,
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
      organizationId: this.organizationId!,
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
      `INSERT INTO media_files (id, filename, original_name, mime_type, size, width, height, duration, path, thumbnail_path, metadata, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, mediaFile.filename, mediaFile.originalName, mediaFile.mimeType,
        mediaFile.size, mediaFile.width || null, mediaFile.height || null, mediaFile.duration || null,
        mediaFile.path, mediaFile.thumbnailPath || null, JSON.stringify(mediaFile.metadata), now
      ]
    )
    
    return {
      id,
      ...mediaFile,
      organizationId: this.organizationId!,
      createdAt: now
    }
  }

  async getMediaFiles(): Promise<MediaFile[]> {
    if (!this.organizationId) throw new Error('Organization not set')
    
    const rows = await this.query('SELECT * FROM media_files ORDER BY created_at DESC')
    
    return rows.map(row => ({
      id: row.id,
      organizationId: this.organizationId!,
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
      'INSERT INTO calendar_events (id, post_id, scheduled_at, status, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, event.postId, event.scheduledAt, event.status, now]
    )
    
    return {
      id,
      ...event,
      organizationId: this.organizationId!,
      createdAt: now
    }
  }

  async getCalendarEvents(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    if (!this.organizationId) throw new Error('Organization not set')
    
    let sql = 'SELECT * FROM calendar_events WHERE 1=1'
    const params: any[] = []
    
    if (startDate && endDate) {
      sql += ' AND scheduled_at BETWEEN ? AND ?'
      params.push(startDate, endDate)
    }
    
    sql += ' ORDER BY scheduled_at ASC'
    
    const rows = await this.query(sql, params)
    
    return rows.map(row => ({
      id: row.id,
      postId: row.post_id,
      organizationId: this.organizationId!,
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
      organizationId: this.organizationId!,
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
      `INSERT INTO post_templates (id, name, content, media_template, hashtags, platform, type, is_default, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, template.name, template.content,
        template.mediaTemplate ? JSON.stringify(template.mediaTemplate) : null,
        template.hashtags ? JSON.stringify(template.hashtags) : null,
        template.platform, template.type, template.isDefault, now, now
      ]
    )
    
    return {
      id,
      ...template,
      organizationId: this.organizationId!,
      createdAt: now,
      updatedAt: now
    }
  }

  async getPostTemplates(): Promise<PostTemplate[]> {
    if (!this.organizationId) throw new Error('Organization not set')
    
    const rows = await this.query('SELECT * FROM post_templates ORDER BY name')
    
    return rows.map(row => ({
      id: row.id,
      organizationId: this.organizationId!,
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
      organizationId: this.organizationId!,
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