const Database = require('better-sqlite3');
const path = require('path');

async function getInstagramWithUserToken() {
  try {
    const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');
    const db = new Database(dbPath);
    
    // Get the Facebook account (which has the user token)
    const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ?').get('facebook');
    
    if (!account) {
      console.error('❌ No Facebook account found in database');
      return;
    }
    
    // Get the user token from the database (this is the original user token)
    const userToken = account.access_token;
    
    console.log('🔍 Getting Instagram Business Account using User Token...\n');
    console.log(`User Token: ${userToken.substring(0, 20)}...\n`);
    
    // Step 1: Get user's pages
    console.log('1. Getting user pages...');
    const pagesUrl = `https://graph.facebook.com/v23.0/me/accounts?access_token=${userToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    
    if (pagesData.error) {
      console.error('❌ Cannot get pages:', pagesData.error);
      return;
    }
    
    console.log(`✅ Found ${pagesData.data.length} pages:`);
    pagesData.data.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.name} (ID: ${page.id})`);
    });
    
    // Step 2: For each page, check for Instagram business account
    for (const page of pagesData.data) {
      console.log(`\n2. Checking page: ${page.name} (${page.id})`);
      
      // Get page access token
      const pageTokenUrl = `https://graph.facebook.com/v23.0/${page.id}?fields=access_token&access_token=${userToken}`;
      const pageTokenResponse = await fetch(pageTokenUrl);
      const pageTokenData = await pageTokenResponse.json();
      
      if (pageTokenData.error) {
        console.log(`   ❌ Cannot get page token: ${pageTokenData.error.message}`);
        continue;
      }
      
      const pageToken = pageTokenData.access_token;
      console.log(`   ✅ Got page token for ${page.name}`);
      
      // Check for Instagram business account
      const igUrl = `https://graph.facebook.com/v23.0/${page.id}?fields=instagram_business_account&access_token=${pageToken}`;
      const igResponse = await fetch(igUrl);
      const igData = await igResponse.json();
      
      if (igData.error) {
        console.log(`   ❌ Cannot get Instagram account: ${igData.error.message}`);
        continue;
      }
      
      if (igData.instagram_business_account) {
        const igBusinessAccountId = igData.instagram_business_account.id;
        console.log(`   ✅ Found Instagram Business Account: ${igBusinessAccountId}`);
        
        // Test the Instagram business account
        console.log(`\n3. Testing Instagram access for ${page.name}...`);
        const testUrl = `https://graph.facebook.com/v23.0/${igBusinessAccountId}/media?fields=id,caption,media_type&limit=10&access_token=${pageToken}`;
        const testResponse = await fetch(testUrl);
        const testData = await testResponse.json();
        
        if (testData.error) {
          console.error(`   ❌ Cannot access Instagram media: ${testData.error.message}`);
        } else {
          console.log(`   ✅ Instagram works! Found ${testData.data.length} posts`);
          if (testData.data.length > 0) {
            console.log(`   Sample post: ${testData.data[0].id}`);
          }
          
          console.log(`\n📋 Update your Instagram settings with:`);
          console.log(`   Business Account ID: ${igBusinessAccountId}`);
          console.log(`   Page Access Token: ${pageToken}`);
          console.log(`   (This is for page: ${page.name})`);
          
          db.close();
          return;
        }
      } else {
        console.log(`   ❌ No Instagram business account connected to ${page.name}`);
      }
    }
    
    console.log('\n❌ No Instagram business account found in any page');
    db.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getInstagramWithUserToken();

