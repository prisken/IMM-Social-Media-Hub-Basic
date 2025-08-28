#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🧹 Safe cleanup of mock data from IMM Marketing Hub...\n');

const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');

try {
  const db = new Database(dbPath);
  
  console.log('📊 Before cleanup:');
  
  // Check counts before cleanup
  const beforeCounts = {
    posts: db.prepare("SELECT COUNT(*) as count FROM posts").get().count,
    socialAccounts: db.prepare("SELECT COUNT(*) as count FROM social_media_accounts").get().count,
    analytics: db.prepare("SELECT COUNT(*) as count FROM analytics_metrics").get().count,
    engagement: db.prepare("SELECT COUNT(*) as count FROM engagement_interactions").get().count,
    postingJobs: db.prepare("SELECT COUNT(*) as count FROM posting_jobs").get().count,
    postingLogs: db.prepare("SELECT COUNT(*) as count FROM posting_logs").get().count,
    scheduledJobs: db.prepare("SELECT COUNT(*) as count FROM scheduled_jobs").get().count
  };
  
  Object.entries(beforeCounts).forEach(([key, count]) => {
    console.log(`  ${key}: ${count}`);
  });
  
  console.log('\n🗑️ Removing mock data (handling dependencies)...');
  
  // First, identify mock posts
  const mockPosts = db.prepare("SELECT id FROM posts WHERE content LIKE '%🚀 Exciting news%' OR content LIKE '%Marketing Tip%' OR content LIKE '%Behind the scenes%' OR content LIKE '%Want to boost%' OR content LIKE '%future of marketing%'").all();
  
  if (mockPosts.length > 0) {
    const mockPostIds = mockPosts.map(p => p.id);
    console.log(`  📝 Found ${mockPostIds.length} mock posts to remove`);
    
    // Delete dependent records first (in order of dependency)
    const deletedAnalytics = db.prepare("DELETE FROM analytics_metrics WHERE post_id IN (" + mockPostIds.map(() => '?').join(',') + ")").run(...mockPostIds);
    console.log(`  ✅ Removed ${deletedAnalytics.changes} dependent analytics records`);
    
    const deletedEngagement = db.prepare("DELETE FROM engagement_interactions WHERE post_id IN (" + mockPostIds.map(() => '?').join(',') + ")").run(...mockPostIds);
    console.log(`  ✅ Removed ${deletedEngagement.changes} dependent engagement interactions`);
    
    const deletedPostingJobs = db.prepare("DELETE FROM posting_jobs WHERE post_id IN (" + mockPostIds.map(() => '?').join(',') + ")").run(...mockPostIds);
    console.log(`  ✅ Removed ${deletedPostingJobs.changes} dependent posting jobs`);
    
    const deletedScheduledJobs = db.prepare("DELETE FROM scheduled_jobs WHERE post_id IN (" + mockPostIds.map(() => '?').join(',') + ")").run(...mockPostIds);
    console.log(`  ✅ Removed ${deletedScheduledJobs.changes} dependent scheduled jobs`);
    
    // Now delete the mock posts
    const deletedPosts = db.prepare("DELETE FROM posts WHERE id IN (" + mockPostIds.map(() => '?').join(',') + ")").run(...mockPostIds);
    console.log(`  ✅ Removed ${deletedPosts.changes} mock posts`);
  }
  
  // Identify mock social media accounts
  const mockAccounts = db.prepare("SELECT id FROM social_media_accounts WHERE access_token LIKE '%sample_token%' OR id LIKE '%sample_%'").all();
  
  if (mockAccounts.length > 0) {
    const mockAccountIds = mockAccounts.map(a => a.id);
    console.log(`  📝 Found ${mockAccountIds.length} mock social media accounts to remove`);
    
    // Delete dependent records first
    const deletedPostingLogs = db.prepare("DELETE FROM posting_logs WHERE account_id IN (" + mockAccountIds.map(() => '?').join(',') + ")").run(...mockAccountIds);
    console.log(`  ✅ Removed ${deletedPostingLogs.changes} dependent posting logs`);
    
    // scheduled_jobs doesn't have account_id, so we don't need to delete from it
    console.log(`  ℹ️ No dependent scheduled jobs to remove (table doesn't reference accounts)`);
    
    // Now delete the mock accounts
    const deletedAccounts = db.prepare("DELETE FROM social_media_accounts WHERE id IN (" + mockAccountIds.map(() => '?').join(',') + ")").run(...mockAccountIds);
    console.log(`  ✅ Removed ${deletedAccounts.changes} mock social media accounts`);
  }
  
  // Remove remaining mock analytics (not tied to specific posts)
  const deletedAnalyticsRemaining = db.prepare("DELETE FROM analytics_metrics").run();
  console.log(`  ✅ Removed ${deletedAnalyticsRemaining.changes} remaining analytics records`);
  
  // Remove remaining mock engagement (not tied to specific posts)
  const deletedEngagementRemaining = db.prepare("DELETE FROM engagement_interactions").run();
  console.log(`  ✅ Removed ${deletedEngagementRemaining.changes} remaining engagement interactions`);
  
  console.log('\n📊 After cleanup:');
  
  // Check counts after cleanup
  const afterCounts = {
    posts: db.prepare("SELECT COUNT(*) as count FROM posts").get().count,
    socialAccounts: db.prepare("SELECT COUNT(*) as count FROM social_media_accounts").get().count,
    analytics: db.prepare("SELECT COUNT(*) as count FROM analytics_metrics").get().count,
    engagement: db.prepare("SELECT COUNT(*) as count FROM engagement_interactions").get().count,
    postingJobs: db.prepare("SELECT COUNT(*) as count FROM posting_jobs").get().count,
    postingLogs: db.prepare("SELECT COUNT(*) as count FROM posting_logs").get().count,
    scheduledJobs: db.prepare("SELECT COUNT(*) as count FROM scheduled_jobs").get().count
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
