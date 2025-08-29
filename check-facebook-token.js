// Check Facebook token status
// Run this in the Electron process

const path = require('path');
const Database = require('better-sqlite3');

try {
  const dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
  console.log('🔍 Checking Facebook token...');
  
  const db = new Database(dbPath);
  
  // Get Facebook account details
  const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ? AND page_id = ?').get('facebook', '100088250407706');
  
  if (account) {
    console.log('📱 Facebook Account:', account.name);
    console.log('🔑 Access Token Length:', account.access_token ? account.access_token.length : 'NULL');
    console.log('🔑 Token Preview:', account.access_token ? account.access_token.substring(0, 20) + '...' : 'NULL');
    console.log('📅 Token Expires:', account.token_expires_at);
    console.log('📅 Added Date:', account.added_at);
  } else {
    console.log('❌ Facebook account not found');
  }
  
  db.close();
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
