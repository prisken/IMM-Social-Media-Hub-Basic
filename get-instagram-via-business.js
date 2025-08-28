async function getInstagramViaBusiness() {
  const pageToken = 'EAAlQXHVB1h8BPRHwgrCqIGBSlhzfyFFTmMZAcIGkr8cawYLqYtxX4gXjJ3r1mM6msPKSWJL17HZATVIVNOdClEZBHxir5XYqKEIRQLzxoOQAM1AUeh05xGE9j5zuOXFkXNjKA6wdRkZBnv3CZABtS779CYLGmcBFTZBDFje2phSjfGWy8rCDWelVS1ZB1ZAYRHZAp3WjDPO0GP9FZCznENzXXZA2UNXtLWfYfg4XMYbqWRJzsAZD';
  
  console.log('🔍 Getting Instagram account via Business Manager...\n');
  
  try {
    // Step 1: Get user's business accounts
    console.log('1. Getting user business accounts...');
    const businessUrl = `https://graph.facebook.com/v23.0/me?fields=business_users{id,name,business{id,name,instagram_accounts{id,username,account_type}}}&access_token=${pageToken}`;
    const businessResponse = await fetch(businessUrl);
    const businessData = await businessResponse.json();
    
    console.log('Business data:', JSON.stringify(businessData, null, 2));
    
    if (businessData.error) {
      console.log('❌ Cannot get business data, trying page approach...');
      
      // Step 2: Try to get Instagram account directly from page with different fields
      console.log('\n2. Trying page with different fields...');
      const pageUrl = `https://graph.facebook.com/v23.0/107398872203735?fields=id,name,instagram_business_account,connected_instagram_account,instagram_accounts&access_token=${pageToken}`;
      const pageResponse = await fetch(pageUrl);
      const pageData = await pageResponse.json();
      
      console.log('Page data with Instagram fields:', JSON.stringify(pageData, null, 2));
      
      // Step 3: Try to get Instagram account by searching in the business
      console.log('\n3. Trying to get Instagram account from business...');
      const igUrl = `https://graph.facebook.com/v23.0/me/accounts?fields=instagram_business_account,connected_instagram_account&access_token=${pageToken}`;
      const igResponse = await fetch(igUrl);
      const igData = await igResponse.json();
      
      console.log('Instagram accounts from business:', JSON.stringify(igData, null, 2));
      
      if (igData.data && igData.data.length > 0) {
        for (const account of igData.data) {
          if (account.instagram_business_account) {
            const igBusinessAccountId = account.instagram_business_account.id;
            console.log(`✅ Found Instagram Business Account: ${igBusinessAccountId}`);
            
            // Test the Instagram business account
            console.log('\n4. Testing Instagram access...');
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
              return;
            }
          }
        }
      }
      
      console.log('❌ No Instagram business account found in any approach');
    } else {
      // Process business data
      console.log('✅ Got business data, processing...');
      // Process the business data structure
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getInstagramViaBusiness();

