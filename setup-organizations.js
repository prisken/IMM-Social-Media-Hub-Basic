/**
 * Organization Setup Script
 * Creates 6 organizations with sample data for testing
 */

const { databaseService } = require('./dist/services/database/DatabaseService.js')
const { apiService } = require('./dist/services/ApiService.js')

class OrganizationSetup {
  constructor() {
    this.organizations = [
      {
        name: 'Karma Cookie',
        description: 'A mindful cookie company focused on positive energy and delicious treats',
        website: 'https://karmacookie.com',
        logo: 'karma-cookie-logo.png',
        settings: {
          branding: {
            primaryColor: '#FF6B6B',
            secondaryColor: '#4ECDC4'
          },
          preferences: {
            defaultTimezone: 'America/New_York',
            autoSave: true,
            theme: 'light'
          },
          storage: {
            maxStorageGB: 5,
            currentUsageGB: 0
          }
        }
      },
      {
        name: 'Persona Centric',
        description: 'Marketing agency specializing in persona-driven campaigns and brand strategy',
        website: 'https://personacentric.com',
        logo: 'persona-centric-logo.png',
        settings: {
          branding: {
            primaryColor: '#667EEA',
            secondaryColor: '#764BA2'
          },
          preferences: {
            defaultTimezone: 'America/Los_Angeles',
            autoSave: true,
            theme: 'dark'
          },
          storage: {
            maxStorageGB: 10,
            currentUsageGB: 0
          }
        }
      },
      {
        name: 'IMM Limited',
        description: 'International Marketing Management - Global business solutions and consulting',
        website: 'https://immlimited.com',
        logo: 'imm-limited-logo.png',
        settings: {
          branding: {
            primaryColor: '#2C3E50',
            secondaryColor: '#3498DB'
          },
          preferences: {
            defaultTimezone: 'Europe/London',
            autoSave: true,
            theme: 'light'
          },
          storage: {
            maxStorageGB: 15,
            currentUsageGB: 0
          }
        }
      },
      {
        name: 'Roleplay',
        description: 'Interactive entertainment company creating immersive roleplay experiences',
        website: 'https://roleplay-entertainment.com',
        logo: 'roleplay-logo.png',
        settings: {
          branding: {
            primaryColor: '#E74C3C',
            secondaryColor: '#F39C12'
          },
          preferences: {
            defaultTimezone: 'America/Chicago',
            autoSave: true,
            theme: 'dark'
          },
          storage: {
            maxStorageGB: 8,
            currentUsageGB: 0
          }
        }
      },
      {
        name: 'HK Foodies',
        description: 'Hong Kong food blog and restaurant review platform',
        website: 'https://hkfoodies.com',
        logo: 'hk-foodies-logo.png',
        settings: {
          branding: {
            primaryColor: '#FF4757',
            secondaryColor: '#FFA502'
          },
          preferences: {
            defaultTimezone: 'Asia/Hong_Kong',
            autoSave: true,
            theme: 'light'
          },
          storage: {
            maxStorageGB: 12,
            currentUsageGB: 0
          }
        }
      },
      {
        name: '1/2 Drinks',
        description: 'Craft beverage company specializing in unique cocktail mixes and spirits',
        website: 'https://halfdrinks.com',
        logo: 'half-drinks-logo.png',
        settings: {
          branding: {
            primaryColor: '#8E44AD',
            secondaryColor: '#E67E22'
          },
          preferences: {
            defaultTimezone: 'America/New_York',
            autoSave: true,
            theme: 'dark'
          },
          storage: {
            maxStorageGB: 6,
            currentUsageGB: 0
          }
        }
      }
    ]
    
    this.createdOrganizations = []
    this.setupResults = []
  }

  async setupAllOrganizations() {
    console.log('🏢 Setting up 6 organizations...\n')
    
    try {
      // Create organizations
      for (const orgData of this.organizations) {
        await this.createOrganization(orgData)
      }
      
      // Create sample data for each organization
      for (const org of this.createdOrganizations) {
        await this.createSampleData(org)
      }
      
      this.printResults()
      this.generateCredentialsDocument()
      
    } catch (error) {
      console.error('❌ Organization setup failed:', error)
      this.setupResults.push({
        step: 'Organization Setup',
        success: false,
        error: error.message
      })
    }
  }

  async createOrganization(orgData) {
    try {
      console.log(`Creating organization: ${orgData.name}`)
      
      const organization = await databaseService.createOrganization(orgData)
      this.createdOrganizations.push(organization)
      
      // Create default categories for each organization
      await this.createDefaultCategories(organization)
      
      this.setupResults.push({
        step: `Create ${orgData.name}`,
        success: true,
        organizationId: organization.id
      })
      
      console.log(`✅ Created: ${orgData.name} (ID: ${organization.id})`)
      
    } catch (error) {
      this.setupResults.push({
        step: `Create ${orgData.name}`,
        success: false,
        error: error.message
      })
      console.log(`❌ Failed to create ${orgData.name}:`, error.message)
    }
  }

  async createDefaultCategories(organization) {
    const categories = [
      {
        name: 'Marketing',
        color: '#FF6B6B',
        description: 'Marketing and promotional content'
      },
      {
        name: 'Product',
        color: '#4ECDC4',
        description: 'Product-related posts and updates'
      },
      {
        name: 'Community',
        color: '#45B7D1',
        description: 'Community engagement and user-generated content'
      },
      {
        name: 'News',
        color: '#96CEB4',
        description: 'Company news and announcements'
      }
    ]

    for (const categoryData of categories) {
      try {
        await databaseService.createCategory({
          ...categoryData,
          organizationId: organization.id
        })
      } catch (error) {
        console.log(`⚠️ Failed to create category ${categoryData.name} for ${organization.name}`)
      }
    }
  }

  async createSampleData(organization) {
    try {
      console.log(`Creating sample data for: ${organization.name}`)
      
      // Get categories for this organization
      const categories = await databaseService.getCategories(organization.id)
      if (categories.length === 0) return
      
      // Create sample topics
      const marketingCategory = categories.find(c => c.name === 'Marketing')
      if (marketingCategory) {
        await this.createSampleTopics(marketingCategory.id)
      }
      
      // Create sample posts
      await this.createSamplePosts(organization, categories)
      
      // Create sample post templates
      await this.createSampleTemplates(organization)
      
      console.log(`✅ Sample data created for: ${organization.name}`)
      
    } catch (error) {
      console.log(`⚠️ Failed to create sample data for ${organization.name}:`, error.message)
    }
  }

  async createSampleTopics(categoryId) {
    const topics = [
      { name: 'Social Media', color: '#FF6B6B' },
      { name: 'Email Marketing', color: '#4ECDC4' },
      { name: 'Content Marketing', color: '#45B7D1' },
      { name: 'Paid Advertising', color: '#96CEB4' }
    ]

    for (const topicData of topics) {
      try {
        await databaseService.createTopic({
          ...topicData,
          categoryId
        })
      } catch (error) {
        console.log(`⚠️ Failed to create topic ${topicData.name}`)
      }
    }
  }

  async createSamplePosts(organization, categories) {
    const marketingCategory = categories.find(c => c.name === 'Marketing')
    if (!marketingCategory) return
    
    const topics = await databaseService.getTopicsByCategory(marketingCategory.id)
    if (topics.length === 0) return
    
    const samplePosts = [
      {
        title: 'Welcome to ' + organization.name,
        content: `Welcome to ${organization.name}! We're excited to share our journey with you. Follow us for updates, behind-the-scenes content, and exclusive offers. #welcome #${organization.name.toLowerCase().replace(/\s+/g, '')}`,
        categoryId: marketingCategory.id,
        topicId: topics[0].id,
        platform: 'instagram',
        type: 'text',
        status: 'published',
        hashtags: ['#welcome', `#${organization.name.toLowerCase().replace(/\s+/g, '')}`]
      },
      {
        title: 'New Product Launch',
        content: `Exciting news! We're launching something amazing soon. Stay tuned for updates and be the first to know when it's available. #newproduct #launch #excited`,
        categoryId: marketingCategory.id,
        topicId: topics[0].id,
        platform: 'facebook',
        type: 'text',
        status: 'draft',
        hashtags: ['#newproduct', '#launch', '#excited']
      }
    ]

    for (const postData of samplePosts) {
      try {
        await databaseService.createPost({
          ...postData,
          organizationId: organization.id,
          media: [],
          metadata: {
            characterCount: postData.content.length,
            wordCount: postData.content.split(' ').length,
            readingTime: Math.ceil(postData.content.split(' ').length / 200),
            lastEditedBy: 'system',
            version: 1
          }
        })
      } catch (error) {
        console.log(`⚠️ Failed to create sample post for ${organization.name}`)
      }
    }
  }

  async createSampleTemplates(organization) {
    const templates = [
      {
        name: 'Product Announcement',
        content: '🎉 Exciting news! We\'re thrilled to announce our latest product: {{product_name}}. {{product_description}}. Available now! #newproduct #{{brand_hashtag}}',
        platform: 'instagram',
        type: 'text',
        isDefault: true,
        hashtags: ['#newproduct', '#announcement']
      },
      {
        name: 'Behind the Scenes',
        content: 'Behind the scenes at {{company_name}}! Here\'s a glimpse of our team working on {{project_name}}. #behindthescenes #teamwork #{{brand_hashtag}}',
        platform: 'instagram',
        type: 'image',
        isDefault: false,
        hashtags: ['#behindthescenes', '#teamwork']
      }
    ]

    for (const templateData of templates) {
      try {
        await databaseService.createPostTemplate({
          ...templateData,
          organizationId: organization.id
        })
      } catch (error) {
        console.log(`⚠️ Failed to create template for ${organization.name}`)
      }
    }
  }

  printResults() {
    console.log('\n📊 Organization Setup Results:')
    console.log('=' .repeat(50))
    
    const passed = this.setupResults.filter(r => r.success).length
    const failed = this.setupResults.filter(r => !r.success).length
    
    this.setupResults.forEach(result => {
      const status = result.success ? '✅' : '❌'
      console.log(`${status} ${result.step}`)
      
      if (result.organizationId) {
        console.log(`   Organization ID: ${result.organizationId}`)
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
    })
    
    console.log('=' .repeat(50))
    console.log(`Total: ${this.setupResults.length} | Passed: ${passed} | Failed: ${failed}`)
    
    if (failed === 0) {
      console.log('🎉 All organizations created successfully!')
    } else {
      console.log('⚠️ Some organizations failed to create. Please review the errors above.')
    }
  }

  generateCredentialsDocument() {
    const credentials = {
      organizations: this.createdOrganizations.map(org => ({
        id: org.id,
        name: org.name,
        description: org.description,
        website: org.website,
        logo: org.logo,
        settings: org.settings,
        createdAt: org.createdAt
      })),
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    }

    const fs = require('fs')
    const path = require('path')
    
    const credentialsPath = path.join(__dirname, 'ORGANIZATION_CREDENTIALS.json')
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2))
    
    console.log(`\n📄 Credentials document created: ${credentialsPath}`)
    console.log('💾 Keep this file safe for database recovery!')
  }

  async listAllOrganizations() {
    console.log('\n📋 All Organizations:')
    console.log('=' .repeat(50))
    
    const organizations = await databaseService.getAllOrganizations()
    
    organizations.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name}`)
      console.log(`   ID: ${org.id}`)
      console.log(`   Website: ${org.website || 'N/A'}`)
      console.log(`   Created: ${org.createdAt}`)
      console.log('')
    })
  }
}

// Export for use in other scripts
module.exports = { OrganizationSetup }

// Run if called directly
if (require.main === module) {
  async function setupOrganizations() {
    const setup = new OrganizationSetup()
    await setup.setupAllOrganizations()
    await setup.listAllOrganizations()
  }
  
  setupOrganizations().catch(console.error)
}
