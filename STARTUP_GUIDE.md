# Social Media Management App - Startup Guide

## Overview
This guide provides complete instructions for starting the Social Media Management desktop application. The app is built with Electron, React, and uses SQLite for data storage.

## Prerequisites

### Required Software
1. **Node.js** (version 18 or higher)
2. **npm** (comes with Node.js)
3. **Git** (for version control)

### Optional Dependencies
- **Ollama** (for AI Assistant features) - Install from [ollama.ai](https://ollama.ai)

## Installation & Setup

### 1. Clone/Download the Project
```bash
cd /path/to/your/projects
git clone <repository-url> Social-Media-Management
cd Social-Media-Management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Electron Forge (if not already installed)
```bash
npm install --save-dev @electron-forge/cli @electron-forge/maker-deb @electron-forge/maker-rpm @electron-forge/maker-squirrel @electron-forge/maker-zip @electron-forge/plugin-auto-unpack-natives @electron-forge/plugin-fuses @electron/fuses
```

### 4. Verify Configuration Files

#### forge.config.js (Required)
Ensure this file exists in the project root:
```javascript
module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
```

#### package.json Scripts
Verify these scripts are present:
```json
{
  "scripts": {
    "start": "electron-forge start",
    "dev": "concurrently \"npm run dev:renderer\" \"npm run dev:main\"",
    "dev:renderer": "vite",
    "dev:main": "tsc -p tsconfig.main.json && electron-forge start",
    "build": "npm run build:renderer && npm run build:main",
    "build:renderer": "vite build",
    "build:main": "tsc -p tsconfig.main.json",
    "preview": "vite preview",
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev:renderer\" \"wait-on http://localhost:5173 && electron .\"",
    "type-check": "tsc --noEmit"
  }
}
```

## Starting the Application

### Method 1: Development Mode (Recommended)
This starts both the frontend (Vite) and backend (Electron) processes:

```bash
npm run dev
```

**What this does:**
- Starts Vite development server on `http://localhost:5173`
- Compiles TypeScript main process
- Launches Electron app using Electron Forge
- Enables hot reloading for development

### Method 2: Production Mode
For testing the built application:

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues and Solutions

#### 1. "concurrently: command not found"
```bash
npm install concurrently
```

#### 2. "Cannot find module 'dist/main.js'"
```bash
npm run build:main
```

#### 3. "The AutoUnpackNatives plugin requires asar to be truthy or an object"
- Ensure `forge.config.js` exists with `asar: true` in `packagerConfig`
- Reinstall Electron Forge packages if needed

#### 4. "TypeError: Cannot read properties of undefined (reading 'whenReady')"
- This indicates Electron Forge is not properly configured
- Follow the installation steps above
- Ensure `forge.config.js` is present

#### 5. "ERR_CONNECTION_REFUSED" for localhost:5173
- The Vite server isn't running
- Use `npm run dev` instead of just `npm start`
- Check if port 5173 is available

#### 6. "ReferenceError: fetch is not defined" (Ollama)
- This is expected if Ollama is not running
- Install and start Ollama separately: `ollama serve`
- The app will work without Ollama (AI features will be disabled)

### Port Conflicts
If you get port conflicts:
```bash
# Kill processes on ports 5173, 5174, 5175
lsof -ti:5173 | xargs kill -9
lsof -ti:5174 | xargs kill -9
lsof -ti:5175 | xargs kill -9
```

### Clean Restart
If experiencing persistent issues:
```bash
# Stop all processes
pkill -f "npm run dev"
pkill -f "electron"
pkill -f "vite"

# Clear caches
npm cache clean --force
rm -rf node_modules
npm install

# Restart
npm run dev
```

## Database Information

### Database Location
- **Global Database**: `/Users/[username]/Library/Application Support/social-media-management/global.db`
- **Organization Databases**: Created per organization in the same directory

### Database Contents
The app stores:
- **Users**: Authentication and profile data
- **Organizations**: User-created organizations
- **Posts**: Social media posts and content
- **Media**: Uploaded images and files
- **Categories**: Content categorization
- **Calendar**: Post scheduling data

### Backup Database
To backup your data:
```bash
cp "/Users/[username]/Library/Application Support/social-media-management/global.db" ~/Desktop/backup-$(date +%Y%m%d).db
```

## Features Available

### Core Features
- ✅ User authentication and organization management
- ✅ Post creation and editing
- ✅ Media upload and management
- ✅ Calendar view and scheduling
- ✅ Category and topic management
- ✅ Bulk operations
- ✅ Post previews
- ✅ Database persistence

### AI Features (Requires Ollama)
- ✅ AI Assistant for content generation
- ✅ Content suggestions and improvements
- ✅ Automated post creation

## Development Notes

### File Structure
```
Social-Media-Management/
├── electron/           # Electron main process
│   ├── main.ts        # Main application logic
│   ├── preload.ts     # Preload script
│   └── utils.ts       # Utility functions
├── src/               # React frontend
│   ├── components/    # React components
│   ├── services/      # API and data services
│   ├── hooks/         # Custom React hooks
│   └── types/         # TypeScript type definitions
├── forge.config.js    # Electron Forge configuration
└── package.json       # Project configuration
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Electron 22, Node.js
- **Database**: SQLite3
- **Build Tools**: Electron Forge, TypeScript Compiler
- **AI Integration**: Ollama (optional)

## Support

### Logs and Debugging
- Check terminal output for error messages
- Electron logs appear in the terminal where you ran `npm run dev`
- Database errors are logged to the console

### Getting Help
1. Check this guide first
2. Verify all prerequisites are installed
3. Try the clean restart procedure
4. Check the terminal output for specific error messages

## Quick Start Checklist

- [ ] Node.js and npm installed
- [ ] Project dependencies installed (`npm install`)
- [ ] Electron Forge packages installed
- [ ] `forge.config.js` exists with correct configuration
- [ ] `package.json` has required scripts
- [ ] No port conflicts (5173, 5174, 5175)
- [ ] Run `npm run dev` to start the application
- [ ] Verify Electron window opens and loads the app
- [ ] Check that database initializes successfully

---

**Last Updated**: January 2025  
**Version**: Based on commit 248f416e with Electron Forge integration
