const sqlite3 = require('sqlite3').verbose();

console.log('📷 Updating Instagram Token');
console.log('==========================\n');

// After you log in to Instagram, we'll use the Facebook User Token
// which should now have access to the Instagram Business Account
const userToken = 'EAAlQXHVB1h8BPZA6ZCnLEjNpkYGdV5TczeoPc1ffCDktUMYOsZBnfbV4nLxiXMoYmZA9kH6DVuftmn4dby0gKut9CIIBvR6tvgIugqwUABlWTnO3PEGoByVZBkARJD31roxtYV0vgNSLYSmpe3hJFZCt49TUgoIbThHYZCxpAfPaR2R9VtEcL4ZBQzfaPB3LKgdqHgZDZD';

// The Instagram Business Account ID from your settings
const instagramBusinessAccountId = '17841456554940613';

// Connect to database
const db = new sqlite3.Database('user_data/imm_marketing_hub.db');

console.log('🔄 Updating Instagram token in database...');

// Update the Instagram account with the User Token (which now has Instagram access)
db.run(`
    UPDATE social_media_accounts 
    SET access_token = ?, 
        business_account_id = ?,
        updated_at = datetime('now')
    WHERE platform = 'instagram' AND account_name = 'immmediahk'
`, [userToken, instagramBusinessAccountId], function(err) {
    if (err) {
        console.error('❌ Error updating Instagram token:', err.message);
        db.close();
        return;
    }

    console.log('✅ Instagram token updated successfully!');
    console.log('📊 Rows affected:', this.changes);

    // Verify the update
    db.get('SELECT * FROM social_media_accounts WHERE platform = "instagram" AND account_name = ?',
        ['immmediahk'], (err, row) => {
            if (err) {
                console.error('❌ Error querying updated account:', err.message);
            } else if (row) {
                console.log('\n📋 Updated Instagram Account Details:');
                console.log('Platform:', row.platform);
                console.log('Account Name:', row.account_name);
                console.log('Business Account ID:', row.business_account_id);
                console.log('Access Token (first 20 chars):', row.access_token.substring(0, 20) + '...');
                console.log('Updated At:', row.updated_at);
                console.log('\n🎉 Instagram setup complete!');
                console.log('💡 Your app should now be able to access Instagram!');
            } else {
                console.log('❌ No Instagram account found after update');
            }
            db.close();
        });
});
