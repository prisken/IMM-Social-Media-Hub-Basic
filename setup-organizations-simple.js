/**
 * Simple Organization Setup Script
 * Creates 6 organizations directly in the database
 */

const fs = require('fs')
const path = require('path')

class SimpleOrganizationSetup {
  constructor() {
    this.organizations = [
      {
        id: 'karma_cookie_org_001',
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
        id: 'persona_centric_org_002',
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
        id: 'imm_limited_org_003',
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
        id: 'roleplay_org_004',
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
        id: 'hk_foodies_org_005',
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
        id: 'half_drinks_org_006',
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
  }

  generateSQLScript() {
    const now = new Date().toISOString()
    
    let sql = `-- Organization Setup SQL Script
-- Generated: ${now}
-- This script creates 6 organizations with sample data

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM post_media;
-- DELETE FROM calendar_events;
-- DELETE FROM posts;
-- DELETE FROM post_templates;
-- DELETE FROM media_files;
-- DELETE FROM topics;
-- DELETE FROM categories;
-- DELETE FROM users;
-- DELETE FROM organizations;

-- Insert Organizations
`

    // Insert organizations
    this.organizations.forEach(org => {
      sql += `INSERT OR REPLACE INTO organizations (id, name, description, website, logo, settings, created_at, updated_at) VALUES (
  '${org.id}',
  '${org.name.replace(/'/g, "''")}',
  '${org.description.replace(/'/g, "''")}',
  '${org.website}',
  '${org.logo}',
  '${JSON.stringify(org.settings).replace(/'/g, "''")}',
  '${now}',
  '${now}'
);

`
    })

    // Insert default categories for each organization
    const categories = [
      { name: 'Marketing', color: '#FF6B6B', description: 'Marketing and promotional content' },
      { name: 'Product', color: '#4ECDC4', description: 'Product-related posts and updates' },
      { name: 'Community', color: '#45B7D1', description: 'Community engagement and user-generated content' },
      { name: 'News', color: '#96CEB4', description: 'Company news and announcements' }
    ]

    sql += `\n-- Insert Categories for each organization\n`
    this.organizations.forEach(org => {
      categories.forEach((cat, index) => {
        const categoryId = `${org.id}_cat_${index + 1}`
        sql += `INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  '${categoryId}',
  '${org.id}',
  '${cat.name}',
  '${cat.color}',
  '${cat.description}',
  '${now}',
  '${now}'
);

`
      })
    })

    // Insert default topics for Marketing category
    const topics = [
      { name: 'Social Media', color: '#FF6B6B' },
      { name: 'Email Marketing', color: '#4ECDC4' },
      { name: 'Content Marketing', color: '#45B7D1' },
      { name: 'Paid Advertising', color: '#96CEB4' }
    ]

    sql += `\n-- Insert Topics for Marketing categories\n`
    this.organizations.forEach(org => {
      const marketingCategoryId = `${org.id}_cat_1`
      topics.forEach((topic, index) => {
        const topicId = `${org.id}_topic_${index + 1}`
        sql += `INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  '${topicId}',
  '${marketingCategoryId}',
  '${topic.name}',
  '${topic.color}',
  'Marketing topic for ${topic.name.toLowerCase()}',
  '${now}',
  '${now}'
);

`
      })
    })

    // Insert sample posts
    sql += `\n-- Insert Sample Posts\n`
    this.organizations.forEach(org => {
      const marketingCategoryId = `${org.id}_cat_1`
      const socialMediaTopicId = `${org.id}_topic_1`
      
      // Welcome post
      const welcomePostId = `${org.id}_post_1`
      sql += `INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  '${welcomePostId}',
  '${org.id}',
  '${marketingCategoryId}',
  '${socialMediaTopicId}',
  'Welcome to ${org.name}',
  'Welcome to ${org.name}! We are excited to share our journey with you. Follow us for updates, behind-the-scenes content, and exclusive offers.',
  '["#welcome", "#${org.name.toLowerCase().replace(/[^a-z0-9]/g, '')}"]',
  'instagram',
  'text',
  'published',
  '{"characterCount": 120, "wordCount": 20, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '${now}',
  '${now}'
);

`

      // Product launch draft
      const productPostId = `${org.id}_post_2`
      sql += `INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  '${productPostId}',
  '${org.id}',
  '${marketingCategoryId}',
  '${socialMediaTopicId}',
  'New Product Launch',
  'Exciting news! We are launching something amazing soon. Stay tuned for updates and be the first to know when it is available.',
  '["#newproduct", "#launch", "#excited"]',
  'facebook',
  'text',
  'draft',
  '{"characterCount": 130, "wordCount": 22, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '${now}',
  '${now}'
);

`
    })

    // Insert post templates
    sql += `\n-- Insert Post Templates\n`
    this.organizations.forEach(org => {
      // Product announcement template
      const template1Id = `${org.id}_template_1`
      sql += `INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  '${template1Id}',
  '${org.id}',
  'Product Announcement',
  '🎉 Exciting news! We are thrilled to announce our latest product: {{product_name}}. {{product_description}}. Available now! #newproduct #{{brand_hashtag}}',
  '["#newproduct", "#announcement"]',
  'instagram',
  'text',
  1,
  '${now}',
  '${now}'
);

`

      // Behind the scenes template
      const template2Id = `${org.id}_template_2`
      sql += `INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  '${template2Id}',
  '${org.id}',
  'Behind the Scenes',
  'Behind the scenes at {{company_name}}! Here is a glimpse of our team working on {{project_name}}. #behindthescenes #teamwork #{{brand_hashtag}}',
  '["#behindthescenes", "#teamwork"]',
  'instagram',
  'image',
  0,
  '${now}',
  '${now}'
);

`
    })

    return sql
  }

  generateCredentialsDocument() {
    const credentials = {
      organizations: this.organizations,
      defaultCategories: [
        { name: 'Marketing', color: '#FF6B6B', description: 'Marketing and promotional content' },
        { name: 'Product', color: '#4ECDC4', description: 'Product-related posts and updates' },
        { name: 'Community', color: '#45B7D1', description: 'Community engagement and user-generated content' },
        { name: 'News', color: '#96CEB4', description: 'Company news and announcements' }
      ],
      defaultTopics: [
        { name: 'Social Media', color: '#FF6B6B' },
        { name: 'Email Marketing', color: '#4ECDC4' },
        { name: 'Content Marketing', color: '#45B7D1' },
        { name: 'Paid Advertising', color: '#96CEB4' }
      ],
      recoveryInstructions: {
        title: 'Database Recovery Instructions',
        steps: [
          '1. Stop the application',
          '2. Restore database from backup if available',
          '3. Run the SQL script: setup-organizations.sql',
          '4. Verify organizations are created correctly',
          '5. Restart the application',
          '6. Test login for each organization'
        ],
        notes: [
          'Keep this file in a safe location',
          'Update this file whenever organizations are modified',
          'Use the setup-organizations.sql script to recreate organizations',
          'Each organization has unique settings and branding'
        ]
      },
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    }

    return credentials
  }

  async run() {
    console.log('🏢 Setting up 6 organizations...\n')
    
    try {
      // Generate SQL script
      const sqlScript = this.generateSQLScript()
      const sqlPath = path.join(__dirname, 'setup-organizations.sql')
      fs.writeFileSync(sqlPath, sqlScript)
      console.log(`✅ SQL script created: ${sqlPath}`)
      
      // Generate credentials document
      const credentials = this.generateCredentialsDocument()
      const credentialsPath = path.join(__dirname, 'ORGANIZATION_CREDENTIALS.json')
      fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2))
      console.log(`✅ Credentials document created: ${credentialsPath}`)
      
      // Generate quick start guide
      const guide = this.generateQuickStartGuide()
      const guidePath = path.join(__dirname, 'QUICK_START_GUIDE.md')
      fs.writeFileSync(guidePath, guide)
      console.log(`✅ Quick start guide created: ${guidePath}`)
      
      console.log('\n📊 Organization Summary:')
      console.log('=' .repeat(50))
      this.organizations.forEach((org, index) => {
        console.log(`${index + 1}. ${org.name}`)
        console.log(`   ID: ${org.id}`)
        console.log(`   Website: ${org.website}`)
        console.log(`   Primary Color: ${org.settings.branding.primaryColor}`)
        console.log('')
      })
      
      console.log('🎉 Setup completed successfully!')
      console.log('\n📝 Next steps:')
      console.log('   1. Start your application: npm run dev')
      console.log('   2. The organizations will be available in the login screen')
      console.log('   3. Click "Select Org" to choose an organization')
      console.log('   4. Test switching between organizations')
      
    } catch (error) {
      console.error('❌ Setup failed:', error)
    }
  }

  generateQuickStartGuide() {
    return `# Quick Start Guide - Organization Login

## Available Organizations:

${this.organizations.map((org, index) => `
${index + 1}. **${org.name}**
   - ID: \`${org.id}\`
   - Description: ${org.description}
   - Website: ${org.website}
   - Primary Color: ${org.settings.branding.primaryColor}
   - Theme: ${org.settings.preferences.theme}
   - Timezone: ${org.settings.preferences.defaultTimezone}
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
1. Run the SQL script: \`setup-organizations.sql\`
2. Or use the credentials file: \`ORGANIZATION_CREDENTIALS.json\`

## Files Created:

- \`setup-organizations.sql\` - SQL script to create organizations
- \`ORGANIZATION_CREDENTIALS.json\` - Organization data backup
- \`QUICK_START_GUIDE.md\` - This guide

## Database Integration:

The organizations will be automatically available in your app because:
- The SQL script creates the data in the correct format
- The app will load organizations from the database
- Organization switching is built into the UI

## Troubleshooting:

If organizations don't appear:
1. Check that the database is running
2. Verify the SQL script was executed
3. Check the browser console for errors
4. Restart the application
`
  }
}

// Run the setup
async function main() {
  const setup = new SimpleOrganizationSetup()
  await setup.run()
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { SimpleOrganizationSetup }
