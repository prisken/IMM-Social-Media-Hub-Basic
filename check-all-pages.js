const https = require('https');

console.log('🔍 Checking All Facebook Pages You Have Access To');
console.log('================================================\n');

// Your Facebook access token
const facebookToken = 'EAAlQXHVB1h8BPZA6ZCnLEjNpkYGdV5TczeoPc1ffCDktUMYOsZBnfbV4nLxiXMoYmZA9kH6DVuftmn4dby0gKut9CIIBvR6tvgIugqwUABlWTnO3PEGoByVZBkARJD31roxtYV0vgNSLYSmpe3hJFZCt49TUgoIbThHYZCxpAfPaR2R9VtEcL4ZBQzfaPB3LKgdqHgZDZD';

// Function to make HTTPS requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function checkAllPages() {
  try {
    console.log('🔍 Fetching all pages you have access to...');
    
    // Get all pages
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${facebookToken}`;
    const pagesData = await makeRequest(pagesUrl);
    
    if (pagesData.error) {
      console.log('❌ Facebook API error:', pagesData.error);
      return;
    }
    
    console.log(`✅ Found ${pagesData.data.length} pages you have access to:`);
    console.log('');
    
    for (let i = 0; i < pagesData.data.length; i++) {
      const page = pagesData.data[i];
      console.log(`📘 Page ${i + 1}: ${page.name}`);
      console.log(`   ID: ${page.id}`);
      console.log(`   Category: ${page.category}`);
      console.log(`   Access Token: ${page.access_token.substring(0, 20)}...`);
      console.log('');
      
      // Check posts for this page
      try {
        const postsUrl = `https://graph.facebook.com/v18.0/${page.id}/posts?fields=id,message,created_time&limit=10&access_token=${page.access_token}`;
        const postsData = await makeRequest(postsUrl);
        
        if (postsData.error) {
          console.log(`   ❌ Error fetching posts: ${postsData.error.message}`);
        } else {
          console.log(`   📝 Posts: ${postsData.data.length} found`);
          
          // Show first few posts
          postsData.data.slice(0, 3).forEach((post, index) => {
            const date = new Date(post.created_time).toLocaleDateString();
            const content = post.message ? post.message.substring(0, 50) + '...' : 'No text content';
            console.log(`      ${index + 1}. ${date} - ${content}`);
          });
        }
        
        // Check if Instagram is connected
        try {
          const instagramUrl = `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`;
          const instagramData = await makeRequest(instagramUrl);
          
          if (instagramData.instagram_business_account) {
            console.log(`   📸 Instagram connected: ${instagramData.instagram_business_account.id}`);
            
            // Try to get Instagram posts
            const mediaUrl = `https://graph.facebook.com/v18.0/${instagramData.instagram_business_account.id}/media?fields=id,caption,media_type,created_time&limit=10&access_token=${page.access_token}`;
            const mediaData = await makeRequest(mediaUrl);
            
            if (mediaData.error) {
              console.log(`   ❌ Instagram API error: ${mediaData.error.message}`);
            } else {
              console.log(`   📸 Instagram posts: ${mediaData.data.length} found`);
              
              // Show first few Instagram posts
              mediaData.data.slice(0, 3).forEach((post, index) => {
                const date = new Date(post.created_time).toLocaleDateString();
                const caption = post.caption ? post.caption.substring(0, 50) + '...' : 'No caption';
                console.log(`      ${index + 1}. ${date} (${post.media_type}) - ${caption}`);
              });
            }
          } else {
            console.log(`   📸 Instagram: Not connected`);
          }
        } catch (error) {
          console.log(`   📸 Instagram check failed: ${error.message}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error checking page data: ${error.message}`);
      }
      
      console.log('─'.repeat(60));
    }
    
    console.log('\n🎯 Summary:');
    console.log(`   Total pages: ${pagesData.data.length}`);
    console.log(`   Pages with posts: ${pagesData.data.filter(p => p.posts_count > 0).length}`);
    console.log(`   Pages with Instagram: ${pagesData.data.filter(p => p.instagram_connected).length}`);
    
    console.log('\n💡 Next steps:');
    console.log('   1. Identify which page has the correct data');
    console.log('   2. Update the app with the correct page ID');
    console.log('   3. Connect Instagram accounts if needed');
    console.log('   4. Update the database with real data');
    
  } catch (error) {
    console.error('❌ Error checking pages:', error.message);
  }
}

checkAllPages();
