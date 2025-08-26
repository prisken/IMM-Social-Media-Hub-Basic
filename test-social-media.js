#!/usr/bin/env node

/**
 * Social Media Posting Test Script
 * 
 * This script tests the social media connectors to ensure they can post to real platforms.
 * Run this after setting up your social media accounts in the app.
 */

const { SocialMediaManager } = require('./dist/main/social-connectors.js');

// Test configuration
const TEST_CONFIG = {
  facebook: {
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    accountId: 'test-account',
    pageId: process.env.FACEBOOK_PAGE_ID
  },
  instagram: {
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN, // Same as Facebook
    accountId: 'test-account',
    businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
  },
  linkedin: {
    accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
    accountId: 'test-account',
    organizationId: process.env.LINKEDIN_ORGANIZATION_ID
  }
};

async function testSocialMediaPosting() {
  console.log('🧪 Testing Social Media Posting...\n');

  const socialMediaManager = new SocialMediaManager();

  // Test Facebook
  if (TEST_CONFIG.facebook.accessToken) {
    console.log('📘 Testing Facebook...');
    try {
      const facebookAccount = {
        id: TEST_CONFIG.facebook.accountId,
        platform: 'facebook',
        accountName: 'Test Facebook Page',
        accessToken: TEST_CONFIG.facebook.accessToken,
        pageId: TEST_CONFIG.facebook.pageId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Test authentication
      const isAuthenticated = await socialMediaManager.testConnection(facebookAccount);
      console.log(`   Authentication: ${isAuthenticated ? '✅ Success' : '❌ Failed'}`);

      if (isAuthenticated) {
        // Test posting
        const testContent = `🧪 Test post from IMM Marketing Hub - ${new Date().toLocaleString()}`;
        const result = await socialMediaManager.postToPlatform(facebookAccount, testContent);
        
        if (result.success) {
          console.log(`   Posting: ✅ Success (Post ID: ${result.platformPostId})`);
        } else {
          console.log(`   Posting: ❌ Failed - ${result.error}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  } else {
    console.log('📘 Facebook: ⚠️ No access token configured\n');
  }

  // Test Instagram
  if (TEST_CONFIG.instagram.accessToken && TEST_CONFIG.instagram.businessAccountId) {
    console.log('📸 Testing Instagram...');
    try {
      const instagramAccount = {
        id: TEST_CONFIG.instagram.accountId,
        platform: 'instagram',
        accountName: 'Test Instagram Account',
        accessToken: TEST_CONFIG.instagram.accessToken,
        businessAccountId: TEST_CONFIG.instagram.businessAccountId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Test authentication
      const isAuthenticated = await socialMediaManager.testConnection(instagramAccount);
      console.log(`   Authentication: ${isAuthenticated ? '✅ Success' : '❌ Failed'}`);

      if (isAuthenticated) {
        // Test posting (Instagram requires media)
        const testContent = `🧪 Test post from IMM Marketing Hub - ${new Date().toLocaleString()}`;
        const result = await socialMediaManager.postToPlatform(instagramAccount, testContent, ['test-image.jpg']);
        
        if (result.success) {
          console.log(`   Posting: ✅ Success (Post ID: ${result.platformPostId})`);
        } else {
          console.log(`   Posting: ❌ Failed - ${result.error}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  } else {
    console.log('📸 Instagram: ⚠️ No access token or business account ID configured\n');
  }

  // Test LinkedIn
  if (TEST_CONFIG.linkedin.accessToken) {
    console.log('💼 Testing LinkedIn...');
    try {
      const linkedinAccount = {
        id: TEST_CONFIG.linkedin.accountId,
        platform: 'linkedin',
        accountName: 'Test LinkedIn Account',
        accessToken: TEST_CONFIG.linkedin.accessToken,
        organizationId: TEST_CONFIG.linkedin.organizationId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Test authentication
      const isAuthenticated = await socialMediaManager.testConnection(linkedinAccount);
      console.log(`   Authentication: ${isAuthenticated ? '✅ Success' : '❌ Failed'}`);

      if (isAuthenticated) {
        // Test posting
        const testContent = `🧪 Test post from IMM Marketing Hub - ${new Date().toLocaleString()}`;
        const result = await socialMediaManager.postToPlatform(linkedinAccount, testContent);
        
        if (result.success) {
          console.log(`   Posting: ✅ Success (Post ID: ${result.platformPostId})`);
        } else {
          console.log(`   Posting: ❌ Failed - ${result.error}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  } else {
    console.log('💼 LinkedIn: ⚠️ No access token configured\n');
  }

  console.log('🏁 Test completed!');
}

// Run the test
if (require.main === module) {
  testSocialMediaPosting().catch(console.error);
}

module.exports = { testSocialMediaPosting }; 