const https = require('https');

console.log('📷 Testing Instagram via Business Suite');
console.log('=====================================\n');

// Use the Facebook User Token
const userToken = 'EAAlQXHVB1h8BPZA6ZCnLEjNpkYGdV5TczeoPc1ffCDktUMYOsZBnfbV4nLxiXMoYmZA9kH6DVuftmn4dby0gKut9CIIBvR6tvgIugqwUABlWTnO3PEGoByVZBkARJD31roxtYV0vgNSLYSmpe3hJFZCt49TUgoIbThHYZCxpAfPaR2R9VtEcL4ZBQzfaPB3LKgdqHgZDZD';

console.log('🔍 Testing Instagram access through different methods...\n');

// Test 1: Get all Instagram Business Accounts
function testInstagramBusinessAccounts() {
    console.log('🔍 Test 1: Getting all Instagram Business Accounts...');
    
    const url = `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account{id,username,name}&access_token=${userToken}`;
    
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
                    let foundInstagram = false;
                    
                    if (response.data && response.data.length > 0) {
                        response.data.forEach((page, index) => {
                            console.log(`Page ${index + 1}: ${page.name || 'Unknown'} (ID: ${page.id})`);
                            if (page.instagram_business_account) {
                                console.log(`   ✅ Instagram: ${page.instagram_business_account.username} (ID: ${page.instagram_business_account.id})`);
                                foundInstagram = true;
                                testInstagramDirect(page.instagram_business_account.id);
                            } else {
                                console.log(`   ❌ No Instagram connected`);
                            }
                        });
                    }
                    
                    if (!foundInstagram) {
                        console.log('❌ No Instagram Business Accounts found in any pages');
                        console.log('💡 The connection might need time to propagate or requires additional setup');
                    }
                } catch (error) {
                    console.log('❌ Error parsing response:', error);
                }
            } else {
                console.log('❌ Failed to get pages with Instagram accounts');
            }
        });
    }).on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });
}

// Test 2: Try direct Instagram access
function testInstagramDirect(instagramId) {
    console.log('🔍 Test 2: Testing direct Instagram access...');
    
    const url = `https://graph.facebook.com/v18.0/${instagramId}?fields=id,username,name&access_token=${userToken}`;
    
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
                console.log('❌ Direct Instagram access failed');
                console.log('💡 This might require additional app permissions or the connection needs time to activate');
            }
        });
    }).on('error', (error) => {
        console.log('❌ Request error:', error.message);
    });
}

// Start testing
testInstagramBusinessAccounts();
