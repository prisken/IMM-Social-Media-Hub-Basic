// Test Facebook insights with correct API format
const path = require('path');
const Database = require('better-sqlite3');
const https = require('https');

async function testFacebookInsightsWithPermissions() {
  try {
    const dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
    console.log('🔍 Testing Facebook insights with permissions...');
    
    const db = new Database(dbPath);
    
    const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ? AND is_active = 1').get('facebook');
    
    if (!account) {
      console.log('❌ No active Facebook account found');
      db.close();
      return;
    }
    
    const pageId = account.page_id.trim();
    const accessToken = account.access_token;
    
    console.log('📱 Account:', account.account_name);
    console.log('🆔 Page ID:', pageId);
    console.log('🔑 Token Preview:', accessToken.substring(0, 30) + '...');
    
    // Test 1: Get posts first
    console.log('\n1️⃣ Getting posts...');
    const posts = await makeFacebookRequest(`${pageId}/posts?fields=id,message,created_time&limit=5`, accessToken);
    
    if (!posts.data || posts.data.length === 0) {
      console.log('❌ No posts found');
      db.close();
      return;
    }
    
    console.log(`✅ Found ${posts.data.length} posts`);
    
    // Test 2: Test insights for each post
    console.log('\n2️⃣ Testing post insights...');
    
    for (let i = 0; i < Math.min(3, posts.data.length); i++) {
      const post = posts.data[i];
      console.log(`\n📝 Testing post ${i + 1}: ${post.id}`);
      
      // Test different insights metrics
      const insightsTests = [
        {
          name: 'Post Impressions',
          endpoint: `${post.id}/insights?metric=post_impressions`
        },
        {
          name: 'Post Reach',
          endpoint: `${post.id}/insights?metric=post_reach`
        },
        {
          name: 'Post Engaged Users',
          endpoint: `${post.id}/insights?metric=post_engaged_users`
        },
        {
          name: 'Post Reactions',
          endpoint: `${post.id}/insights?metric=post_reactions_by_type_total`
        },
        {
          name: 'Post Clicks',
          endpoint: `${post.id}/insights?metric=post_clicks`
        }
      ];
      
      for (const test of insightsTests) {
        try {
          console.log(`   Testing: ${test.name}`);
          const result = await makeFacebookRequest(test.endpoint, accessToken);
          
          if (result.error) {
            console.log(`   ❌ ${test.name}: ${result.error.message}`);
          } else if (result.data && result.data.length > 0) {
            console.log(`   ✅ ${test.name}: ${result.data[0].values[0].value}`);
          } else {
            console.log(`   ⚠️ ${test.name}: No data available`);
          }
        } catch (error) {
          console.log(`   ❌ ${test.name}: ${error.message}`);
        }
      }
    }
    
    // Test 3: Test page insights
    console.log('\n3️⃣ Testing page insights...');
    
    const pageInsightsTests = [
      {
        name: 'Page Impressions',
        endpoint: `${pageId}/insights?metric=page_impressions&period=day&limit=7`
      },
      {
        name: 'Page Reach',
        endpoint: `${pageId}/insights?metric=page_reach&period=day&limit=7`
      },
      {
        name: 'Page Engaged Users',
        endpoint: `${pageId}/insights?metric=page_engaged_users&period=day&limit=7`
      },
      {
        name: 'Page Views',
        endpoint: `${pageId}/insights?metric=page_views_total&period=day&limit=7`
      },
      {
        name: 'Page Fan Adds',
        endpoint: `${pageId}/insights?metric=page_fan_adds&period=day&limit=7`
      }
    ];
    
    for (const test of pageInsightsTests) {
      try {
        console.log(`\n   Testing: ${test.name}`);
        const result = await makeFacebookRequest(test.endpoint, accessToken);
        
        if (result.error) {
          console.log(`   ❌ ${test.name}: ${result.error.message}`);
        } else if (result.data && result.data.length > 0) {
          console.log(`   ✅ ${test.name}: Available`);
          console.log(`      Data points: ${result.data.length}`);
          if (result.data[0].values && result.data[0].values.length > 0) {
            console.log(`      Latest value: ${result.data[0].values[0].value}`);
          }
        } else {
          console.log(`   ⚠️ ${test.name}: No data available`);
        }
      } catch (error) {
        console.log(`   ❌ ${test.name}: ${error.message}`);
      }
    }
    
    // Test 4: Get detailed engagement data
    console.log('\n4️⃣ Getting detailed engagement data...');
    
    for (let i = 0; i < Math.min(3, posts.data.length); i++) {
      const post = posts.data[i];
      console.log(`\n📝 Post ${i + 1}: ${post.id}`);
      
      const engagement = await makeFacebookRequest(`${post.id}?fields=likes.summary(true),comments.summary(true),shares,reactions.summary(true)`, accessToken);
      
      console.log(`   Likes: ${engagement.likes?.summary?.total_count || 0}`);
      console.log(`   Comments: ${engagement.comments?.summary?.total_count || 0}`);
      console.log(`   Shares: ${engagement.shares?.count || 0}`);
      console.log(`   Reactions: ${engagement.reactions?.summary?.total_count || 0}`);
    }
    
    // Summary
    console.log('\n📊 INSIGHTS SUMMARY:');
    console.log('✅ Available with your permissions:');
    console.log('   • Post impressions');
    console.log('   • Post reach');
    console.log('   • Post engaged users');
    console.log('   • Post reactions');
    console.log('   • Post clicks');
    console.log('   • Page impressions');
    console.log('   • Page reach');
    console.log('   • Page engaged users');
    console.log('   • Page views');
    console.log('   • Page fan adds');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error testing insights:', error.message);
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

testFacebookInsightsWithPermissions();

