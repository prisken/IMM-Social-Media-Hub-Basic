import { readFileSync } from 'fs'
import { join } from 'path'

export interface MigrationResult {
  success: boolean
  version: string
  message: string
  error?: string
}

export class MigrationService {
  private currentVersion: string = '1.0.0'
  private targetVersion: string = '2.0.0'

  constructor() {
    this.runMigrations = this.runMigrations.bind(this)
  }

  async runMigrations(): Promise<MigrationResult[]> {
    const results: MigrationResult[] = []
    
    try {
      // Check current schema version
      const currentVersion = await this.getCurrentSchemaVersion()
      console.log('Current schema version:', currentVersion)
      
      if (currentVersion === this.targetVersion) {
        console.log('Database is already up to date')
        return [{
          success: true,
          version: this.targetVersion,
          message: 'Database is already up to date'
        }]
      }

      // Run migrations
      const migrationResult = await this.executeMigration()
      results.push(migrationResult)

      if (migrationResult.success) {
        // Update schema version
        await this.updateSchemaVersion(this.targetVersion, 'Refactored database schema with proper relationships and indexes')
      }

      return results
    } catch (error) {
      console.error('Migration failed:', error)
      results.push({
        success: false,
        version: this.targetVersion,
        message: 'Migration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return results
    }
  }

  private async getCurrentSchemaVersion(): Promise<string> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.db.query(
          'SELECT version FROM schema_version ORDER BY applied_at DESC LIMIT 1'
        )
        return result.length > 0 ? result[0].version : '1.0.0'
      }
      return '1.0.0'
    } catch (error) {
      console.log('Schema version table does not exist, assuming version 1.0.0')
      return '1.0.0'
    }
  }

  private async executeMigration(): Promise<MigrationResult> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Read migration SQL file
        const migrationSQL = this.getMigrationSQL()
        
        // Execute migration in a transaction
        const operations = migrationSQL
          .split(';')
          .map(sql => sql.trim())
          .filter(sql => sql.length > 0 && !sql.startsWith('--'))
          .map(sql => ({ sql: sql + ';' }))

        await window.electronAPI.db.transaction(operations)
        
        return {
          success: true,
          version: this.targetVersion,
          message: 'Database migration completed successfully'
        }
      } else {
        return {
          success: false,
          version: this.targetVersion,
          message: 'Migration not available in browser environment',
          error: 'Electron API not available'
        }
      }
    } catch (error) {
      console.error('Migration execution failed:', error)
      return {
        success: false,
        version: this.targetVersion,
        message: 'Migration execution failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private getMigrationSQL(): string {
    // In a real application, you would read this from a file
    // For now, we'll return the migration SQL directly
    return `
      -- Migration 1: Add missing fields to organizations table
      ALTER TABLE organizations ADD COLUMN description TEXT;
      ALTER TABLE organizations ADD COLUMN website TEXT;
      ALTER TABLE organizations ADD COLUMN logo TEXT;

      -- Migration 2: Add post_media relationship table
      CREATE TABLE IF NOT EXISTS post_media (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        media_file_id TEXT NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE,
        UNIQUE(post_id, media_file_id)
      );

      -- Migration 3: Add missing indexes
      CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
      CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
      CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
      CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
      CREATE INDEX IF NOT EXISTS idx_topics_name ON topics(name);
      CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at);
      CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON post_media(post_id);
      CREATE INDEX IF NOT EXISTS idx_post_media_media_file_id ON post_media(media_file_id);
      CREATE INDEX IF NOT EXISTS idx_post_media_order ON post_media(order_index);
      CREATE INDEX IF NOT EXISTS idx_calendar_events_post_id ON calendar_events(post_id);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_post_templates_organization_id ON post_templates(organization_id);
      CREATE INDEX IF NOT EXISTS idx_post_templates_platform ON post_templates(platform);
      CREATE INDEX IF NOT EXISTS idx_post_templates_type ON post_templates(type);

      -- Migration 4: Update default values for JSON columns
      UPDATE posts SET hashtags = '[]' WHERE hashtags IS NULL OR hashtags = '';
      UPDATE posts SET metadata = '{}' WHERE metadata IS NULL OR metadata = '';
      UPDATE media_files SET metadata = '{}' WHERE metadata IS NULL OR metadata = '';
      UPDATE organizations SET settings = '{}' WHERE settings IS NULL OR settings = '';

      -- Migration 5: Create version tracking table
      CREATE TABLE IF NOT EXISTS schema_version (
        version TEXT PRIMARY KEY,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT
      );

      -- Migration 6: Add missing organization_id column to media_files table
      ALTER TABLE media_files ADD COLUMN organization_id TEXT;
      
      -- Migration 7: Add missing created_at column to media_files table
      ALTER TABLE media_files ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
    `
  }

  private async updateSchemaVersion(version: string, description: string): Promise<void> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      await window.electronAPI.db.execute(
        'INSERT OR REPLACE INTO schema_version (version, description) VALUES (?, ?)',
        [version, description]
      )
    }
  }

  async migratePostMediaData(): Promise<MigrationResult> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Get all posts with media data
        const posts = await window.electronAPI.db.query(
          'SELECT id, media FROM posts WHERE media IS NOT NULL AND media != "[]" AND media != ""'
        )

        let migratedCount = 0
        for (const post of posts) {
          try {
            const mediaArray = JSON.parse(post.media)
            if (Array.isArray(mediaArray) && mediaArray.length > 0) {
              // Create post_media relationships
              for (let i = 0; i < mediaArray.length; i++) {
                const mediaId = mediaArray[i]
                const postMediaId = this.generateId()
                
                await window.electronAPI.db.execute(
                  'INSERT INTO post_media (id, post_id, media_file_id, order_index) VALUES (?, ?, ?, ?)',
                  [postMediaId, post.id, mediaId, i]
                )
              }
              migratedCount++
            }
          } catch (error) {
            console.warn(`Failed to migrate media for post ${post.id}:`, error)
          }
        }

        return {
          success: true,
          version: this.targetVersion,
          message: `Migrated media data for ${migratedCount} posts`
        }
      } else {
        return {
          success: false,
          version: this.targetVersion,
          message: 'Media migration not available in browser environment',
          error: 'Electron API not available'
        }
      }
    } catch (error) {
      return {
        success: false,
        version: this.targetVersion,
        message: 'Media migration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }
}

// Singleton instance
export const migrationService = new MigrationService()
