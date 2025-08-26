const sqlite3 = require('sqlite3').verbose();

console.log('🔧 Direct LinkedIn Token Update');
console.log('===============================\n');

// Your new token
const newToken = 'AQVDHvAbCtlF1fsZ0fhYIKdq-u8SlpwCkMkzkRLEKBaNp4k9oZLhpAeju9nyOFbBuc1FimdrYwbnOcxe3tJ4X9foWg7Gqg9E_7TYf2nEYnF_2I_BImF3AsMPdgbHIoSir9o-gndMzFnwUuEp5VCiFnsToa0_fxIL1UCxbn4IvZLQyYFCKUSNhTaMYTxQ4UTTJNm9uHt9IznMZ0f2rkfaEMHF5OPx2v2zv7Pu8Dag_rQAoY3Zrgx5dduJkaUBydpOLKEk2m_HO63RKGxtQlE8Ch9krZl5c75t2QYiw5PsIk1GU7YVrRLzmaDzoiSP65mHpm8tpdtkpxRlj6_SLHvt1p7OWJqQRA';
const organizationId = '860d47fdd076hh';

// Connect to database
const db = new sqlite3.Database('user_data/imm_marketing_hub.db');

console.log('🔄 Updating LinkedIn token in database...');

// Update the LinkedIn account
db.run(`
    UPDATE social_media_accounts 
    SET access_token = ?, 
        organization_id = ?,
        updated_at = datetime('now')
    WHERE platform = 'linkedin' AND account_name = 'IMM Marketing Hub'
`, [newToken, organizationId], function(err) {
    if (err) {
        console.error('❌ Error updating token:', err.message);
        db.close();
        return;
    }

    console.log('✅ LinkedIn token updated successfully!');
    console.log('📊 Rows affected:', this.changes);

    // Verify the update
    db.get('SELECT * FROM social_media_accounts WHERE platform = "linkedin" AND account_name = ?',
        ['IMM Marketing Hub'], (err, row) => {
            if (err) {
                console.error('❌ Error querying updated account:', err.message);
            } else if (row) {
                console.log('\n📋 Updated Account Details:');
                console.log('Platform:', row.platform);
                console.log('Account Name:', row.account_name);
                console.log('Organization ID:', row.organization_id);
                console.log('Access Token (first 20 chars):', row.access_token.substring(0, 20) + '...');
                console.log('Updated At:', row.updated_at);
                console.log('\n🎉 Token update complete!');
                console.log('💡 You can now test posting with: node test-linkedin-token.js');
            } else {
                console.log('❌ No LinkedIn account found after update');
            }
            db.close();
        });
});
