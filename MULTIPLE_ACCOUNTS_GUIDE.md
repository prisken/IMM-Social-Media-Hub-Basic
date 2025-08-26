# Multiple Social Media Accounts Guide

## 🎯 **Your Current Setup**

Based on your database, you currently have **3 real social media accounts**:

### **📘 Facebook**
- **Account**: IMM HK
- **Status**: ✅ Active with real token
- **Type**: Facebook Page
- **Page ID**: 100088250407706

### **📸 Instagram** 
- **Account**: immmediahk
- **Status**: ✅ Active with real token
- **Type**: Instagram Business Account
- **Business Account ID**: 17841456554940613

### **💼 LinkedIn**
- **Account**: IMM Marketing Hub
- **Status**: ✅ Active with real token
- **Type**: LinkedIn Organization
- **Organization ID**: 860d47fdd076hh

---

## 🔧 **How Account Selection Works**

### **Current Behavior:**
When you post to a platform, the app automatically selects which account to use:

1. **Single Account**: If you have only one account for a platform, it uses that one
2. **Multiple Accounts**: If you have multiple accounts, it prioritizes:
   - ✅ **Real accounts** over test accounts
   - ✅ **Active accounts** over inactive ones
   - ✅ **First available** account if multiple real accounts exist

### **Account Priority Logic:**
```javascript
// The app uses this logic to select accounts:
const realAccount = accounts.find(acc => 
  acc.isActive && 
  !acc.accountName.toLowerCase().includes('test') && 
  !acc.accessToken.toLowerCase().includes('test')
);
```

---

## 📱 **Adding Multiple Accounts**

### **Step 1: Add Additional Accounts**
1. Go to **Settings** → **Social Accounts**
2. Click **"Add Account"**
3. Select the platform (Facebook, Instagram, or LinkedIn)
4. Enter the account details:
   - **Account Name**: A descriptive name (e.g., "Company Page", "Personal Account")
   - **Access Token**: The platform's access token
   - **Additional IDs**: Page ID, Business Account ID, or Organization ID

### **Step 2: Account Naming Best Practices**
Use descriptive names to easily identify accounts:
- `"Company Facebook Page"`
- `"Personal LinkedIn Profile"`
- `"Main Instagram Business"`
- `"Secondary Instagram Account"`

### **Step 3: Test Each Account**
1. Click **"Test Connection"** for each account
2. Verify the account details are correct
3. Ensure the account is marked as **"Active"**

---

## 🎯 **Managing Multiple Accounts**

### **View All Accounts:**
```bash
node manage-accounts.js
```

This script shows:
- All accounts by platform
- Account status (Active/Inactive)
- Token type (Real/Test)
- Posting priority

### **Account Management in App:**
1. **Settings** → **Social Accounts**
2. View all accounts for each platform
3. Edit account details
4. Test connections
5. Delete unused accounts

---

## 🚀 **Posting with Multiple Accounts**

### **Current Behavior:**
- **LinkedIn**: Posts from "IMM Marketing Hub"
- **Facebook**: Posts from "IMM HK" 
- **Instagram**: Posts from "immmediahk"

### **Future Enhancement:**
The app will be enhanced to allow **account selection** during posting:

1. **Content Studio** will show account selector
2. **Choose which account** to post from
3. **Preview** which account the post will appear on
4. **Schedule posts** to specific accounts

---

## 🔍 **Troubleshooting Multiple Accounts**

### **Issue: "Wrong account used for posting"**
**Solution**: 
- Check account priority in `manage-accounts.js`
- Ensure the correct account is marked as "Active"
- Remove or deactivate unwanted accounts

### **Issue: "Authentication failed for some accounts"**
**Solution**:
- Test each account connection individually
- Refresh expired access tokens
- Check account permissions

### **Issue: "Can't find my account"**
**Solution**:
- Verify account is added to the correct platform
- Check account is marked as "Active"
- Test the connection

---

## 📊 **Account Status Monitoring**

### **Check Account Health:**
```bash
# View all accounts and their status
node manage-accounts.js

# Test specific platform accounts
node test-social-media.js
```

### **Account Health Indicators:**
- ✅ **Active**: Account is available for posting
- ❌ **Inactive**: Account is disabled
- 🔑 **Real Token**: Valid access token for real posting
- 🧪 **Test Token**: Test token (won't post to real platforms)

---

## 🎯 **Best Practices**

### **Account Organization:**
1. **Use descriptive names** for easy identification
2. **Group related accounts** (e.g., "Company Accounts", "Personal Accounts")
3. **Keep test accounts separate** from production accounts
4. **Regularly review** and clean up unused accounts

### **Security:**
1. **Rotate access tokens** regularly
2. **Use minimum required permissions**
3. **Monitor account activity**
4. **Remove unused accounts**

### **Posting Strategy:**
1. **Test posts** on test accounts first
2. **Use appropriate accounts** for different content types
3. **Monitor posting success** for each account
4. **Keep backup accounts** for redundancy

---

## 🔮 **Future Features**

### **Planned Enhancements:**
1. **Account Selection UI**: Choose account during posting
2. **Account Groups**: Organize accounts by purpose
3. **Posting Rules**: Automatically select accounts based on content
4. **Account Analytics**: Track performance per account
5. **Bulk Account Management**: Manage multiple accounts at once

### **Account Selection Interface:**
```
Platform: LinkedIn
┌─────────────────────────────────────┐
│ Select Account:                     │
│ ○ IMM Marketing Hub (Company)       │
│ ○ Personal LinkedIn Profile         │
│ ○ Test Account                      │
└─────────────────────────────────────┘
```

---

## 📞 **Support**

### **Need Help?**
1. **Run diagnostics**: `node manage-accounts.js`
2. **Check logs**: Look at console output for errors
3. **Test connections**: Use "Test Connection" in Settings
4. **Review setup**: Follow `SOCIAL_MEDIA_SETUP_GUIDE.md`

### **Common Commands:**
```bash
# View all accounts
node manage-accounts.js

# Test social media posting
node test-social-media.js

# Add test accounts (for testing)
node add-test-accounts.js
```

---

**Your current setup is perfect for real social media posting!** You have valid accounts for all three platforms and the app will automatically use the correct accounts for posting. 🎉 