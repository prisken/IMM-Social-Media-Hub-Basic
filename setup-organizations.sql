-- Organization Setup SQL Script
-- Generated: 2025-09-14T18:57:58.794Z
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
INSERT OR REPLACE INTO organizations (id, name, description, website, logo, settings, created_at, updated_at) VALUES (
  'karma_cookie_org_001',
  'Karma Cookie',
  'A mindful cookie company focused on positive energy and delicious treats',
  'https://karmacookie.com',
  'karma-cookie-logo.png',
  '{"branding":{"primaryColor":"#FF6B6B","secondaryColor":"#4ECDC4"},"preferences":{"defaultTimezone":"America/New_York","autoSave":true,"theme":"light"},"storage":{"maxStorageGB":5,"currentUsageGB":0}}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO organizations (id, name, description, website, logo, settings, created_at, updated_at) VALUES (
  'persona_centric_org_002',
  'Persona Centric',
  'Marketing agency specializing in persona-driven campaigns and brand strategy',
  'https://personacentric.com',
  'persona-centric-logo.png',
  '{"branding":{"primaryColor":"#667EEA","secondaryColor":"#764BA2"},"preferences":{"defaultTimezone":"America/Los_Angeles","autoSave":true,"theme":"dark"},"storage":{"maxStorageGB":10,"currentUsageGB":0}}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO organizations (id, name, description, website, logo, settings, created_at, updated_at) VALUES (
  'imm_limited_org_003',
  'IMM Limited',
  'International Marketing Management - Global business solutions and consulting',
  'https://immlimited.com',
  'imm-limited-logo.png',
  '{"branding":{"primaryColor":"#2C3E50","secondaryColor":"#3498DB"},"preferences":{"defaultTimezone":"Europe/London","autoSave":true,"theme":"light"},"storage":{"maxStorageGB":15,"currentUsageGB":0}}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO organizations (id, name, description, website, logo, settings, created_at, updated_at) VALUES (
  'roleplay_org_004',
  'Roleplay',
  'Interactive entertainment company creating immersive roleplay experiences',
  'https://roleplay-entertainment.com',
  'roleplay-logo.png',
  '{"branding":{"primaryColor":"#E74C3C","secondaryColor":"#F39C12"},"preferences":{"defaultTimezone":"America/Chicago","autoSave":true,"theme":"dark"},"storage":{"maxStorageGB":8,"currentUsageGB":0}}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO organizations (id, name, description, website, logo, settings, created_at, updated_at) VALUES (
  'hk_foodies_org_005',
  'HK Foodies',
  'Hong Kong food blog and restaurant review platform',
  'https://hkfoodies.com',
  'hk-foodies-logo.png',
  '{"branding":{"primaryColor":"#FF4757","secondaryColor":"#FFA502"},"preferences":{"defaultTimezone":"Asia/Hong_Kong","autoSave":true,"theme":"light"},"storage":{"maxStorageGB":12,"currentUsageGB":0}}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO organizations (id, name, description, website, logo, settings, created_at, updated_at) VALUES (
  'half_drinks_org_006',
  '1/2 Drinks',
  'Craft beverage company specializing in unique cocktail mixes and spirits',
  'https://halfdrinks.com',
  'half-drinks-logo.png',
  '{"branding":{"primaryColor":"#8E44AD","secondaryColor":"#E67E22"},"preferences":{"defaultTimezone":"America/New_York","autoSave":true,"theme":"dark"},"storage":{"maxStorageGB":6,"currentUsageGB":0}}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);


-- Insert Categories for each organization
INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'karma_cookie_org_001_cat_1',
  'karma_cookie_org_001',
  'Marketing',
  '#FF6B6B',
  'Marketing and promotional content',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'karma_cookie_org_001_cat_2',
  'karma_cookie_org_001',
  'Product',
  '#4ECDC4',
  'Product-related posts and updates',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'karma_cookie_org_001_cat_3',
  'karma_cookie_org_001',
  'Community',
  '#45B7D1',
  'Community engagement and user-generated content',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'karma_cookie_org_001_cat_4',
  'karma_cookie_org_001',
  'News',
  '#96CEB4',
  'Company news and announcements',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'persona_centric_org_002_cat_1',
  'persona_centric_org_002',
  'Marketing',
  '#FF6B6B',
  'Marketing and promotional content',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'persona_centric_org_002_cat_2',
  'persona_centric_org_002',
  'Product',
  '#4ECDC4',
  'Product-related posts and updates',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'persona_centric_org_002_cat_3',
  'persona_centric_org_002',
  'Community',
  '#45B7D1',
  'Community engagement and user-generated content',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'persona_centric_org_002_cat_4',
  'persona_centric_org_002',
  'News',
  '#96CEB4',
  'Company news and announcements',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'imm_limited_org_003_cat_1',
  'imm_limited_org_003',
  'Marketing',
  '#FF6B6B',
  'Marketing and promotional content',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'imm_limited_org_003_cat_2',
  'imm_limited_org_003',
  'Product',
  '#4ECDC4',
  'Product-related posts and updates',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'imm_limited_org_003_cat_3',
  'imm_limited_org_003',
  'Community',
  '#45B7D1',
  'Community engagement and user-generated content',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'imm_limited_org_003_cat_4',
  'imm_limited_org_003',
  'News',
  '#96CEB4',
  'Company news and announcements',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'roleplay_org_004_cat_1',
  'roleplay_org_004',
  'Marketing',
  '#FF6B6B',
  'Marketing and promotional content',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'roleplay_org_004_cat_2',
  'roleplay_org_004',
  'Product',
  '#4ECDC4',
  'Product-related posts and updates',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'roleplay_org_004_cat_3',
  'roleplay_org_004',
  'Community',
  '#45B7D1',
  'Community engagement and user-generated content',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'roleplay_org_004_cat_4',
  'roleplay_org_004',
  'News',
  '#96CEB4',
  'Company news and announcements',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'hk_foodies_org_005_cat_1',
  'hk_foodies_org_005',
  'Marketing',
  '#FF6B6B',
  'Marketing and promotional content',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'hk_foodies_org_005_cat_2',
  'hk_foodies_org_005',
  'Product',
  '#4ECDC4',
  'Product-related posts and updates',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'hk_foodies_org_005_cat_3',
  'hk_foodies_org_005',
  'Community',
  '#45B7D1',
  'Community engagement and user-generated content',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'hk_foodies_org_005_cat_4',
  'hk_foodies_org_005',
  'News',
  '#96CEB4',
  'Company news and announcements',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'half_drinks_org_006_cat_1',
  'half_drinks_org_006',
  'Marketing',
  '#FF6B6B',
  'Marketing and promotional content',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'half_drinks_org_006_cat_2',
  'half_drinks_org_006',
  'Product',
  '#4ECDC4',
  'Product-related posts and updates',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'half_drinks_org_006_cat_3',
  'half_drinks_org_006',
  'Community',
  '#45B7D1',
  'Community engagement and user-generated content',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO categories (id, organization_id, name, color, description, created_at, updated_at) VALUES (
  'half_drinks_org_006_cat_4',
  'half_drinks_org_006',
  'News',
  '#96CEB4',
  'Company news and announcements',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);


-- Insert Topics for Marketing categories
INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'karma_cookie_org_001_topic_1',
  'karma_cookie_org_001_cat_1',
  'Social Media',
  '#FF6B6B',
  'Marketing topic for social media',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'karma_cookie_org_001_topic_2',
  'karma_cookie_org_001_cat_1',
  'Email Marketing',
  '#4ECDC4',
  'Marketing topic for email marketing',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'karma_cookie_org_001_topic_3',
  'karma_cookie_org_001_cat_1',
  'Content Marketing',
  '#45B7D1',
  'Marketing topic for content marketing',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'karma_cookie_org_001_topic_4',
  'karma_cookie_org_001_cat_1',
  'Paid Advertising',
  '#96CEB4',
  'Marketing topic for paid advertising',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'persona_centric_org_002_topic_1',
  'persona_centric_org_002_cat_1',
  'Social Media',
  '#FF6B6B',
  'Marketing topic for social media',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'persona_centric_org_002_topic_2',
  'persona_centric_org_002_cat_1',
  'Email Marketing',
  '#4ECDC4',
  'Marketing topic for email marketing',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'persona_centric_org_002_topic_3',
  'persona_centric_org_002_cat_1',
  'Content Marketing',
  '#45B7D1',
  'Marketing topic for content marketing',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'persona_centric_org_002_topic_4',
  'persona_centric_org_002_cat_1',
  'Paid Advertising',
  '#96CEB4',
  'Marketing topic for paid advertising',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'imm_limited_org_003_topic_1',
  'imm_limited_org_003_cat_1',
  'Social Media',
  '#FF6B6B',
  'Marketing topic for social media',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'imm_limited_org_003_topic_2',
  'imm_limited_org_003_cat_1',
  'Email Marketing',
  '#4ECDC4',
  'Marketing topic for email marketing',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'imm_limited_org_003_topic_3',
  'imm_limited_org_003_cat_1',
  'Content Marketing',
  '#45B7D1',
  'Marketing topic for content marketing',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'imm_limited_org_003_topic_4',
  'imm_limited_org_003_cat_1',
  'Paid Advertising',
  '#96CEB4',
  'Marketing topic for paid advertising',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'roleplay_org_004_topic_1',
  'roleplay_org_004_cat_1',
  'Social Media',
  '#FF6B6B',
  'Marketing topic for social media',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'roleplay_org_004_topic_2',
  'roleplay_org_004_cat_1',
  'Email Marketing',
  '#4ECDC4',
  'Marketing topic for email marketing',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'roleplay_org_004_topic_3',
  'roleplay_org_004_cat_1',
  'Content Marketing',
  '#45B7D1',
  'Marketing topic for content marketing',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'roleplay_org_004_topic_4',
  'roleplay_org_004_cat_1',
  'Paid Advertising',
  '#96CEB4',
  'Marketing topic for paid advertising',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'hk_foodies_org_005_topic_1',
  'hk_foodies_org_005_cat_1',
  'Social Media',
  '#FF6B6B',
  'Marketing topic for social media',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'hk_foodies_org_005_topic_2',
  'hk_foodies_org_005_cat_1',
  'Email Marketing',
  '#4ECDC4',
  'Marketing topic for email marketing',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'hk_foodies_org_005_topic_3',
  'hk_foodies_org_005_cat_1',
  'Content Marketing',
  '#45B7D1',
  'Marketing topic for content marketing',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'hk_foodies_org_005_topic_4',
  'hk_foodies_org_005_cat_1',
  'Paid Advertising',
  '#96CEB4',
  'Marketing topic for paid advertising',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'half_drinks_org_006_topic_1',
  'half_drinks_org_006_cat_1',
  'Social Media',
  '#FF6B6B',
  'Marketing topic for social media',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'half_drinks_org_006_topic_2',
  'half_drinks_org_006_cat_1',
  'Email Marketing',
  '#4ECDC4',
  'Marketing topic for email marketing',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'half_drinks_org_006_topic_3',
  'half_drinks_org_006_cat_1',
  'Content Marketing',
  '#45B7D1',
  'Marketing topic for content marketing',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO topics (id, category_id, name, color, description, created_at, updated_at) VALUES (
  'half_drinks_org_006_topic_4',
  'half_drinks_org_006_cat_1',
  'Paid Advertising',
  '#96CEB4',
  'Marketing topic for paid advertising',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);


-- Insert Sample Posts
INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  'karma_cookie_org_001_post_1',
  'karma_cookie_org_001',
  'karma_cookie_org_001_cat_1',
  'karma_cookie_org_001_topic_1',
  'Welcome to Karma Cookie',
  'Welcome to Karma Cookie! We are excited to share our journey with you. Follow us for updates, behind-the-scenes content, and exclusive offers.',
  '["#welcome", "#karmacookie"]',
  'instagram',
  'text',
  'published',
  '{"characterCount": 120, "wordCount": 20, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  'karma_cookie_org_001_post_2',
  'karma_cookie_org_001',
  'karma_cookie_org_001_cat_1',
  'karma_cookie_org_001_topic_1',
  'New Product Launch',
  'Exciting news! We are launching something amazing soon. Stay tuned for updates and be the first to know when it is available.',
  '["#newproduct", "#launch", "#excited"]',
  'facebook',
  'text',
  'draft',
  '{"characterCount": 130, "wordCount": 22, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  'persona_centric_org_002_post_1',
  'persona_centric_org_002',
  'persona_centric_org_002_cat_1',
  'persona_centric_org_002_topic_1',
  'Welcome to Persona Centric',
  'Welcome to Persona Centric! We are excited to share our journey with you. Follow us for updates, behind-the-scenes content, and exclusive offers.',
  '["#welcome", "#personacentric"]',
  'instagram',
  'text',
  'published',
  '{"characterCount": 120, "wordCount": 20, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  'persona_centric_org_002_post_2',
  'persona_centric_org_002',
  'persona_centric_org_002_cat_1',
  'persona_centric_org_002_topic_1',
  'New Product Launch',
  'Exciting news! We are launching something amazing soon. Stay tuned for updates and be the first to know when it is available.',
  '["#newproduct", "#launch", "#excited"]',
  'facebook',
  'text',
  'draft',
  '{"characterCount": 130, "wordCount": 22, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  'imm_limited_org_003_post_1',
  'imm_limited_org_003',
  'imm_limited_org_003_cat_1',
  'imm_limited_org_003_topic_1',
  'Welcome to IMM Limited',
  'Welcome to IMM Limited! We are excited to share our journey with you. Follow us for updates, behind-the-scenes content, and exclusive offers.',
  '["#welcome", "#immlimited"]',
  'instagram',
  'text',
  'published',
  '{"characterCount": 120, "wordCount": 20, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  'imm_limited_org_003_post_2',
  'imm_limited_org_003',
  'imm_limited_org_003_cat_1',
  'imm_limited_org_003_topic_1',
  'New Product Launch',
  'Exciting news! We are launching something amazing soon. Stay tuned for updates and be the first to know when it is available.',
  '["#newproduct", "#launch", "#excited"]',
  'facebook',
  'text',
  'draft',
  '{"characterCount": 130, "wordCount": 22, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  'roleplay_org_004_post_1',
  'roleplay_org_004',
  'roleplay_org_004_cat_1',
  'roleplay_org_004_topic_1',
  'Welcome to Roleplay',
  'Welcome to Roleplay! We are excited to share our journey with you. Follow us for updates, behind-the-scenes content, and exclusive offers.',
  '["#welcome", "#roleplay"]',
  'instagram',
  'text',
  'published',
  '{"characterCount": 120, "wordCount": 20, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  'roleplay_org_004_post_2',
  'roleplay_org_004',
  'roleplay_org_004_cat_1',
  'roleplay_org_004_topic_1',
  'New Product Launch',
  'Exciting news! We are launching something amazing soon. Stay tuned for updates and be the first to know when it is available.',
  '["#newproduct", "#launch", "#excited"]',
  'facebook',
  'text',
  'draft',
  '{"characterCount": 130, "wordCount": 22, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  'hk_foodies_org_005_post_1',
  'hk_foodies_org_005',
  'hk_foodies_org_005_cat_1',
  'hk_foodies_org_005_topic_1',
  'Welcome to HK Foodies',
  'Welcome to HK Foodies! We are excited to share our journey with you. Follow us for updates, behind-the-scenes content, and exclusive offers.',
  '["#welcome", "#hkfoodies"]',
  'instagram',
  'text',
  'published',
  '{"characterCount": 120, "wordCount": 20, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  'hk_foodies_org_005_post_2',
  'hk_foodies_org_005',
  'hk_foodies_org_005_cat_1',
  'hk_foodies_org_005_topic_1',
  'New Product Launch',
  'Exciting news! We are launching something amazing soon. Stay tuned for updates and be the first to know when it is available.',
  '["#newproduct", "#launch", "#excited"]',
  'facebook',
  'text',
  'draft',
  '{"characterCount": 130, "wordCount": 22, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  'half_drinks_org_006_post_1',
  'half_drinks_org_006',
  'half_drinks_org_006_cat_1',
  'half_drinks_org_006_topic_1',
  'Welcome to 1/2 Drinks',
  'Welcome to 1/2 Drinks! We are excited to share our journey with you. Follow us for updates, behind-the-scenes content, and exclusive offers.',
  '["#welcome", "#12drinks"]',
  'instagram',
  'text',
  'published',
  '{"characterCount": 120, "wordCount": 20, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO posts (id, organization_id, category_id, topic_id, title, content, hashtags, platform, type, status, metadata, created_at, updated_at) VALUES (
  'half_drinks_org_006_post_2',
  'half_drinks_org_006',
  'half_drinks_org_006_cat_1',
  'half_drinks_org_006_topic_1',
  'New Product Launch',
  'Exciting news! We are launching something amazing soon. Stay tuned for updates and be the first to know when it is available.',
  '["#newproduct", "#launch", "#excited"]',
  'facebook',
  'text',
  'draft',
  '{"characterCount": 130, "wordCount": 22, "readingTime": 1, "lastEditedBy": "system", "version": 1}',
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);


-- Insert Post Templates
INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  'karma_cookie_org_001_template_1',
  'karma_cookie_org_001',
  'Product Announcement',
  '🎉 Exciting news! We are thrilled to announce our latest product: {{product_name}}. {{product_description}}. Available now! #newproduct #{{brand_hashtag}}',
  '["#newproduct", "#announcement"]',
  'instagram',
  'text',
  1,
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  'karma_cookie_org_001_template_2',
  'karma_cookie_org_001',
  'Behind the Scenes',
  'Behind the scenes at {{company_name}}! Here is a glimpse of our team working on {{project_name}}. #behindthescenes #teamwork #{{brand_hashtag}}',
  '["#behindthescenes", "#teamwork"]',
  'instagram',
  'image',
  0,
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  'persona_centric_org_002_template_1',
  'persona_centric_org_002',
  'Product Announcement',
  '🎉 Exciting news! We are thrilled to announce our latest product: {{product_name}}. {{product_description}}. Available now! #newproduct #{{brand_hashtag}}',
  '["#newproduct", "#announcement"]',
  'instagram',
  'text',
  1,
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  'persona_centric_org_002_template_2',
  'persona_centric_org_002',
  'Behind the Scenes',
  'Behind the scenes at {{company_name}}! Here is a glimpse of our team working on {{project_name}}. #behindthescenes #teamwork #{{brand_hashtag}}',
  '["#behindthescenes", "#teamwork"]',
  'instagram',
  'image',
  0,
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  'imm_limited_org_003_template_1',
  'imm_limited_org_003',
  'Product Announcement',
  '🎉 Exciting news! We are thrilled to announce our latest product: {{product_name}}. {{product_description}}. Available now! #newproduct #{{brand_hashtag}}',
  '["#newproduct", "#announcement"]',
  'instagram',
  'text',
  1,
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  'imm_limited_org_003_template_2',
  'imm_limited_org_003',
  'Behind the Scenes',
  'Behind the scenes at {{company_name}}! Here is a glimpse of our team working on {{project_name}}. #behindthescenes #teamwork #{{brand_hashtag}}',
  '["#behindthescenes", "#teamwork"]',
  'instagram',
  'image',
  0,
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  'roleplay_org_004_template_1',
  'roleplay_org_004',
  'Product Announcement',
  '🎉 Exciting news! We are thrilled to announce our latest product: {{product_name}}. {{product_description}}. Available now! #newproduct #{{brand_hashtag}}',
  '["#newproduct", "#announcement"]',
  'instagram',
  'text',
  1,
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  'roleplay_org_004_template_2',
  'roleplay_org_004',
  'Behind the Scenes',
  'Behind the scenes at {{company_name}}! Here is a glimpse of our team working on {{project_name}}. #behindthescenes #teamwork #{{brand_hashtag}}',
  '["#behindthescenes", "#teamwork"]',
  'instagram',
  'image',
  0,
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  'hk_foodies_org_005_template_1',
  'hk_foodies_org_005',
  'Product Announcement',
  '🎉 Exciting news! We are thrilled to announce our latest product: {{product_name}}. {{product_description}}. Available now! #newproduct #{{brand_hashtag}}',
  '["#newproduct", "#announcement"]',
  'instagram',
  'text',
  1,
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  'hk_foodies_org_005_template_2',
  'hk_foodies_org_005',
  'Behind the Scenes',
  'Behind the scenes at {{company_name}}! Here is a glimpse of our team working on {{project_name}}. #behindthescenes #teamwork #{{brand_hashtag}}',
  '["#behindthescenes", "#teamwork"]',
  'instagram',
  'image',
  0,
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  'half_drinks_org_006_template_1',
  'half_drinks_org_006',
  'Product Announcement',
  '🎉 Exciting news! We are thrilled to announce our latest product: {{product_name}}. {{product_description}}. Available now! #newproduct #{{brand_hashtag}}',
  '["#newproduct", "#announcement"]',
  'instagram',
  'text',
  1,
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

INSERT OR REPLACE INTO post_templates (id, organization_id, name, content, hashtags, platform, type, is_default, created_at, updated_at) VALUES (
  'half_drinks_org_006_template_2',
  'half_drinks_org_006',
  'Behind the Scenes',
  'Behind the scenes at {{company_name}}! Here is a glimpse of our team working on {{project_name}}. #behindthescenes #teamwork #{{brand_hashtag}}',
  '["#behindthescenes", "#teamwork"]',
  'instagram',
  'image',
  0,
  '2025-09-14T18:57:58.794Z',
  '2025-09-14T18:57:58.794Z'
);

