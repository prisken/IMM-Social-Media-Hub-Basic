const https = require('https');

console.log('🔍 LinkedIn Token Debug Test');
console.log('============================\n');

// Your new token
const accessToken = 'AQWhRv7o0lySYmeg4oGn5FiR8PqmUrR3zJ-aAOffJWIRITx_gddXj8r6TUnxd1iUV-2nbJBJ_rOVOqxTRaCNerADZK-GWWOtD0GjQaSDiwkJY72tuhMQFhwIylVawplCuSyEHCEhU4V_P2EWls8htem7ttno0Mh7fWRkWE-WUQRFpl1wMPxexLKMz9k0s6bc5IJDDnRCc1-uIWR8OcdLbDqDzucP9bPrgvEOoX1_RUXp87zgzcQfPoonQnlQp3qcNt3R3_JWCAIzF2UE3ohQYdrA2tJYUv-lglqF34f69UdELLoRbeqAXoZccZ21pn_LzgTbcWmFqeGxAS-l98LleMjjZDT9mg';

console.log('🔑 Token (first 50 chars):', accessToken.substring(0, 50) + '...');
console.log('🔑 Token length:', accessToken.length);
console.log('');

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
    }
];

let currentTest = 0;

function testEndpoint() {
    if (currentTest >= endpoints.length) {
        console.log('\n📋 Summary:');
        console.log('All endpoints failed. This suggests:');
        console.log('1. The token might be invalid or expired');
        console.log('2. The scopes might not be properly applied');
        console.log('3. The LinkedIn app might need additional configuration');
        console.log('\n💡 Next steps:');
        console.log('1. Check your LinkedIn app OAuth 2.0 settings');
        console.log('2. Make sure you\'re using "Member authorization code (3-legged)" flow');
        console.log('3. Verify the redirect URLs are configured correctly');
        console.log('4. Try generating a new token with the OAuth flow instead of direct generation');
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
            console.log(`Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
            console.log('');
            
            if (res.statusCode === 200) {
                console.log(`✅ ${endpoint.name} works!`);
                console.log('🎉 This means your token is valid and has the right permissions!');
                return;
            }
            
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
