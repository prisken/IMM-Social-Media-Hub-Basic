# LinkedIn Access Token Setup Guide

## 🚨 **Current Issue: Invalid/Expired Access Token**

Your LinkedIn access token is invalid or expired. This is why posting is failing with "Field Value validation failed" errors.

## 🔧 **Solution: Get Fresh LinkedIn Access Token**

### **Step 1: Go to LinkedIn Developer Portal**
1. Visit: https://www.linkedin.com/developers/
2. Sign in with your LinkedIn account
3. Click "Create App" or select your existing app

### **Step 2: Configure App Permissions**
1. Go to "Auth" tab
2. Add these **OAuth 2.0 scopes**:
   - `r_liteprofile` (Read basic profile)
   - `r_organization_social` (Read organization posts)
   - `w_organization_social` (Write organization posts)
   - `rw_organization_admin` (Read/Write organization admin)

### **Step 3: Get Access Token**
1. Go to "Products" tab
2. Add "Marketing Developer Platform" product
3. Go to "Auth" tab
4. Click "Generate access token"
5. Select the scopes from Step 2
6. Copy the generated token

### **Step 4: Get Organization ID**
1. Go to your LinkedIn organization page
2. The URL will be: `https://www.linkedin.com/company/[organization-id]`
3. Copy the organization ID from the URL

### **Step 5: Update Database**
Run this command to update your LinkedIn account:

```bash
node update-linkedin-token.js
```

## 📋 **Required Information:**
- **Access Token**: Fresh token with correct permissions
- **Organization ID**: Your LinkedIn company page ID
- **Organization Name**: "IMM Marketing Hub"

## 🔍 **Verify Token Works:**
After updating, test with:
```bash
node test-linkedin-token.js
```

## ⚠️ **Important Notes:**
- LinkedIn access tokens expire after 60 days
- You need admin access to the LinkedIn organization
- The organization must be approved for the Marketing Developer Platform

## 🆘 **Need Help?**
If you're not an admin of the LinkedIn organization, you'll need to:
1. Ask the organization admin to add you as an admin
2. Or create a new LinkedIn organization page
3. Or use a personal LinkedIn account instead 