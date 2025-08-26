#!/usr/bin/env node

/**
 * Social Media Account Management Script
 * 
 * This script helps you view and manage your social media accounts.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');

async function manageAccounts() {
  console.log('📱 Social Media Account Management\n');

  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Get all accounts
      db.all('SELECT * FROM social_media_accounts ORDER BY platform, created_at DESC', (err, accounts) => {
        if (err) {
          console.error('❌ Error querying accounts:', err.message);
          reject(err);
          return;
        }

        if (accounts.length === 0) {
          console.log('📭 No social media accounts found.');
          console.log('💡 Add accounts in the app: Settings → Social Accounts');
          db.close();
          resolve();
          return;
        }

        // Group accounts by platform
        const accountsByPlatform = {};
        accounts.forEach(acc => {
          if (!accountsByPlatform[acc.platform]) {
            accountsByPlatform[acc.platform] = [];
          }
          accountsByPlatform[acc.platform].push(acc);
        });

        console.log(`📊 Found ${accounts.length} accounts across ${Object.keys(accountsByPlatform).length} platforms:\n`);

        // Display accounts by platform
        Object.keys(accountsByPlatform).forEach(platform => {
          const platformAccounts = accountsByPlatform[platform];
          console.log(`🔵 ${platform.toUpperCase()} (${platformAccounts.length} account${platformAccounts.length > 1 ? 's' : ''}):`);
          
          platformAccounts.forEach((acc, index) => {
            const status = acc.is_active ? '✅ Active' : '❌ Inactive';
            const tokenType = acc.access_token.toLowerCase().includes('test') ? '🧪 Test Token' : '🔑 Real Token';
            const tokenPreview = acc.access_token.substring(0, 20) + '...';
            
            console.log(`   ${index + 1}. ${acc.account_name}`);
            console.log(`      Status: ${status}`);
            console.log(`      Token: ${tokenType} (${tokenPreview})`);
            console.log(`      ID: ${acc.id}`);
            
            if (acc.page_id) console.log(`      Page ID: ${acc.page_id}`);
            if (acc.business_account_id) console.log(`      Business Account ID: ${acc.business_account_id}`);
            if (acc.organization_id) console.log(`      Organization ID: ${acc.organization_id}`);
            
            console.log(`      Created: ${new Date(acc.created_at).toLocaleString()}`);
            console.log('');
          });
        });

        // Show posting priority
        console.log('🎯 Posting Priority (which account will be used for posting):');
        Object.keys(accountsByPlatform).forEach(platform => {
          const platformAccounts = accountsByPlatform[platform];
          if (platformAccounts.length > 1) {
            console.log(`\n   ${platform.toUpperCase()}:`);
            
            // Find the account that would be used for posting (real account first, then first active)
            const realAccount = platformAccounts.find(acc => 
              acc.is_active && 
              !acc.account_name.toLowerCase().includes('test') && 
              !acc.access_token.toLowerCase().includes('test')
            );
            
            const postingAccount = realAccount || platformAccounts.find(acc => acc.is_active) || platformAccounts[0];
            
            console.log(`   ⭐ Will post from: ${postingAccount.account_name}`);
            console.log(`   📝 Available accounts: ${platformAccounts.map(acc => acc.account_name).join(', ')}`);
          } else {
            console.log(`\n   ${platform.toUpperCase()}: ${platformAccounts[0].account_name} (only account)`);
          }
        });

        // Recommendations
        console.log('\n💡 Recommendations:');
        
        Object.keys(accountsByPlatform).forEach(platform => {
          const platformAccounts = accountsByPlatform[platform];
          const testAccounts = platformAccounts.filter(acc => 
            acc.access_token.toLowerCase().includes('test') || 
            acc.account_name.toLowerCase().includes('test')
          );
          const realAccounts = platformAccounts.filter(acc => 
            !acc.access_token.toLowerCase().includes('test') && 
            !acc.account_name.toLowerCase().includes('test')
          );

          if (testAccounts.length > 0 && realAccounts.length === 0) {
            console.log(`   ⚠️  ${platform.toUpperCase()}: Only test accounts found. Add a real account for actual posting.`);
          } else if (testAccounts.length > 0 && realAccounts.length > 0) {
            console.log(`   ✅ ${platform.toUpperCase()}: Real account available. Test accounts can be removed.`);
          } else if (realAccounts.length > 1) {
            console.log(`   ℹ️  ${platform.toUpperCase()}: Multiple real accounts. The app will use the first non-test account.`);
          }
        });

        console.log('\n🔧 Management Commands:');
        console.log('   • View accounts in app: Settings → Social Accounts');
        console.log('   • Remove test accounts: Use the app interface');
        console.log('   • Update tokens: Edit accounts in Settings');
        console.log('   • Test connections: Use "Test Connection" in Settings');

        db.close();
        resolve();
      });
    });
  });
}

// Run the script
if (require.main === module) {
  manageAccounts()
    .then(() => {
      console.log('\n✅ Account management complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { manageAccounts }; 