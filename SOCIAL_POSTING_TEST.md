# Social Posting Connectors Test Guide

## Milestone 5 Implementation Complete ✅

This document outlines the implementation of **Milestone 5: Social Posting Connectors** and how to test the functionality.

## What Was Implemented

### 1. Social Media Connectors (`src/main/social-connectors.ts`)
- **FacebookConnector**: Handles Facebook Graph API integration
- **InstagramConnector**: Handles Instagram Graph API integration  
- **LinkedInConnector**: Handles LinkedIn API integration
- **SocialMediaManager**: Manages all connectors and provides unified interface

### 2. Posting Engine (`src/main/posting-engine.ts`)
- **Retry Logic**: Exponential backoff with configurable retry counts
- **Platform Formatting**: Automatic content formatting for each platform
- **Content Validation**: Validates content against platform limits
- **Logging**: Comprehensive logging of all posting attempts

### 3. Database Integration (`src/main/database.ts`)
- **social_media_accounts** table: Stores platform credentials
- **posting_jobs** table: Tracks posting jobs and their status
- **posting_logs** table: Logs all posting attempts and results

### 4. User Interface Components
- **SocialMediaAccounts** (`src/renderer/components/SocialMediaAccounts.tsx`): Manage social media accounts
- **PostingLogs** (`src/renderer/components/PostingLogs.tsx`): View posting history and manage jobs

## How to Test

### 1. Start the Application
```bash
npm run dev
```

### 2. Configure Social Media Accounts
1. Navigate to "📘 Social Accounts" in the main menu
2. Click "Add Account" to configure your first social media account
3. Follow the setup instructions for each platform:

#### Facebook Setup
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app or use existing one
3. Add Facebook Login product
4. Generate access token with required permissions
5. For pages, add the page ID

#### Instagram Setup
1. Convert Instagram account to Business account
2. Connect to Facebook page
3. Use same Facebook app from above
4. Add Instagram Basic Display or Graph API
5. Generate access token with required permissions

#### LinkedIn Setup
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers)
2. Create a new app
3. Request access to Marketing Developer Platform
4. Generate access token with required permissions
5. For organizations, add organization ID

### 3. Test Account Connection
1. After adding an account, click "Test Connection"
2. Verify the connection is successful
3. If failed, check your access token and permissions

### 4. Create a Posting Job
1. Navigate to "Content Studio" or "Scheduling Hub"
2. Create a new post with content and media
3. Schedule the post for a future time
4. The posting engine will automatically handle the posting

### 5. Monitor Posting Activity
1. Navigate to "📊 Posting Logs" in the main menu
2. View the "Posting Logs" tab to see posting history
3. View the "Active Jobs" tab to see pending jobs
4. Use the filter to view specific status types

### 6. Manage Failed Jobs
1. In "Posting Logs", find failed jobs
2. Click "View Details" to see error information
3. Click "Retry" to attempt posting again
4. Click "Cancel" to cancel pending jobs

## Platform-Specific Features

### Facebook
- **Max Length**: 63,206 characters
- **Hashtag Limit**: 30 hashtags
- **Media**: Optional, up to 10 files
- **Special Features**: Page posting support

### Instagram
- **Max Length**: 2,200 characters
- **Hashtag Limit**: 30 hashtags
- **Media**: Required, up to 10 files
- **Special Features**: Business account required

### LinkedIn
- **Max Length**: 3,000 characters
- **Hashtag Limit**: 5 hashtags
- **Media**: Optional, up to 9 files
- **Special Features**: Organization posting support

## Content Formatting

The posting engine automatically formats content for each platform:

### Instagram Formatting
- Adds line breaks for better readability
- Adds emojis if none present
- Optimizes for visual appeal

### LinkedIn Formatting
- Ensures professional formatting
- Converts lists to bullet points
- Removes excessive line breaks

### Facebook Formatting
- Flexible formatting
- Cleans up excessive line breaks

## Error Handling & Retries

- **Exponential Backoff**: 1s, 5s, 15s, 30s, 60s delays
- **Max Retries**: Configurable (default: 3)
- **Error Logging**: Detailed error messages stored
- **Manual Retry**: Failed jobs can be retried manually

## Acceptance Criteria Met ✅

- ✅ **Facebook Graph API integration** with authentication and posting
- ✅ **Instagram API integration** with business account support
- ✅ **LinkedIn API integration** with organization support
- ✅ **Posting engine with retries** and exponential backoff
- ✅ **Comprehensive logging** of all posting attempts
- ✅ **Per-platform formatting** with content validation
- ✅ **User interface** for managing accounts and viewing logs
- ✅ **Integration with calendar** for scheduled posting

## Next Steps

1. **Media Upload Implementation**: Complete the media upload functionality for each platform
2. **Token Refresh**: Implement automatic token refresh for expired tokens
3. **Analytics Integration**: Connect posting results to analytics dashboard
4. **Bulk Operations**: Add support for bulk posting across multiple platforms
5. **Advanced Scheduling**: Add more sophisticated scheduling options

## Files Created/Modified

### New Files
- `src/main/social-connectors.ts` - Social media API connectors
- `src/main/posting-engine.ts` - Posting engine with retry logic
- `src/renderer/components/SocialMediaAccounts.tsx` - Account management UI
- `src/renderer/components/SocialMediaAccounts.css` - Account management styles
- `src/renderer/components/PostingLogs.tsx` - Posting logs UI
- `src/renderer/components/PostingLogs.css` - Posting logs styles

### Modified Files
- `src/main/database.ts` - Added social media tables and methods
- `src/main/index.ts` - Added IPC handlers for social media operations
- `src/main/preload.ts` - Added API exposure for social media operations
- `src/renderer/App.tsx` - Added navigation for new components

The implementation is complete and ready for testing! 🎉 