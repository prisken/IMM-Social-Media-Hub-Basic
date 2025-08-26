const https = require('https');

console.log('📷 Getting Instagram Business Accounts');
console.log('=====================================\n');

// Use the Facebook User Token we got earlier
const userToken = 'EAAlQXHVB1h8BPZA6ZCnLEjNpkYGdV5TczeoPc1ffCDktUMYOsZBnfbV4nLxiXMoYmZA9kH6DVuftmn4dby0gKut9CIIBvR6tvgIugqwUABlWTnO3PEGoByVZBkARJD31roxtYV0vgNSLYSmpe3hJFZCt49TUgoIbThHYZCxpAfPaR2R9VtEcL4ZBQzfaPB3LKgdqHgZDZD';

console.log('🔍 Getting detailed page information...');

// Get detailed page information including Instagram accounts
const url = `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,instagram_business_account{id,username,name},access_token&access_token=${userToken}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        
        if (res.statusCode === 200) {
            try {
                const response = JSON.parse(data);
                console.log('\n📋 Detailed Page Information:');
                
                if (response.data && response.data.length > 0) {
                    response.data.forEach((page, index) => {
                        console.log(`\n${index + 1}. Page: ${page.name || 'Unknown'}`);
                        console.log(`   Page ID: ${page.id}`);
                        console.log(`   Page Access Token: ${page.access_token ? page.access_token.substring(0, 20) + '...' : 'None'}`);
                        
                        if (page.instagram_business_account) {
                            console.log(`   ✅ Instagram Business Account Connected!`);
                            console.log(`   Instagram ID: ${page.instagram_business_account.id}`);
                            console.log(`   Instagram Username: ${page.instagram_business_account.username || 'Unknown'}`);
                            console.log(`   Instagram Name: ${page.instagram_business_account.name || 'Unknown'}`);
                        } else {
                            console.log(`   ❌ Instagram Business Account: Not connected`);
                        }
                    });
                } else {
                    console.log('❌ No pages found with Instagram Business Accounts');
                }
            } catch (error) {
                console.log('❌ Error parsing response:', error);
            }
        } else {
            console.log('❌ Failed to get Instagram Business Accounts');
        }
    });
}).on('error', (error) => {
    console.log('❌ Request error:', error.message);
});
