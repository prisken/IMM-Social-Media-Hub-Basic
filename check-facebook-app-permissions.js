// Check Facebook app permissions
const path = require('path');
const Database = require('better-sqlite3');
const https = require('https');

async function checkFacebookAppPermissions() {
  try {
    const dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
    console.log('🔍 Checking Facebook app permissions...');
    
    const db = new Database(dbPath);
    
    const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ? AND is_active = 1').get('facebook');
    
    if (!account) {
      console.log('❌ No active Facebook account found');
      db.close();
      return;
    }
    
    const accessToken = account.access_token;
    
    console.log('📱 Account:', account.account_name);
    console.log('🔑 Token Preview:', accessToken.substring(0, 30) + '...');
    
    // Test 1: Check what permissions the token has
    console.log('\n1️⃣ Checking token permissions...');
    const permissions = await makeFacebookRequest('me/permissions', accessToken);
    console.log('Current Permissions:', permissions);
    
    // Test 2: Check app info
    console.log('\n2️⃣ Checking app information...');
    const appInfo = await makeFacebookRequest('app?fields=id,name,app_domains,website_url', accessToken);
    console.log('App Info:', appInfo);
    
    // Test 3: Check if we can access insights with current permissions
    console.log('\n3️⃣ Testing insights access...');
    
    // Get a post first
    const pageId = account.page_id.trim();
    const posts = await makeFacebookRequest(`${pageId}/posts?fields=id&limit=1`, accessToken);
    
    if (posts.data && posts.data.length > 0) {
      const postId = posts.data[0].id;
      
      // Test different insights endpoints
      const insightsTests = [
        {
          name: 'Post Insights - Basic',
          endpoint: `${postId}/insights?metric=post_impressions`
        },
        {
          name: 'Post Insights - Engagement',
          endpoint: `${postId}/insights?metric=post_engaged_users`
        },
        {
          name: 'Post Insights - Reach',
          endpoint: `${postId}/insights?metric=post_reach`
        },
        {
          name: 'Page Insights - Basic',
          endpoint: `${pageId}/insights?metric=page_impressions&period=day&limit=1`
        },
        {
          name: 'Page Insights - Reach',
          endpoint: `${pageId}/insights?metric=page_reach&period=day&limit=1`
        }
      ];
      
      for (const test of insightsTests) {
        try {
          console.log(`\n   Testing: ${test.name}`);
          const result = await makeFacebookRequest(test.endpoint, accessToken);
          
          if (result.error) {
            console.log(`   ❌ ${test.name}: ${result.error.message}`);
            console.log(`      Error Code: ${result.error.code}`);
            if (result.error.error_subcode) {
              console.log(`      Subcode: ${result.error.error_subcode}`);
            }
          } else {
            console.log(`   ✅ ${test.name}: Available`);
            console.log(`      Data:`, result.data ? result.data.length : 'No data');
          }
        } catch (error) {
          console.log(`   ❌ ${test.name}: ${error.message}`);
        }
      }
    }
    
    // Summary
    console.log('\n📊 PERMISSIONS SUMMARY:');
    console.log('✅ Available with current token:');
    console.log('   • Basic page info');
    console.log('   • Post content and engagement');
    console.log('   • Some basic insights metrics');
    console.log('');
    console.log('❌ Requires App Review:');
    console.log('   • post_reach');
    console.log('   • post_engaged_users');
    console.log('   • page_reach');
    console.log('   • page_engaged_users');
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('1. Go to https://developers.facebook.com/');
    console.log('2. Find your app in the dashboard');
    console.log('3. Go to "App Review" → "Permissions and Features"');
    console.log('4. Request: pages_read_insights, pages_read_engagement');
    console.log('5. Submit documentation and wait for approval');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error checking permissions:', error.message);
  }
}

function makeFacebookRequest(endpoint, accessToken) {
  return new Promise((resolve, reject) => {
    const url = `https://graph.facebook.com/v18.0/${endpoint}${endpoint.includes('?') ? '&' : '?'}access_token=${accessToken}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

checkFacebookAppPermissions();

