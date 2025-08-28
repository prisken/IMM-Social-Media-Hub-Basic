const Database = require('better-sqlite3');
const path = require('path');

async function testCurrentTokens() {
  try {
    const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');
    console.log('🔍 Testing current tokens from database...\n');
    
    const db = new Database(dbPath);
    const accounts = db.prepare('SELECT * FROM social_media_accounts').all();
    
    for (const account of accounts) {
      console.log(`=== ${account.platform.toUpperCase()} ACCOUNT ===`);
      console.log(`Account Name: ${account.account_name}`);
      console.log(`Page ID: ${account.page_id || 'NULL'}`);
      console.log(`Business Account ID: ${account.business_account_id || 'NULL'}`);
      console.log(`Token: ${account.access_token ? account.access_token.substring(0, 20) + '...' : 'NULL'}`);
      console.log(`Is Active: ${account.is_active}\n`);
      
      if (account.access_token) {
        await testToken(account.platform, account.access_token, account.page_id, account.business_account_id);
      }
      console.log('---\n');
    }
    
    db.close();
  } catch (error) {
    console.error('❌ Error testing tokens:', error);
  }
}

async function testToken(platform, token, pageId, businessAccountId) {
  try {
    if (platform === 'facebook') {
      await testFacebookToken(token, pageId);
    } else if (platform === 'instagram') {
      await testInstagramToken(token, businessAccountId);
    }
  } catch (error) {
    console.error(`❌ Error testing ${platform} token:`, error.message);
  }
}

async function testFacebookToken(token, pageId) {
  console.log('📋 Testing Facebook token...');
  
  // 1. Test basic token validity
  console.log('1. Testing token validity...');
  const meUrl = `https://graph.facebook.com/v23.0/me?access_token=${token}`;
  const meResponse = await fetch(meUrl);
  const meData = await meResponse.json();
  
  if (meData.error) {
    console.error('❌ Token invalid:', meData.error.message);
    return;
  }
  console.log('✅ Token is valid');
  
  // 2. Test pages access
  console.log('2. Testing pages access...');
  const pagesUrl = `https://graph.facebook.com/v23.0/me/accounts?access_token=${token}`;
  const pagesResponse = await fetch(pagesUrl);
  const pagesData = await pagesResponse.json();
  
  if (pagesData.error) {
    console.error('❌ Cannot access pages:', pagesData.error.message);
  } else {
    console.log(`✅ Found ${pagesData.data.length} pages:`);
    pagesData.data.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.name} (ID: ${page.id})`);
    });
  }
  
  // 3. Test specific page access
  if (pageId) {
    console.log(`3. Testing access to page ${pageId}...`);
    const pageUrl = `https://graph.facebook.com/v23.0/${pageId}?fields=id,name&access_token=${token}`;
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();
    
    if (pageData.error) {
      console.error('❌ Cannot access specific page:', pageData.error.message);
    } else {
      console.log(`✅ Can access page: ${pageData.name}`);
    }
  }
  
  // 4. Test posts access
  if (pageId) {
    console.log(`4. Testing posts access for page ${pageId}...`);
    const postsUrl = `https://graph.facebook.com/v23.0/${pageId}/posts?fields=id,message,created_time&limit=5&access_token=${token}`;
    const postsResponse = await fetch(postsUrl);
    const postsData = await postsResponse.json();
    
    if (postsData.error) {
      console.error('❌ Cannot access posts:', postsData.error.message);
    } else {
      console.log(`✅ Can access posts: Found ${postsData.data.length} posts`);
    }
  }
}

async function testInstagramToken(token, businessAccountId) {
  console.log('📸 Testing Instagram token...');
  
  // 1. Test basic token validity
  console.log('1. Testing token validity...');
  const meUrl = `https://graph.facebook.com/v23.0/me?access_token=${token}`;
  const meResponse = await fetch(meUrl);
  const meData = await meResponse.json();
  
  if (meData.error) {
    console.error('❌ Token invalid:', meData.error.message);
    return;
  }
  console.log('✅ Token is valid');
  
  // 2. Test business accounts access
  console.log('2. Testing business accounts access...');
  const accountsUrl = `https://graph.facebook.com/v23.0/me/accounts?access_token=${token}`;
  const accountsResponse = await fetch(accountsUrl);
  const accountsData = await accountsResponse.json();
  
  if (accountsData.error) {
    console.error('❌ Cannot access accounts:', accountsData.error.message);
  } else {
    console.log(`✅ Found ${accountsData.data.length} accounts:`);
    accountsData.data.forEach((account, index) => {
      console.log(`   ${index + 1}. ${account.name} (ID: ${account.id})`);
    });
  }
  
  // 3. Test specific business account access
  if (businessAccountId) {
    console.log(`3. Testing access to business account ${businessAccountId}...`);
    const accountUrl = `https://graph.facebook.com/v23.0/${businessAccountId}?fields=id,name&access_token=${token}`;
    const accountResponse = await fetch(accountUrl);
    const accountData = await accountResponse.json();
    
    if (accountData.error) {
      console.error('❌ Cannot access business account:', accountData.error.message);
    } else {
      console.log(`✅ Can access business account: ${accountData.name}`);
    }
  }
  
  // 4. Test media access
  if (businessAccountId) {
    console.log(`4. Testing media access for business account ${businessAccountId}...`);
    const mediaUrl = `https://graph.facebook.com/v23.0/${businessAccountId}/media?fields=id,caption,media_type&limit=5&access_token=${token}`;
    const mediaResponse = await fetch(mediaUrl);
    const mediaData = await mediaResponse.json();
    
    if (mediaData.error) {
      console.error('❌ Cannot access media:', mediaData.error.message);
    } else {
      console.log(`✅ Can access media: Found ${mediaData.data.length} posts`);
    }
  }
}

testCurrentTokens();

