async function testFacebookPages() {
  // Your Facebook token from the database
  const accessToken = 'EAAIQXHVB1h8BPXznMJ5MNxbcM8WI5hUVB32kgsliYOn7ZAiOhegqZC9LIUxZCn5QnkGEv6AWJupfpQYkp4QcKBZBjfW6UnfZA8MCFOE3CgVzOTuoJHlWzRfC5dBq';
  
  console.log('🔍 Testing Facebook API access...\n');
  
  try {
    // 1. First, let's check what pages the user has access to
    console.log('📋 Checking user pages...');
    const pagesUrl = `https://graph.facebook.com/v23.0/me/accounts?access_token=${accessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    
    if (pagesData.error) {
      console.error('❌ Error fetching pages:', pagesData.error);
    } else {
      console.log('✅ User pages found:');
      pagesData.data.forEach((page, index) => {
        console.log(`  ${index + 1}. Page: ${page.name} (ID: ${page.id})`);
        console.log(`     Access Token: ${page.access_token.substring(0, 20)}...`);
        console.log(`     Category: ${page.category}`);
        console.log('');
      });
    }
    
    // 2. Test the specific page ID from your database
    console.log('🔍 Testing specific page ID: 100088250407706');
    const pageUrl = `https://graph.facebook.com/v23.0/100088250407706?fields=id,name,category&access_token=${accessToken}`;
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();
    
    if (pageData.error) {
      console.error('❌ Error fetching specific page:', pageData.error);
    } else {
      console.log('✅ Specific page found:', pageData);
    }
    
    // 3. Test posts endpoint on the specific page
    console.log('\n📝 Testing posts endpoint...');
    const postsUrl = `https://graph.facebook.com/v23.0/100088250407706/posts?fields=id,message,created_time&limit=5&access_token=${accessToken}`;
    const postsResponse = await fetch(postsUrl);
    const postsData = await postsResponse.json();
    
    if (postsData.error) {
      console.error('❌ Error fetching posts:', postsData.error);
    } else {
      console.log('✅ Posts found:', postsData.data.length);
      postsData.data.forEach((post, index) => {
        console.log(`  ${index + 1}. Post ID: ${post.id}`);
        console.log(`     Created: ${post.created_time}`);
        console.log(`     Message: ${post.message ? post.message.substring(0, 50) + '...' : 'No message'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testFacebookPages();
