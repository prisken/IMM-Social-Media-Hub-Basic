// Test Facebook API with current token from database
const path = require('path');
const Database = require('better-sqlite3');
const https = require('https');

async function testFacebookWithCurrentToken() {
  try {
    const dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
    console.log('🔍 Testing Facebook API with current token from database...');
    
    const db = new Database(dbPath);
    
    // Get the exact Facebook account from database
    const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ? AND is_active = 1').get('facebook');
    
    if (!account) {
      console.log('❌ No active Facebook account found');
      db.close();
      return;
    }
    
    console.log('📱 Account Name:', account.account_name);
    console.log('🆔 Page ID:', account.page_id);
    console.log('🔑 Token Length:', account.access_token ? account.access_token.length : 'NULL');
    console.log('🔑 Token Preview:', account.access_token ? account.access_token.substring(0, 30) + '...' : 'NULL');
    console.log('📅 Last Updated:', account.updated_at);
    
    if (!account.access_token) {
      console.log('❌ No access token found');
      db.close();
      return;
    }
    
    const pageId = account.page_id.trim();
    const accessToken = account.access_token;
    
    console.log('\n🔍 Testing Facebook Graph API with current token...');
    
    // Test 1: Verify token works with page info
    console.log('\n1️⃣ Testing Page Info...');
    const pageInfo = await makeFacebookRequest(`${pageId}?fields=id,name,fan_count,verification_status`, accessToken);
    console.log('✅ Page Info Response:', pageInfo);
    
    if (pageInfo.error) {
      console.log('❌ Page Info Error:', pageInfo.error.message);
      console.log('   Error Code:', pageInfo.error.code);
      console.log('   This suggests the token might be invalid or expired');
      db.close();
      return;
    }
    
    // Test 2: Get posts with current token
    console.log('\n2️⃣ Testing Posts Access...');
    const posts = await makeFacebookRequest(`${pageId}/posts?fields=id,message,created_time,permalink_url&limit=5`, accessToken);
    console.log('✅ Posts Response:', {
      count: posts.data ? posts.data.length : 0,
      hasError: !!posts.error,
      error: posts.error ? posts.error.message : null
    });
    
    if (posts.data && posts.data.length > 0) {
      console.log('📝 Sample Post:', {
        id: posts.data[0].id,
        message: posts.data[0].message ? posts.data[0].message.substring(0, 100) + '...' : 'No message',
        created_time: posts.data[0].created_time
      });
    }
    
    // Test 3: Get real engagement data for posts
    if (posts.data && posts.data.length > 0) {
      console.log('\n3️⃣ Testing Real Post Engagement...');
      
      for (let i = 0; i < Math.min(3, posts.data.length); i++) {
        const post = posts.data[i];
        console.log(`\n   Testing post ${i + 1}: ${post.id}`);
        
        const engagement = await makeFacebookRequest(`${post.id}?fields=likes.summary(true),comments.summary(true),shares`, accessToken);
        console.log(`   ✅ Engagement for ${post.id}:`, {
          likes: engagement.likes?.summary?.total_count || 0,
          comments: engagement.comments?.summary?.total_count || 0,
          shares: engagement.shares?.count || 0,
          hasError: !!engagement.error
        });
        
        if (engagement.error) {
          console.log(`   ❌ Engagement Error: ${engagement.error.message}`);
        }
      }
    }
    
    // Test 4: Try to get insights (this requires special permissions)
    if (posts.data && posts.data.length > 0) {
      console.log('\n4️⃣ Testing Post Insights (requires special permissions)...');
      const firstPost = posts.data[0];
      
      const insights = await makeFacebookRequest(`${firstPost.id}/insights?metric=post_impressions,post_reach,post_engaged_users`, accessToken);
      console.log('📊 Insights Response:', insights);
      
      if (insights.error) {
        console.log('❌ Insights Error:', insights.error.message);
        console.log('   Error Code:', insights.error.code);
        console.log('   Error Subcode:', insights.error.error_subcode);
        console.log('   This means your app needs additional permissions for insights');
      } else if (insights.data) {
        console.log('✅ Insights Available:', insights.data);
      }
    }
    
    // Test 5: Test page insights
    console.log('\n5️⃣ Testing Page Insights...');
    const pageInsights = await makeFacebookRequest(`${pageId}/insights?metric=page_impressions,page_reach,page_engaged_users&period=day&limit=7`, accessToken);
    console.log('📊 Page Insights Response:', pageInsights);
    
    if (pageInsights.error) {
      console.log('❌ Page Insights Error:', pageInsights.error.message);
      console.log('   Error Code:', pageInsights.error.code);
    } else if (pageInsights.data) {
      console.log('✅ Page Insights Available:', pageInsights.data);
    }
    
    // Summary
    console.log('\n📊 SUMMARY OF AVAILABLE DATA WITH CURRENT TOKEN:');
    console.log('✅ Page basic info (name, fan count)');
    console.log('✅ Page posts (content, creation time)');
    console.log('✅ Basic post engagement (likes, comments, shares) - if posts are public');
    console.log('❓ Post insights (reach, impressions) - depends on app permissions');
    console.log('❓ Page insights (page-level analytics) - depends on app permissions');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error testing Facebook with current token:', error.message);
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

testFacebookWithCurrentToken();

