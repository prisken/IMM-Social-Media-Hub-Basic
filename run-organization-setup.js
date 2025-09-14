/**
 * Organization Setup Runner
 * Sets up all 6 organizations and tests the system
 */

const { OrganizationSetup } = require('./setup-organizations.js')
const { databaseService } = require('./dist/services/database/DatabaseService.js')
const { apiService } = require('./dist/services/ApiService.js')

class OrganizationSetupRunner {
  constructor() {
    this.setup = new OrganizationSetup()
  }

  async run() {
    console.log('🚀 Starting Organization Setup and Testing...\n')
    
    try {
      // Step 1: Setup organizations
      console.log('📋 Step 1: Setting up organizations...')
      await this.setup.setupAllOrganizations()
      
      // Step 2: Test database operations
      console.log('\n🔍 Step 2: Testing database operations...')
      await this.testDatabaseOperations()
      
      // Step 3: Test API operations
      console.log('\n🔌 Step 3: Testing API operations...')
      await this.testApiOperations()
      
      // Step 4: List all organizations
      console.log('\n📋 Step 4: Final organization list...')
      await this.setup.listAllOrganizations()
      
      console.log('\n🎉 Organization setup completed successfully!')
      console.log('\n📝 Next steps:')
      console.log('   1. Start your application: npm run dev')
      console.log('   2. Go to the login screen')
      console.log('   3. Click "Select Org" to choose an organization')
      console.log('   4. Test switching between organizations')
      
    } catch (error) {
      console.error('❌ Setup failed:', error)
      process.exit(1)
    }
  }

  async testDatabaseOperations() {
    try {
      // Test getting all organizations
      const organizations = await databaseService.getAllOrganizations()
      console.log(`✅ Retrieved ${organizations.length} organizations`)
      
      // Test getting categories for each organization
      for (const org of organizations) {
        const categories = await databaseService.getCategories(org.id)
        console.log(`✅ ${org.name}: ${categories.length} categories`)
        
        // Test getting topics for first category
        if (categories.length > 0) {
          const topics = await databaseService.getTopicsByCategory(categories[0].id)
          console.log(`   └─ ${categories[0].name}: ${topics.length} topics`)
        }
      }
      
      // Test getting posts
      let totalPosts = 0
      for (const org of organizations) {
        const posts = await databaseService.getPosts({}, org.id)
        totalPosts += posts.length
      }
      console.log(`✅ Total posts across all organizations: ${totalPosts}`)
      
      // Test getting templates
      let totalTemplates = 0
      for (const org of organizations) {
        const templates = await databaseService.getPostTemplates(org.id)
        totalTemplates += templates.length
      }
      console.log(`✅ Total templates across all organizations: ${totalTemplates}`)
      
    } catch (error) {
      console.error('❌ Database operations test failed:', error.message)
    }
  }

  async testApiOperations() {
    try {
      // Test API service with different organizations
      const organizations = await apiService.getAllOrganizations()
      
      for (const org of organizations.slice(0, 3)) { // Test first 3 organizations
        console.log(`\n🔌 Testing API for: ${org.name}`)
        
        // Set organization ID
        apiService.setOrganizationId(org.id)
        
        // Test getting categories
        const categories = await apiService.getCategories()
        console.log(`   ✅ Categories: ${categories.length}`)
        
        // Test getting posts
        const posts = await apiService.getPosts()
        console.log(`   ✅ Posts: ${posts.length}`)
        
        // Test getting templates
        const templates = await apiService.getPostTemplates()
        console.log(`   ✅ Templates: ${templates.length}`)
        
        // Test statistics
        const postStats = await apiService.getPostStatistics()
        console.log(`   ✅ Post stats: ${postStats.total} total, ${postStats.draft} drafts`)
      }
      
    } catch (error) {
      console.error('❌ API operations test failed:', error.message)
    }
  }

  async generateQuickStartGuide() {
    const organizations = await databaseService.getAllOrganizations()
    
    const guide = `
# Quick Start Guide - Organization Login

## Available Organizations:

${organizations.map((org, index) => `
${index + 1}. **${org.name}**
   - ID: \`${org.id}\`
   - Description: ${org.description}
   - Website: ${org.website || 'N/A'}
   - Primary Color: ${org.settings.branding.primaryColor}
`).join('')}

## How to Login:

1. **Start the application**: \`npm run dev\`
2. **Go to login screen**
3. **Click "Select Org" tab**
4. **Choose an organization** from the list
5. **Click "Continue to [Organization Name]"**

## Organization Switching:

- Use the organization switcher in the header (after login)
- Or logout and select a different organization

## Testing Each Organization:

Each organization has:
- ✅ 4 default categories (Marketing, Product, Community, News)
- ✅ 4 default topics (Social Media, Email Marketing, Content Marketing, Paid Advertising)
- ✅ 2 sample posts (Welcome post + Product launch draft)
- ✅ 2 post templates (Product Announcement + Behind the Scenes)

## Recovery:

If you need to recreate organizations:
\`\`\`bash
node setup-organizations.js
\`\`\`

## Credentials Backup:

Your organization data is backed up in:
- \`ORGANIZATION_CREDENTIALS.json\`
- Keep this file safe for database recovery
`

    const fs = require('fs')
    fs.writeFileSync('QUICK_START_GUIDE.md', guide)
    console.log('\n📄 Quick start guide created: QUICK_START_GUIDE.md')
  }
}

// Run the setup
async function main() {
  const runner = new OrganizationSetupRunner()
  await runner.run()
  await runner.generateQuickStartGuide()
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { OrganizationSetupRunner }
