const path = require('path');
const Database = require('better-sqlite3');

try {
  const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');
  console.log('🔍 Checking Facebook Settings...');
  
  const db = new Database(dbPath);
  
  // Get Facebook account details
  const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ? AND page_id = ?').get('facebook', '100088250407706');
  
  if (account) {
    console.log('\n📱 Facebook Account Details:');
    console.log('Name:', account.accountName);
    console.log('Page ID:', account.pageId);
    console.log('Account ID:', account.accountId);
    console.log('Is Active:', account.isActive);
    console.log('Added Date:', account.added_at);
    console.log('Token Length:', account.accessToken ? account.accessToken.length : 'NULL');
    console.log('Token Preview:', account.accessToken ? account.accessToken.substring(0, 20) + '...' : 'NULL');
    
    // Check if token looks valid (should start with EAA...)
    if (account.accessToken && account.accessToken.startsWith('EAA')) {
      console.log('✅ Token format looks correct (starts with EAA)');
    } else {
      console.log('❌ Token format may be incorrect (should start with EAA)');
    }
    
  } else {
    console.log('❌ Facebook account not found');
  }
  
  db.close();
  
} catch (error) {
  console.error('❌ Error checking Facebook settings:', error.message);
}
