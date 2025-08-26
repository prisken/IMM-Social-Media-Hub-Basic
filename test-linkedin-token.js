const sqlite3 = require('sqlite3').verbose();
const https = require('https');

console.log('🧪 LinkedIn Token Test Tool');
console.log('==========================\n');

// Connect to database
const db = new sqlite3.Database('user_data/imm_marketing_hub.db');

db.get('SELECT * FROM social_media_accounts WHERE platform = "linkedin" AND account_name = "IMM Marketing Hub"', (err, row) => {
    if (err) {
        console.error('❌ Database error:', err);
        db.close();
        return;
    }

    if (!row) {
        console.log('❌ No LinkedIn account found with name "IMM Marketing Hub"');
        console.log('💡 Run: node update-linkedin-token.js to set up your LinkedIn account');
        db.close();
        return;
    }

    console.log('📋 LinkedIn Account Found:');
    console.log('Platform:', row.platform);
    console.log('Account Name:', row.account_name);
    console.log('Organization ID:', row.organization_id);
    console.log('Access Token (first 20 chars):', row.access_token.substring(0, 20) + '...');
    console.log('Updated At:', row.updated_at);

    // Test 1: Check if we can access user profile
    console.log('\n🔍 Test 1: Checking user profile access...');
    testUserProfile(row.access_token);

    // Test 2: Check if we can access organization info
    console.log('\n🔍 Test 2: Checking organization access...');
    testOrganization(row.access_token, row.organization_id);

    // Test 3: Try to post content
    console.log('\n🔍 Test 3: Testing post creation...');
    testPosting(row.access_token, row.organization_id);
});

function testUserProfile(accessToken) {
    const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: '/v2/me',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                if (res.statusCode === 200) {
                    console.log('✅ User profile accessible!');
                    console.log('   User ID:', response.id);
                    console.log('   Name:', response.localizedFirstName, response.localizedLastName);
                } else {
                    console.log('❌ User profile access failed');
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

function testOrganization(accessToken, organizationId) {
    const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: `/v2/organizations/${organizationId}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                if (res.statusCode === 200) {
                    console.log('✅ Organization accessible!');
                    console.log('   Organization Name:', response.name);
                    console.log('   Organization URN:', response.id);
                } else {
                    console.log('❌ Organization access failed');
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
    const authorUrn = `urn:li:organization:${organizationId}`;
    
    const postData = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text: '🧪 Test post from IMM Marketing Hub - Token verification successful!'
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
                    console.log('🎉 SUCCESS! Post created successfully!');
                    console.log('   Post ID:', response.id);
                    console.log('   Author URN:', authorUrn);
                    console.log('\n✅ LinkedIn token is working perfectly!');
                    console.log('💡 You can now post from the IMM Marketing Hub app!');
                } else {
                    console.log('❌ Posting failed');
                    console.log('   Status:', res.statusCode);
                    console.log('   Error:', response.message);
                    console.log('   Author URN used:', authorUrn);
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