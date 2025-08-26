import { AppDatabase } from './src/main/database';

async function testAnalytics() {
  console.log('🧪 Testing Analytics Functionality...\n');
  
  const db = new AppDatabase();
  
  try {
    // Initialize database
    await db.initialize();
    console.log('✅ Database initialized');
    
    // Test analytics data
    const analyticsData = await db.getAnalyticsData();
    console.log('📊 Analytics Data:', JSON.stringify(analyticsData, null, 2));
    
    // Test saving metrics
    const testMetrics = {
      postId: 'test_post_123',
      platform: 'facebook',
      reach: 2500,
      impressions: 3000,
      likes: 120,
      comments: 15,
      shares: 8,
      clicks: 75,
      engagementRate: 0.057,
      sentimentScore: 0.8
    };
    
    const metricsId = await db.saveAnalyticsMetrics(testMetrics);
    console.log('✅ Metrics saved with ID:', metricsId);
    
    // Test retrieving metrics
    const retrievedMetrics = await db.getAnalyticsMetrics();
    console.log('📈 Retrieved Metrics:', retrievedMetrics.length, 'records');
    
    // Test saving trend
    const testTrend = {
      platform: 'facebook',
      date: new Date().toISOString().split('T')[0],
      totalReach: 5000,
      totalEngagement: 300,
      totalPosts: 5,
      avgEngagementRate: 0.06,
      topContentType: 'Tips & Advice'
    };
    
    const trendId = await db.saveAnalyticsTrend(testTrend);
    console.log('✅ Trend saved with ID:', trendId);
    
    // Test retrieving trends
    const trends = await db.getAnalyticsTrends();
    console.log('📊 Retrieved Trends:', trends.length, 'records');
    
    // Test top posts
    const topPosts = await db.getTopPosts();
    console.log('🏆 Top Posts:', topPosts.length, 'records');
    
    console.log('\n🎉 All analytics tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    db.close();
  }
}

testAnalytics();

