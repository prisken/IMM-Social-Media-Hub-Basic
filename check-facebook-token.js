const https = require('https');

console.log('🔍 Checking Facebook Token Details');
console.log('==================================\n');

// Get the token from database
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('user_data/imm_marketing_hub.db');

db.get('SELECT access_token FROM social_media_accounts WHERE platform = "facebook" AND is_active = 1', (err, row) => {
    if (err) {
        console.error('❌ Database error:', err);
        db.close();
        return;
    }

    if (!row) {
        console.log('❌ No Facebook token found');
        db.close();
        return;
    }

    const accessToken = row.access_token;
    console.log('🔑 Token (first 20 chars):', accessToken.substring(0, 20) + '...');
    console.log('');

    // Check token details
    checkTokenDetails(accessToken);
});

function checkTokenDetails(accessToken) {
    console.log('🔍 Checking token details...');
    
    const url = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${accessToken}`;
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                
                if (response.data) {
                    const tokenInfo = response.data;
                    
                    console.log('📋 Token Information:');
                    console.log('App ID:', tokenInfo.app_id);
                    console.log('User ID:', tokenInfo.user_id);
                    console.log('Type:', tokenInfo.type);
                    console.log('Valid:', tokenInfo.is_valid);
                    console.log('Expires At:', new Date(tokenInfo.expires_at * 1000).toLocaleString());
                    console.log('Issued At:', new Date(tokenInfo.issued_at * 1000).toLocaleString());
                    console.log('Scopes:', tokenInfo.scopes ? tokenInfo.scopes.join(', ') : 'None');
                    
                    if (tokenInfo.is_valid) {
                        console.log('\n✅ Token is valid!');
                        console.log('💡 Expires:', new Date(tokenInfo.expires_at * 1000).toLocaleString());
                    } else {
                        console.log('\n❌ Token is invalid!');
                        console.log('💡 Reason:', response.data.error ? response.data.error.message : 'Unknown');
                    }
                } else {
                    console.log('❌ Could not get token details');
                    console.log('Response:', data);
                }
            } catch (error) {
                console.log('❌ Error parsing response:', error);
                console.log('Raw response:', data);
            }
            
            db.close();
        });
    }).on('error', (error) => {
        console.log('❌ Request error:', error.message);
        db.close();
    });
}
