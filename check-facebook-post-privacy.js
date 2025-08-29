const https = require('https');

console.log('🔍 Checking Facebook Post Privacy Levels');
console.log('=======================================\n');

// Your Facebook access token and page ID
const facebookToken = 'EAAlQXHVB1h8BPdg90uhHRUlRDsa7otNqCoZA7NGKRGYibnbmux6KXU03dURijoSkRN2WdGOlUw1dZBT0KKJrMupRyxdhocDZBJFZAm6GUKncUkWoEZCmJ43wVT3HN8kk1d7578ZALLCp9p96OGk2nLDWJWHhEvpw4Irnr42nymeMi6j87zZA4inEwRwkUhaSRW9vhwZD';
const facebookPageId = '107398872203735';

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

async function checkPostPrivacy() {
  try {
    console.log('📘 Checking IMM HK Facebook page posts...\n');
    
    // Method 1: Get posts with more fields to check privacy
    console.log('🔍 Method 1: Fetching posts with privacy info...');
    const postsUrl1 = `https://graph.facebook.com/v18.0/${facebookPageId}/posts?fields=id,message,created_time,privacy,permalink_url&limit=50&access_token=${facebookToken}`;
    const postsData1 = await makeRequest(postsUrl1);
    
    if (postsData1.error) {
      console.log('❌ API Error:', postsData1.error);
      return;
    }
    
    console.log(`✅ Found ${postsData1.data.length} posts via /posts endpoint`);
    
    // Method 2: Get feed (includes more post types)
    console.log('\n🔍 Method 2: Fetching feed (includes more post types)...');
    const feedUrl = `https://graph.facebook.com/v18.0/${facebookPageId}/feed?fields=id,message,created_time,type,permalink_url&limit=50&access_token=${facebookToken}`;
    const feedData = await makeRequest(feedUrl);
    
    if (feedData.error) {
      console.log('❌ Feed API Error:', feedData.error);
    } else {
      console.log(`✅ Found ${feedData.data.length} posts via /feed endpoint`);
    }
    
    // Method 3: Get published posts
    console.log('\n🔍 Method 3: Fetching published posts...');
    const publishedUrl = `https://graph.facebook.com/v18.0/${facebookPageId}/published_posts?fields=id,message,created_time,type,permalink_url&limit=50&access_token=${facebookToken}`;
    const publishedData = await makeRequest(publishedUrl);
    
    if (publishedData.error) {
      console.log('❌ Published posts API Error:', publishedData.error);
    } else {
      console.log(`✅ Found ${publishedData.data.length} posts via /published_posts endpoint`);
    }
    
    // Combine all results
    const allPosts = new Map();
    
    // Add posts from /posts endpoint
    postsData1.data.forEach(post => {
      allPosts.set(post.id, {
        ...post,
        source: 'posts',
        privacy: post.privacy || 'Unknown'
      });
    });
    
    // Add posts from /feed endpoint
    if (feedData.data) {
      feedData.data.forEach(post => {
        if (!allPosts.has(post.id)) {
          allPosts.set(post.id, {
            ...post,
            source: 'feed',
            privacy: 'Public (feed)'
          });
        }
      });
    }
    
    // Add posts from /published_posts endpoint
    if (publishedData.data) {
      publishedData.data.forEach(post => {
        if (!allPosts.has(post.id)) {
          allPosts.set(post.id, {
            ...post,
            source: 'published_posts',
            privacy: 'Public (published)'
          });
        }
      });
    }
    
    console.log(`\n📊 Total unique posts found: ${allPosts.size}`);
    
    // Display all posts
    const postsArray = Array.from(allPosts.values()).sort((a, b) => 
      new Date(b.created_time) - new Date(a.created_time)
    );
    
    console.log('\n📝 All Posts Found:');
    postsArray.forEach((post, index) => {
      const date = new Date(post.created_time).toLocaleDateString();
      const content = post.message ? post.message.substring(0, 80) + '...' : 'No text content';
      console.log(`\n${index + 1}. ${date} - ${post.type || 'Post'}`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Source: ${post.source}`);
      console.log(`   Privacy: ${post.privacy}`);
      console.log(`   Content: ${content}`);
    });
    
    // Check for specific post types that might be missing
    console.log('\n🔍 Checking for specific post types...');
    
    // Check for photo updates
    const photosUrl = `https://graph.facebook.com/v18.0/${facebookPageId}/photos?fields=id,created_time,name&limit=20&access_token=${facebookToken}`;
    const photosData = await makeRequest(photosUrl);
    
    if (photosData.error) {
      console.log('❌ Photos API Error:', photosData.error);
    } else {
      console.log(`📸 Found ${photosData.data.length} photos`);
      photosData.data.slice(0, 5).forEach((photo, index) => {
        const date = new Date(photo.created_time).toLocaleDateString();
        console.log(`   ${index + 1}. ${date} - ${photo.name || 'No name'}`);
      });
    }
    
    // Check for videos
    const videosUrl = `https://graph.facebook.com/v18.0/${facebookPageId}/videos?fields=id,created_time,title&limit=20&access_token=${facebookToken}`;
    const videosData = await makeRequest(videosUrl);
    
    if (videosData.error) {
      console.log('❌ Videos API Error:', videosData.error);
    } else {
      console.log(`🎥 Found ${videosData.data.length} videos`);
      videosData.data.slice(0, 5).forEach((video, index) => {
        const date = new Date(video.created_time).toLocaleDateString();
        console.log(`   ${index + 1}. ${date} - ${video.title || 'No title'}`);
      });
    }
    
    console.log('\n💡 Privacy Recommendations:');
    console.log('   1. All posts should be set to "Public" for API access');
    console.log('   2. Check Facebook page settings → Privacy');
    console.log('   3. Ensure "Public" is selected for new posts');
    console.log('   4. Review existing posts and change privacy to "Public"');
    console.log('\n🎯 Expected: 6 posts (based on your screenshot)');
    console.log(`📊 Found: ${allPosts.size} posts via API`);
    
    if (allPosts.size < 6) {
      console.log('\n⚠️  Missing posts might be due to:');
      console.log('   1. Posts set to non-public privacy');
      console.log('   2. Posts created before API access was granted');
      console.log('   3. Different post types (photos, videos, etc.)');
      console.log('   4. API permissions limitations');
    }
    
  } catch (error) {
    console.error('❌ Error checking post privacy:', error.message);
  }
}

checkPostPrivacy();
