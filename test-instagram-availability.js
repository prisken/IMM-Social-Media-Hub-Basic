const Database = require('./dist/main/database').default;

async function testInstagramAvailability() {
  console.log('🔍 Testing Instagram API Availability...\n');
  
  const db = new Database();
  await db.initialize();
  
  const accounts = await db.getSocialMediaAccounts();
  const facebookAccount = accounts.find(acc => acc.platform === 'facebook' && acc.isActive);
  
  if (!facebookAccount) {
    console.log('❌ No active Facebook account found');
    return;
  }
  
  console.log(`🔑 Using token: ${facebookAccount.accessToken.substring(0, 20)}...\n`);
  
  // Test 1: Check if we can access Instagram Business Account via Facebook page
  console.log('📱 Test 1: Instagram Business Account via Facebook Page');
  try {
    const pageUrl = `https://graph.facebook.com/v23.0/${facebookAccount.pageId}?fields=instagram_business_account&access_token=${facebookAccount.accessToken}`;
    const response = await fetch(pageUrl);
    const data = await response.json();
    
    if (data.error) {
      console.log(`❌ Error: ${data.error.message}`);
    } else if (data.instagram_business_account) {
      console.log(`✅ Instagram Business Account Found: ${data.instagram_business_account.id}`);
      
      // Test 2: Try to access Instagram media directly
      console.log('\n📸 Test 2: Instagram Media Access');
      const mediaUrl = `https://graph.facebook.com/v23.0/${data.instagram_business_account.id}/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${facebookAccount.accessToken}`;
      const mediaResponse = await fetch(mediaUrl);
      const mediaData = await mediaResponse.json();
      
      if (mediaData.error) {
        console.log(`❌ Media Access Error: ${mediaData.error.message}`);
      } else {
        console.log(`✅ Media Access Success: ${mediaData.data?.length || 0} posts found`);
      }
      
    } else {
      console.log('⚠️ No Instagram Business Account linked to this Facebook page');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  // Test 3: Check user's Instagram accounts
  console.log('\n👤 Test 3: User Instagram Accounts');
  try {
    const userUrl = `https://graph.facebook.com/v23.0/me/accounts?fields=instagram_business_account&access_token=${facebookAccount.accessToken}`;
    const response = await fetch(userUrl);
    const data = await response.json();
    
    if (data.error) {
      console.log(`❌ Error: ${data.error.message}`);
    } else {
      const pages = data.data || [];
      const pagesWithInstagram = pages.filter(page => page.instagram_business_account);
      
      if (pagesWithInstagram.length > 0) {
        console.log(`✅ Found ${pagesWithInstagram.length} pages with Instagram accounts:`);
        pagesWithInstagram.forEach(page => {
          console.log(`   - Page: ${page.id} -> Instagram: ${page.instagram_business_account.id}`);
        });
      } else {
        console.log('⚠️ No pages with Instagram Business Accounts found');
      }
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  // Test 4: Check Instagram Basic Display API (if we have a different token)
  console.log('\n📱 Test 4: Instagram Basic Display API');
  try {
    // This would need a different token type - Instagram Basic Display tokens are different
    console.log('ℹ️ Instagram Basic Display API requires a different token type');
    console.log('ℹ️ This API is being deprecated in favor of Meta Business Suite');
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  // Test 5: Check Meta Business Suite endpoints
  console.log('\n🏢 Test 5: Meta Business Suite Access');
  try {
    const businessUrl = `https://graph.facebook.com/v23.0/me/businesses?access_token=${facebookAccount.accessToken}`;
    const response = await fetch(businessUrl);
    const data = await response.json();
    
    if (data.error) {
      console.log(`❌ Business Suite Error: ${data.error.message}`);
    } else {
      console.log(`✅ Business Suite Access: ${data.data?.length || 0} businesses found`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('\n📋 Summary:');
  console.log('- Instagram Graph API is still available but requires Business/Creator accounts');
  console.log('- Instagram Basic Display API is being deprecated');
  console.log('- Meta is pushing toward Meta Business Suite for business features');
  console.log('- Threads API is in development but not widely available yet');
  
  await db.close();
}

testInstagramAvailability().catch(console.error);

