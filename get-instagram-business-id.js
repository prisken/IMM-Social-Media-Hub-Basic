async function getInstagramBusinessId() {
  const pageToken = 'EAAlQXHVB1h8BPRHwgrCqIGBSlhzfyFFTmMZAcIGkr8cawYLqYtxX4gXjJ3r1mM6msPKSWJL17HZATVIVNOdClEZBHxir5XYqKEIRQLzxoOQAM1AUeh05xGE9j5zuOXFkXNjKA6wdRkZBnv3CZABtS779CYLGmcBFTZBDFje2phSjfGWy8rCDWelVS1ZB1ZAYRHZAp3WjDPO0GP9FZCznENzXXZA2UNXtLWfYfg4XMYbqWRJzsAZD';
  
  console.log('🔍 Getting Instagram Business Account ID for @immmediahk...\n');
  
  try {
    // Step 1: Try to get Instagram business account by username
    console.log('1. Searching for Instagram business account by username...');
    const searchUrl = `https://graph.facebook.com/v23.0/immmediahk?fields=id,username,account_type&access_token=${pageToken}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    console.log('Search result:', JSON.stringify(searchData, null, 2));
    
    if (searchData.error) {
      console.log('❌ Cannot find by username, trying different approach...');
      
      // Step 2: Try to get Instagram accounts from the page
      console.log('\n2. Getting Instagram accounts from page...');
      const pageUrl = `https://graph.facebook.com/v23.0/107398872203735?fields=instagram_business_account,connected_instagram_account&access_token=${pageToken}`;
      const pageResponse = await fetch(pageUrl);
      const pageData = await pageResponse.json();
      
      console.log('Page Instagram data:', JSON.stringify(pageData, null, 2));
      
      if (pageData.instagram_business_account) {
        const igBusinessAccountId = pageData.instagram_business_account.id;
        console.log(`✅ Found Instagram Business Account: ${igBusinessAccountId}`);
        
        // Test the Instagram business account
        console.log('\n3. Testing Instagram access...');
        const testUrl = `https://graph.facebook.com/v23.0/${igBusinessAccountId}/media?fields=id,caption,media_type&limit=10&access_token=${pageToken}`;
        const testResponse = await fetch(testUrl);
        const testData = await testResponse.json();
        
        if (testData.error) {
          console.error('❌ Cannot access Instagram media:', testData.error);
        } else {
          console.log(`✅ Instagram works! Found ${testData.data.length} posts`);
          console.log('\n📋 Update your Instagram settings with:');
          console.log(`   Business Account ID: ${igBusinessAccountId}`);
          console.log(`   Page Access Token: ${pageToken}`);
        }
      } else {
        console.log('❌ No Instagram business account found');
      }
    } else {
      // Found by username
      const igBusinessAccountId = searchData.id;
      console.log(`✅ Found Instagram Business Account: ${igBusinessAccountId}`);
      
      // Test the Instagram business account
      console.log('\n3. Testing Instagram access...');
      const testUrl = `https://graph.facebook.com/v23.0/${igBusinessAccountId}/media?fields=id,caption,media_type&limit=10&access_token=${pageToken}`;
      const testResponse = await fetch(testUrl);
      const testData = await testResponse.json();
      
      if (testData.error) {
        console.error('❌ Cannot access Instagram media:', testData.error);
      } else {
        console.log(`✅ Instagram works! Found ${testData.data.length} posts`);
        console.log('\n📋 Update your Instagram settings with:');
        console.log(`   Business Account ID: ${igBusinessAccountId}`);
        console.log(`   Page Access Token: ${pageToken}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getInstagramBusinessId();

