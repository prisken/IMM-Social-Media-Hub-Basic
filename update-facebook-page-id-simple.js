#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🔧 Facebook Page ID Update Tool\n');

const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');

try {
  const db = new Database(dbPath);
  
  // Get current Facebook account
  const facebookAccount = db.prepare("SELECT * FROM social_media_accounts WHERE platform = 'facebook'").get();
  
  if (!facebookAccount) {
    console.log('❌ No Facebook account found. Please add one first.');
    process.exit(1);
  }
  
  console.log('📋 Current Facebook Account:');
  console.log(`  Account Name: ${facebookAccount.account_name}`);
  console.log(`  Page ID: ${facebookAccount.page_id || 'NOT SET'}`);
  console.log(`  Active: ${facebookAccount.is_active ? 'Yes' : 'No'}`);
  
  // Get Page ID from command line argument
  const pageId = process.argv[2];
  
  if (!pageId) {
    console.log('\n📝 Usage:');
    console.log('  node update-facebook-page-id-simple.js YOUR_PAGE_ID');
    console.log('\n📝 To find your Facebook Page ID:');
    console.log('1. Go to your Facebook Page');
    console.log('2. Click "About" in the left sidebar');
    console.log('3. Scroll down to find "Page ID"');
    console.log('4. Or use: https://findmyfbid.com/');
    console.log('5. Or go to Page Info and look for the ID');
    console.log('\n💡 Your Page ID is usually a 15-16 digit number');
    console.log('   Example: 123456789012345');
    process.exit(1);
  }
  
  // Update the Page ID
  db.prepare("UPDATE social_media_accounts SET page_id = ?, updated_at = ? WHERE platform = 'facebook'").run(
    pageId, 
    new Date().toISOString()
  );
  
  console.log(`✅ Updated Page ID to: ${pageId}`);
  
  // Verify the update
  const updatedAccount = db.prepare("SELECT * FROM social_media_accounts WHERE platform = 'facebook'").get();
  console.log('\n📋 Updated Account:');
  console.log(`  Account Name: ${updatedAccount.account_name}`);
  console.log(`  Page ID: ${updatedAccount.page_id}`);
  console.log(`  Active: ${updatedAccount.is_active ? 'Yes' : 'No'}`);
  
  db.close();
  
  console.log('\n🎉 Facebook Page ID updated successfully!');
  console.log('💡 Restart the app to see the changes in the Settings.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
