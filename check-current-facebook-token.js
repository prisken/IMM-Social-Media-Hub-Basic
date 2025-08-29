// Check current Facebook token status
const path = require('path');
const Database = require('better-sqlite3');

try {
  const dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
  console.log('🔍 Checking current Facebook token...');
  
  const db = new Database(dbPath);
  
  // Get all Facebook accounts
  const accounts = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ?').all('facebook');
  
  if (accounts.length > 0) {
    console.log(`📱 Found ${accounts.length} Facebook account(s):`);
    
    accounts.forEach((account, index) => {
      console.log(`\n--- Account ${index + 1} ---`);
      console.log('📱 Account Name:', account.account_name);
      console.log('🆔 Page ID:', account.page_id);
      console.log('🔑 Access Token Length:', account.access_token ? account.access_token.length : 'NULL');
      console.log('🔑 Token Preview:', account.access_token ? account.access_token.substring(0, 20) + '...' : 'NULL');
      console.log('📅 Created:', account.created_at);
      console.log('📅 Updated:', account.updated_at);
      console.log('✅ Active:', account.is_active ? 'Yes' : 'No');
    });
  } else {
    console.log('❌ No Facebook accounts found');
  }
  
  db.close();
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

