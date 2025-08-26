const https = require('https');

console.log('📷 Testing Instagram Permissions');
console.log('================================\n');

// Use the Facebook User Token
const userToken = 'EAAlQXHVB1h8BPZA6ZCnLEjNpkYGdV5TczeoPc1ffCDktUMYOsZBnfbV4nLxiXMoYmZA9kH6DVuftmn4dby0gKut9CIIBvR6tvgIugqwUABlWTnO3PEGoByVZBkARJD31roxtYV0vgNSLYSmpe3hJFZCt49TUgoIbThHYZCxpAfPaR2R9VtEcL4ZBQzfaPB3LKgdqHgZDZD';

console.log('🔍 Testing Instagram access with different endpoints...\n');

// Test 1: Check if we can access Instagram accounts through the user
function testInstagramAccounts() {
    console.log('🔍 Test 1: Getting Instagram accounts through user...');
    
    const url = `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account{id,username,name}&access_token=${userToken}`;
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data.substring(0, 500) + '...');
            console.log('');
            
            if (res.statusCode === 200) {
                console.log('✅ Instagram accounts access successful!');
                testInstagramBusinessAccount();
            } else {
                console.log('❌ Instagram accounts access failed');
            }
        });
    }).on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });
}

// Test 2: Try to access the Instagram Business Account directly
function testInstagramBusinessAccount() {
    console.log('🔍 Test 2: Accessing Instagram Business Account directly...');
    
    const instagramId = '17841456554940613';
    const url = `https://graph.facebook.com/v18.0/${instagramId}?fields=id,username,name&access_token=${userToken}`;
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            console.log('');
            
            if (res.statusCode === 200) {
                console.log('✅ Instagram Business Account access successful!');
                testInstagramMedia();
            } else {
                console.log('❌ Instagram Business Account access failed');
                console.log('💡 This might require additional permissions');
            }
        });
    }).on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });
}

// Test 3: Try to get Instagram media
function testInstagramMedia() {
    console.log('🔍 Test 3: Getting Instagram media...');
    
    const instagramId = '17841456554940613';
    const url = `https://graph.facebook.com/v18.0/${instagramId}/media?fields=id,caption,media_type&access_token=${userToken}`;
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data.substring(0, 300) + '...');
            console.log('');
            
            if (res.statusCode === 200) {
                console.log('✅ Instagram media access successful!');
                console.log('🎉 Instagram integration is working!');
            } else {
                console.log('❌ Instagram media access failed');
                console.log('💡 Instagram posting might require additional setup');
            }
        });
    }).on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });
}

// Start testing
testInstagramAccounts();
