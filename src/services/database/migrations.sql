-- Database Migration Scripts
-- Version: 2.0.0
-- This file contains migration scripts to update the database schema

-- Migration 1: Add missing fields to organizations table
ALTER TABLE organizations ADD COLUMN description TEXT;
ALTER TABLE organizations ADD COLUMN website TEXT;
ALTER TABLE organizations ADD COLUMN logo TEXT;

-- Migration 2: Update posts table to remove media column (now handled by post_media table)
-- Note: This migration will need to be handled carefully to preserve existing data
-- The media column will be removed after data migration to post_media table

-- Migration 3: Add post_media relationship table
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

-- Migration 4: Add missing indexes
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

-- Migration 5: Update default values for JSON columns
UPDATE posts SET hashtags = '[]' WHERE hashtags IS NULL OR hashtags = '';
UPDATE posts SET metadata = '{}' WHERE metadata IS NULL OR metadata = '';
UPDATE media_files SET metadata = '{}' WHERE metadata IS NULL OR metadata = '';
UPDATE organizations SET settings = '{}' WHERE settings IS NULL OR settings = '';

-- Migration 6: Create version tracking table
CREATE TABLE IF NOT EXISTS schema_version (
  version TEXT PRIMARY KEY,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- Insert current version
INSERT OR REPLACE INTO schema_version (version, description) 
VALUES ('2.0.0', 'Refactored database schema with proper relationships and indexes');
