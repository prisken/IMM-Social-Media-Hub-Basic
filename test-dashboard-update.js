#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🧪 Testing Dashboard Update Detection\n');

const dbPath = path.join(__dirname, 'user_data', 'imm_marketing_hub.db');

try {
  const db = new Database(dbPath);
  
  // Test 1: Check current Facebook account status
  console.log('📋 Test 1: Current Facebook Account Status');
  const facebookAccount = db.prepare("SELECT * FROM social_media_accounts WHERE platform = 'facebook'").get();
  
  if (facebookAccount) {
    console.log(`  ✅ Account found: ${facebookAccount.account_name}`);
    console.log(`  ✅ Active: ${facebookAccount.is_active ? 'Yes' : 'No'}`);
    console.log(`  ✅ Page ID: ${facebookAccount.page_id || 'NOT SET'}`);
    console.log(`  ✅ Access Token: ${facebookAccount.access_token ? 'SET' : 'NOT SET'}`);
  } else {
    console.log('  ❌ No Facebook account found');
  }
  
  // Test 2: Simulate getPlatformStats
  console.log('\n📊 Test 2: Platform Stats Simulation');
  const accounts = db.prepare('SELECT * FROM social_media_accounts').all();
  
  const stats = {
    facebook: { connected: false, accountName: undefined },
    instagram: { connected: false, accountName: undefined },
    linkedin: { connected: false, accountName: undefined }
  };
  
  accounts.forEach(account => {
    if (account.is_active) {
      const platform = account.platform.toLowerCase();
      if (stats[platform]) {
        stats[platform].connected = true;
        stats[platform].accountName = account.account_name;
      }
    }
  });
  
  console.log('  Platform Stats:', JSON.stringify(stats, null, 2));
  
  // Test 3: Check if dashboard should show Facebook as connected
  console.log('\n🎯 Test 3: Dashboard Connection Status');
  const facebookConnected = stats.facebook.connected;
  console.log(`  Facebook should show as: ${facebookConnected ? '✅ CONNECTED' : '❌ NOT CONNECTED'}`);
  
  if (facebookConnected) {
    console.log(`  Account Name: ${stats.facebook.accountName}`);
    console.log('  ✅ Dashboard should display Facebook as connected');
  } else {
    console.log('  ❌ Dashboard will show Facebook as not connected');
    console.log('  💡 Make sure the account is active in the database');
  }
  
  // Test 4: Check for potential issues
  console.log('\n🔍 Test 4: Potential Issues Check');
  
  if (facebookAccount) {
    if (!facebookAccount.page_id) {
      console.log('  ⚠️  Missing Page ID - this may affect posting functionality');
    }
    
    if (!facebookAccount.access_token) {
      console.log('  ⚠️  Missing Access Token - this will prevent API calls');
    }
    
    if (!facebookAccount.is_active) {
      console.log('  ⚠️  Account is inactive - dashboard will show as disconnected');
    }
    
    if (facebookAccount.access_token && facebookAccount.is_active) {
      console.log('  ✅ Account appears to be properly configured');
    }
  }
  
  db.close();
  
  console.log('\n📝 Summary:');
  console.log('  - If Facebook shows as connected, the dashboard should update');
  console.log('  - If not, check the account status in the database');
  console.log('  - Use the refresh button in the dashboard to reload data');
  console.log('  - Make sure to restart the app after making changes');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
