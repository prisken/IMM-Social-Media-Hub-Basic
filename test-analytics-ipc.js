#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🧪 Testing Analytics IPC Handler\n');

const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');

try {
  const db = new Database(dbPath);
  
  // Simulate the analytics:get-data IPC handler
  const analyticsData = {
    facebook: { reach: 0, posts: 0, engagement: 0 },
    instagram: { reach: 0, posts: 0, engagement: 0 },
    linkedin: { reach: 0, posts: 0, engagement: 0 },
    total: { reach: 0, posts: 0, engagement: 0 }
  };
  
  // Get analytics metrics for each platform
  const platforms = ['facebook', 'instagram', 'linkedin'];
  
  for (const platform of platforms) {
    const metrics = db.prepare('SELECT * FROM analytics_metrics WHERE platform = ?').all(platform);
    
    if (metrics.length > 0) {
      const platformData = analyticsData[platform];
      platformData.reach = metrics.reduce((sum, m) => sum + m.reach, 0);
      platformData.posts = metrics.length;
      platformData.engagement = metrics.reduce((sum, m) => 
        sum + m.likes + m.comments + m.shares, 0);
    }
  }
  
  // Calculate totals
  analyticsData.total.reach = analyticsData.facebook.reach + analyticsData.instagram.reach + analyticsData.linkedin.reach;
  analyticsData.total.posts = analyticsData.facebook.posts + analyticsData.instagram.posts + analyticsData.linkedin.posts;
  analyticsData.total.engagement = analyticsData.facebook.engagement + analyticsData.instagram.engagement + analyticsData.linkedin.engagement;
  
  console.log('📊 Analytics Data (what the dashboard should show):');
  console.log(JSON.stringify(analyticsData, null, 2));
  
  // Test platform stats
  const accounts = db.prepare('SELECT * FROM social_media_accounts').all();
  
  const stats = {
    facebook: { connected: false, accountName: undefined },
    instagram: { connected: false, accountName: undefined },
    linkedin: { connected: false, accountName: undefined }
  };
  
  accounts.forEach(account => {
    if (account.is_active) {
      const platform = account.platform.toLowerCase();
      if (stats[platform]) {
        stats[platform].connected = true;
        stats[platform].accountName = account.account_name;
      }
    }
  });
  
  console.log('\n🔗 Platform Stats (what the dashboard should show):');
  console.log(JSON.stringify(stats, null, 2));
  
  db.close();
  
  console.log('\n✅ Test completed!');
  console.log('💡 If the app is running, the dashboard should now show this data.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
