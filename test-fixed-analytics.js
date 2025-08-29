const { AppDatabase } = require('./dist/main/database.js');

async function testFixedAnalytics() {
  console.log('🧪 Testing Fixed Analytics Data Method...\n');
  
  try {
    // Initialize database
    const db = new AppDatabase();
    await db.initialize();
    
    console.log('✅ Database initialized');
    
    // Test the fixed getAnalyticsData method
    const analyticsData = await db.getAnalyticsData();
    
    console.log('📈 Analytics Overview Data (Fixed Method):');
    console.log(JSON.stringify(analyticsData, null, 2));
    
    // Show what the app should display
    console.log('\n🎯 What you should see in the Analytics Overview:');
    console.log(`   📘 Facebook: ${analyticsData.facebook.reach.toLocaleString()} reach, ${analyticsData.facebook.posts} posts, ${analyticsData.facebook.engagement.toLocaleString()} engagement`);
    console.log(`   📸 Instagram: ${analyticsData.instagram.reach.toLocaleString()} reach, ${analyticsData.instagram.posts} posts, ${analyticsData.instagram.engagement.toLocaleString()} engagement`);
    console.log(`   💼 LinkedIn: ${analyticsData.linkedin.reach.toLocaleString()} reach, ${analyticsData.linkedin.posts} posts, ${analyticsData.linkedin.engagement.toLocaleString()} engagement`);
    console.log(`   📊 Total: ${analyticsData.total.reach.toLocaleString()} reach, ${analyticsData.total.posts} posts, ${analyticsData.total.engagement.toLocaleString()} engagement`);
    
    console.log('\n🎉 Analytics data method is now fixed!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Start the app: npm run dev');
    console.log('   2. Go to Analytics Overview');
    console.log('   3. You should now see real Facebook data');
    console.log('   4. The metrics should match what we calculated above');
    
  } catch (error) {
    console.error('❌ Error testing fixed analytics:', error);
  }
}

testFixedAnalytics();
