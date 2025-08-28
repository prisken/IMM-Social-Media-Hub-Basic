#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🧹 Cleaning up mock data from IMM Marketing Hub...\n');

const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');

try {
  const db = new Database(dbPath);
  
  console.log('📊 Before cleanup:');
  
  // Check counts before cleanup
  const beforeCounts = {
    posts: db.prepare("SELECT COUNT(*) as count FROM posts").get().count,
    socialAccounts: db.prepare("SELECT COUNT(*) as count FROM social_media_accounts").get().count,
    analytics: db.prepare("SELECT COUNT(*) as count FROM analytics_metrics").get().count,
    engagement: db.prepare("SELECT COUNT(*) as count FROM engagement_interactions").get().count
  };
  
  Object.entries(beforeCounts).forEach(([key, count]) => {
    console.log(`  ${key}: ${count}`);
  });
  
  console.log('\n🗑️ Removing mock data...');
  
  // Remove mock posts
  const deletedPosts = db.prepare("DELETE FROM posts WHERE content LIKE '%🚀 Exciting news%' OR content LIKE '%Marketing Tip%' OR content LIKE '%Behind the scenes%' OR content LIKE '%Want to boost%' OR content LIKE '%future of marketing%'").run();
  console.log(`  ✅ Removed ${deletedPosts.changes} mock posts`);
  
  // Remove mock social media accounts
  const deletedAccounts = db.prepare("DELETE FROM social_media_accounts WHERE accessToken LIKE '%sample_token%' OR id LIKE '%sample_%'").run();
  console.log(`  ✅ Removed ${deletedAccounts.changes} mock social media accounts`);
  
  // Remove mock analytics
  const deletedAnalytics = db.prepare("DELETE FROM analytics_metrics").run();
  console.log(`  ✅ Removed ${deletedAnalytics.changes} mock analytics records`);
  
  // Remove mock engagement interactions
  const deletedEngagement = db.prepare("DELETE FROM engagement_interactions").run();
  console.log(`  ✅ Removed ${deletedEngagement.changes} mock engagement interactions`);
  
  console.log('\n📊 After cleanup:');
  
  // Check counts after cleanup
  const afterCounts = {
    posts: db.prepare("SELECT COUNT(*) as count FROM posts").get().count,
    socialAccounts: db.prepare("SELECT COUNT(*) as count FROM social_media_accounts").get().count,
    analytics: db.prepare("SELECT COUNT(*) as count FROM analytics_metrics").get().count,
    engagement: db.prepare("SELECT COUNT(*) as count FROM engagement_interactions").get().count
  };
  
  Object.entries(afterCounts).forEach(([key, count]) => {
    console.log(`  ${key}: ${count}`);
  });
  
  db.close();
  
  console.log('\n✅ Mock data cleanup completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('  1. Add real social media accounts');
  console.log('  2. Upload real media files');
  console.log('  3. Create brand voice profiles');
  console.log('  4. Add real products');
  console.log('  5. Test all functionality with real data');
  
} catch (error) {
  console.error('❌ Error during cleanup:', error.message);
  process.exit(1);
}
