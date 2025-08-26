const https = require('https');

console.log('🔑 Testing LinkedIn Direct Token Approach');
console.log('=========================================\n');

// Let's try using the token you generated earlier but test what scopes it actually has
const accessToken = 'AQVDHvAbCtlF1fsZ0fhYIKdq-u8SlpwCkMkzkRLEKBaNp4k9oZLhpAeju9nyOFbBuc1FimdrYwbnOcxe3tJ4X9foWg7Gqg9E_7TYf2nEYnF_2I_BImF3AsMPdgbHIoSir9o-gndMzFnwUuEp5VCiFnsToa0_fxIL1UCxbn4IvZLQyYFCKUSNhTaMYTxQ4UTTJNm9uHt9IznMZ0f2rkfaEMHF5OPx2v2zv7Pu8Dag_rQAoY3Zrgx5dduJkaUBydpOLKEk2m_HO63RKGxtQlE8Ch9krZl5c75t2QYiw5PsIk1GU7YVrRLzmaDzoiSP65mHpm8tpdtkpxRlj6_SLHvt1p7OWJqQRA';

console.log('🔍 Testing what this token can actually do...\n');

// Test 1: Try to get user info (this should work with any valid token)
function testUserInfo() {
    console.log('🔍 Test 1: User Info endpoint...');
    
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
            if (res.statusCode === 200) {
                console.log('✅ User Info works!');
                console.log('Response:', data.substring(0, 200) + '...');
            } else {
                console.log('❌ User Info failed');
                console.log('Response:', data);
            }
            console.log('');
            testPosting();
        });
    });

    req.on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });

    req.end();
}

// Test 2: Try to post content
function testPosting() {
    console.log('🔍 Test 2: Posting endpoint...');
    
    const postData = {
        author: 'urn:li:person:YOUR_PERSON_ID', // We'll need to get this
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text: '🧪 Test post from IMM Marketing Hub - Testing token capabilities!'
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
            if (res.statusCode === 201) {
                console.log('🎉 SUCCESS! Posting works!');
                console.log('Response:', data);
            } else {
                console.log('❌ Posting failed');
                console.log('Response:', data);
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
