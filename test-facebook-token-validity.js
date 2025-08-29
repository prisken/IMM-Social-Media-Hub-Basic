// Test Facebook token validity
const path = require('path');
const Database = require('better-sqlite3');
const https = require('https');

async function testFacebookToken() {
  try {
    const dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
    console.log('🔍 Testing Facebook token validity...');
    
    const db = new Database(dbPath);
    
    // Get Facebook account
    const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ? AND is_active = 1').get('facebook');
    
    if (!account) {
      console.log('❌ No active Facebook account found');
      db.close();
      return;
    }
    
    console.log('📱 Account:', account.account_name);
    console.log('🆔 Page ID:', account.page_id);
    console.log('🔑 Token Preview:', account.access_token ? account.access_token.substring(0, 20) + '...' : 'NULL');
    
    if (!account.access_token) {
      console.log('❌ No access token found');
      db.close();
      return;
    }
    
    // Test token by getting page info
    const pageId = account.page_id.trim();
    const accessToken = account.access_token;
    
    console.log('\n🔍 Testing token with Facebook Graph API...');
    
    const url = `https://graph.facebook.com/v18.0/${pageId}?fields=id,name,fan_count,verification_status&access_token=${accessToken}`;
    
    const response = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });
    
    if (response.error) {
      console.log('❌ Token Error:', response.error.message);
      console.log('🔍 Error Code:', response.error.code);
      console.log('🔍 Error Subcode:', response.error.error_subcode);
    } else {
      console.log('✅ Token is valid!');
      console.log('📱 Page Name:', response.name);
      console.log('🆔 Page ID:', response.id);
      console.log('👥 Fan Count:', response.fan_count);
      console.log('✅ Verification Status:', response.verification_status);
    }
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error testing token:', error.message);
  }
}

testFacebookToken();

