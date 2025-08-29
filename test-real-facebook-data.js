// Test real Facebook data fetching
const path = require('path');
const Database = require('better-sqlite3');
const https = require('https');

async function testRealFacebookData() {
  try {
    const dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
    console.log('🔍 Testing real Facebook data fetching...');
    
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
    
    if (!account.accessToken) {
      console.log('❌ No access token found');
      db.close();
      return;
    }
    
    const pageId = account.pageId.trim();
    const accessToken = account.accessToken;
    
    console.log('\n🔍 Testing Facebook Graph API endpoints...');
    
    // Test 1: Get page info
    console.log('\n1️⃣ Testing Page Info...');
    const pageInfo = await makeFacebookRequest(`${pageId}?fields=id,name,fan_count,verification_status`, accessToken);
    console.log('Page Info:', pageInfo);
    
    // Test 2: Get posts
    console.log('\n2️⃣ Testing Posts...');
    const posts = await makeFacebookRequest(`${pageId}/posts?fields=id,message,created_time,permalink_url&limit=10`, accessToken);
    console.log('Posts found:', posts.data ? posts.data.length : 0);
    if (posts.data && posts.data.length > 0) {
      console.log('Sample post:', posts.data[0]);
    }
    
    // Test 3: Get post insights (this is where real analytics come from)
    if (posts.data && posts.data.length > 0) {
      const firstPost = posts.data[0];
      console.log('\n3️⃣ Testing Post Insights...');
      console.log('Testing insights for post:', firstPost.id);
      
      // Try different insight endpoints
      const insightEndpoints = [
        `${firstPost.id}/insights?metric=post_impressions,post_reach,post_engaged_users,post_negative_feedback&access_token=${accessToken}`,
        `${firstPost.id}?fields=likes.summary(true),comments.summary(true),shares&access_token=${accessToken}`,
        `${firstPost.id}/insights?metric=post_impressions&access_token=${accessToken}`
      ];
      
      for (let i = 0; i < insightEndpoints.length; i++) {
        try {
          console.log(`\n   Testing endpoint ${i + 1}:`);
          const insights = await makeFacebookRequest(insightEndpoints[i].replace(`&access_token=${accessToken}`, ''), accessToken);
          console.log(`   Result:`, insights);
          
          if (insights.error) {
            console.log(`   ❌ Error: ${insights.error.message} (Code: ${insights.error.code})`);
            if (insights.error.error_subcode) {
              console.log(`   Subcode: ${insights.error.error_subcode}`);
            }
          }
        } catch (error) {
          console.log(`   ❌ Request failed:`, error.message);
        }
      }
    }
    
    // Test 4: Check page insights
    console.log('\n4️⃣ Testing Page Insights...');
    const pageInsights = await makeFacebookRequest(`${pageId}/insights?metric=page_impressions,page_reach,page_engaged_users&period=day&limit=7`, accessToken);
    console.log('Page Insights:', pageInsights);
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error testing Facebook data:', error.message);
  }
}

function makeFacebookRequest(endpoint, accessToken) {
  return new Promise((resolve, reject) => {
    const url = `https://graph.facebook.com/v18.0/${endpoint}${endpoint.includes('?') ? '&' : '?'}access_token=${accessToken}`;
    
    console.log(`   📡 Requesting: ${endpoint}`);
    
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

testRealFacebookData();

