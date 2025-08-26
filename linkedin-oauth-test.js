const http = require('http');
const https = require('https');
const url = require('url');
const readline = require('readline');

console.log('🔗 LinkedIn OAuth Token Generator');
console.log('==================================\n');

// Your LinkedIn app credentials
const CLIENT_ID = '860d47fdd076hh';
const CLIENT_SECRET = 'WPL_AP1.jnTcIyM1ATB09exy.MUVMSA%3D%3D';
const REDIRECT_URI = 'http://localhost:3000/auth/linkedin/callback';
const SCOPES = 'profile w_member_social';

// Generate the authorization URL
const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `state=random_state_string`;

console.log('📋 Step 1: Authorization URL');
console.log('============================');
console.log('Open this URL in your browser:');
console.log(authUrl);
console.log('\nThis will redirect you to a URL like:');
console.log('http://localhost:3000/auth/linkedin/callback?code=XXXXX&state=random_state_string');
console.log('\nCopy the "code" parameter from that URL.\n');

// Create a simple server to catch the callback
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/auth/linkedin/callback') {
        const code = parsedUrl.query.code;
        const state = parsedUrl.query.state;
        
        if (code) {
            console.log('✅ Authorization code received!');
            console.log('Code:', code);
            console.log('\n📋 Step 2: Exchanging code for token...\n');
            
            // Exchange code for token
            exchangeCodeForToken(code);
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <body>
                        <h2>✅ Authorization Successful!</h2>
                        <p>You can close this window and return to the terminal.</p>
                        <script>window.close();</script>
                    </body>
                </html>
            `);
        } else {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h2>❌ Error: No authorization code received</h2>');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h2>404 - Not Found</h2>');
    }
});

function exchangeCodeForToken(code) {
    if (!CLIENT_SECRET) {
        console.log('❌ Error: CLIENT_SECRET is not set');
        console.log('💡 Please get your Client Secret from your LinkedIn app settings and update this script');
        console.log('   Then run this script again');
        server.close();
        return;
    }
    
    const tokenData = `grant_type=authorization_code&` +
        `code=${code}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `client_id=${CLIENT_ID}&` +
        `client_secret=${CLIENT_SECRET}`;
    
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
            server.close();
        });
    });
    
    req.on('error', (error) => {
        console.log('❌ Request error:', error.message);
        server.close();
    });
    
    req.write(tokenData);
    req.end();
}

// Start the server
server.listen(3000, () => {
    console.log('🌐 Server started on http://localhost:3000');
    console.log('Waiting for OAuth callback...\n');
});

console.log('💡 Instructions:');
console.log('1. Open the authorization URL in your browser');
console.log('2. Authorize your app');
console.log('3. Copy the authorization code from the redirect URL');
console.log('4. The script will automatically exchange it for an access token\n');
