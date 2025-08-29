const { AppDatabase } = require('./dist/main/database.js');
const path = require('path');

async function setupFacebookAccount() {
  console.log('🔧 Setting up Facebook account in IMM Marketing Hub...\n');
  
  try {
    // Initialize database
    const db = new AppDatabase();
    await db.initialize();
    
    // Your Facebook account details from the test
    const facebookAccount = {
      platform: 'facebook',
      accountName: 'IMM HK', // Using your main page
      accessToken: 'EAAlQXHVB1h8BPdg90uhHRUlRDsa7otNqCoZA7NGKRGYibnbmux6KXU03dURijoSkRN2WdGOlUw1dZBT0KKJrMupRyxdhocDZBJFZAm6GUKncUkWoEZCmJ43wVT3HN8kk1d7578ZALLCp9p96OGk2nLDWJWHhEvpw4Irnr42nymeMi6j87zZA4inEwRwkUhaSRW9vhwZD',
      pageId: '107398872203735', // IMM HK page ID
      businessAccountId: '',
      organizationId: '',
      threadsAccountId: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add the Facebook account
    const accountId = await db.addSocialMediaAccount(facebookAccount);
    
    if (accountId) {
      console.log('✅ Facebook account added successfully!');
      console.log(`📋 Account ID: ${accountId}`);
      console.log('📋 Account Details:');
      console.log(`   Platform: ${facebookAccount.platform}`);
      console.log(`   Account Name: ${facebookAccount.accountName}`);
      console.log(`   Page ID: ${facebookAccount.pageId}`);
      console.log(`   Active: ${facebookAccount.isActive}`);
      console.log('');
      
      // Test the connection
      console.log('🔍 Testing Facebook connection...');
      const { SocialMediaManager } = require('./dist/main/social-connectors.js');
      const socialManager = new SocialMediaManager();
      
      const connectionTest = await socialManager.testConnection(facebookAccount);
      console.log(`   Connection Test: ${connectionTest ? '✅ Success' : '❌ Failed'}`);
      
      if (connectionTest) {
        console.log('');
        console.log('🎉 Facebook integration is ready!');
        console.log('');
        console.log('📊 What you can now do:');
        console.log('   1. View real analytics in the Analytics Overview');
        console.log('   2. Post content to your Facebook page');
        console.log('   3. Fetch real engagement data');
        console.log('   4. Monitor your page performance');
        console.log('');
        console.log('🚀 Next steps:');
        console.log('   1. Open the app and go to Settings → Social Media');
        console.log('   2. You should see your Facebook account listed');
        console.log('   3. Test posting from the Content Studio');
        console.log('   4. Check the Analytics Overview for real data');
      }
    } else {
      console.log('❌ Failed to add Facebook account');
    }
    
  } catch (error) {
    console.error('❌ Error setting up Facebook account:', error);
  }
}

setupFacebookAccount();
