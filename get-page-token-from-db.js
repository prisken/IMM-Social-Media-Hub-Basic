const Database = require('better-sqlite3');
const path = require('path');

async function getPageTokenFromDB() {
  try {
    const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');
    const db = new Database(dbPath);
    
    // Get the Facebook account
    const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ?').get('facebook');
    
    if (!account) {
      console.error('❌ No Facebook account found in database');
      return;
    }
    
    const userToken = account.access_token;
    const pageId = account.page_id;
    
    console.log('🔍 Getting Page Access Token from database...\n');
    console.log(`Page ID: ${pageId}`);
    console.log(`User Token: ${userToken.substring(0, 20)}...\n`);
    
    // Get page access token
    console.log('1. Requesting page access token...');
    const pageTokenUrl = `https://graph.facebook.com/v23.0/${pageId}?fields=access_token&access_token=${userToken}`;
    const response = await fetch(pageTokenUrl);
    const data = await response.json();
    
    if (data.error) {
      console.error('❌ Error getting page token:', data.error);
      return;
    }
    
    console.log('✅ Page Access Token obtained successfully!');
    console.log(`Page ID: ${data.id}`);
    console.log(`Page Access Token: ${data.access_token}`);
    console.log('\n📋 Copy this token and update it in your app settings!');
    
    // Test the page token
    console.log('\n2. Testing page token...');
    const testUrl = `https://graph.facebook.com/v23.0/${pageId}/posts?fields=id,message,created_time&limit=5&access_token=${data.access_token}`;
    const testResponse = await fetch(testUrl);
    const testData = await testResponse.json();
    
    if (testData.error) {
      console.error('❌ Page token test failed:', testData.error);
    } else {
      console.log(`✅ Page token works! Found ${testData.data.length} posts`);
      if (testData.data.length > 0) {
        console.log('Sample post:', testData.data[0]);
      }
    }
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getPageTokenFromDB();

