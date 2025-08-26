const sqlite3 = require('sqlite3').verbose();
const https = require('https');

// Connect to database
const db = new sqlite3.Database('user_data/imm_marketing_hub.db');

db.get('SELECT * FROM social_media_accounts WHERE platform = "linkedin" AND account_name = " IMM Marketing Hub"', (err, row) => {
    if (err) {
        console.error('Database error:', err);
        db.close();
        return;
    }

    console.log('LinkedIn Account Found:');
    console.log('Organization ID:', row.organization_id);
    console.log('Access Token (first 20 chars):', row.access_token.substring(0, 20) + '...');

    // First, let's verify the organization ID by calling LinkedIn's organization endpoint
    const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: `/v2/organizations/${row.organization_id}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${row.access_token}`,
            'X-Restli-Protocol-Version': '2.0.0'
        }
    };

    console.log('\nVerifying organization ID with LinkedIn...');
    console.log('URL:', `https://api.linkedin.com/v2/organizations/${row.organization_id}`);

    const req = https.request(options, (res) => {
        console.log(`\nResponse Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('\nOrganization Response:');
            try {
                const response = JSON.parse(data);
                console.log(JSON.stringify(response, null, 2));
                
                if (res.statusCode === 200) {
                    console.log('\n✅ Organization ID is valid!');
                    console.log('Organization Name:', response.name);
                    console.log('Organization URN:', response.id);
                    
                    // Now let's try posting with the verified organization URN
                    testPosting(response.id, row.access_token);
                } else {
                    console.log('\n❌ Organization ID verification failed');
                    console.log('This might be the issue - the organization ID might be incorrect');
                }
            } catch (e) {
                console.log('Raw response:', data);
            }
            db.close();
        });
    });

    req.on('error', (error) => {
        console.error('Request error:', error);
        db.close();
    });

    req.end();
});

function testPosting(organizationUrn, accessToken) {
    console.log('\n\nTesting posting with verified organization URN...');
    
    const postData = {
        author: organizationUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text: 'Test post from IMM Marketing Hub - using verified URN'
                },
                shareMediaCategory: 'NONE'
            }
        },
        visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
    };

    console.log('Post Data:');
    console.log(JSON.stringify(postData, null, 2));

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
        console.log(`\nPost Response Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('\nPost Response:');
            try {
                const response = JSON.parse(data);
                console.log(JSON.stringify(response, null, 2));
                
                if (res.statusCode === 201) {
                    console.log('\n🎉 SUCCESS! Post created successfully!');
                    console.log('Post ID:', response.id);
                } else {
                    console.log('\n❌ Posting still failed');
                }
            } catch (e) {
                console.log('Raw response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('Post request error:', error);
    });

    req.write(postBody);
    req.end();
} 