const https = require('https');

console.log('🔄 Manual Token Exchange');
console.log('========================\n');

// Your credentials
const CLIENT_ID = '860d47fdd076hh';
const CLIENT_SECRET = 'WPL_AP1.jnTcIyM1ATB09exy.MUVMSA==';
const REDIRECT_URI = 'http://localhost:3000/auth/linkedin/callback';

// The authorization code from your browser URL
const AUTH_CODE = 'AQQwY6ZThlyov4u8wSfXSGN-W5Xdeli6n2Y8OJFGLHOl9lBsbe3Z7nB3Y6tcvJJ-gEdRvnzzDgoHFQtWN2ByViWX5T9kG4k9z9ZMp7zdiThj-kWBF6O_bdUt4aWvgvyBlwIHGZienXa7EEUjrPuVAZyL96-6VbBSbrxbFi7-D7diuXD7ttKc_yQi3g6L5uASB5NTLur5dFSA3bMkvGE';

console.log('🔑 Exchanging authorization code for access token...\n');

const tokenData = `grant_type=authorization_code&` +
    `code=${AUTH_CODE}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `client_id=${CLIENT_ID}&` +
    `client_secret=${encodeURIComponent(CLIENT_SECRET)}`;

const options = {
    hostname: 'www.linkedin.com',
    port: 443,
    path: '/oauth/v2/accessToken',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(tokenData)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (response.access_token) {
                console.log('🎉 SUCCESS! Access Token Generated!');
                console.log('====================================');
                console.log('Access Token:', response.access_token);
                console.log('Expires In:', response.expires_in, 'seconds');
                console.log('Scope:', response.scope);
                console.log('\n💡 Copy this token and update your app with:');
                console.log('   node update-linkedin-token.js');
            } else {
                console.log('❌ Error exchanging code for token:');
                console.log(response);
            }
        } catch (error) {
            console.log('❌ Error parsing response:', error);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
});

req.write(tokenData);
req.end();
