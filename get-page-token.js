// Script to get Page Access Token from User Token
async function getPageToken() {
  // Your current user token from the database
  const userToken = 'EAAlQXHVB1h8BPeD886s...'; // This is the current token from your database
  const pageId = '107398872203735';
  
  console.log('🔍 Getting Page Access Token...\n');
  
  try {
    // Step 1: Get page access token
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
    
    // Step 2: Test the page token
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
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getPageToken();
