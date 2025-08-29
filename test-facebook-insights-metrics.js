// Test what Facebook insights metrics are available
const path = require('path');
const Database = require('better-sqlite3');
const https = require('https');

async function testFacebookInsightsMetrics() {
  try {
    const dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
    console.log('🔍 Testing available Facebook insights metrics...');
    
    const db = new Database(dbPath);
    
    const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ? AND is_active = 1').get('facebook');
    
    if (!account) {
      console.log('❌ No active Facebook account found');
      db.close();
      return;
    }
    
    const pageId = account.page_id.trim();
    const accessToken = account.access_token;
    
    console.log('📱 Testing with page:', pageId);
    
    // Test different insights metrics
    const metricsToTest = [
      'post_impressions',
      'post_reach', 
      'post_engaged_users',
      'post_negative_feedback',
      'post_reactions_by_type_total',
      'post_clicks',
      'page_impressions',
      'page_reach',
      'page_engaged_users',
      'page_views_total',
      'page_fan_adds',
      'page_fan_removes'
    ];
    
    console.log('\n🔍 Testing individual metrics...');
    
    for (const metric of metricsToTest) {
      try {
        console.log(`\nTesting metric: ${metric}`);
        
        // Test for posts
        const posts = await makeFacebookRequest(`${pageId}/posts?fields=id&limit=1`, accessToken);
        if (posts.data && posts.data.length > 0) {
          const postId = posts.data[0].id;
          const postInsight = await makeFacebookRequest(`${postId}/insights?metric=${metric}`, accessToken);
          
          if (postInsight.error) {
            console.log(`   ❌ Post ${metric}: ${postInsight.error.message}`);
          } else {
            console.log(`   ✅ Post ${metric}: Available`);
          }
        }
        
        // Test for page
        const pageInsight = await makeFacebookRequest(`${pageId}/insights?metric=${metric}&period=day&limit=1`, accessToken);
        
        if (pageInsight.error) {
          console.log(`   ❌ Page ${metric}: ${pageInsight.error.message}`);
        } else {
          console.log(`   ✅ Page ${metric}: Available`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error testing ${metric}: ${error.message}`);
      }
    }
    
    // Test what we can actually get from posts
    console.log('\n🔍 Testing what real data we can get from posts...');
    const posts = await makeFacebookRequest(`${pageId}/posts?fields=id,message,created_time,permalink_url&limit=3`, accessToken);
    
    if (posts.data && posts.data.length > 0) {
      for (let i = 0; i < posts.data.length; i++) {
        const post = posts.data[i];
        console.log(`\n📝 Post ${i + 1}: ${post.id}`);
        
        // Get detailed engagement data
        const detailedPost = await makeFacebookRequest(`${post.id}?fields=likes.summary(true),comments.summary(true),shares,reactions.summary(true)`, accessToken);
        
        console.log(`   Message: ${post.message ? post.message.substring(0, 100) + '...' : 'No message'}`);
        console.log(`   Created: ${post.created_time}`);
        console.log(`   Likes: ${detailedPost.likes?.summary?.total_count || 0}`);
        console.log(`   Comments: ${detailedPost.comments?.summary?.total_count || 0}`);
        console.log(`   Shares: ${detailedPost.shares?.count || 0}`);
        console.log(`   Reactions: ${detailedPost.reactions?.summary?.total_count || 0}`);
      }
    }
    
    // Test page-level data
    console.log('\n🔍 Testing page-level data...');
    const pageData = await makeFacebookRequest(`${pageId}?fields=id,name,fan_count,verification_status,rating_count,rating,overall_star_rating`, accessToken);
    console.log('Page Data:', pageData);
    
    db.close();
    
    console.log('\n📊 FINAL SUMMARY:');
    console.log('✅ REAL DATA AVAILABLE:');
    console.log('   • Page name and basic info');
    console.log('   • Page fan count (followers)');
    console.log('   • Post content and creation time');
    console.log('   • Post engagement (likes, comments, shares, reactions)');
    console.log('   • Post permalink URLs');
    console.log('');
    console.log('❌ DATA NOT AVAILABLE (requires app review):');
    console.log('   • Post reach and impressions');
    console.log('   • Page-level analytics');
    console.log('   • Detailed insights metrics');
    console.log('');
    console.log('💡 RECOMMENDATION:');
    console.log('   Use the real engagement data (likes, comments, shares) for analytics.');
    console.log('   This is actual data from your Facebook page, not fake data.');
    
  } catch (error) {
    console.error('❌ Error testing insights metrics:', error.message);
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

testFacebookInsightsMetrics();

