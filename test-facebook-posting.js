const https = require('https');

console.log('📝 Testing Facebook Posting');
console.log('===========================\n');

// The Page Access Token for IMM HK
const pageAccessToken = 'EAAlQXHVB1h8BPUjfwiID8eVYiGcvwxdokRa72vXUrXRaiImB8j7HdAm8JFbcS1PYqhoIbwk9qYIM37ARMoTv7bfNwGnECJNinBYh5SotzsWhkZANu2NhOYUvhrWWPBnH5YSwGzvNgcu8FhEgETQKk0MaCaRwWdp8UgQ6ykGdNQVRihnok3BD12xADegnYyR0ZD';

// The correct Page ID for IMM HK
const pageId = '107398872203735';

console.log('🔍 Testing Facebook posting to IMM HK page...');
console.log('Page ID:', pageId);
console.log('Token (first 20 chars):', pageAccessToken.substring(0, 20) + '...');
console.log('');

// Test posting
const postData = {
    message: '🧪 Test post from IMM Marketing Hub - Testing Facebook integration! This should work now!',
    access_token: pageAccessToken
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
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        
        if (res.statusCode === 200) {
            console.log('\n🎉 SUCCESS! Facebook post created!');
            console.log('💡 Check your IMM HK Facebook page for the post!');
        } else {
            console.log('\n❌ Facebook posting failed');
            console.log('💡 Check the error message above');
        }
    });
});

req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
});

req.write(postBody);
req.end();
