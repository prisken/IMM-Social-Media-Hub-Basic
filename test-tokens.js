const fetch = require('node-fetch');

async function testTokens() {
  console.log('🔍 Testing Facebook and Instagram tokens...\n');
  
  // Test Facebook token
  try {
    console.log('📘 Testing Facebook token...');
    const fbResponse = await fetch('https://graph.facebook.com/v18.0/me?access_token=YOUR_FACEBOOK_TOKEN_HERE');
    const fbData = await fbResponse.json();
    
    if (fbData.error) {
      console.log('❌ Facebook token error:', fbData.error);
    } else {
      console.log('✅ Facebook token is valid');
      console.log('📋 User info:', fbData);
    }
  } catch (error) {
    console.log('❌ Facebook API error:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test Instagram token
  try {
    console.log('📸 Testing Instagram token...');
    const igResponse = await fetch('https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_INSTAGRAM_TOKEN_HERE');
    const igData = await igResponse.json();
    
    if (igData.error) {
      console.log('❌ Instagram token error:', igData.error);
    } else {
      console.log('✅ Instagram token is valid');
      console.log('📋 Accounts:', igData);
    }
  } catch (error) {
    console.log('❌ Instagram API error:', error.message);
  }
}

testTokens();

