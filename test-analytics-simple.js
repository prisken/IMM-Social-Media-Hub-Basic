const { AppDatabase } = require('./dist/main/database.js');

async function testAnalytics() {
  console.log('🧪 Testing Analytics Data...\n');
  
  try {
    // Initialize database
    const db = new AppDatabase();
    await db.initialize();
    
    // Check if analytics_metrics table exists
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='analytics_metrics'").get();
    console.log('📋 Analytics table exists:', !!tableCheck);
    
    // Check current analytics count
    const currentCount = db.prepare("SELECT COUNT(*) as count FROM analytics_metrics").get();
    console.log('📊 Current analytics records:', currentCount.count);
    
    // Try to add a test analytics record
    const testMetrics = {
      postId: 'test_post_123',
      platform: 'facebook',
      reach: 1000,
      impressions: 1500,
      likes: 50,
      comments: 10,
      shares: 5,
      clicks: 25,
      engagementRate: 6.5,
      sentimentScore: 0.8
    };
    
    console.log('\n➕ Adding test analytics record...');
    const metricsId = await db.saveAnalyticsMetrics(testMetrics);
    console.log('✅ Analytics record added with ID:', metricsId);
    
    // Check count again
    const newCount = db.prepare("SELECT COUNT(*) as count FROM analytics_metrics").get();
    console.log('📊 New analytics records count:', newCount.count);
    
    // Get the analytics data
    const analytics = await db.getAnalyticsMetrics();
    console.log('📈 Retrieved analytics records:', analytics.length);
    
    if (analytics.length > 0) {
      console.log('📋 Sample analytics record:');
      console.log(JSON.stringify(analytics[0], null, 2));
    }
    
    // Test the analytics data method
    const analyticsData = await db.getAnalyticsData();
    console.log('\n📊 Analytics Overview Data:');
    console.log(JSON.stringify(analyticsData, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing analytics:', error);
  }
}

testAnalytics();

