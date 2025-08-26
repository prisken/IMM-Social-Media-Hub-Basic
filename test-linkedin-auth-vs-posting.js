const sqlite3 = require('sqlite3').verbose();
const https = require('https');

console.log('🔍 LinkedIn Authentication vs Posting Test');
console.log('==========================================\n');

// Connect to database
const db = new sqlite3.Database('user_data/imm_marketing_hub.db');

db.get('SELECT * FROM social_media_accounts WHERE platform = "linkedin" AND account_name = " IMM Marketing Hub"', (err, row) => {
    if (err) {
        console.error('❌ Database error:', err);
        db.close();
        return;
    }

    if (!row) {
        console.log('❌ No LinkedIn account found');
        db.close();
        return;
    }

    console.log('📋 LinkedIn Account Found:');
    console.log('Organization ID:', row.organization_id);
    console.log('Access Token (first 20 chars):', row.access_token.substring(0, 20) + '...');

    // Test 1: Authentication (what the "Test Connection" button does)
    console.log('\n🔍 Test 1: Authentication (Test Connection Button)');
    testAuthentication(row.access_token);

    // Test 2: Posting (what actually fails)
    console.log('\n🔍 Test 2: Posting (What Actually Fails)');
    testPosting(row.access_token, row.organization_id);
});

function testAuthentication(accessToken) {
    console.log('Testing: https://api.linkedin.com/v2/userinfo');
    
    const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: '/v2/userinfo',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                if (res.statusCode === 200) {
                    console.log('✅ Authentication SUCCESS!');
                    console.log('   User ID:', response.sub);
                    console.log('   Name:', response.name);
                    console.log('   Email:', response.email);
                    console.log('\n💡 This is why "Test Connection" shows "Connection successful!"');
                    console.log('   The token can access basic user info, but NOT post content.');
                } else {
                    console.log('❌ Authentication failed');
                    console.log('   Status:', res.statusCode);
                    console.log('   Error:', response.message);
                }
            } catch (e) {
                console.log('❌ Invalid response format');
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });

    req.end();
}

function testPosting(accessToken, organizationId) {
    console.log('Testing: https://api.linkedin.com/v2/ugcPosts');
    
    const authorUrn = `urn:li:organization:${organizationId}`;
    
    const postData = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text: 'Test post from IMM Marketing Hub'
                },
                shareMediaCategory: 'NONE'
            }
        },
        visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
    };

    const postBody = JSON.stringify(postData);
    
    const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: '/v2/ugcPosts',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postBody)
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                if (res.statusCode === 201) {
                    console.log('✅ Posting SUCCESS!');
                    console.log('   Post ID:', response.id);
                    console.log('   Author URN:', authorUrn);
                } else {
                    console.log('❌ Posting FAILED');
                    console.log('   Status:', res.statusCode);
                    console.log('   Error:', response.message);
                    console.log('   Author URN used:', authorUrn);
                    console.log('\n💡 This is the real issue!');
                    console.log('   The token can authenticate but cannot post content.');
                    console.log('   This means the token lacks posting permissions.');
                }
            } catch (e) {
                console.log('❌ Invalid response format');
                console.log('Raw response:', data);
            }
            db.close();
        });
    });

    req.on('error', (error) => {
        console.log('❌ Request error:', error.message);
        db.close();
    });

    req.write(postBody);
    req.end();
} 