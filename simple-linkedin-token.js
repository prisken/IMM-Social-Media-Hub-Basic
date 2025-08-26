const https = require('https');

console.log('🔑 Simple LinkedIn Token Test');
console.log('=============================\n');

// Test with a fresh authorization code
const CLIENT_ID = '860d47fdd076hh';
const CLIENT_SECRET = 'WPL_AP1.jnTcIyM1ATB09exy.MUVMSA==';

console.log('📋 Step 1: Generate authorization URL');
console.log('Open this URL in your browser:');
console.log(`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent('http://localhost:3000/auth/linkedin/callback')}&scope=${encodeURIComponent('profile w_member_social')}&state=test123`);
console.log('\nAfter authorization, you\'ll get a URL like:');
console.log('http://localhost:3000/auth/linkedin/callback?code=XXXXX&state=test123');
console.log('\nCopy the code parameter and paste it below.\n');

// For now, let's test if we can at least validate the credentials
console.log('🔍 Testing client credentials...');

const testData = `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${encodeURIComponent(CLIENT_SECRET)}`;

const options = {
    hostname: 'www.linkedin.com',
    port: 443,
    path: '/oauth/v2/accessToken',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(testData)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
    });
});

req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
});

req.write(testData);
req.end();
