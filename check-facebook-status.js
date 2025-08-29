const path = require('path');
const Database = require('better-sqlite3');

try {
  const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');
  console.log('🔍 Checking Facebook connection status...');
  console.log('Database path:', dbPath);
  
  const db = new Database(dbPath);
  
  // Check social media accounts
  const accounts = db.prepare('SELECT * FROM social_media_accounts WHERE platform = ?').all('facebook');
  console.log('\n📱 Facebook Accounts:');
  console.log(accounts);
  
  // Check posts
  const posts = db.prepare('SELECT * FROM posts WHERE platform = ?').all('facebook');
  console.log('\n📝 Facebook Posts:');
  console.log(`Found ${posts.length} Facebook posts`);
  
  // Check analytics
  const analytics = db.prepare('SELECT * FROM analytics_metrics WHERE platform = ?').all('facebook');
  console.log('\n📊 Facebook Analytics:');
  console.log(`Found ${analytics.length} Facebook analytics records`);
  
  db.close();
  
} catch (error) {
  console.error('❌ Error checking Facebook status:', error.message);
}
