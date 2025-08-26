const https = require('https');

console.log('🔍 Simple Facebook Token Test');
console.log('=============================\n');

// The token from the debugger
const token = 'EAAlQXHVB1h8BPZA6ZCnLEjNpkYGdV5TczeoPc1ffCDktUMYOsZBnfbV4nLxiXMoYmZA9kH6DVuftmn4dby0gKut9CIIBvR6tvgIugqwUABlWTnO3PEGoByVZBkARJD31roxtYV0vgNSLYSmpe3hJFZCt49TUgoIbThHYZCxpAfPaR2R9VtEcL4ZBQzfaPB3LKgdqHgZDZD';

console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');
console.log('🔑 Token length:', token.length);
console.log('');

// Test 1: Check token details
console.log('🔍 Test 1: Checking token details...');
const debugUrl = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`;

https.get(debugUrl, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        console.log('');
        
        if (res.statusCode === 200) {
            console.log('✅ Token is valid!');
            testUserInfo();
        } else {
            console.log('❌ Token validation failed');
        }
    });
}).on('error', (error) => {
    console.log('❌ Request error:', error.message);
});

function testUserInfo() {
    console.log('🔍 Test 2: Getting user info...');
    const userUrl = `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${token}`;
    
    https.get(userUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 200) {
                console.log('✅ User info successful!');
                testPages();
            } else {
                console.log('❌ User info failed');
            }
        });
    }).on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });
}

function testPages() {
    console.log('🔍 Test 3: Getting pages...');
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${token}`;
    
    https.get(pagesUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 200) {
                console.log('✅ Pages access successful!');
            } else {
                console.log('❌ Pages access failed');
            }
        });
    }).on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });
}
