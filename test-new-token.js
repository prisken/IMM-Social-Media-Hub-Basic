const Database = require('./dist/main/database').default;

async function testNewToken() {
  console.log('🔍 Testing new token access...\n');
  
  const db = new Database();
  await db.initialize();
  
  const accounts = await db.getSocialMediaAccounts();
  const facebookAccount = accounts.find(acc => acc.platform === 'facebook' && acc.isActive);
  
  if (!facebookAccount) {
    console.log('❌ No active Facebook account found');
    return;
  }
  
  console.log(`📱 Testing Facebook Page: ${facebookAccount.pageId}`);
  console.log(`🔑 Token: ${facebookAccount.accessToken.substring(0, 20)}...`);
  
  // Test 1: Facebook Page Access
  try {
    const pageUrl = `https://graph.facebook.com/v23.0/${facebookAccount.pageId}?fields=id,name,access_token&access_token=${facebookAccount.accessToken}`;
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();
    
    if (pageData.error) {
      console.log(`❌ Facebook Page Error: ${pageData.error.message}`);
    } else {
      console.log(`✅ Facebook Page Access: ${pageData.name} (${pageData.id})`);
    }
  } catch (error) {
    console.log(`❌ Facebook Page Error: ${error.message}`);
  }
  
  // Test 2: Facebook Posts Access
  try {
    const postsUrl = `https://graph.facebook.com/v23.0/${facebookAccount.pageId}/posts?limit=5&access_token=${facebookAccount.accessToken}`;
    const postsResponse = await fetch(postsUrl);
    const postsData = await postsResponse.json();
    
    if (postsData.error) {
      console.log(`❌ Facebook Posts Error: ${postsData.error.message}`);
    } else {
      console.log(`✅ Facebook Posts Access: ${postsData.data?.length || 0} posts found`);
    }
  } catch (error) {
    console.log(`❌ Facebook Posts Error: ${error.message}`);
  }
  
  // Test 3: Instagram Business Account Access
  try {
    const instagramUrl = `https://graph.facebook.com/v23.0/me/accounts?fields=instagram_business_account&access_token=${facebookAccount.accessToken}`;
    const instagramResponse = await fetch(instagramUrl);
    const instagramData = await instagramResponse.json();
    
    if (instagramData.error) {
      console.log(`❌ Instagram Access Error: ${instagramData.error.message}`);
    } else {
      const pages = instagramData.data || [];
      const pageWithInstagram = pages.find(page => page.instagram_business_account);
      
      if (pageWithInstagram) {
        console.log(`✅ Instagram Business Account Found: ${pageWithInstagram.instagram_business_account.id}`);
      } else {
        console.log(`⚠️ No Instagram Business Account linked to any page`);
      }
    }
  } catch (error) {
    console.log(`❌ Instagram Access Error: ${error.message}`);
  }
  
  await db.close();
}

testNewToken().catch(console.error);

