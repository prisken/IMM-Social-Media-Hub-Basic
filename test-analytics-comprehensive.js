const { AppDatabase } = require('./dist/main/database.js');

async function testAnalyticsComprehensive() {
  console.log('🧪 Comprehensive Analytics Testing...\n');
  
  const db = new AppDatabase();
  
  try {
    // Initialize database
    await db.initialize();
    console.log('✅ Database initialized');
    
    // Test 1: Analytics Data Overview
    console.log('\n📊 Test 1: Analytics Data Overview');
    const analyticsData = await db.getAnalyticsData();
    console.log('Overview Data:', JSON.stringify(analyticsData, null, 2));
    
    // Test 2: Save Analytics Metrics
    console.log('\n📈 Test 2: Save Analytics Metrics');
    const testMetrics = [
      {
        postId: 'post_1',
        platform: 'facebook',
        reach: 2500,
        impressions: 3200,
        likes: 145,
        comments: 23,
        shares: 12,
        clicks: 89,
        engagementRate: 0.072,
        sentimentScore: 0.85
      },
      {
        postId: 'post_2',
        platform: 'instagram',
        reach: 1800,
        impressions: 2200,
        likes: 234,
        comments: 18,
        shares: 8,
        clicks: 45,
        engagementRate: 0.144,
        sentimentScore: 0.92
      },
      {
        postId: 'post_3',
        platform: 'linkedin',
        reach: 1200,
        impressions: 1500,
        likes: 67,
        comments: 15,
        shares: 28,
        clicks: 34,
        engagementRate: 0.092,
        sentimentScore: 0.78
      }
    ];
    
    for (const metrics of testMetrics) {
      const metricsId = await db.saveAnalyticsMetrics(metrics);
      console.log(`✅ Metrics saved for ${metrics.platform}: ${metricsId}`);
    }
    
    // Test 3: Retrieve Analytics Metrics
    console.log('\n📊 Test 3: Retrieve Analytics Metrics');
    const allMetrics = await db.getAnalyticsMetrics();
    console.log(`Total metrics records: ${allMetrics.length}`);
    
    const facebookMetrics = await db.getAnalyticsMetrics(undefined, 'facebook');
    console.log(`Facebook metrics: ${facebookMetrics.length} records`);
    
    // Test 4: Save Analytics Trends
    console.log('\n📈 Test 4: Save Analytics Trends');
    const testTrends = [
      {
        platform: 'facebook',
        date: new Date().toISOString().split('T')[0],
        totalReach: 2500,
        totalEngagement: 180,
        totalPosts: 1,
        avgEngagementRate: 0.072,
        topContentType: 'Marketing Tips'
      },
      {
        platform: 'instagram',
        date: new Date().toISOString().split('T')[0],
        totalReach: 1800,
        totalEngagement: 260,
        totalPosts: 1,
        avgEngagementRate: 0.144,
        topContentType: 'Behind the Scenes'
      }
    ];
    
    for (const trend of testTrends) {
      const trendId = await db.saveAnalyticsTrend(trend);
      console.log(`✅ Trend saved for ${trend.platform}: ${trendId}`);
    }
    
    // Test 5: Retrieve Analytics Trends
    console.log('\n📊 Test 5: Retrieve Analytics Trends');
    const allTrends = await db.getAnalyticsTrends();
    console.log(`Total trends records: ${allTrends.length}`);
    
    const facebookTrends = await db.getAnalyticsTrends('facebook', 30);
    console.log(`Facebook trends (30 days): ${facebookTrends.length} records`);
    
    // Test 6: Save Brand Voice Performance
    console.log('\n🎯 Test 6: Save Brand Voice Performance');
    const testVoicePerformance = {
      voiceProfileId: 'voice_1',
      tone: 'professional',
      style: 'conversational',
      engagementRate: 0.085,
      sentimentScore: 0.82,
      postCount: 3,
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      periodEnd: new Date().toISOString()
    };
    
    const voicePerfId = await db.saveBrandVoicePerformance(testVoicePerformance);
    console.log(`✅ Brand voice performance saved: ${voicePerfId}`);
    
    // Test 7: Retrieve Brand Voice Performance
    console.log('\n🎯 Test 7: Retrieve Brand Voice Performance');
    const voicePerformance = await db.getBrandVoicePerformance();
    console.log(`Brand voice performance records: ${voicePerformance.length}`);
    
    // Test 8: Get Top Posts
    console.log('\n🏆 Test 8: Get Top Posts');
    const topPosts = await db.getTopPosts();
    console.log(`Top posts: ${topPosts.length} records`);
    
    const topFacebookPosts = await db.getTopPosts('facebook', 5, 30);
    console.log(`Top Facebook posts (5 posts, 30 days): ${topFacebookPosts.length} records`);
    
    // Test 9: Platform-specific Analytics
    console.log('\n📱 Test 9: Platform-specific Analytics');
    const platforms = ['facebook', 'instagram', 'linkedin'];
    
    for (const platform of platforms) {
      const platformMetrics = await db.getAnalyticsMetrics(undefined, platform);
      const platformTrends = await db.getAnalyticsTrends(platform, 7);
      console.log(`${platform}: ${platformMetrics.length} metrics, ${platformTrends.length} trends`);
    }
    
    // Test 10: Time-based Filtering
    console.log('\n⏰ Test 10: Time-based Filtering');
    const recentMetrics = await db.getAnalyticsMetrics(undefined, undefined, 
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    console.log(`Recent metrics (last 7 days): ${recentMetrics.length} records`);
    
    console.log('\n🎉 All analytics tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Analytics metrics: ${allMetrics.length} records`);
    console.log(`- Analytics trends: ${allTrends.length} records`);
    console.log(`- Brand voice performance: ${voicePerformance.length} records`);
    console.log(`- Top posts: ${topPosts.length} records`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    db.close();
  }
}

testAnalyticsComprehensive();

