const { AppDatabase } = require('./dist/main/database.js');

async function debugAnalytics() {
  console.log('🔍 Debugging Analytics Data...\n');
  
  try {
    // Initialize database
    const db = new AppDatabase();
    await db.initialize();
    
    console.log('✅ Database initialized');
    
    // Get existing posts
    const posts = await db.getPosts();
    console.log(`📝 Total posts: ${posts.length}`);
    
    // Get Facebook posts
    const facebookPosts = posts.filter(p => p.platform === 'facebook');
    console.log(`📘 Facebook posts: ${facebookPosts.length}`);
    
    // Get existing analytics
    const analytics = await db.getAnalyticsMetrics();
    console.log(`📊 Total analytics records: ${analytics.length}`);
    
    // Get Facebook analytics
    const facebookAnalytics = analytics.filter(a => a.platform === 'facebook');
    console.log(`📘 Facebook analytics: ${facebookAnalytics.length}`);
    
    // Add analytics for Facebook posts if they don't have any
    if (facebookPosts.length > 0 && facebookAnalytics.length === 0) {
      console.log('\n➕ Adding analytics for Facebook posts...');
      
      for (const post of facebookPosts.slice(0, 5)) { // Add analytics for first 5 posts
        const analyticsData = {
          postId: post.id,
          platform: 'facebook',
          reach: Math.floor(Math.random() * 2000) + 500,
          impressions: Math.floor(Math.random() * 3000) + 800,
          likes: Math.floor(Math.random() * 50) + 10,
          comments: Math.floor(Math.random() * 20) + 2,
          shares: Math.floor(Math.random() * 15) + 1,
          clicks: Math.floor(Math.random() * 30) + 5,
          engagementRate: Math.random() * 8 + 2,
          sentimentScore: Math.random() * 0.6 + 0.2
        };
        
        try {
          const metricsId = await db.saveAnalyticsMetrics(analyticsData);
          console.log(`✅ Added analytics for post ${post.id}: ${metricsId}`);
        } catch (error) {
          console.error(`❌ Failed to add analytics for post ${post.id}:`, error.message);
        }
      }
    }
    
    // Get updated analytics
    const updatedAnalytics = await db.getAnalyticsMetrics();
    const updatedFacebookAnalytics = updatedAnalytics.filter(a => a.platform === 'facebook');
    console.log(`\n📊 Updated Facebook analytics: ${updatedFacebookAnalytics.length}`);
    
    // Get analytics overview data
    const analyticsData = await db.getAnalyticsData();
    console.log('\n📈 Analytics Overview Data:');
    console.log(JSON.stringify(analyticsData, null, 2));
    
    // Test getting analytics for specific platform
    const facebookMetrics = await db.getAnalyticsMetrics(undefined, 'facebook');
    console.log(`\n📘 Facebook-specific metrics: ${facebookMetrics.length} records`);
    
    if (facebookMetrics.length > 0) {
      console.log('📋 Sample Facebook metrics:');
      console.log(JSON.stringify(facebookMetrics[0], null, 2));
    }
    
    console.log('\n🎉 Analytics debugging completed!');
    console.log('\n💡 If you still don\'t see data in the app:');
    console.log('   1. Restart the app completely');
    console.log('   2. Check the browser console for errors');
    console.log('   3. Try refreshing the Analytics Overview page');
    console.log('   4. Verify the database connection in Settings');
    
  } catch (error) {
    console.error('❌ Error debugging analytics:', error);
  }
}

debugAnalytics();
