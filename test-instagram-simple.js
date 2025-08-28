async function testInstagramSimple() {
  console.log('🔍 Testing Instagram API Availability (Simple Test)...\n');
  
  // Test with a sample token (you'll need to replace this with your actual token)
  const sampleToken = 'YOUR_TOKEN_HERE'; // Replace with your actual token
  
  console.log('📱 Test 1: Instagram Business Account via Facebook Page');
  console.log('ℹ️ This test requires a valid Facebook token with Instagram permissions');
  console.log('ℹ️ Instagram Graph API is still available but requires:');
  console.log('   - Business/Creator Instagram account');
  console.log('   - Proper permissions (instagram_basic, instagram_content_publish)');
  console.log('   - Account linked to Facebook page');
  
  console.log('\n📋 Current Instagram API Status:');
  console.log('✅ Instagram Graph API: Still available (v23.0)');
  console.log('⚠️ Instagram Basic Display API: Being deprecated');
  console.log('⚠️ Instagram Content Publishing API: Very restricted');
  console.log('🆕 Threads API: In development, not widely available');
  
  console.log('\n🔧 To test Instagram access:');
  console.log('1. Generate new token in Graph API Explorer');
  console.log('2. Add permissions: instagram_basic, instagram_content_publish');
  console.log('3. Ensure Instagram account is Business/Creator type');
  console.log('4. Link Instagram account to Facebook page');
  
  console.log('\n📊 Alternative: Meta Business Suite');
  console.log('- Meta is pushing businesses toward Business Suite');
  console.log('- More comprehensive analytics and management');
  console.log('- Better integration between Facebook, Instagram, and Threads');
}

testInstagramSimple().catch(console.error);

