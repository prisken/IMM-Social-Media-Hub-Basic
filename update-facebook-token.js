const sqlite3 = require('sqlite3').verbose();

console.log('🔧 Updating Facebook Token');
console.log('==========================\n');

// Your new Facebook Page Access Token for IMM HK page
const newUserToken = 'EAAlQXHVB1h8BPUjfwiID8eVYiGcvwxdokRa72vXUrXRaiImB8j7HdAm8JFbcS1PYqhoIbwk9qYIM37ARMoTv7bfNwGnECJNinBYh5SotzsWhkZANu2NhOYUvhrWWPBnH5YSwGzvNgcu8FhEgETQKk0MaCaRwWdp8UgQ6ykGdNQVRihnok3BD12xADegnYyR0ZD';

// Connect to database
const db = new sqlite3.Database('user_data/imm_marketing_hub.db');

console.log('🔄 Updating Facebook token in database...');

// Update the Facebook account
db.run(`
    UPDATE social_media_accounts 
    SET access_token = ?, 
        updated_at = datetime('now')
    WHERE platform = 'facebook' AND account_name = 'IMM HK'
`, [newUserToken], function(err) {
    if (err) {
        console.error('❌ Error updating token:', err.message);
        db.close();
        return;
    }

    console.log('✅ Facebook token updated successfully!');
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
                console.log('Access Token (first 20 chars):', row.access_token.substring(0, 20) + '...');
                console.log('Updated At:', row.updated_at);
                console.log('\n🎉 Token update complete!');
                console.log('💡 Next step: We need to get a Page Access Token for posting');
            } else {
                console.log('❌ No Facebook account found after update');
            }
            db.close();
        });
});
