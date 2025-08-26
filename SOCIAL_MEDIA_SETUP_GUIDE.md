# Social Media Setup Guide

This guide will help you set up real social media posting for Facebook, Instagram, and LinkedIn.

## 🚀 Prerequisites

Before you can post to social media platforms, you need to:

1. **Create Developer Accounts** for each platform
2. **Set up Applications** in their developer consoles
3. **Get Access Tokens** with proper permissions
4. **Configure the App** with your credentials

## 📘 Facebook Setup

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Choose "Business" as the app type
4. Fill in your app details

### Step 2: Configure Facebook App
1. In your app dashboard, go to "Settings" → "Basic"
2. Note your **App ID** and **App Secret**
3. Add your domain to "App Domains"
4. Add `http://localhost:3000` to "Valid OAuth Redirect URIs"

### Step 3: Set Up Facebook Login
1. Go to "Products" → "Facebook Login"
2. Click "Set Up"
3. Configure OAuth settings:
   - Valid OAuth Redirect URIs: `http://localhost:3000/auth/facebook/callback`
   - Deauthorize Callback URL: `http://localhost:3000/auth/facebook/deauthorize`
   - Data Deletion Request URL: `http://localhost:3000/auth/facebook/delete`

### Step 4: Get Required Permissions
Your app needs these permissions:
- `pages_manage_posts` - Post to Facebook Pages
- `pages_read_engagement` - Read page insights
- `pages_show_list` - Access user's pages
- `publish_to_groups` - Post to groups (optional)

### Step 5: Get Access Token
1. Go to "Tools" → "Graph API Explorer"
2. Select your app from the dropdown
3. Add the required permissions
4. Click "Generate Access Token"
5. Copy the generated token

## 📸 Instagram Setup

### Step 1: Convert to Business Account
1. Your Instagram account must be a **Business Account** or **Creator Account**
2. Go to Instagram Settings → Account → Switch to Professional Account
3. Choose "Business" or "Creator"

### Step 2: Connect to Facebook
1. In Instagram Settings → Account → Linked Accounts
2. Connect your Instagram account to a Facebook Page
3. Note the **Instagram Business Account ID**

### Step 3: Get Instagram Permissions
Your Facebook app needs these additional permissions:
- `instagram_basic` - Access Instagram account
- `instagram_content_publish` - Post to Instagram
- `instagram_manage_comments` - Manage comments
- `instagram_manage_insights` - Access insights

### Step 4: Get Instagram Access Token
1. Use the same Facebook app from above
2. Add Instagram permissions to your app
3. Generate a new access token with Instagram permissions
4. The token will work for both Facebook and Instagram

## 💼 LinkedIn Setup

### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill in your app details
4. Agree to the terms

### Step 2: Configure LinkedIn App
1. In your app dashboard, go to "Auth" tab
2. Add these OAuth 2.0 settings:
   - Authorized redirect URLs: `http://localhost:3000/auth/linkedin/callback`
   - Application permissions: Request access to "Sign In with LinkedIn"

### Step 3: Get Required Permissions
Your app needs these permissions:
- `r_liteprofile` - Read basic profile
- `w_member_social` - Post content
- `r_organization_social` - Post as organization (if posting to company page)

### Step 4: Get Access Token
1. Go to "Auth" tab in your app
2. Click "Request" next to the permissions you need
3. Follow the OAuth flow to get an access token
4. Copy the generated token

## 🔧 App Configuration

### Step 1: Add Environment Variables
Create a `.env` file in your project root:

```env
# Facebook/Instagram
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
```

### Step 2: Configure Social Media Accounts
1. Open the app and go to **Settings** → **Social Media**
2. Click "Add Account" for each platform
3. Enter your credentials:

#### Facebook Account:
- **Platform**: Facebook
- **Account Name**: Your Page Name
- **Access Token**: Your Facebook access token
- **Page ID**: Your Facebook Page ID (optional)

#### Instagram Account:
- **Platform**: Instagram
- **Account Name**: Your Instagram handle
- **Access Token**: Your Facebook access token (same as Facebook)
- **Business Account ID**: Your Instagram Business Account ID

#### LinkedIn Account:
- **Platform**: LinkedIn
- **Account Name**: Your LinkedIn profile name
- **Access Token**: Your LinkedIn access token
- **Organization ID**: Your company page ID (optional)

### Step 3: Test Connections
1. Click "Test Connection" for each account
2. Verify that the status shows "Connected"
3. If there are errors, check your credentials and permissions

## 🧪 Testing Real Posting

### Test Facebook Posting:
1. Go to **Content Studio**
2. Select "Facebook" as the platform
3. Write a test post
4. Click "🚀 Post Now"
5. Check your Facebook Page for the post

### Test Instagram Posting:
1. Go to **Content Studio**
2. Select "Instagram" as the platform
3. Add an image to your post (required for Instagram)
4. Write a caption
5. Click "🚀 Post Now"
6. Check your Instagram account for the post

### Test LinkedIn Posting:
1. Go to **Content Studio**
2. Select "LinkedIn" as the platform
3. Write a professional post
4. Click "🚀 Post Now"
5. Check your LinkedIn profile for the post

## 🔒 Security Best Practices

### Access Token Security:
- **Never commit tokens to version control**
- **Use environment variables** for sensitive data
- **Rotate tokens regularly** (every 60-90 days)
- **Use the minimum required permissions**

### App Security:
- **Keep your app secret secure**
- **Use HTTPS in production**
- **Implement proper error handling**
- **Log posting activities for audit**

## 🚨 Troubleshooting

### Common Issues:

#### "No active Facebook account found"
- Check that you've added a Facebook account in Settings
- Verify the access token is valid
- Ensure the token has the required permissions

#### "Instagram requires at least one media file"
- Instagram posts must include an image or video
- Add media to your post before posting

#### "LinkedIn authentication failed"
- Check your LinkedIn access token
- Ensure the token hasn't expired
- Verify the token has the required scopes

#### "Media upload failed"
- Check file format (JPG, PNG, MP4 for video)
- Ensure file size is within limits
- Verify the file path is accessible

### Debug Mode:
Enable debug logging by setting:
```env
DEBUG_SOCIAL_MEDIA=true
```

This will show detailed API requests and responses in the console.

## 📞 Support

If you encounter issues:

1. **Check the console logs** for detailed error messages
2. **Verify your credentials** are correct
3. **Test with platform APIs** directly
4. **Check platform status** for any outages
5. **Review platform documentation** for API changes

## 🔄 Token Refresh

Access tokens expire periodically. To handle this:

1. **Monitor token expiration** dates
2. **Implement refresh logic** for long-lived tokens
3. **Notify users** when tokens need renewal
4. **Provide easy re-authentication** flow

## 📊 Monitoring

Track your posting success:

1. **Monitor posting logs** in the app
2. **Check platform insights** for engagement
3. **Review error rates** and patterns
4. **Track API rate limits** and usage

---

**Note**: This setup requires real developer accounts and may involve approval processes from the platforms. Some features may require business verification or additional permissions. 