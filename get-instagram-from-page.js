async function getInstagramFromPage() {
  const pageToken = 'EAAlQXHVB1h8BPRHwgrCqIGBSlhzfyFFTmMZAcIGkr8cawYLqYtxX4gXjJ3r1mM6msPKSWJL17HZATVIVNOdClEZBHxir5XYqKEIRQLzxoOQAM1AUeh05xGE9j5zuOXFkXNjKA6wdRkZBnv3CZABtS779CYLGmcBFTZBDFje2phSjfGWy8rCDWelVS1ZB1ZAYRHZAp3WjDPO0GP9FZCznENzXXZA2UNXtLWfYfg4XMYbqWRJzsAZD';
  const pageId = '107398872203735';
  
  console.log('🔍 Getting Instagram Business Account from Facebook page...\n');
  
  try {
    // Step 1: Get all page fields including Instagram business account
    console.log('1. Getting page details with Instagram business account...');
    const pageUrl = `https://graph.facebook.com/v23.0/${pageId}?fields=id,name,instagram_business_account,connected_instagram_account&access_token=${pageToken}`;
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();
    
    console.log('Page data:', JSON.stringify(pageData, null, 2));
    
    if (pageData.error) {
      console.error('❌ Error getting page data:', pageData.error);
      return;
    }
    
    // Step 2: Check for Instagram business account
    if (pageData.instagram_business_account) {
      const igBusinessAccountId = pageData.instagram_business_account.id;
      console.log(`✅ Found Instagram Business Account: ${igBusinessAccountId}`);
      
      // Step 3: Test Instagram access
      console.log('\n2. Testing Instagram access...');
      const testUrl = `https://graph.facebook.com/v23.0/${igBusinessAccountId}/media?fields=id,caption,media_type&limit=10&access_token=${pageToken}`;
      const testResponse = await fetch(testUrl);
      const testData = await testResponse.json();
      
      if (testData.error) {
        console.error('❌ Cannot access Instagram media:', testData.error);
      } else {
        console.log(`✅ Instagram works! Found ${testData.data.length} posts`);
        if (testData.data.length > 0) {
          console.log('Sample posts:', testData.data.slice(0, 3));
        }
        
        console.log('\n📋 Update your Instagram settings with:');
        console.log(`   Business Account ID: ${igBusinessAccountId}`);
        console.log(`   Page Access Token: ${pageToken}`);
      }
    } else if (pageData.connected_instagram_account) {
      console.log(`✅ Found Connected Instagram Account: ${pageData.connected_instagram_account.id}`);
      // This might be a personal Instagram account, not business
    } else {
      console.log('❌ No Instagram account found connected to this page');
      console.log('Available fields:', Object.keys(pageData));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getInstagramFromPage();

