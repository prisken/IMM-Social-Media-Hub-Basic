# Electron Troubleshooting Guide: Getting Electron Working

## Overview

This guide documents the complete process of troubleshooting and fixing Electron installation issues, specifically the common problem where `require('electron')` returns a string path instead of the actual Electron module object, causing `app` to be undefined.

## The Problem

### Symptoms
- `TypeError: Cannot read properties of undefined (reading 'whenReady')`
- `app` object is undefined when trying to use `const { app, BrowserWindow } = require('electron')`
- `require('electron')` returns a string path instead of the module object
- Electron app fails to launch with Node.js errors

### Root Cause
The issue occurs when Electron is not properly installed or when using manual setup instead of the official Electron Forge scaffolding tool.

## Solution: Use Electron Forge

### Why Electron Forge?
Electron Forge is the official scaffolding and build tool for Electron applications. It handles all the complex setup, dependency management, and configuration that can cause issues with manual installations.

### Step-by-Step Fix

#### 1. Clean Slate Approach
```bash
# Remove any existing problematic installations
rm -rf node_modules package-lock.json
npm cache clean --force
```

#### 2. Create New Project with Electron Forge
```bash
# Create a new Electron app using the official template
npx create-electron-app@latest my-electron-app
cd my-electron-app
```

#### 3. Verify the Working Structure
The working project should have this structure:
```
my-electron-app/
├── src/
│   ├── main.js          # Main process file
│   ├── index.html       # Renderer HTML
│   └── preload.js       # Preload script (optional)
├── package.json         # Project configuration
└── forge.config.js      # Electron Forge configuration
```

#### 4. Key Differences in package.json
```json
{
  "name": "my-electron-app",
  "main": "src/main.js",
  "scripts": {
    "start": "electron-forge start",
    "package": "electron-forge package",
    "make": "electron-forge make"
  },
  "dependencies": {
    "electron-squirrel-startup": "^1.0.1"
  },
  "devDependencies": {
    "@electron-forge/cli": "^7.9.0",
    "@electron-forge/maker-deb": "^7.9.0",
    "@electron-forge/maker-rpm": "^7.9.0",
    "@electron-forge/maker-squirrel": "^7.9.0",
    "@electron-forge/maker-zip": "^7.9.0",
    "@electron-forge/plugin-auto-unpack-natives": "^7.9.0",
    "@electron-forge/plugin-fuses": "^7.9.0",
    "@electron/fuses": "^1.8.0",
    "electron": "38.1.1"
  }
}
```

#### 5. Proper main.js Structure
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  // Load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

## Alternative Solutions (If Electron Forge Doesn't Work)

### Method 1: Global Electron Installation
```bash
# Install Electron globally
npm install -g electron

# Install locally in project
npm install electron --save-dev

# Run with global binary
electron .
```

### Method 2: Direct Binary Usage
```bash
# Use the local binary directly
./node_modules/.bin/electron .
```

### Method 3: Version-Specific Installation
```bash
# Try a specific stable version
npm install electron@22.3.27 --save-dev
```

## Common Issues and Solutions

### Issue 1: "Cannot read properties of undefined (reading 'whenReady')"
**Solution**: Use Electron Forge instead of manual setup

### Issue 2: "Electron failed to install correctly"
**Solution**: 
```bash
rm -rf node_modules/electron
npm install electron
```

### Issue 3: Node.js Version Conflicts
**Solution**: Use a compatible Node.js version (16.x or 18.x recommended)

### Issue 4: Permission Issues on macOS
**Solution**:
```bash
# Clear Electron cache
rm -rf ~/Library/Application\ Support/Electron
rm -rf ~/Library/Caches/Electron
rm -rf ~/Library/Preferences/com.electron.*
```

## Security Considerations

### Is This a Virus/Malware?
**No.** The symptoms described are not caused by malware but by improper Electron setup. However, always:

1. Run `npm audit` to check for vulnerabilities
2. Verify package integrity with checksums
3. Use official packages from npm registry
4. Keep dependencies updated

### Security Best Practices
- Use `contextIsolation: true` in production
- Implement Content Security Policy (CSP)
- Validate all user inputs
- Keep Electron and dependencies updated

## Verification Steps

### 1. Test Basic Functionality
```bash
npm start
```
Should launch the Electron app without errors.

### 2. Check Console Output
Look for:
- ✅ "Launched Electron app" message
- ❌ Any TypeError or undefined errors

### 3. Verify App Object
Create a test file to verify:
```javascript
const { app } = require('electron');
console.log('App object:', typeof app);
console.log('App methods:', Object.getOwnPropertyNames(app));
```

## Best Practices for Electron Development

### 1. Always Use Electron Forge
- Official scaffolding tool
- Handles complex setup automatically
- Provides build and packaging tools

### 2. Proper Project Structure
```
src/
├── main.js          # Main process
├── renderer.js      # Renderer process
├── preload.js       # Preload script
└── index.html       # Main HTML file
```

### 3. Security Configuration
```javascript
webPreferences: {
  nodeIntegration: false,        // Disable in production
  contextIsolation: true,        // Enable in production
  preload: path.join(__dirname, 'preload.js')
}
```

### 4. Development vs Production
- Use DevTools in development only
- Implement proper error handling
- Use environment variables for configuration

## Troubleshooting Checklist

- [ ] Used Electron Forge for project setup
- [ ] Verified package.json has correct dependencies
- [ ] Checked Node.js version compatibility
- [ ] Cleared npm cache if needed
- [ ] Verified file paths are correct
- [ ] Checked for permission issues
- [ ] Ran `npm audit` for security issues
- [ ] Tested with minimal example first

## Conclusion

The most reliable way to get Electron working is to use the official Electron Forge scaffolding tool. Manual setups often lead to the issues described in this guide. Electron Forge handles all the complex configuration and dependency management automatically, ensuring a working Electron application.

## Resources

- [Electron Forge Documentation](https://www.electronforge.io/)
- [Electron Official Documentation](https://www.electronjs.org/docs)
- [Electron Security Guide](https://www.electronjs.org/docs/tutorial/security)
- [Node.js Version Compatibility](https://www.electronjs.org/docs/tutorial/electron-versioning)
