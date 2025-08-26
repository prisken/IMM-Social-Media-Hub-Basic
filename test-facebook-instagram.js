const sqlite3 = require('sqlite3').verbose();
const https = require('https');

console.log('📘 Testing Facebook & Instagram');
console.log('===============================\n');

// Connect to database
const db = new sqlite3.Database('user_data/imm_marketing_hub.db');

// Test Facebook first
db.get('SELECT * FROM social_media_accounts WHERE platform = "facebook" AND is_active = 1', (err, facebookAccount) => {
    if (err) {
        console.error('❌ Database error:', err);
        db.close();
        return;
    }

    if (!facebookAccount) {
        console.log('❌ No active Facebook account found');
        testInstagram();
        return;
    }

    console.log('📘 Facebook Account Found:');
    console.log('Account Name:', facebookAccount.account_name);
    console.log('Access Token (first 20 chars):', facebookAccount.access_token.substring(0, 20) + '...');
    console.log('Page ID:', facebookAccount.page_id);
    console.log('');

    testFacebook(facebookAccount);
});

function testFacebook(account) {
    console.log('🔍 Testing Facebook API...');
    
    // Test 1: Check if we can access the page
    const pageId = account.page_id || 'me';
    const url = `https://graph.facebook.com/v18.0/${pageId}?fields=id,name&access_token=${account.access_token}`;
    
    console.log('Testing URL:', `https://graph.facebook.com/v18.0/${pageId}?fields=id,name&access_token=...`);
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 200) {
                console.log('✅ Facebook page access successful!');
                testFacebookPosting(account);
            } else {
                console.log('❌ Facebook page access failed');
                console.log('💡 This might mean the access token is invalid or expired');
            }
            console.log('');
            testInstagram();
        });
    }).on('error', (error) => {
        console.log('❌ Request error:', error.message);
        testInstagram();
    });
}

function testFacebookPosting(account) {
    console.log('🔍 Testing Facebook posting...');
    
    const pageId = account.page_id || 'me';
    const postData = {
        message: '🧪 Test post from IMM Marketing Hub - Testing Facebook integration!',
        access_token: account.access_token
    };
    
    const postBody = JSON.stringify(postData);
    
    const options = {
        hostname: 'graph.facebook.com',
        port: 443,
        path: `/v18.0/${pageId}/feed`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postBody)
        }
    };
    
    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Posting Status:', res.statusCode);
            console.log('Posting Response:', data);
            
            if (res.statusCode === 200) {
                console.log('🎉 SUCCESS! Facebook post created!');
            } else {
                console.log('❌ Facebook posting failed');
            }
        });
    });
    
    req.on('error', (error) => {
        console.log('❌ Posting request error:', error.message);
    });
    
    req.write(postBody);
    req.end();
}

function testInstagram() {
    db.get('SELECT * FROM social_media_accounts WHERE platform = "instagram" AND is_active = 1', (err, instagramAccount) => {
        if (err) {
            console.error('❌ Database error:', err);
            db.close();
            return;
        }

        if (!instagramAccount) {
            console.log('❌ No active Instagram account found');
            db.close();
            return;
        }

        console.log('📷 Instagram Account Found:');
        console.log('Account Name:', instagramAccount.account_name);
        console.log('Access Token (first 20 chars):', instagramAccount.access_token.substring(0, 20) + '...');
        console.log('Business Account ID:', instagramAccount.business_account_id);
        console.log('');

        testInstagramAPI(instagramAccount);
    });
}

function testInstagramAPI(account) {
    console.log('🔍 Testing Instagram API...');
    
    if (!account.business_account_id) {
        console.log('❌ No Instagram Business Account ID found');
        console.log('💡 Instagram requires a Business Account ID for API access');
        db.close();
        return;
    }
    
    const url = `https://graph.facebook.com/v18.0/${account.business_account_id}?fields=id,username,media_count&access_token=${account.access_token}`;
    
    console.log('Testing URL:', `https://graph.facebook.com/v18.0/${account.business_account_id}?fields=id,username,media_count&access_token=...`);
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 200) {
                console.log('✅ Instagram account access successful!');
                console.log('💡 Instagram posting requires media files, so we can\'t test posting without an image');
            } else {
                console.log('❌ Instagram account access failed');
                console.log('💡 This might mean the access token is invalid or the Business Account ID is incorrect');
            }
            
            db.close();
        });
    }).on('error', (error) => {
        console.log('❌ Request error:', error.message);
        db.close();
    });
}
