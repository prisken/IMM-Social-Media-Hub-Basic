const https = require('https');

console.log('📷 Testing Instagram via Facebook Page');
console.log('=====================================\n');

// Use the Facebook Page Access Token for IMM HK
const pageAccessToken = 'EAAlQXHVB1h8BPUjfwiID8eVYiGcvwxdokRa72vXUrXRaiImB8j7HdAm8JFbcS1PYqhoIbwk9qYIM37ARMoTv7bfNwGnECJNinBYh5SotzsWhkZANu2NhOYUvhrWWPBnH5YSwGzvNgcu8FhEgETQKk0MaCaRwWdp8UgQ6ykGdNQVRihnok3BD12xADegnYyR0ZD';

// The IMM HK page ID
const pageId = '107398872203735';

console.log('🔍 Testing Instagram access through Facebook page...\n');

// Test 1: Get Instagram account connected to the page
function testInstagramViaPage() {
    console.log('🔍 Test 1: Getting Instagram account via Facebook page...');
    
    const url = `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            console.log('');
            
            if (res.statusCode === 200) {
                try {
                    const response = JSON.parse(data);
                    if (response.instagram_business_account) {
                        console.log('✅ Instagram Business Account found!');
                        console.log('Instagram ID:', response.instagram_business_account.id);
                        testInstagramAccess(response.instagram_business_account.id);
                    } else {
                        console.log('❌ No Instagram Business Account connected to this page');
                        console.log('💡 The Instagram account might not be set up as a Business Account');
                    }
                } catch (error) {
                    console.log('❌ Error parsing response:', error);
                }
            } else {
                console.log('❌ Failed to get page Instagram info');
            }
        });
    }).on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });
}

// Test 2: Try to access the Instagram account
function testInstagramAccess(instagramId) {
    console.log('🔍 Test 2: Testing Instagram account access...');
    
    const url = `https://graph.facebook.com/v18.0/${instagramId}?fields=id,username,name&access_token=${pageAccessToken}`;
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            console.log('');
            
            if (res.statusCode === 200) {
                console.log('🎉 SUCCESS! Instagram access working!');
                console.log('💡 Your app should now be able to post to Instagram!');
            } else {
                console.log('❌ Instagram access still failed');
                console.log('💡 This might require additional app permissions');
            }
        });
    }).on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });
}

// Start testing
testInstagramViaPage();
