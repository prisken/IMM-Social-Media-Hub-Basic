const Database = require('better-sqlite3');
const path = require('path');

try {
  const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');
  console.log('Database path:', dbPath);
  
  const db = new Database(dbPath);
  const accounts = db.prepare('SELECT * FROM social_media_accounts').all();
  
  console.log('\n=== Social Media Accounts ===');
  if (accounts.length === 0) {
    console.log('No social media accounts found in database');
  } else {
    accounts.forEach((acc, index) => {
      console.log(`\n--- Account ${index + 1} ---`);
      console.log(`Platform: ${acc.platform}`);
      console.log(`Account Name: ${acc.account_name}`);
      console.log(`Page ID: ${acc.page_id || 'NULL'}`);
      console.log(`Business Account ID: ${acc.business_account_id || 'NULL'}`);
      console.log(`Access Token: ${acc.access_token ? acc.access_token.substring(0, 20) + '...' : 'NULL'}`);
      console.log(`Token Length: ${acc.access_token ? acc.access_token.length : 0}`);
      console.log(`Is Active: ${acc.is_active}`);
      console.log(`Created: ${acc.created_at}`);
    });
  }
  
  db.close();
} catch (error) {
  console.error('Error checking database:', error.message);
}

