const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔧 LinkedIn Token Update Tool');
console.log('============================\n');

// Connect to database
const db = new sqlite3.Database('user_data/imm_marketing_hub.db');

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function updateLinkedInToken() {
    try {
        console.log('📋 Please provide the following information:\n');

        // Get new access token
        const accessToken = await askQuestion('🔑 LinkedIn Access Token: ');
        if (!accessToken) {
            console.log('❌ Access token is required!');
            rl.close();
            db.close();
            return;
        }

        // Get organization ID
        const organizationId = await askQuestion('🏢 LinkedIn Organization ID (from company URL): ');
        if (!organizationId) {
            console.log('❌ Organization ID is required!');
            rl.close();
            db.close();
            return;
        }

        // Get organization name
        const organizationName = await askQuestion('📝 Organization Name (default: "IMM Marketing Hub"): ') || 'IMM Marketing Hub';

        console.log('\n🔄 Updating LinkedIn account in database...');

        // Update the LinkedIn account
        const updateQuery = `
            UPDATE social_media_accounts 
            SET access_token = ?, 
                organization_id = ?, 
                account_name = ?,
                updated_at = datetime('now')
            WHERE platform = 'linkedin' AND account_name = ' IMM Marketing Hub'
        `;

        db.run(updateQuery, [accessToken, organizationId, organizationName], function(err) {
            if (err) {
                console.error('❌ Database error:', err.message);
            } else {
                if (this.changes > 0) {
                    console.log('✅ LinkedIn account updated successfully!');
                    console.log(`📊 Rows affected: ${this.changes}`);
                    
                    // Verify the update
                    db.get('SELECT * FROM social_media_accounts WHERE platform = "linkedin" AND account_name = ?', 
                        [organizationName], (err, row) => {
                            if (err) {
                                console.error('❌ Error verifying update:', err.message);
                            } else if (row) {
                                console.log('\n📋 Updated Account Details:');
                                console.log('Platform:', row.platform);
                                console.log('Account Name:', row.account_name);
                                console.log('Organization ID:', row.organization_id);
                                console.log('Access Token (first 20 chars):', row.access_token.substring(0, 20) + '...');
                                console.log('Updated At:', row.updated_at);
                                
                                console.log('\n🎉 LinkedIn token updated successfully!');
                                console.log('💡 You can now test posting with: node test-linkedin-token.js');
                            } else {
                                console.log('❌ Account not found after update');
                            }
                            rl.close();
                            db.close();
                        });
                } else {
                    console.log('❌ No LinkedIn account found to update');
                    console.log('💡 Make sure you have a LinkedIn account with name " IMM Marketing Hub"');
                    rl.close();
                    db.close();
                }
            }
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        rl.close();
        db.close();
    }
}

// Start the update process
updateLinkedInToken(); 