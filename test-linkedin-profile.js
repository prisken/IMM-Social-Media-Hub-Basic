const https = require('https');

console.log('🔍 Testing LinkedIn Profile Access');
console.log('==================================\n');

const accessToken = 'AQVDHvAbCtlF1fsZ0fhYIKdq-u8SlpwCkMkzkRLEKBaNp4k9oZLhpAeju9nyOFbBuc1FimdrYwbnOcxe3tJ4X9foWg7Gqg9E_7TYf2nEYnF_2I_BImF3AsMPdgbHIoSir9o-gndMzFnwUuEp5VCiFnsToa0_fxIL1UCxbn4IvZLQyYFCKUSNhTaMYTxQ4UTTJNm9uHt9IznMZ0f2rkfaEMHF5OPx2v2zv7Pu8Dag_rQAoY3Zrgx5dduJkaUBydpOLKEk2m_HO63RKGxtQlE8Ch9krZl5c75t2QYiw5PsIk1GU7YVrRLzmaDzoiSP65mHpm8tpdtkpxRlj6_SLHvt1p7OWJqQRA';

// Test different endpoints to see what works
const endpoints = [
    {
        name: 'UserInfo (OpenID)',
        path: '/v2/userinfo',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    },
    {
        name: 'Profile (Basic)',
        path: '/v2/me',
        headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
        }
    },
    {
        name: 'Profile (Simple)',
        path: '/v2/me?projection=(id,localizedFirstName,localizedLastName)',
        headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
        }
    },
    {
        name: 'Profile (Minimal)',
        path: '/v2/me?projection=(id)',
        headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
        }
    }
];

let currentTest = 0;

function testEndpoint() {
    if (currentTest >= endpoints.length) {
        console.log('\n📋 Summary:');
        console.log('All profile endpoints failed. This suggests the token might not have the right scopes.');
        console.log('\n💡 Let\'s try updating your app with this token anyway and see if posting works:');
        console.log('   node update-linkedin-token.js');
        return;
    }

    const endpoint = endpoints[currentTest];
    console.log(`🔍 Test ${currentTest + 1}: ${endpoint.name}`);
    console.log(`URL: https://api.linkedin.com${endpoint.path}`);
    
    const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: endpoint.path,
        method: 'GET',
        headers: endpoint.headers
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log(`✅ ${endpoint.name} works!`);
                console.log('Response:', data.substring(0, 200) + '...');
                console.log('\n🎉 This token has the right permissions!');
                console.log('💡 You can now update your app with this token.');
                return;
            } else {
                console.log(`❌ ${endpoint.name} failed`);
                console.log('Response:', data.substring(0, 200) + '...');
            }
            console.log('');
            currentTest++;
            testEndpoint();
        });
    });

    req.on('error', (error) => {
        console.log(`❌ Request error: ${error.message}`);
        currentTest++;
        testEndpoint();
    });

    req.end();
}

// Start testing
testEndpoint();
