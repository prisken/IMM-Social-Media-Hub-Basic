/**
 * Database Refactor Test Script
 * Tests all database functions to ensure they work correctly after refactoring
 */

const { databaseService } = require('./dist/services/database/DatabaseService.js')
const { apiService } = require('./dist/services/ApiService.js')
const { migrationService } = require('./dist/services/database/MigrationService.js')

class DatabaseTestSuite {
  constructor() {
    this.testResults = []
    this.testOrganizationId = null
    this.testCategoryId = null
    this.testTopicId = null
    this.testPostId = null
    this.testMediaId = null
    this.testTemplateId = null
  }

  async runAllTests() {
    console.log('🚀 Starting Database Refactor Test Suite...\n')
    
    try {
      // Run migrations first
      await this.testMigrations()
      
      // Test organization operations
      await this.testOrganizationOperations()
      
      // Test category operations
      await this.testCategoryOperations()
      
      // Test topic operations
      await this.testTopicOperations()
      
      // Test media operations
      await this.testMediaOperations()
      
      // Test post operations
      await this.testPostOperations()
      
      // Test post template operations
      await this.testPostTemplateOperations()
      
      // Test calendar operations
      await this.testCalendarOperations()
      
      // Test API service
      await this.testApiService()
      
      // Cleanup
      await this.cleanup()
      
      this.printResults()
      
    } catch (error) {
      console.error('❌ Test suite failed:', error)
      this.testResults.push({
        test: 'Test Suite',
        success: false,
        error: error.message
      })
    }
  }

  async testMigrations() {
    console.log('📋 Testing Migrations...')
    
    try {
      const results = await migrationService.runMigrations()
      const success = results.every(r => r.success)
      
      this.testResults.push({
        test: 'Database Migrations',
        success,
        details: results
      })
      
      console.log(success ? '✅ Migrations passed' : '❌ Migrations failed')
    } catch (error) {
      this.testResults.push({
        test: 'Database Migrations',
        success: false,
        error: error.message
      })
      console.log('❌ Migrations failed:', error.message)
    }
  }

  async testOrganizationOperations() {
    console.log('🏢 Testing Organization Operations...')
    
    try {
      // Create organization
      const orgData = {
        name: 'Test Organization',
        description: 'Test organization for database testing',
        website: 'https://test.com',
        logo: 'test-logo.png',
        settings: {
          branding: {
            primaryColor: '#007bff',
            secondaryColor: '#6c757d'
          },
          preferences: {
            defaultTimezone: 'UTC',
            autoSave: true,
            theme: 'light'
          },
          storage: {
            maxStorageGB: 10,
            currentUsageGB: 0
          }
        }
      }
      
      const organization = await databaseService.createOrganization(orgData)
      this.testOrganizationId = organization.id
      
      // Get organization
      const retrievedOrg = await databaseService.getOrganization(organization.id)
      
      // Update organization
      const updatedOrg = await databaseService.updateOrganization(organization.id, {
        name: 'Updated Test Organization'
      })
      
      // Get all organizations
      const allOrgs = await databaseService.getAllOrganizations()
      
      this.testResults.push({
        test: 'Organization Operations',
        success: true,
        details: {
          created: !!organization,
          retrieved: !!retrievedOrg,
          updated: updatedOrg?.name === 'Updated Test Organization',
          allOrgs: allOrgs.length > 0
        }
      })
      
      console.log('✅ Organization operations passed')
    } catch (error) {
      this.testResults.push({
        test: 'Organization Operations',
        success: false,
        error: error.message
      })
      console.log('❌ Organization operations failed:', error.message)
    }
  }

  async testCategoryOperations() {
    console.log('📂 Testing Category Operations...')
    
    try {
      if (!this.testOrganizationId) throw new Error('No organization ID available')
      
      // Create category
      const categoryData = {
        organizationId: this.testOrganizationId,
        name: 'Test Category',
        color: '#ff0000',
        description: 'Test category for database testing'
      }
      
      const category = await databaseService.createCategory(categoryData)
      this.testCategoryId = category.id
      
      // Get categories
      const categories = await databaseService.getCategories(this.testOrganizationId)
      
      // Update category
      const updatedCategory = await databaseService.updateCategory(category.id, {
        name: 'Updated Test Category'
      })
      
      this.testResults.push({
        test: 'Category Operations',
        success: true,
        details: {
          created: !!category,
          retrieved: categories.length > 0,
          updated: updatedCategory?.name === 'Updated Test Category'
        }
      })
      
      console.log('✅ Category operations passed')
    } catch (error) {
      this.testResults.push({
        test: 'Category Operations',
        success: false,
        error: error.message
      })
      console.log('❌ Category operations failed:', error.message)
    }
  }

  async testTopicOperations() {
    console.log('🏷️ Testing Topic Operations...')
    
    try {
      if (!this.testCategoryId) throw new Error('No category ID available')
      
      // Create topic
      const topicData = {
        categoryId: this.testCategoryId,
        name: 'Test Topic',
        color: '#00ff00',
        description: 'Test topic for database testing'
      }
      
      const topic = await databaseService.createTopic(topicData)
      this.testTopicId = topic.id
      
      // Get topics by category
      const topics = await databaseService.getTopicsByCategory(this.testCategoryId)
      
      // Update topic
      const updatedTopic = await databaseService.updateTopic(topic.id, {
        name: 'Updated Test Topic'
      })
      
      this.testResults.push({
        test: 'Topic Operations',
        success: true,
        details: {
          created: !!topic,
          retrieved: topics.length > 0,
          updated: updatedTopic?.name === 'Updated Test Topic'
        }
      })
      
      console.log('✅ Topic operations passed')
    } catch (error) {
      this.testResults.push({
        test: 'Topic Operations',
        success: false,
        error: error.message
      })
      console.log('❌ Topic operations failed:', error.message)
    }
  }

  async testMediaOperations() {
    console.log('📷 Testing Media Operations...')
    
    try {
      if (!this.testOrganizationId) throw new Error('No organization ID available')
      
      // Create media file
      const mediaData = {
        organizationId: this.testOrganizationId,
        filename: 'test-image.jpg',
        originalName: 'test-image.jpg',
        mimeType: 'image/jpeg',
        size: 1024000,
        width: 1920,
        height: 1080,
        path: '/test/path/test-image.jpg',
        thumbnailPath: '/test/path/thumb-test-image.jpg',
        metadata: {
          alt: 'Test image',
          caption: 'Test image caption',
          tags: ['test', 'image'],
          isOptimized: true,
          compressionRatio: 0.8
        }
      }
      
      const mediaFile = await databaseService.createMediaFile(mediaData)
      this.testMediaId = mediaFile.id
      
      // Get media files
      const mediaFiles = await databaseService.getMediaFiles()
      
      this.testResults.push({
        test: 'Media Operations',
        success: true,
        details: {
          created: !!mediaFile,
          retrieved: mediaFiles.length > 0
        }
      })
      
      console.log('✅ Media operations passed')
    } catch (error) {
      this.testResults.push({
        test: 'Media Operations',
        success: false,
        error: error.message
      })
      console.log('❌ Media operations failed:', error.message)
    }
  }

  async testPostOperations() {
    console.log('📝 Testing Post Operations...')
    
    try {
      if (!this.testOrganizationId || !this.testCategoryId || !this.testTopicId || !this.testMediaId) {
        throw new Error('Missing required IDs for post testing')
      }
      
      // Create post with media
      const postData = {
        organizationId: this.testOrganizationId,
        categoryId: this.testCategoryId,
        topicId: this.testTopicId,
        title: 'Test Post',
        content: 'This is a test post for database testing',
        media: [{
          postId: '', // Will be set after post creation
          mediaFileId: this.testMediaId,
          orderIndex: 0,
          createdAt: new Date().toISOString()
        }],
        hashtags: ['#test', '#database'],
        platform: 'instagram',
        type: 'image',
        status: 'draft',
        metadata: {
          characterCount: 50,
          wordCount: 10,
          readingTime: 1,
          lastEditedBy: 'test-user',
          version: 1
        }
      }
      
      const post = await databaseService.createPost(postData)
      this.testPostId = post.id
      
      // Get posts
      const posts = await databaseService.getPosts({}, this.testOrganizationId)
      
      // Get single post
      const singlePost = await databaseService.getPost(post.id)
      
      // Update post
      const updatedPost = await databaseService.updatePost(post.id, {
        title: 'Updated Test Post',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      })
      
      this.testResults.push({
        test: 'Post Operations',
        success: true,
        details: {
          created: !!post,
          retrieved: posts.length > 0,
          singlePost: !!singlePost,
          updated: updatedPost?.title === 'Updated Test Post',
          mediaRelations: singlePost?.media?.length > 0
        }
      })
      
      console.log('✅ Post operations passed')
    } catch (error) {
      this.testResults.push({
        test: 'Post Operations',
        success: false,
        error: error.message
      })
      console.log('❌ Post operations failed:', error.message)
    }
  }

  async testPostTemplateOperations() {
    console.log('📋 Testing Post Template Operations...')
    
    try {
      if (!this.testOrganizationId) throw new Error('No organization ID available')
      
      // Create post template
      const templateData = {
        organizationId: this.testOrganizationId,
        name: 'Test Template',
        content: 'This is a test template with {{placeholder}}',
        mediaTemplate: ['image-placeholder'],
        hashtags: ['#template', '#test'],
        platform: 'instagram',
        type: 'image',
        isDefault: false
      }
      
      const template = await databaseService.createPostTemplate(templateData)
      this.testTemplateId = template.id
      
      // Get templates
      const templates = await databaseService.getPostTemplates(this.testOrganizationId)
      
      // Get single template
      const singleTemplate = await databaseService.getPostTemplate(template.id)
      
      // Update template
      const updatedTemplate = await databaseService.updatePostTemplate(template.id, {
        name: 'Updated Test Template'
      })
      
      this.testResults.push({
        test: 'Post Template Operations',
        success: true,
        details: {
          created: !!template,
          retrieved: templates.length > 0,
          singleTemplate: !!singleTemplate,
          updated: updatedTemplate?.name === 'Updated Test Template'
        }
      })
      
      console.log('✅ Post template operations passed')
    } catch (error) {
      this.testResults.push({
        test: 'Post Template Operations',
        success: false,
        error: error.message
      })
      console.log('❌ Post template operations failed:', error.message)
    }
  }

  async testCalendarOperations() {
    console.log('📅 Testing Calendar Operations...')
    
    try {
      if (!this.testPostId || !this.testOrganizationId) throw new Error('Missing required IDs for calendar testing')
      
      // Create calendar event
      const eventData = {
        postId: this.testPostId,
        organizationId: this.testOrganizationId,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: 'scheduled'
      }
      
      const event = await databaseService.createCalendarEvent(eventData)
      
      // Get calendar events
      const events = await databaseService.getCalendarEvents()
      
      // Update event
      const updatedEvent = await databaseService.updateCalendarEvent(event.id, {
        status: 'published'
      })
      
      this.testResults.push({
        test: 'Calendar Operations',
        success: true,
        details: {
          created: !!event,
          retrieved: events.length > 0,
          updated: updatedEvent?.status === 'published'
        }
      })
      
      console.log('✅ Calendar operations passed')
    } catch (error) {
      this.testResults.push({
        test: 'Calendar Operations',
        success: false,
        error: error.message
      })
      console.log('❌ Calendar operations failed:', error.message)
    }
  }

  async testApiService() {
    console.log('🔌 Testing API Service...')
    
    try {
      if (!this.testOrganizationId) throw new Error('No organization ID available')
      
      // Set organization ID for API service
      apiService.setOrganizationId(this.testOrganizationId)
      
      // Test API methods
      const categories = await apiService.getCategories()
      const posts = await apiService.getPosts()
      const mediaFiles = await apiService.getMediaFiles()
      const templates = await apiService.getPostTemplates()
      const calendarEvents = await apiService.getCalendarEvents()
      
      // Test statistics
      const postStats = await apiService.getPostStatistics()
      const mediaStats = await apiService.getMediaStatistics()
      
      this.testResults.push({
        test: 'API Service',
        success: true,
        details: {
          categories: categories.length > 0,
          posts: posts.length > 0,
          mediaFiles: mediaFiles.length > 0,
          templates: templates.length > 0,
          calendarEvents: calendarEvents.length > 0,
          postStats: postStats.total > 0,
          mediaStats: mediaStats.total > 0
        }
      })
      
      console.log('✅ API service passed')
    } catch (error) {
      this.testResults.push({
        test: 'API Service',
        success: false,
        error: error.message
      })
      console.log('❌ API service failed:', error.message)
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up test data...')
    
    try {
      // Delete in reverse order to respect foreign key constraints
      if (this.testTemplateId) {
        await databaseService.deletePostTemplate(this.testTemplateId)
      }
      
      if (this.testPostId) {
        await databaseService.deletePost(this.testPostId)
      }
      
      if (this.testMediaId) {
        await databaseService.deleteMediaFile(this.testMediaId)
      }
      
      if (this.testTopicId) {
        await databaseService.deleteTopic(this.testTopicId)
      }
      
      if (this.testCategoryId) {
        await databaseService.deleteCategory(this.testCategoryId)
      }
      
      // Note: Organization cleanup would require additional logic
      // as it might have other dependencies
      
      console.log('✅ Cleanup completed')
    } catch (error) {
      console.log('⚠️ Cleanup failed:', error.message)
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary:')
    console.log('=' .repeat(50))
    
    const passed = this.testResults.filter(r => r.success).length
    const failed = this.testResults.filter(r => !r.success).length
    
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌'
      console.log(`${status} ${result.test}`)
      
      if (result.details) {
        Object.entries(result.details).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`)
        })
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
    })
    
    console.log('=' .repeat(50))
    console.log(`Total: ${this.testResults.length} | Passed: ${passed} | Failed: ${failed}`)
    
    if (failed === 0) {
      console.log('🎉 All tests passed! Database refactor is successful.')
    } else {
      console.log('⚠️ Some tests failed. Please review the errors above.')
    }
  }
}

// Run the test suite
async function runTests() {
  const testSuite = new DatabaseTestSuite()
  await testSuite.runAllTests()
}

// Export for use in other scripts
module.exports = { DatabaseTestSuite, runTests }

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error)
}
