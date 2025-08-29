const path = require('path');
const Database = require('better-sqlite3');

try {
  const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');
  console.log('🧪 Testing Facebook Refresh with New Token...');
  
  const db = new Database(dbPath);
  
  // Get current Facebook account
  const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ? AND page_id = ?').get('facebook', '100088250407706');
  
  if (account) {
    console.log('\n📱 Current Facebook Account:');
    console.log('Name:', account.accountName);
    console.log('Page ID:', account.pageId);
    console.log('Token Length:', account.accessToken ? account.accessToken.length : 'NULL');
    console.log('Token Preview:', account.accessToken ? account.accessToken.substring(0, 20) + '...' : 'NULL');
    
    // Test the token format
    if (account.accessToken && account.accessToken.startsWith('EAA')) {
      console.log('✅ Token format is correct');
      
      // Test a simple Facebook API call
      console.log('\n🔍 Testing Facebook API call...');
      const testUrl = `https://graph.facebook.com/v23.0/${account.pageId}?fields=name&access_token=${account.accessToken}`;
      
      fetch(testUrl)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            console.log('❌ Facebook API Error:', data.error);
          } else {
            console.log('✅ Facebook API Success:', data);
            console.log('Page Name:', data.name);
          }
        })
        .catch(error => {
          console.log('❌ Network Error:', error.message);
        });
        
    } else {
      console.log('❌ Token format is incorrect');
    }
    
  } else {
    console.log('❌ Facebook account not found');
  }
  
  db.close();
  
} catch (error) {
  console.error('❌ Error testing Facebook refresh:', error.message);
}
