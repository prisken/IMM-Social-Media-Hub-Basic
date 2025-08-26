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

    // Let's try to get the user's profile first to see what we can access
    const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: '/v2/me',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${row.access_token}`,
            'X-Restli-Protocol-Version': '2.0.0'
        }
    };

    console.log('\nChecking user profile...');
    console.log('URL:', 'https://api.linkedin.com/v2/me');

    const req = https.request(options, (res) => {
        console.log(`\nResponse Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('\nUser Profile Response:');
            try {
                const response = JSON.parse(data);
                console.log(JSON.stringify(response, null, 2));
                
                if (res.statusCode === 200) {
                    console.log('\n✅ User profile accessible!');
                    console.log('User ID:', response.id);
                    console.log('First Name:', response.localizedFirstName);
                    console.log('Last Name:', response.localizedLastName);
                    
                    // Now let's try to get the user's organizations
                    getUserOrganizations(row.access_token);
                } else {
                    console.log('\n❌ User profile access failed');
                    console.log('This suggests the access token might be invalid or expired');
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

function getUserOrganizations(accessToken) {
    console.log('\n\nGetting user organizations...');
    
    const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: '/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
        }
    };

    const req = https.request(options, (res) => {
        console.log(`\nOrganizations Response Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('\nOrganizations Response:');
            try {
                const response = JSON.parse(data);
                console.log(JSON.stringify(response, null, 2));
                
                if (res.statusCode === 200 && response.elements && response.elements.length > 0) {
                    console.log('\n✅ Found organizations!');
                    response.elements.forEach((org, index) => {
                        console.log(`\nOrganization ${index + 1}:`);
                        console.log('Organization URN:', org.organizationalTarget);
                        console.log('Role:', org.role);
                        console.log('State:', org.state);
                        
                        // Try posting with this organization URN
                        testPostingWithOrg(org.organizationalTarget, accessToken, index + 1);
                    });
                } else {
                    console.log('\n❌ No organizations found or access denied');
                    console.log('This might mean the user is not an admin of any organization');
                }
            } catch (e) {
                console.log('Raw response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('Organizations request error:', error);
    });

    req.end();
}

function testPostingWithOrg(organizationUrn, accessToken, orgNumber) {
    console.log(`\n\nTesting posting with organization ${orgNumber} URN: ${organizationUrn}`);
    
    const postData = {
        author: organizationUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text: `Test post from IMM Marketing Hub - Organization ${orgNumber}`
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
        console.log(`\nPost Response Status (Org ${orgNumber}): ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`\nPost Response (Org ${orgNumber}):`);
            try {
                const response = JSON.parse(data);
                console.log(JSON.stringify(response, null, 2));
                
                if (res.statusCode === 201) {
                    console.log(`\n🎉 SUCCESS! Post created successfully with organization ${orgNumber}!`);
                    console.log('Post ID:', response.id);
                } else {
                    console.log(`\n❌ Posting failed with organization ${orgNumber}`);
                }
            } catch (e) {
                console.log('Raw response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error(`Post request error (Org ${orgNumber}):`, error);
    });

    req.write(postBody);
    req.end();
} 