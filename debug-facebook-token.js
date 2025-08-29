const path = require('path');
const Database = require('better-sqlite3');

try {
  const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');
  console.log('🔍 Debugging Facebook Token...');
  
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
    
    if (account.accessToken) {
      console.log('\n🔑 Token Analysis:');
      console.log('Token Length:', account.accessToken.length);
      console.log('Token Preview (first 30 chars):', account.accessToken.substring(0, 30) + '...');
      console.log('Token Preview (last 10 chars):', '...' + account.accessToken.substring(account.accessToken.length - 10));
      
      // Check token format
      if (account.accessToken.startsWith('EAA')) {
        console.log('✅ Token starts with EAA (correct format)');
      } else {
        console.log('❌ Token does NOT start with EAA (incorrect format)');
        console.log('Expected: EAA...');
        console.log('Actual:  ', account.accessToken.substring(0, 10) + '...');
      }
      
      // Check for common issues
      if (account.accessToken.includes(' ')) {
        console.log('❌ Token contains spaces (should be removed)');
      }
      
      if (account.accessToken.includes('\n') || account.accessToken.includes('\r')) {
        console.log('❌ Token contains line breaks (should be removed)');
      }
      
      if (account.accessToken.length < 100) {
        console.log('❌ Token is too short (should be 200+ characters)');
      }
      
      // Check if it looks like a valid Facebook token
      const isValidFormat = account.accessToken.startsWith('EAA') && 
                           account.accessToken.length > 200 && 
                           !account.accessToken.includes(' ') &&
                           !account.accessToken.includes('\n');
      
      if (isValidFormat) {
        console.log('✅ Token format appears valid');
        console.log('💡 The issue might be:');
        console.log('   - Token has expired');
        console.log('   - Token lacks required permissions');
        console.log('   - App ID mismatch');
      } else {
        console.log('❌ Token format is invalid');
        console.log('💡 You need to get a new valid token from Facebook');
      }
      
    } else {
      console.log('❌ No access token found');
    }
    
  } else {
    console.log('❌ Facebook account not found');
  }
  
  db.close();
  
} catch (error) {
  console.error('❌ Error debugging Facebook token:', error.message);
}
