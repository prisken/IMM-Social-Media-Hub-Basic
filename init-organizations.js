/**
 * Initialize Organizations in Database
 * This script will be executed by the Electron main process
 */

const { databaseService } = require('./dist/services/database/DatabaseService.js')

const organizations = [
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

async function initializeOrganizations() {
  console.log('🏢 Initializing organizations in database...')
  
  try {
    // Create organizations
    for (const orgData of organizations) {
      try {
        await databaseService.createOrganization(orgData)
        console.log(`✅ Created organization: ${orgData.name}`)
      } catch (error) {
        console.log(`⚠️ Organization ${orgData.name} may already exist: ${error.message}`)
      }
    }
    
    console.log('🎉 Organization initialization completed!')
    
  } catch (error) {
    console.error('❌ Organization initialization failed:', error.message)
  }
}

// Export for use in main process
module.exports = { initializeOrganizations, organizations }
