# Quick Setup Guide - Fix Social Media Posting

## 🚨 Current Issues

Based on the console output, you're experiencing these issues:

1. **Access tokens have expired** - Facebook and Instagram tokens expired
2. **No LinkedIn account connected** - The app can't find a LinkedIn account
3. **IPC handler conflicts** - Fixed in the code

## 🔧 Quick Fix Steps

### Step 1: Add Social Media Accounts

1. **Open the app** and go to **Settings** → **Social Accounts**
2. **Click "Add Account"** for each platform you want to use

### Step 2: For LinkedIn (Most Important - Fixes Current Error)

1. **Platform**: Select "LinkedIn"
2. **Account Name**: Enter your LinkedIn profile name
3. **Access Token**: You'll need to get this from LinkedIn
4. **Organization ID**: (Optional) Your company page ID if posting to company page

**To get LinkedIn Access Token:**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app or use existing one
3. Go to "Auth" tab
4. Request these permissions:
   - `r_liteprofile` (Read basic profile)
   - `w_member_social` (Post content)
5. Generate an access token
6. Copy the token to the app

### Step 3: For Facebook & Instagram

**Option A: Use Test Tokens (Quick Setup)**
1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Add permissions: `pages_manage_posts`, `pages_read_engagement`
4. Generate access token
5. Add to app with your Facebook Page ID

**Option B: Create Real App (Production)**
1. Follow the detailed guide in `SOCIAL_MEDIA_SETUP_GUIDE.md`
2. Create Facebook Developer account
3. Set up proper app with permissions
4. Get long-lived access tokens

### Step 4: Test the Setup

1. **Go to Content Studio**
2. **Select a platform** (LinkedIn, Facebook, or Instagram)
3. **Write a test post**
4. **Click "🚀 Post Now"**
5. **Check if it works**

## 🧪 Test with Sample Data

If you want to test without real tokens, you can use these sample accounts:

### LinkedIn Test Account:
```
Platform: LinkedIn
Account Name: Test LinkedIn Account
Access Token: test_token_123
Organization ID: (leave empty)
```

### Facebook Test Account:
```
Platform: Facebook
Account Name: Test Facebook Page
Access Token: test_token_456
Page ID: test_page_123
```

### Instagram Test Account:
```
Platform: Instagram
Account Name: Test Instagram Account
Access Token: test_token_789
Business Account ID: test_ig_123
```

## 🔍 Troubleshooting

### "No active [platform] account found"
- **Solution**: Add an account for that platform in Settings → Social Accounts
- **Check**: Account is marked as "Active"

### "Access token expired"
- **Solution**: Generate a new access token
- **Check**: Token has proper permissions

### "Authentication failed"
- **Solution**: Verify your credentials
- **Check**: Account is properly connected

## 📞 Need Help?

1. **Check the console logs** for detailed error messages
2. **Follow the detailed guide** in `SOCIAL_MEDIA_SETUP_GUIDE.md`
3. **Use the test script** in `test-social-media.js` to verify setup

## 🎯 Next Steps

Once you've added at least one social media account:

1. **Test posting** in Content Studio
2. **Try scheduling** posts for future
3. **Check posting logs** to see success/failure
4. **Add more accounts** for other platforms

---

**Note**: The app is now fully functional for real social media posting. You just need to connect your accounts with valid access tokens! 