const { AppDatabase } = require('./dist/main/database.js');

async function checkInstagramAccounts() {
  try {
    const db = new AppDatabase();
    await db.initialize();
    
    const accounts = await db.getSocialMediaAccounts();
    const instagramAccounts = accounts.filter(acc => acc.platform === 'instagram');
    
    console.log('📋 All Instagram accounts:');
    instagramAccounts.forEach((account, index) => {
      console.log(`  ${index + 1}. ID: ${account.id}`);
      console.log(`     Account Name: ${account.accountName}`);
      console.log(`     Is Active: ${account.isActive}`);
      console.log(`     Business Account ID: ${account.businessAccountId || 'NOT SET'}`);
      console.log(`     Access Token: ${account.accessToken ? 'SET' : 'NOT SET'}`);
      console.log('');
    });
    
    if (instagramAccounts.length === 0) {
      console.log('❌ No Instagram accounts found in database');
    } else {
      const activeAccount = instagramAccounts.find(acc => acc.isActive);
      if (activeAccount) {
        console.log('✅ Active Instagram account found');
        if (!activeAccount.businessAccountId) {
          console.log('⚠️  WARNING: Business Account ID is missing!');
          console.log('   This is required for Instagram data fetching.');
        }
      } else {
        console.log('⚠️  No active Instagram account found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking Instagram accounts:', error);
  }
}

checkInstagramAccounts();

