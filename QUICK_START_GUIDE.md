# Quick Start Guide - Organization Login

## Available Organizations:


1. **Karma Cookie**
   - ID: `karma_cookie_org_001`
   - Description: A mindful cookie company focused on positive energy and delicious treats
   - Website: https://karmacookie.com
   - Primary Color: #FF6B6B
   - Theme: light
   - Timezone: America/New_York

2. **Persona Centric**
   - ID: `persona_centric_org_002`
   - Description: Marketing agency specializing in persona-driven campaigns and brand strategy
   - Website: https://personacentric.com
   - Primary Color: #667EEA
   - Theme: dark
   - Timezone: America/Los_Angeles

3. **IMM Limited**
   - ID: `imm_limited_org_003`
   - Description: International Marketing Management - Global business solutions and consulting
   - Website: https://immlimited.com
   - Primary Color: #2C3E50
   - Theme: light
   - Timezone: Europe/London

4. **Roleplay**
   - ID: `roleplay_org_004`
   - Description: Interactive entertainment company creating immersive roleplay experiences
   - Website: https://roleplay-entertainment.com
   - Primary Color: #E74C3C
   - Theme: dark
   - Timezone: America/Chicago

5. **HK Foodies**
   - ID: `hk_foodies_org_005`
   - Description: Hong Kong food blog and restaurant review platform
   - Website: https://hkfoodies.com
   - Primary Color: #FF4757
   - Theme: light
   - Timezone: Asia/Hong_Kong

6. **1/2 Drinks**
   - ID: `half_drinks_org_006`
   - Description: Craft beverage company specializing in unique cocktail mixes and spirits
   - Website: https://halfdrinks.com
   - Primary Color: #8E44AD
   - Theme: dark
   - Timezone: America/New_York


## How to Login:

1. **Start the application**: `npm run dev`
2. **Go to login screen**
3. **Click "Select Org" tab**
4. **Choose an organization** from the list
5. **Click "Continue to [Organization Name]"**

## Organization Switching:

- Use the organization switcher in the header (after login)
- Or logout and select a different organization

## Testing Each Organization:

Each organization has:
- ✅ 4 default categories (Marketing, Product, Community, News)
- ✅ 4 default topics (Social Media, Email Marketing, Content Marketing, Paid Advertising)
- ✅ 2 sample posts (Welcome post + Product launch draft)
- ✅ 2 post templates (Product Announcement + Behind the Scenes)

## Recovery:

If you need to recreate organizations:
1. Run the SQL script: `setup-organizations.sql`
2. Or use the credentials file: `ORGANIZATION_CREDENTIALS.json`

## Files Created:

- `setup-organizations.sql` - SQL script to create organizations
- `ORGANIZATION_CREDENTIALS.json` - Organization data backup
- `QUICK_START_GUIDE.md` - This guide

## Database Integration:

The organizations will be automatically available in your app because:
- The SQL script creates the data in the correct format
- The app will load organizations from the database
- Organization switching is built into the UI

## Troubleshooting:

If organizations don't appear:
1. Check that the database is running
2. Verify the SQL script was executed
3. Check the browser console for errors
4. Restart the application
