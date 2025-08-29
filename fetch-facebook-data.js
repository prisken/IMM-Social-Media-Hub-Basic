const { AppDatabase } = require('./dist/main/database.js');
const { FacebookPostsFetcher } = require('./dist/main/facebook-posts-fetcher.js');

async function fetchFacebookData() {
  console.log('📊 Fetching real Facebook data for analytics...\n');
  
  try {
    // Initialize database
    const db = new AppDatabase();
    await db.initialize();
    
    // Get the Facebook account we just added
    const accounts = await db.getSocialMediaAccounts();
    const facebookAccount = accounts.find(acc => acc.platform === 'facebook' && acc.isActive);
    
    if (!facebookAccount) {
      console.log('❌ No active Facebook account found. Please run setup-facebook-account.js first.');
      return;
    }
    
    console.log(`📋 Using Facebook account: ${facebookAccount.accountName} (${facebookAccount.pageId})`);
    
    // Fetch existing posts and analytics
    const postsFetcher = new FacebookPostsFetcher(db);
    await postsFetcher.fetchExistingPosts();
    
    // Get analytics data
    const analytics = await db.getAnalyticsMetrics();
    const posts = await db.getPosts();
    
    console.log('');
    console.log('📈 Analytics Summary:');
    console.log(`   Total Posts: ${posts.filter(p => p.platform === 'facebook').length}`);
    console.log(`   Total Analytics Records: ${analytics.filter(a => a.platform === 'facebook').length}`);
    
    if (analytics.length > 0) {
      const facebookAnalytics = analytics.filter(a => a.platform === 'facebook');
      const totalReach = facebookAnalytics.reduce((sum, a) => sum + a.reach, 0);
      const totalEngagement = facebookAnalytics.reduce((sum, a) => sum + a.likes + a.comments + a.shares, 0);
      const avgEngagementRate = facebookAnalytics.reduce((sum, a) => sum + a.engagementRate, 0) / facebookAnalytics.length;
      
      console.log(`   Total Reach: ${totalReach.toLocaleString()}`);
      console.log(`   Total Engagement: ${totalEngagement.toLocaleString()}`);
      console.log(`   Average Engagement Rate: ${avgEngagementRate.toFixed(2)}%`);
    }
    
    console.log('');
    console.log('✅ Facebook data fetch completed!');
    console.log('');
    console.log('🎯 Your app now has:');
    console.log('   • Real Facebook posts in the database');
    console.log('   • Actual engagement metrics');
    console.log('   • Live analytics data');
    console.log('   • Ready for posting new content');
    console.log('');
    console.log('🚀 Open the app and check:');
    console.log('   1. Analytics Overview - Real Facebook metrics');
    console.log('   2. Content Studio - Ready to post to Facebook');
    console.log('   3. Engagement Hub - Real comments and interactions');
    
  } catch (error) {
    console.error('❌ Error fetching Facebook data:', error);
  }
}

fetchFacebookData();
