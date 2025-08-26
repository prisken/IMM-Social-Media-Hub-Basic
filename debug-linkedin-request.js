const sqlite3 = require('sqlite3').verbose();

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
    console.log('Account ID:', row.id);
    console.log('Access Token (first 20 chars):', row.access_token.substring(0, 20) + '...');

    // Construct the author URN exactly as the code does
    let authorUrn;
    if (row.organization_id) {
        authorUrn = `urn:li:organization:${row.organization_id}`;
    } else {
        authorUrn = `urn:li:person:${row.id}`;
    }

    console.log('\nConstructed Author URN:', authorUrn);

    // Create the exact post data that would be sent
    const postData = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text: 'Test post from IMM Marketing Hub'
                },
                shareMediaCategory: 'NONE'
            }
        },
        visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
    };

    console.log('\nPost Data to be sent:');
    console.log(JSON.stringify(postData, null, 2));

    // Test the API call directly
    const https = require('https');
    
    const postBody = JSON.stringify(postData);
    
    const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: '/v2/ugcPosts',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${row.access_token}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postBody)
        }
    };

    console.log('\nMaking API request to LinkedIn...');
    console.log('URL:', 'https://api.linkedin.com/v2/ugcPosts');
    console.log('Headers:', JSON.stringify(options.headers, null, 2));

    const req = https.request(options, (res) => {
        console.log(`\nResponse Status: ${res.statusCode}`);
        console.log('Response Headers:', JSON.stringify(res.headers, null, 2));

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('\nResponse Body:');
            try {
                const response = JSON.parse(data);
                console.log(JSON.stringify(response, null, 2));
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

    req.write(postBody);
    req.end();
}); 