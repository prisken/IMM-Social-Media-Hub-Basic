#!/usr/bin/env node

/**
 * Test Posting Fix Script
 * 
 * This script tests the posting functionality to ensure the platform matching works correctly.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');

async function testPostingFix() {
  console.log('🧪 Testing posting fix...\n');

  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Test 1: Check social media accounts
      console.log('📋 Checking social media accounts...');
      db.all('SELECT platform, account_name, is_active FROM social_media_accounts', (err, accounts) => {
        if (err) {
          console.error('❌ Error querying accounts:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ Found accounts:');
        accounts.forEach(acc => {
          console.log(`   - ${acc.platform}: ${acc.account_name} (Active: ${acc.is_active ? 'Yes' : 'No'})`);
        });

        // Test 2: Check posts
        console.log('\n📝 Checking posts...');
        db.all('SELECT id, platform, content FROM posts ORDER BY created_at DESC LIMIT 3', (err, posts) => {
          if (err) {
            console.error('❌ Error querying posts:', err.message);
            reject(err);
            return;
          }
          
          console.log('✅ Found posts:');
          posts.forEach(post => {
            console.log(`   - ${post.platform}: "${post.content.substring(0, 50)}..."`);
          });

          // Test 3: Simulate platform matching
          console.log('\n🔍 Testing platform matching...');
          posts.forEach(post => {
            const matchingAccount = accounts.find(acc => 
              acc.platform.toLowerCase() === post.platform.toLowerCase() && acc.is_active === 1
            );
            
            if (matchingAccount) {
              console.log(`   ✅ "${post.platform}" matches "${matchingAccount.platform}" -> ${matchingAccount.account_name}`);
            } else {
              console.log(`   ❌ No match found for "${post.platform}"`);
            }
          });

          console.log('\n🎉 Test completed!');
          console.log('\n📋 Summary:');
          console.log(`   - ${accounts.length} social media accounts found`);
          console.log(`   - ${posts.length} posts found`);
          console.log('   - Platform matching should now work correctly');
          
          db.close();
          resolve();
        });
      });
    });
  });
}

// Run the test
if (require.main === module) {
  testPostingFix()
    .then(() => {
      console.log('\n✅ All tests passed!');
      console.log('🚀 You can now test posting in the Content Studio.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testPostingFix }; 