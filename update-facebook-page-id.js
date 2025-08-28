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
  console.log(`  Business Account ID: ${facebookAccount.business_account_id || 'NOT SET'}`);
  console.log(`  Active: ${facebookAccount.is_active ? 'Yes' : 'No'}`);
  
  console.log('\n📝 To find your Facebook Page ID:');
  console.log('1. Go to your Facebook Page');
  console.log('2. Click "About" in the left sidebar');
  console.log('3. Scroll down to find "Page ID"');
  console.log('4. Or use: https://findmyfbid.com/');
  console.log('5. Or go to Page Info and look for the ID');
  
  console.log('\n💡 Your Page ID is usually a 15-16 digit number');
  console.log('   Example: 123456789012345');
  
  // If you want to update it programmatically, uncomment the lines below:
  /*
  const pageId = 'YOUR_PAGE_ID_HERE'; // Replace with your actual Page ID
  
  if (pageId && pageId !== 'YOUR_PAGE_ID_HERE') {
    db.prepare("UPDATE social_media_accounts SET page_id = ? WHERE platform = 'facebook'").run(pageId);
    console.log(`✅ Updated Page ID to: ${pageId}`);
  }
  */
  
  db.close();
  
  console.log('\n📋 Next Steps:');
  console.log('1. Find your Facebook Page ID using the methods above');
  console.log('2. Update the page_id in the database');
  console.log('3. Restart the app to see the changes');
  console.log('4. Test the connection in Settings');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
