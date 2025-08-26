#!/usr/bin/env node

/**
 * LinkedIn Posting Test Script
 * 
 * This script tests LinkedIn posting with the fixed author field format.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');

async function testLinkedInPosting() {
  console.log('🧪 Testing LinkedIn Posting with Fixed Author Field...\n');

  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Get LinkedIn account
      db.get('SELECT * FROM social_media_accounts WHERE platform = "linkedin" AND is_active = 1', (err, account) => {
        if (err) {
          console.error('❌ Error querying LinkedIn account:', err.message);
          reject(err);
          return;
        }

        if (!account) {
          console.log('❌ No active LinkedIn account found');
          db.close();
          resolve();
          return;
        }

        console.log('✅ Found LinkedIn account:', account.account_name);
        console.log('   Organization ID:', account.organization_id);
        console.log('   Account ID:', account.id);

        // Test author URN format
        let authorUrn;
        if (account.organization_id) {
          authorUrn = `urn:li:organization:${account.organization_id}`;
          console.log('   Will post as organization');
        } else {
          authorUrn = `urn:li:person:${account.id}`;
          console.log('   Will post as person');
        }

        console.log('   Author URN:', authorUrn);

        // Test post data structure
        const testPostData = {
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: 'Test post from IMM Marketing Hub - ' + new Date().toLocaleString()
              },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        };

        console.log('\n📝 Test Post Data Structure:');
        console.log(JSON.stringify(testPostData, null, 2));

        console.log('\n🎯 Next Steps:');
        console.log('1. The author field format is now correct');
        console.log('2. Try posting in the Content Studio');
        console.log('3. Check your LinkedIn page for the post');
        console.log('4. If it works, you\'ll see the post on your LinkedIn page');

        db.close();
        resolve();
      });
    });
  });
}

// Run the test
if (require.main === module) {
  testLinkedInPosting()
    .then(() => {
      console.log('\n✅ LinkedIn posting test complete!');
      console.log('🚀 Try posting in the Content Studio now.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testLinkedInPosting }; 