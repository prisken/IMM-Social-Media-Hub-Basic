const https = require('https');

console.log('🔍 Checking Real Social Media Data');
console.log('==================================\n');

// Your Facebook access token
const facebookToken = 'EAAlQXHVB1h8BPdg90uhHRUlRDsa7otNqCoZA7NGKRGYibnbmux6KXU03dURijoSkRN2WdGOlUw1dZBT0KKJrMupRyxdhocDZBJFZAm6GUKncUkWoEZCmJ43wVT3HN8kk1d7578ZALLCp9p96OGk2nLDWJWHhEvpw4Irnr42nymeMi6j87zZA4inEwRwkUhaSRW9vhwZD';

// Facebook Page ID for IMM HK
const facebookPageId = '107398872203735';

console.log('📘 Checking Facebook Page: IMM HK');
console.log('Page ID:', facebookPageId);
console.log('');

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

async function checkFacebookData() {
  try {
    console.log('🔍 Fetching Facebook posts...');
    
    // Get posts from Facebook page
    const postsUrl = `https://graph.facebook.com/v18.0/${facebookPageId}/posts?fields=id,message,created_time,permalink_url&limit=50&access_token=${facebookToken}`;
    const postsData = await makeRequest(postsUrl);
    
    if (postsData.error) {
      console.log('❌ Facebook API error:', postsData.error);
      return;
    }
    
    console.log(`✅ Found ${postsData.data.length} Facebook posts`);
    console.log('');
    
    // Show first few posts
    postsData.data.slice(0, 5).forEach((post, index) => {
      console.log(`📝 Post ${index + 1}:`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Created: ${new Date(post.created_time).toLocaleDateString()}`);
      console.log(`   Content: ${post.message ? post.message.substring(0, 100) + '...' : 'No text content'}`);
      console.log('');
    });
    
    // Get page info
    console.log('🔍 Fetching Facebook page info...');
    const pageUrl = `https://graph.facebook.com/v18.0/${facebookPageId}?fields=name,fan_count,followers_count&access_token=${facebookToken}`;
    const pageData = await makeRequest(pageUrl);
    
    if (pageData.error) {
      console.log('❌ Facebook page API error:', pageData.error);
    } else {
      console.log('📘 Page Info:');
      console.log(`   Name: ${pageData.name}`);
      console.log(`   Followers: ${pageData.followers_count || 'N/A'}`);
      console.log(`   Fans: ${pageData.fan_count || 'N/A'}`);
      console.log('');
    }
    
    return postsData.data.length;
    
  } catch (error) {
    console.error('❌ Error fetching Facebook data:', error.message);
    return 0;
  }
}

async function checkInstagramData() {
  try {
    console.log('📸 Checking Instagram Data...');
    console.log('Note: Instagram data requires Business Account ID and different permissions');
    console.log('');
    
    // First, let's try to get Instagram accounts connected to the Facebook page
    console.log('🔍 Checking for connected Instagram accounts...');
    const instagramUrl = `https://graph.facebook.com/v18.0/${facebookPageId}?fields=instagram_business_account&access_token=${facebookToken}`;
    const instagramData = await makeRequest(instagramUrl);
    
    if (instagramData.error) {
      console.log('❌ Instagram API error:', instagramData.error);
      console.log('💡 This might be because:');
      console.log('   1. Instagram account not connected to Facebook page');
      console.log('   2. Missing Instagram permissions in the token');
      console.log('   3. Instagram Business Account required');
      return 0;
    }
    
    if (instagramData.instagram_business_account) {
      console.log('✅ Instagram Business Account found!');
      console.log(`   ID: ${instagramData.instagram_business_account.id}`);
      
      // Try to get Instagram media
      const mediaUrl = `https://graph.facebook.com/v18.0/${instagramData.instagram_business_account.id}/media?fields=id,caption,media_type,media_url,permalink,created_time&limit=50&access_token=${facebookToken}`;
      const mediaData = await makeRequest(mediaUrl);
      
      if (mediaData.error) {
        console.log('❌ Instagram media API error:', mediaData.error);
        console.log('💡 This might be due to missing Instagram permissions');
      } else {
        console.log(`✅ Found ${mediaData.data.length} Instagram posts`);
        
        // Show first few posts
        mediaData.data.slice(0, 5).forEach((post, index) => {
          console.log(`📸 Post ${index + 1}:`);
          console.log(`   ID: ${post.id}`);
          console.log(`   Type: ${post.media_type}`);
          console.log(`   Created: ${new Date(post.created_time).toLocaleDateString()}`);
          console.log(`   Caption: ${post.caption ? post.caption.substring(0, 100) + '...' : 'No caption'}`);
          console.log('');
        });
        
        return mediaData.data.length;
      }
    } else {
      console.log('❌ No Instagram Business Account connected to this Facebook page');
      console.log('💡 To connect Instagram:');
      console.log('   1. Go to your Instagram app');
      console.log('   2. Settings → Account → Linked Accounts');
      console.log('   3. Connect to your Facebook page');
    }
    
    return 0;
    
  } catch (error) {
    console.error('❌ Error fetching Instagram data:', error.message);
    return 0;
  }
}

async function main() {
  console.log('🚀 Starting social media data check...\n');
  
  const facebookCount = await checkFacebookData();
  console.log('─'.repeat(50));
  const instagramCount = await checkInstagramData();
  
  console.log('📊 Summary:');
  console.log(`   Facebook posts: ${facebookCount}`);
  console.log(`   Instagram posts: ${instagramCount}`);
  console.log('');
  
  if (facebookCount !== 6) {
    console.log('⚠️  Facebook post count mismatch!');
    console.log(`   Expected: 6 posts`);
    console.log(`   Found: ${facebookCount} posts`);
    console.log('💡 This might be due to:');
    console.log('   1. API permissions limiting post access');
    console.log('   2. Some posts being private or unpublished');
    console.log('   3. Different page being checked');
  }
  
  if (instagramCount !== 19) {
    console.log('⚠️  Instagram post count mismatch!');
    console.log(`   Expected: 19 posts`);
    console.log(`   Found: ${instagramCount} posts`);
    console.log('💡 This might be due to:');
    console.log('   1. Instagram account not properly connected');
    console.log('   2. Missing Instagram API permissions');
    console.log('   3. Different Instagram account being checked');
  }
  
  console.log('\n🎯 Next steps:');
  console.log('   1. Verify the correct pages are being checked');
  console.log('   2. Check API permissions for both platforms');
  console.log('   3. Ensure Instagram Business Account is connected');
  console.log('   4. Update the app with correct data counts');
}

main();
