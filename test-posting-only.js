const https = require('https');

console.log('📝 Testing LinkedIn Posting Only');
console.log('================================\n');

const accessToken = 'AQVDHvAbCtlF1fsZ0fhYIKdq-u8SlpwCkMkzkRLEKBaNp4k9oZLhpAeju9nyOFbBuc1FimdrYwbnOcxe3tJ4X9foWg7Gqg9E_7TYf2nEYnF_2I_BImF3AsMPdgbHIoSir9o-gndMzFnwUuEp5VCiFnsToa0_fxIL1UCxbn4IvZLQyYFCKUSNhTaMYTxQ4UTTJNm9uHt9IznMZ0f2rkfaEMHF5OPx2v2zv7Pu8Dag_rQAoY3Zrgx5dduJkaUBydpOLKEk2m_HO63RKGxtQlE8Ch9krZl5c75t2QYiw5PsIk1GU7YVrRLzmaDzoiSP65mHpm8tpdtkpxRlj6_SLHvt1p7OWJqQRA';

// Try posting as organization (since we have the organization ID)
const organizationId = '860d47fdd076hh';
const authorUrn = `urn:li:organization:${organizationId}`;

console.log('🔍 Testing organization posting...');
console.log('Author URN:', authorUrn);

const postData = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
        'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
                text: '🧪 Test post from IMM Marketing Hub - Testing organization posting!'
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
        
        if (res.statusCode === 201) {
            console.log('\n🎉 SUCCESS! Post created successfully!');
            console.log('💡 This means your token works for posting!');
        } else {
            console.log('\n❌ Posting failed');
            console.log('💡 The token might not have the right permissions for posting');
        }
    });
});

req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
});

req.write(postBody);
req.end();
