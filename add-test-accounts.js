#!/usr/bin/env node

/**
 * Quick Test Account Setup Script
 * 
 * This script adds test social media accounts to the database for testing purposes.
 * Run this to quickly set up test accounts without going through the UI.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');

// Test accounts to add
const testAccounts = [
  {
    id: 'test_linkedin_001',
    platform: 'linkedin',
    accountName: 'Test LinkedIn Account',
    accessToken: 'test_linkedin_token_123',
    refreshToken: null,
    expiresAt: null,
    pageId: null,
    businessAccountId: null,
    organizationId: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test_facebook_001',
    platform: 'facebook',
    accountName: 'Test Facebook Page',
    accessToken: 'test_facebook_token_456',
    refreshToken: null,
    expiresAt: null,
    pageId: 'test_page_123',
    businessAccountId: null,
    organizationId: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test_instagram_001',
    platform: 'instagram',
    accountName: 'Test Instagram Account',
    accessToken: 'test_instagram_token_789',
    refreshToken: null,
    expiresAt: null,
    pageId: null,
    businessAccountId: 'test_ig_123',
    organizationId: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function addTestAccounts() {
  console.log('🔧 Adding test social media accounts...\n');

  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create social_media_accounts table if it doesn't exist
      db.run(`
        CREATE TABLE IF NOT EXISTS social_media_accounts (
          id TEXT PRIMARY KEY,
          platform TEXT NOT NULL,
          account_name TEXT NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          expires_at TEXT,
          page_id TEXT,
          business_account_id TEXT,
          organization_id TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating table:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Social media accounts table ready');

        // Add test accounts
        let addedCount = 0;
        testAccounts.forEach((account, index) => {
          const stmt = db.prepare(`
            INSERT OR REPLACE INTO social_media_accounts 
            (id, platform, account_name, access_token, refresh_token, expires_at, page_id, business_account_id, organization_id, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          stmt.run(
            account.id,
            account.platform,
            account.accountName,
            account.accessToken,
            account.refreshToken,
            account.expiresAt,
            account.pageId,
            account.businessAccountId,
            account.organizationId,
            account.isActive ? 1 : 0,
            account.createdAt,
            account.updatedAt,
            (err) => {
              if (err) {
                console.error(`❌ Error adding ${account.platform} account:`, err.message);
              } else {
                console.log(`✅ Added ${account.platform} test account: ${account.accountName}`);
                addedCount++;
              }

              stmt.finalize();

              // Check if all accounts have been processed
              if (index === testAccounts.length - 1) {
                console.log(`\n🎉 Successfully added ${addedCount} test accounts!`);
                console.log('\n📋 Test Accounts Added:');
                testAccounts.forEach(acc => {
                  console.log(`   - ${acc.platform.toUpperCase()}: ${acc.accountName}`);
                });
                console.log('\n🚀 You can now test posting in the Content Studio!');
                console.log('   Note: These are test accounts and won\'t actually post to real platforms.');
                console.log('   For real posting, follow the setup guide in SOCIAL_MEDIA_SETUP_GUIDE.md');
                
                db.close();
                resolve();
              }
            }
          );
        });
      });
    });
  });
}

// Run the script
if (require.main === module) {
  addTestAccounts()
    .then(() => {
      console.log('\n✅ Setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { addTestAccounts }; 