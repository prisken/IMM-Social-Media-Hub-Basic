const sqlite3 = require('sqlite3').verbose();

console.log('🔧 Updating Facebook Page ID');
console.log('============================\n');

// The correct Page ID for IMM HK
const correctPageId = '107398872203735';

// Connect to database
const db = new sqlite3.Database('user_data/imm_marketing_hub.db');

console.log('🔄 Updating Facebook page ID in database...');

// Update the Facebook account with correct page ID
db.run(`
    UPDATE social_media_accounts 
    SET page_id = ?, 
        updated_at = datetime('now')
    WHERE platform = 'facebook' AND account_name = 'IMM HK'
`, [correctPageId], function(err) {
    if (err) {
        console.error('❌ Error updating page ID:', err.message);
        db.close();
        return;
    }

    console.log('✅ Facebook page ID updated successfully!');
    console.log('📊 Rows affected:', this.changes);

    // Verify the update
    db.get('SELECT * FROM social_media_accounts WHERE platform = "facebook" AND account_name = ?',
        ['IMM HK'], (err, row) => {
            if (err) {
                console.error('❌ Error querying updated account:', err.message);
            } else if (row) {
                console.log('\n📋 Updated Account Details:');
                console.log('Platform:', row.platform);
                console.log('Account Name:', row.account_name);
                console.log('Page ID:', row.page_id);
                console.log('Access Token (first 20 chars):', row.access_token.substring(0, 20) + '...');
                console.log('Updated At:', row.updated_at);
                console.log('\n🎉 Facebook setup complete!');
                console.log('💡 Your app should now be able to post to Facebook!');
            } else {
                console.log('❌ No Facebook account found after update');
            }
            db.close();
        });
});
