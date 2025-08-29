const path = require('path');
const Database = require('better-sqlite3');

try {
  const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');
  console.log('🔧 Fixing Facebook account date...');
  
  const db = new Database(dbPath);
  
  // Get current Facebook account
  const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ? AND page_id = ?').get('facebook', '100088250407706');
  
  if (account) {
    console.log('📱 Found Facebook account:', account.name);
    console.log('📅 Current added date:', account.added_at);
    
    // Update the added date to a reasonable date (let's say 1 week ago)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    db.prepare('UPDATE social_media_accounts SET added_at = ? WHERE platform = ? AND page_id = ?').run(oneWeekAgo, 'facebook', '100088250407706');
    
    console.log('✅ Updated added date to:', oneWeekAgo);
    
    // Verify the update
    const updatedAccount = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ? AND page_id = ?').get('facebook', '100088250407706');
    console.log('📅 New added date:', updatedAccount.added_at);
  } else {
    console.log('❌ Facebook account not found');
  }
  
  db.close();
  
} catch (error) {
  console.error('❌ Error fixing Facebook date:', error.message);
}
