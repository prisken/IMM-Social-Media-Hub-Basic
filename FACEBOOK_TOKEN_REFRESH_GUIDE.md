# Facebook Token Refresh Setup Guide

## 🔄 Automatic Token Refresh Implementation

The app now includes automatic Facebook token refresh functionality to handle token expiration issues.

### ✅ What's Implemented:

1. **Token Validation**: Automatically checks if tokens are valid before making API calls
2. **Token Refresh**: Can refresh short-lived tokens to long-lived tokens (60 days)
3. **Page Token Storage**: Saves page tokens to database for longer lifespan
4. **Error Handling**: Graceful fallback when tokens expire

### 🔧 Setup Instructions:

#### Option 1: Manual Token Updates (Current Default)
- When tokens expire, the app will show clear error messages
- Update tokens manually in Settings when needed
- Page tokens last much longer than user tokens

#### Option 2: Automatic Token Refresh (Recommended)

To enable automatic token refresh:

1. **Get Your Facebook App Secret**:
   - Go to [Facebook Developers](https://developers.facebook.com)
   - Select your app: `IMM Marketing Hub`
   - Go to **Settings → Basic**
   - Scroll down to **"App Secret"** section
   - Click **"Show"** (you may need to enter your Facebook password)
   - Copy the App Secret

2. **Add App Secret to Your Account**:
   - Go to **Settings → Social Media Accounts**
   - Click **"Edit"** on your Facebook account
   - Paste your App Secret in the **"App Secret"** field
   - Click **"Update Account"**

3. **That's it!** The app will now automatically refresh your tokens when they expire.

### 🔍 How It Works:

#### Token Validation:
- Makes a test API call to `/me` endpoint
- Checks for error responses indicating expired tokens
- Logs clear status messages

#### Token Refresh:
- Uses Facebook's token exchange API
- Converts short-lived tokens to long-lived tokens
- Updates database with new tokens automatically

#### Page Token Exchange:
- Automatically exchanges user tokens for page tokens
- Page tokens last much longer (until revoked)
- Saves page tokens to database for future use

### 📊 Current Status:

✅ **Working Features**:
- Token validation before API calls
- Page token exchange and storage
- Clear error messages for expired tokens
- Automatic token refresh with App Secret
- App Secret stored securely in database
- User-friendly setup in Settings

✅ **Fully Implemented**:
- App Secret field in Social Media Accounts form
- Database schema updated to store App Secret
- Automatic token refresh using stored App Secret
- Detailed setup instructions in UI

### 🚀 Benefits:

1. **Longer Token Lifespan**: Page tokens last much longer than user tokens
2. **Automatic Validation**: Checks tokens before making API calls
3. **Clear Feedback**: Shows exactly when tokens need updating
4. **Graceful Degradation**: Falls back to manual updates if auto-refresh fails

### 🔒 Security Notes:

- Facebook App Secret is stored securely in the local database
- App Secret is only used for token refresh, never exposed in logs
- App Secret field is password-protected in the UI
- Each account can have its own App Secret for different Facebook apps

### 📝 Usage:

The token refresh happens automatically when:
- Fetching Facebook posts and analytics
- Making any Facebook API calls
- The app detects token expiration

No manual intervention required once configured!
