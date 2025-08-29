// Check current analytics data in the database
const path = require('path');
const Database = require('better-sqlite3');

try {
  const dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
  console.log('🔍 Checking current analytics data...');
  
  const db = new Database(dbPath);
  
  // Check posts
  const posts = db.prepare('SELECT * FROM posts WHERE platform = ?').all('facebook');
  console.log(`\n📝 Facebook Posts: ${posts.length}`);
  posts.forEach((post, index) => {
    console.log(`  ${index + 1}. ID: ${post.id}`);
    console.log(`     Content: ${post.content.substring(0, 50)}...`);
    console.log(`     Status: ${post.status}`);
    console.log(`     Created: ${post.created_at}`);
  });
  
  // Check analytics metrics
  const analytics = db.prepare('SELECT * FROM analytics_metrics WHERE platform = ?').all('facebook');
  console.log(`\n📊 Facebook Analytics Records: ${analytics.length}`);
  analytics.forEach((metric, index) => {
    console.log(`  ${index + 1}. Post ID: ${metric.post_id}`);
    console.log(`     Reach: ${metric.reach}`);
    console.log(`     Impressions: ${metric.impressions}`);
    console.log(`     Likes: ${metric.likes}`);
    console.log(`     Comments: ${metric.comments}`);
    console.log(`     Shares: ${metric.shares}`);
    console.log(`     Engagement Rate: ${metric.engagement_rate}%`);
  });
  
  // Calculate totals
  const totalReach = analytics.reduce((sum, metric) => sum + metric.reach, 0);
  const totalEngagement = analytics.reduce((sum, metric) => 
    sum + metric.likes + metric.comments + metric.shares, 0);
  const avgEngagementRate = analytics.length > 0 ? 
    analytics.reduce((sum, metric) => sum + metric.engagement_rate, 0) / analytics.length : 0;
  
  console.log(`\n📈 Summary:`);
  console.log(`   Total Posts: ${posts.length}`);
  console.log(`   Total Analytics Records: ${analytics.length}`);
  console.log(`   Total Reach: ${totalReach}`);
  console.log(`   Total Engagement: ${totalEngagement}`);
  console.log(`   Average Engagement Rate: ${avgEngagementRate.toFixed(2)}%`);
  
  db.close();
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

