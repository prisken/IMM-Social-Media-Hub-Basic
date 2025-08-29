// Test the updated Facebook fetcher with real insights
const path = require('path');
const Database = require('better-sqlite3');

async function testFacebookRealInsights() {
  try {
    const dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
    console.log('🔍 Testing updated Facebook fetcher with real insights...');
    
    const db = new Database(dbPath);
    
    // Get Facebook account
    const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ? AND is_active = 1').get('facebook');
    
    if (!account) {
      console.log('❌ No active Facebook account found');
      db.close();
      return;
    }
    
    console.log('📱 Using Facebook account:', account.account_name);
    console.log('🔑 Token length:', account.access_token.length);
    
    // Test fetching a single post with real insights
    const posts = db.prepare('SELECT * FROM posts WHERE platform = ? LIMIT 1').all('facebook');
    
    if (posts.length === 0) {
      console.log('❌ No Facebook posts found in database');
      db.close();
      return;
    }
    
    const post = posts[0];
    console.log(`\n📝 Testing post: ${post.id}`);
    console.log(`   Content: ${post.content.substring(0, 100)}...`);
    
    // Test fetching real insights for this post
    const accessToken = account.access_token;
    const postId = post.id;
    
    console.log('\n🔍 Testing real insights API calls...');
    
    // Test basic post data
    const postUrl = `https://graph.facebook.com/v23.0/${postId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${accessToken}`;
    const postResponse = await fetch(postUrl);
    const postData = await postResponse.json();
    
    console.log('📊 Basic post data:');
    console.log(`   Likes: ${postData.likes?.summary?.total_count || 0}`);
    console.log(`   Comments: ${postData.comments?.summary?.total_count || 0}`);
    console.log(`   Shares: ${postData.shares?.count || 0}`);
    
    // Test real insights
    const insightsUrl = `https://graph.facebook.com/v23.0/${postId}/insights?metric=post_impressions,post_reactions_by_type_total,post_clicks&access_token=${accessToken}`;
    const insightsResponse = await fetch(insightsUrl);
    const insightsData = await insightsResponse.json();
    
    console.log('\n📈 Real insights data:');
    if (insightsData.error) {
      console.log(`   ❌ Error: ${insightsData.error.message}`);
    } else if (insightsData.data) {
      insightsData.data.forEach(metric => {
        console.log(`   ✅ ${metric.name}: ${metric.values?.[0]?.value || 0}`);
      });
    } else {
      console.log('   ⚠️ No insights data available');
    }
    
    // Check current analytics in database
    const analytics = db.prepare('SELECT * FROM analytics_metrics WHERE post_id = ?').all(post.id);
    console.log('\n💾 Current analytics in database:');
    analytics.forEach(metric => {
      console.log(`   Reach: ${metric.reach}`);
      console.log(`   Impressions: ${metric.impressions}`);
      console.log(`   Likes: ${metric.likes}`);
      console.log(`   Comments: ${metric.comments}`);
      console.log(`   Shares: ${metric.shares}`);
      console.log(`   Clicks: ${metric.clicks}`);
      console.log(`   Engagement Rate: ${metric.engagement_rate}%`);
    });
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFacebookRealInsights();
