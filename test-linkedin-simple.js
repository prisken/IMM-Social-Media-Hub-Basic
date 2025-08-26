const https = require('https');

console.log('🧪 Simple LinkedIn Token Test');
console.log('=============================\n');

// Your new token
const accessToken = 'AQWhRv7o0lySYmeg4oGn5FiR8PqmUrR3zJ-aAOffJWIRITx_gddXj8r6TUnxd1iUV-2nbJBJ_rOVOqxTRaCNerADZK-GWWOtD0GjQaSDiwkJY72tuhMQFhwIylVawplCuSyEHCEhU4V_P2EWls8htem7ttno0Mh7fWRkWE-WUQRFpl1wMPxexLKMz9k0s6bc5IJDDnRCc1-uIWR8OcdLbDqDzucP9bPrgvEOoX1_RUXp87zgzcQfPoonQnlQp3qcNt3R3_JWCAIzF2UE3ohQYdrA2tJYUv-lglqF34f69UdELLoRbeqAXoZccZ21pn_LzgTbcWmFqeGxAS-l98LleMjjZDT9mg';

console.log('🔑 Testing token validity...\n');

// Test 1: Check if token is valid with userinfo endpoint
function testUserInfo() {
    console.log('🔍 Test 1: Checking userinfo endpoint...');
    
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
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            console.log('');
            
            if (res.statusCode === 200) {
                console.log('✅ Token is valid!');
                testProfile();
            } else {
                console.log('❌ Token validation failed');
                console.log('💡 This might mean the token is invalid or has wrong scopes');
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });

    req.end();
}

// Test 2: Try to get profile with /v2/me
function testProfile() {
    console.log('🔍 Test 2: Checking /v2/me endpoint...');
    
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
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            console.log('');
            
            if (res.statusCode === 200) {
                console.log('✅ Profile access successful!');
                testPosting();
            } else {
                console.log('❌ Profile access failed');
                console.log('💡 The profile scope might not be working as expected');
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });

    req.end();
}

// Test 3: Try to post content
function testPosting() {
    console.log('🔍 Test 3: Testing post creation...');
    
    const postData = {
        author: 'urn:li:person:YOUR_PERSON_ID', // We'll need to get this from profile
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text: '🧪 Test post from IMM Marketing Hub - Testing new token!'
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
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            console.log('');
            
            if (res.statusCode === 201) {
                console.log('🎉 SUCCESS! Post created successfully!');
            } else {
                console.log('❌ Posting failed');
                console.log('💡 This might be due to missing w_member_social scope or invalid author URN');
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });

    req.write(postBody);
    req.end();
}

// Start testing
testUserInfo();
