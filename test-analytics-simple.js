const { AppDatabase } = require('./dist/main/database.js');

async function testAnalyticsSimple() {
  console.log('🧪 Simple Analytics Testing...\n');
  
  const db = new AppDatabase();
  
  try {
    // Initialize database (this should work with existing data)
    await db.initialize();
    console.log('✅ Database initialized');
    
    // Test 1: Get existing posts
    console.log('\n📝 Test 1: Get Existing Posts');
    const posts = await db.getPosts();
    console.log(`Total posts: ${posts.length}`);
    
    // Test 2: Get Analytics Data Overview
    console.log('\n📊 Test 2: Analytics Data Overview');
    const analyticsData = await db.getAnalyticsData();
    console.log('Overview Data:', JSON.stringify(analyticsData, null, 2));
    
    // Test 3: Save Analytics Metrics for existing posts
    console.log('\n📈 Test 3: Save Analytics Metrics');
    if (posts.length > 0) {
      const firstPost = posts[0];
      const testMetrics = {
        postId: firstPost.id,
        platform: firstPost.platform.toLowerCase(),
        reach: 2500,
        impressions: 3200,
        likes: 145,
        comments: 23,
        shares: 12,
        clicks: 89,
        engagementRate: 0.072,
        sentimentScore: 0.85
      };
      
      const metricsId = await db.saveAnalyticsMetrics(testMetrics);
      console.log(`✅ Metrics saved for post ${firstPost.id}: ${metricsId}`);
    }
    
    // Test 4: Retrieve Analytics Metrics
    console.log('\n📊 Test 4: Retrieve Analytics Metrics');
    const allMetrics = await db.getAnalyticsMetrics();
    console.log(`Total metrics records: ${allMetrics.length}`);
    
    // Test 5: Save Analytics Trends
    console.log('\n📈 Test 5: Save Analytics Trends');
    const testTrend = {
      platform: 'facebook',
      date: new Date().toISOString().split('T')[0],
      totalReach: 2500,
      totalEngagement: 180,
      totalPosts: 1,
      avgEngagementRate: 0.072,
      topContentType: 'Marketing Tips'
    };
    
    const trendId = await db.saveAnalyticsTrend(testTrend);
    console.log(`✅ Trend saved: ${trendId}`);
    
    // Test 6: Retrieve Analytics Trends
    console.log('\n📊 Test 6: Retrieve Analytics Trends');
    const allTrends = await db.getAnalyticsTrends();
    console.log(`Total trends records: ${allTrends.length}`);
    
    // Test 7: Get Top Posts
    console.log('\n🏆 Test 7: Get Top Posts');
    const topPosts = await db.getTopPosts();
    console.log(`Top posts: ${topPosts.length} records`);
    
    // Test 8: Platform-specific Analytics
    console.log('\n📱 Test 8: Platform-specific Analytics');
    const facebookMetrics = await db.getAnalyticsMetrics(undefined, 'facebook');
    const instagramMetrics = await db.getAnalyticsMetrics(undefined, 'instagram');
    const linkedinMetrics = await db.getAnalyticsMetrics(undefined, 'linkedin');
    
    console.log(`Facebook metrics: ${facebookMetrics.length} records`);
    console.log(`Instagram metrics: ${instagramMetrics.length} records`);
    console.log(`LinkedIn metrics: ${linkedinMetrics.length} records`);
    
    console.log('\n🎉 All analytics tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Posts: ${posts.length} records`);
    console.log(`- Analytics metrics: ${allMetrics.length} records`);
    console.log(`- Analytics trends: ${allTrends.length} records`);
    console.log(`- Top posts: ${topPosts.length} records`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    db.close();
  }
}

testAnalyticsSimple();

