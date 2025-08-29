const { AppDatabase } = require('./dist/main/database.js');

async function verifyAppData() {
  console.log('🔍 Verifying App Data...\n');
  
  try {
    const db = new AppDatabase();
    await db.initialize();
    
    console.log('✅ Database initialized');
    
    // Get all data
    const posts = await db.getPosts();
    const analytics = await db.getAnalyticsMetrics();
    const analyticsData = await db.getAnalyticsData();
    
    console.log('\n📊 Current App Data:');
    console.log(`   Total Posts: ${posts.length}`);
    console.log(`   Total Analytics Records: ${analytics.length}`);
    
    // Facebook data
    const facebookPosts = posts.filter(p => p.platform === 'facebook');
    const facebookAnalytics = analytics.filter(a => a.platform === 'facebook');
    
    console.log('\n📘 Facebook Data:');
    console.log(`   Posts: ${facebookPosts.length}`);
    console.log(`   Analytics Records: ${facebookAnalytics.length}`);
    
    // Show Facebook posts
    console.log('\n📝 Facebook Posts:');
    facebookPosts.forEach((post, index) => {
      const date = new Date(post.createdAt).toLocaleDateString();
      const content = post.content.substring(0, 50) + (post.content.length > 50 ? '...' : '');
      console.log(`   ${index + 1}. ${date} - ${content}`);
    });
    
    // Analytics Overview
    console.log('\n📈 Analytics Overview (What the app should show):');
    console.log(JSON.stringify(analyticsData, null, 2));
    
    console.log('\n🎯 Expected vs Actual:');
    console.log(`   Expected Facebook posts: 8`);
    console.log(`   Actual Facebook posts: ${facebookPosts.length}`);
    console.log(`   Expected Facebook reach: ~11,243`);
    console.log(`   Actual Facebook reach: ${analyticsData.facebook.reach.toLocaleString()}`);
    
    if (facebookPosts.length === 8) {
      console.log('\n✅ SUCCESS! App data is correct!');
      console.log('🚀 The app should now show the updated Facebook data.');
    } else {
      console.log('\n❌ Data mismatch detected!');
      console.log('💡 Try restarting the app again.');
    }
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  }
}

verifyAppData();
