// Simple script to fix Facebook account date
// Run this in the Electron process

const path = require('path');
const Database = require('better-sqlite3');

try {
  const dbPath = path.join(process.cwd(), 'user_data', 'imm_marketing_hub.db');
  console.log('🔧 Fixing Facebook account date...');
  
  const db = new Database(dbPath);
  
  // Set the date to 1 week ago (more realistic)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  // Update the Facebook account
  const result = db.prepare('UPDATE social_media_accounts SET added_at = ? WHERE platform = ? AND page_id = ?').run(oneWeekAgo, 'facebook', '100088250407706');
  
  if (result.changes > 0) {
    console.log('✅ Successfully updated Facebook account date to:', oneWeekAgo);
    
    // Verify the update
    const account = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ? AND page_id = ?').get('facebook', '100088250407706');
    console.log('📅 New added date:', account.added_at);
  } else {
    console.log('❌ No Facebook account found to update');
  }
  
  db.close();
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
