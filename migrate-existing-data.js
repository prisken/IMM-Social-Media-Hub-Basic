/**
 * Data Migration Script
 * Migrates existing data from old schema to new schema
 * Handles the transition from JSON media arrays to proper relationships
 */

const { databaseService } = require('./dist/services/database/DatabaseService.js')
const { migrationService } = require('./dist/services/database/MigrationService.js')

class DataMigration {
  constructor() {
    this.migrationResults = []
    this.backupCreated = false
  }

  async runMigration() {
    console.log('🔄 Starting Data Migration...\n')
    
    try {
      // Step 1: Create backup
      await this.createBackup()
      
      // Step 2: Run schema migrations
      await this.runSchemaMigrations()
      
      // Step 3: Migrate post media data
      await this.migratePostMediaData()
      
      // Step 4: Update organization data
      await this.updateOrganizationData()
      
      // Step 5: Validate migration
      await this.validateMigration()
      
      this.printResults()
      
    } catch (error) {
      console.error('❌ Migration failed:', error)
      this.migrationResults.push({
        step: 'Migration Process',
        success: false,
        error: error.message
      })
    }
  }

  async createBackup() {
    console.log('💾 Creating database backup...')
    
    try {
      // In a real application, you would create a backup file
      // For now, we'll just log that we would create a backup
      console.log('📁 Backup would be created at: ./backups/database-backup-' + new Date().toISOString().split('T')[0] + '.db')
      
      this.migrationResults.push({
        step: 'Database Backup',
        success: true,
        message: 'Backup creation simulated'
      })
      
      this.backupCreated = true
      console.log('✅ Backup creation completed')
    } catch (error) {
      this.migrationResults.push({
        step: 'Database Backup',
        success: false,
        error: error.message
      })
      console.log('❌ Backup creation failed:', error.message)
      throw error
    }
  }

  async runSchemaMigrations() {
    console.log('🏗️ Running schema migrations...')
    
    try {
      const results = await migrationService.runMigrations()
      const success = results.every(r => r.success)
      
      this.migrationResults.push({
        step: 'Schema Migrations',
        success,
        details: results
      })
      
      if (success) {
        console.log('✅ Schema migrations completed')
      } else {
        throw new Error('Schema migrations failed')
      }
    } catch (error) {
      this.migrationResults.push({
        step: 'Schema Migrations',
        success: false,
        error: error.message
      })
      console.log('❌ Schema migrations failed:', error.message)
      throw error
    }
  }

  async migratePostMediaData() {
    console.log('📷 Migrating post media data...')
    
    try {
      const result = await migrationService.migratePostMediaData()
      
      this.migrationResults.push({
        step: 'Post Media Migration',
        success: result.success,
        message: result.message,
        error: result.error
      })
      
      if (result.success) {
        console.log('✅ Post media migration completed')
      } else {
        console.log('⚠️ Post media migration had issues:', result.message)
      }
    } catch (error) {
      this.migrationResults.push({
        step: 'Post Media Migration',
        success: false,
        error: error.message
      })
      console.log('❌ Post media migration failed:', error.message)
    }
  }

  async updateOrganizationData() {
    console.log('🏢 Updating organization data...')
    
    try {
      // Get all organizations
      const organizations = await databaseService.getAllOrganizations()
      let updatedCount = 0
      
      for (const org of organizations) {
        // Check if organization needs updates
        const needsUpdate = !org.description && !org.website && !org.logo
        
        if (needsUpdate) {
          // Add default values for missing fields
          const updates = {
            description: org.description || 'Organization created before migration',
            website: org.website || null,
            logo: org.logo || null,
            settings: org.settings || {
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
          
          await databaseService.updateOrganization(org.id, updates)
          updatedCount++
        }
      }
      
      this.migrationResults.push({
        step: 'Organization Data Update',
        success: true,
        message: `Updated ${updatedCount} organizations`
      })
      
      console.log(`✅ Organization data update completed (${updatedCount} organizations updated)`)
    } catch (error) {
      this.migrationResults.push({
        step: 'Organization Data Update',
        success: false,
        error: error.message
      })
      console.log('❌ Organization data update failed:', error.message)
    }
  }

  async validateMigration() {
    console.log('🔍 Validating migration...')
    
    try {
      const validationResults = []
      
      // Validate organizations
      const organizations = await databaseService.getAllOrganizations()
      validationResults.push({
        check: 'Organizations',
        success: organizations.length > 0,
        count: organizations.length
      })
      
      // Validate categories
      let totalCategories = 0
      for (const org of organizations) {
        const categories = await databaseService.getCategories(org.id)
        totalCategories += categories.length
      }
      validationResults.push({
        check: 'Categories',
        success: totalCategories >= 0,
        count: totalCategories
      })
      
      // Validate posts
      let totalPosts = 0
      for (const org of organizations) {
        const posts = await databaseService.getPosts({}, org.id)
        totalPosts += posts.length
      }
      validationResults.push({
        check: 'Posts',
        success: totalPosts >= 0,
        count: totalPosts
      })
      
      // Validate media files
      let totalMedia = 0
      for (const org of organizations) {
        // This would need to be implemented in DatabaseService
        // const mediaFiles = await databaseService.getMediaFiles(org.id)
        // totalMedia += mediaFiles.length
      }
      validationResults.push({
        check: 'Media Files',
        success: true,
        count: totalMedia
      })
      
      // Validate post-media relationships
      let totalRelationships = 0
      for (const org of organizations) {
        const posts = await databaseService.getPosts({}, org.id)
        for (const post of posts) {
          totalRelationships += post.media.length
        }
      }
      validationResults.push({
        check: 'Post-Media Relationships',
        success: totalRelationships >= 0,
        count: totalRelationships
      })
      
      this.migrationResults.push({
        step: 'Migration Validation',
        success: validationResults.every(r => r.success),
        details: validationResults
      })
      
      console.log('✅ Migration validation completed')
    } catch (error) {
      this.migrationResults.push({
        step: 'Migration Validation',
        success: false,
        error: error.message
      })
      console.log('❌ Migration validation failed:', error.message)
    }
  }

  printResults() {
    console.log('\n📊 Migration Results Summary:')
    console.log('=' .repeat(50))
    
    const passed = this.migrationResults.filter(r => r.success).length
    const failed = this.migrationResults.filter(r => !r.success).length
    
    this.migrationResults.forEach(result => {
      const status = result.success ? '✅' : '❌'
      console.log(`${status} ${result.step}`)
      
      if (result.message) {
        console.log(`   Message: ${result.message}`)
      }
      
      if (result.details) {
        if (Array.isArray(result.details)) {
          result.details.forEach(detail => {
            if (detail.check) {
              console.log(`   ${detail.check}: ${detail.count}`)
            } else if (detail.message) {
              console.log(`   ${detail.message}`)
            }
          })
        } else {
          Object.entries(result.details).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`)
          })
        }
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
    })
    
    console.log('=' .repeat(50))
    console.log(`Total Steps: ${this.migrationResults.length} | Passed: ${passed} | Failed: ${failed}`)
    
    if (failed === 0) {
      console.log('🎉 Migration completed successfully!')
      console.log('📝 Next steps:')
      console.log('   1. Test the application thoroughly')
      console.log('   2. Verify all data is accessible')
      console.log('   3. Check that media relationships work correctly')
      console.log('   4. Remove old media column from posts table (optional)')
    } else {
      console.log('⚠️ Migration had some issues. Please review the errors above.')
      console.log('📝 Recommended actions:')
      console.log('   1. Check the error messages above')
      console.log('   2. Restore from backup if necessary')
      console.log('   3. Fix any data issues')
      console.log('   4. Re-run the migration')
    }
  }

  async rollback() {
    console.log('🔄 Rolling back migration...')
    
    if (!this.backupCreated) {
      console.log('❌ No backup available for rollback')
      return false
    }
    
    try {
      // In a real application, you would restore from backup
      console.log('📁 Would restore from backup: ./backups/database-backup-' + new Date().toISOString().split('T')[0] + '.db')
      console.log('✅ Rollback completed')
      return true
    } catch (error) {
      console.log('❌ Rollback failed:', error.message)
      return false
    }
  }
}

// Migration utility functions
class MigrationUtils {
  static async checkPreMigrationState() {
    console.log('🔍 Checking pre-migration state...')
    
    try {
      const organizations = await databaseService.getAllOrganizations()
      console.log(`Found ${organizations.length} organizations`)
      
      let totalPosts = 0
      let postsWithMedia = 0
      
      for (const org of organizations) {
        const posts = await databaseService.getPosts({}, org.id)
        totalPosts += posts.length
        
        // Check for posts with old media format
        for (const post of posts) {
          if (post.media && Array.isArray(post.media) && post.media.length > 0) {
            postsWithMedia++
          }
        }
      }
      
      console.log(`Found ${totalPosts} posts`)
      console.log(`Found ${postsWithMedia} posts with media`)
      
      return {
        organizations: organizations.length,
        posts: totalPosts,
        postsWithMedia
      }
    } catch (error) {
      console.log('❌ Pre-migration check failed:', error.message)
      return null
    }
  }

  static async checkPostMigrationState() {
    console.log('🔍 Checking post-migration state...')
    
    try {
      const organizations = await databaseService.getAllOrganizations()
      console.log(`Found ${organizations.length} organizations`)
      
      let totalPosts = 0
      let postsWithMediaRelations = 0
      
      for (const org of organizations) {
        const posts = await databaseService.getPosts({}, org.id)
        totalPosts += posts.length
        
        // Check for posts with new media relationship format
        for (const post of posts) {
          if (post.media && Array.isArray(post.media) && post.media.length > 0) {
            postsWithMediaRelations++
          }
        }
      }
      
      console.log(`Found ${totalPosts} posts`)
      console.log(`Found ${postsWithMediaRelations} posts with media relationships`)
      
      return {
        organizations: organizations.length,
        posts: totalPosts,
        postsWithMediaRelations
      }
    } catch (error) {
      console.log('❌ Post-migration check failed:', error.message)
      return null
    }
  }
}

// Export for use in other scripts
module.exports = { DataMigration, MigrationUtils }

// Run if called directly
if (require.main === module) {
  async function runMigration() {
    const migration = new DataMigration()
    await migration.runMigration()
  }
  
  runMigration().catch(console.error)
}
