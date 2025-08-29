// Test Facebook permissions and available data
const path = require('path');
const Database = require('better-sqlite3');
const https = require('https');

async function testFacebookPermissions() {
  try {
    const dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
    console.log('🔍 Testing Facebook permissions and available data...');
    
    const db = new Database(dbPath);
    
    // Get Facebook account
    const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ? AND is_active = 1').get('facebook');
    
    if (!account) {
      console.log('❌ No active Facebook account found');
      db.close();
      return;
    }
    
    console.log('📱 Account:', account.account_name);
    console.log('🆔 Page ID:', account.page_id);
    console.log('🔑 Token Preview:', account.access_token ? account.access_token.substring(0, 20) + '...' : 'NULL');
    
    if (!account.access_token) {
      console.log('❌ No access token found');
      db.close();
      return;
    }
    
    const pageId = account.page_id.trim();
    const accessToken = account.access_token;
    
    console.log('\n🔍 Testing Facebook Graph API permissions...');
    
    // Test 1: Get token info and permissions
    console.log('\n1️⃣ Testing Token Info...');
    const tokenInfo = await makeFacebookRequest('me?fields=id,name,permissions', accessToken);
    console.log('Token Info:', tokenInfo);
    
    // Test 2: Get page info
    console.log('\n2️⃣ Testing Page Info...');
    const pageInfo = await makeFacebookRequest(`${pageId}?fields=id,name,fan_count,verification_status,access_token`, accessToken);
    console.log('Page Info:', pageInfo);
    
    // Test 3: Get posts
    console.log('\n3️⃣ Testing Posts Access...');
    const posts = await makeFacebookRequest(`${pageId}/posts?fields=id,message,created_time,permalink_url&limit=5`, accessToken);
    console.log('Posts found:', posts.data ? posts.data.length : 0);
    if (posts.data && posts.data.length > 0) {
      console.log('Sample post:', {
        id: posts.data[0].id,
        message: posts.data[0].message ? posts.data[0].message.substring(0, 100) + '...' : 'No message',
        created_time: posts.data[0].created_time
      });
    }
    
    // Test 4: Get basic post engagement (this should work with basic permissions)
    if (posts.data && posts.data.length > 0) {
      const firstPost = posts.data[0];
      console.log('\n4️⃣ Testing Basic Post Engagement...');
      console.log('Testing engagement for post:', firstPost.id);
      
      const postEngagement = await makeFacebookRequest(`${firstPost.id}?fields=likes.summary(true),comments.summary(true),shares`, accessToken);
      console.log('Post Engagement:', postEngagement);
    }
    
    // Test 5: Test insights permissions (this requires special permissions)
    if (posts.data && posts.data.length > 0) {
      const firstPost = posts.data[0];
      console.log('\n5️⃣ Testing Post Insights (requires special permissions)...');
      
      const insights = await makeFacebookRequest(`${firstPost.id}/insights?metric=post_impressions,post_reach,post_engaged_users`, accessToken);
      console.log('Post Insights:', insights);
      
      if (insights.error) {
        console.log('❌ Insights Error:', insights.error.message);
        console.log('   Error Code:', insights.error.code);
        console.log('   Error Subcode:', insights.error.error_subcode);
        console.log('   This means your app needs additional permissions for insights');
      }
    }
    
    // Test 6: Test page insights
    console.log('\n6️⃣ Testing Page Insights...');
    const pageInsights = await makeFacebookRequest(`${pageId}/insights?metric=page_impressions,page_reach,page_engaged_users&period=day&limit=7`, accessToken);
    console.log('Page Insights:', pageInsights);
    
    if (pageInsights.error) {
      console.log('❌ Page Insights Error:', pageInsights.error.message);
      console.log('   Error Code:', pageInsights.error.code);
    }
    
    // Test 7: Test page posts with engagement
    console.log('\n7️⃣ Testing Page Posts with Engagement...');
    const postsWithEngagement = await makeFacebookRequest(`${pageId}/posts?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares&limit=3`, accessToken);
    console.log('Posts with Engagement:', postsWithEngagement);
    
    // Test 8: Check what metrics are available
    console.log('\n8️⃣ Testing Available Metrics...');
    const availableMetrics = await makeFacebookRequest(`${pageId}/insights?metric=page_impressions&period=day&limit=1`, accessToken);
    console.log('Available Metrics Test:', availableMetrics);
    
    db.close();
    
    // Summary
    console.log('\n📊 SUMMARY OF AVAILABLE DATA:');
    console.log('✅ Basic page info (name, fan count)');
    console.log('✅ Page posts (content, creation time)');
    console.log('✅ Basic post engagement (likes, comments, shares) - if posts are public');
    console.log('❓ Post insights (reach, impressions) - requires special permissions');
    console.log('❓ Page insights (page-level analytics) - requires special permissions');
    
  } catch (error) {
    console.error('❌ Error testing Facebook permissions:', error.message);
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

testFacebookPermissions();

