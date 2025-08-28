async function fixInstagramSimple() {
  // Use the Facebook page token we got earlier
  const pageToken = 'EAAlQXHVB1h8BPRHwgrCqIGBSlhzfyFFTmMZAcIGkr8cawYLqYtxX4gXjJ3r1mM6msPKSWJL17HZATVIVNOdClEZBHxir5XYqKEIRQLzxoOQAM1AUeh05xGE9j5zuOXFkXNjKA6wdRkZBnv3CZABtS779CYLGmcBFTZBDFje2phSjfGWy8rCDWelVS1ZB1ZAYRHZAp3WjDPO0GP9FZCznENzXXZA2UNXtLWfYfg4XMYbqWRJzsAZD';
  const pageId = '107398872203735';
  
  console.log('🔍 Fixing Instagram setup using Facebook page token...\n');
  
  try {
    // Step 1: Get Instagram business account from the page
    console.log('1. Getting Instagram business account from page...');
    const igUrl = `https://graph.facebook.com/v23.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`;
    const igResponse = await fetch(igUrl);
    const igData = await igResponse.json();
    
    if (igData.error) {
      console.error('❌ Error getting Instagram account:', igData.error);
      return;
    }
    
    if (!igData.instagram_business_account) {
      console.error('❌ No Instagram business account connected to this page');
      return;
    }
    
    const igBusinessAccountId = igData.instagram_business_account.id;
    console.log(`✅ Found Instagram Business Account: ${igBusinessAccountId}`);
    
    // Step 2: Test Instagram access
    console.log('\n2. Testing Instagram access...');
    const testUrl = `https://graph.facebook.com/v23.0/${igBusinessAccountId}/media?fields=id,caption,media_type&limit=5&access_token=${pageToken}`;
    const testResponse = await fetch(testUrl);
    const testData = await testResponse.json();
    
    if (testData.error) {
      console.error('❌ Cannot access Instagram media:', testData.error);
    } else {
      console.log(`✅ Instagram works! Found ${testData.data.length} posts`);
      if (testData.data.length > 0) {
        console.log('Sample post:', testData.data[0]);
      }
      
      console.log('\n📋 Update your Instagram settings with:');
      console.log(`   Business Account ID: ${igBusinessAccountId}`);
      console.log(`   Page Access Token: ${pageToken}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixInstagramSimple();

