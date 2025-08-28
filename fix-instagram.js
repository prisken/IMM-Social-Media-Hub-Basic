const Database = require('better-sqlite3');
const path = require('path');

async function fixInstagram() {
  try {
    const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');
    const db = new Database(dbPath);
    
    // Get the Instagram account
    const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ?').get('instagram');
    
    if (!account) {
      console.error('❌ No Instagram account found in database');
      return;
    }
    
    const userToken = account.access_token;
    
    console.log('🔍 Fixing Instagram setup...\n');
    console.log(`Current Business Account ID: ${account.business_account_id}`);
    console.log(`User Token: ${userToken.substring(0, 20)}...\n`);
    
    // Step 1: Test user token validity
    console.log('1. Testing user token validity...');
    const meUrl = `https://graph.facebook.com/v23.0/me?access_token=${userToken}`;
    const meResponse = await fetch(meUrl);
    const meData = await meResponse.json();
    
    if (meData.error) {
      console.error('❌ User token invalid:', meData.error);
      return;
    }
    console.log('✅ User token is valid');
    
    // Step 2: Get user's Instagram accounts
    console.log('\n2. Getting Instagram accounts...');
    const accountsUrl = `https://graph.facebook.com/v23.0/me/accounts?access_token=${userToken}`;
    const accountsResponse = await fetch(accountsUrl);
    const accountsData = await accountsResponse.json();
    
    if (accountsData.error) {
      console.error('❌ Cannot get accounts:', accountsData.error);
      return;
    }
    
    console.log(`✅ Found ${accountsData.data.length} accounts:`);
    accountsData.data.forEach((acc, index) => {
      console.log(`   ${index + 1}. ${acc.name} (ID: ${acc.id})`);
    });
    
    // Step 3: For each account, try to get Instagram business account
    for (const acc of accountsData.data) {
      console.log(`\n3. Checking account: ${acc.name} (${acc.id})`);
      
      // Get page access token for this account
      const pageTokenUrl = `https://graph.facebook.com/v23.0/${acc.id}?fields=access_token&access_token=${userToken}`;
      const pageTokenResponse = await fetch(pageTokenUrl);
      const pageTokenData = await pageTokenResponse.json();
      
      if (pageTokenData.error) {
        console.log(`   ❌ Cannot get page token: ${pageTokenData.error.message}`);
        continue;
      }
      
      const pageToken = pageTokenData.access_token;
      console.log(`   ✅ Got page token for ${acc.name}`);
      
      // Try to get Instagram business account
      const igUrl = `https://graph.facebook.com/v23.0/${acc.id}?fields=instagram_business_account&access_token=${pageToken}`;
      const igResponse = await fetch(igUrl);
      const igData = await igResponse.json();
      
      if (igData.error) {
        console.log(`   ❌ Cannot get Instagram account: ${igData.error.message}`);
        continue;
      }
      
      if (igData.instagram_business_account) {
        console.log(`   ✅ Found Instagram Business Account: ${igData.instagram_business_account.id}`);
        
        // Test the Instagram business account
        const testUrl = `https://graph.facebook.com/v23.0/${igData.instagram_business_account.id}/media?fields=id,caption&limit=5&access_token=${pageToken}`;
        const testResponse = await fetch(testUrl);
        const testData = await testResponse.json();
        
        if (testData.error) {
          console.log(`   ❌ Cannot access Instagram media: ${testData.error.message}`);
        } else {
          console.log(`   ✅ Instagram works! Found ${testData.data.length} posts`);
          console.log(`\n📋 Update your Instagram settings with:`);
          console.log(`   Business Account ID: ${igData.instagram_business_account.id}`);
          console.log(`   Page Access Token: ${pageToken}`);
        }
      } else {
        console.log(`   ❌ No Instagram business account connected to ${acc.name}`);
      }
    }
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixInstagram();

