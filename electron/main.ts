import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { isDev } from './utils'
import Database from 'sqlite3'
import { promisify } from 'util'
import { existsSync, mkdirSync } from 'fs'

let mainWindow: BrowserWindow
let database: Database.Database | null = null

// Initialize database
async function initializeDatabase() {
  const userDataPath = app.getPath('userData')
  const dbDir = join(userDataPath, 'databases')
  
  // Ensure database directory exists
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }
  
  const dbPath = join(dbDir, 'social_media_manager.db')
  
  return new Promise<Database.Database>((resolve, reject) => {
    const db = new Database.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to open database:', err)
        reject(err)
      } else {
        console.log('Database opened successfully')
        resolve(db)
      }
    })
  })
}

// Create organizations data
async function createOrganizationsData(db: Database.Database) {
  try {
    console.log('Creating organizations data...')
    
    const organizations = [
      {
        id: 'karma_cookie_org_001',
        name: 'Karma Cookie',
        description: 'A mindful cookie company focused on positive energy and delicious treats',
        website: 'https://karmacookie.com',
        logo: 'karma-cookie-logo.png',
        settings: JSON.stringify({
          branding: { primaryColor: '#FF6B6B', secondaryColor: '#4ECDC4' },
          preferences: { defaultTimezone: 'America/New_York', autoSave: true, theme: 'light' },
          storage: { maxStorageGB: 5, currentUsageGB: 0 }
        })
      },
      {
        id: 'persona_centric_org_002',
        name: 'Persona Centric',
        description: 'Marketing agency specializing in persona-driven campaigns and brand strategy',
        website: 'https://personacentric.com',
        logo: 'persona-centric-logo.png',
        settings: JSON.stringify({
          branding: { primaryColor: '#667EEA', secondaryColor: '#764BA2' },
          preferences: { defaultTimezone: 'America/Los_Angeles', autoSave: true, theme: 'dark' },
          storage: { maxStorageGB: 10, currentUsageGB: 0 }
        })
      },
      {
        id: 'imm_limited_org_003',
        name: 'IMM Limited',
        description: 'International Marketing Management - Global business solutions and consulting',
        website: 'https://immlimited.com',
        logo: 'imm-limited-logo.png',
        settings: JSON.stringify({
          branding: { primaryColor: '#2C3E50', secondaryColor: '#3498DB' },
          preferences: { defaultTimezone: 'Europe/London', autoSave: true, theme: 'light' },
          storage: { maxStorageGB: 15, currentUsageGB: 0 }
        })
      },
      {
        id: 'roleplay_org_004',
        name: 'Roleplay',
        description: 'Interactive entertainment company creating immersive roleplay experiences',
        website: 'https://roleplay-entertainment.com',
        logo: 'roleplay-logo.png',
        settings: JSON.stringify({
          branding: { primaryColor: '#E74C3C', secondaryColor: '#F39C12' },
          preferences: { defaultTimezone: 'America/Chicago', autoSave: true, theme: 'dark' },
          storage: { maxStorageGB: 8, currentUsageGB: 0 }
        })
      },
      {
        id: 'hk_foodies_org_005',
        name: 'HK Foodies',
        description: 'Hong Kong food blog and restaurant review platform',
        website: 'https://hkfoodies.com',
        logo: 'hk-foodies-logo.png',
        settings: JSON.stringify({
          branding: { primaryColor: '#FF4757', secondaryColor: '#FFA502' },
          preferences: { defaultTimezone: 'Asia/Hong_Kong', autoSave: true, theme: 'light' },
          storage: { maxStorageGB: 12, currentUsageGB: 0 }
        })
      },
      {
        id: 'half_drinks_org_006',
        name: '1/2 Drinks',
        description: 'Craft beverage company specializing in unique cocktail mixes and spirits',
        website: 'https://halfdrinks.com',
        logo: 'half-drinks-logo.png',
        settings: JSON.stringify({
          branding: { primaryColor: '#8E44AD', secondaryColor: '#E67E22' },
          preferences: { defaultTimezone: 'America/New_York', autoSave: true, theme: 'dark' },
          storage: { maxStorageGB: 6, currentUsageGB: 0 }
        })
      }
    ]
    
    // Check if organizations already exist
    const existingOrgs = await new Promise((resolve, reject) => {
      db.all('SELECT COUNT(*) as count FROM organizations', [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    }) as any[]
    
    if (existingOrgs[0].count > 0) {
      console.log('✅ Organizations already exist, checking for users...')
      
      // Check if users exist
      const existingUsers = await new Promise((resolve, reject) => {
        db.all('SELECT COUNT(*) as count FROM users', [], (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        })
      }) as any[]
      
      if (existingUsers[0].count > 0) {
        console.log('✅ Users already exist, skipping creation')
        return
      }
      
      console.log('📝 Creating users for existing organizations...')
    }
    
    console.log('📝 Creating initial organizations and users...')
    
    // Create organizations with proper duplicate prevention
    for (const org of organizations) {
      try {
        // Check if organization already exists
        const existingOrg = await new Promise((resolve, reject) => {
          db.get('SELECT id FROM organizations WHERE name = ?', [org.name], (err, row) => {
            if (err) reject(err)
            else resolve(row)
          })
        }) as any
        
        if (existingOrg) {
          console.log(`✅ Organization already exists: ${org.name}`)
          continue
        }
        
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO organizations (name, description, website, logo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [org.name, org.description, org.website, org.logo, new Date().toISOString(), new Date().toISOString()],
            function(err) {
              if (err) reject(err)
              else resolve({ lastInsertRowid: this.lastID })
            }
          )
        })
        console.log(`✅ Created organization: ${org.name}`)
      } catch (error) {
        console.log(`❌ Failed to create organization ${org.name}:`, error)
      }
    }
    
    // Create a user for each organization - match by name instead of array index
    const orgCredentials = [
      { email: 'karma@karmacookie.com', password: 'karma123', orgName: 'Karma Cookie' },
      { email: 'persona@personacentric.com', password: 'persona123', orgName: 'Persona Centric' },
      { email: 'imm@immlimited.com', password: 'imm123', orgName: 'IMM Limited' },
      { email: 'roleplay@roleplay.com', password: 'roleplay123', orgName: 'Roleplay' },
      { email: 'foodies@hkfoodies.com', password: 'foodies123', orgName: 'HK Foodies' },
      { email: 'drinks@halfdrinks.com', password: 'drinks123', orgName: '1/2 Drinks' }
    ]
    
    // Create users by matching organization names
    for (const cred of orgCredentials) {
      try {
        // Find the organization by name
        const org = await new Promise((resolve, reject) => {
          db.get('SELECT id, name FROM organizations WHERE name = ?', [cred.orgName], (err, row) => {
            if (err) reject(err)
            else resolve(row)
          })
        }) as any
        
        if (!org) {
          console.log(`❌ Organization not found: ${cred.orgName}`)
          continue
        }
        
        // Check if user already exists
        const existingUser = await new Promise((resolve, reject) => {
          db.get('SELECT id FROM users WHERE email = ?', [cred.email], (err, row) => {
            if (err) reject(err)
            else resolve(row)
          })
        }) as any
        
        if (existingUser) {
          console.log(`✅ User already exists: ${cred.email}`)
          continue
        }
        
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO users (name, email, password_hash, organization_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [cred.orgName + ' Admin', cred.email, cred.password, org.id, new Date().toISOString(), new Date().toISOString()],
            function(err) {
              if (err) reject(err)
              else resolve({ lastInsertRowid: this.lastID })
            }
          )
        })
        console.log(`✅ Created user for ${org.name}: ${cred.email}`)
      } catch (error) {
        console.log(`❌ Failed to create user for ${cred.orgName}:`, error)
      }
    }
    
    console.log('Organizations data created successfully')
  } catch (error) {
    console.error('Failed to create demo data:', error)
  }
}

// Create database tables
async function createTables(db: Database.Database) {
  const run = promisify(db.run.bind(db))
  
  const schema = `
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      website TEXT,
      logo TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      organization_id INTEGER NOT NULL,
      last_login_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations (id)
    );
    
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      description TEXT,
      organization_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      description TEXT,
      category_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      hashtags TEXT NOT NULL DEFAULT '[]',
      platform TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      category_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      scheduled_at TEXT,
      published_at TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS media_files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      duration INTEGER,
      path TEXT NOT NULL,
      thumbnail_path TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      organization_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS post_media (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      media_file_id TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
      FOREIGN KEY (media_file_id) REFERENCES media_files (id) ON DELETE CASCADE,
      UNIQUE(post_id, media_file_id)
    );
    
    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at TEXT NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS post_templates (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      media_template TEXT,
      hashtags TEXT,
      platform TEXT NOT NULL,
      type TEXT NOT NULL,
      is_default BOOLEAN DEFAULT FALSE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
    );
  `
  
  try {
    // Enable foreign keys
    await run('PRAGMA foreign_keys = ON')
    
    // Split schema into individual statements and execute them
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    for (const statement of statements) {
      await run(statement)
    }
    
    console.log('Database tables created successfully')
  } catch (error) {
    console.error('Failed to create database tables:', error)
    throw error
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  })

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null as any
  })
}

app.whenReady().then(async () => {
  try {
    // Initialize database
    database = await initializeDatabase()
    await createTables(database)
    await createOrganizationsData(database)
    
    // Create window
    createWindow()
  } catch (error) {
    console.error('Failed to initialize application:', error)
    app.quit()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers for file operations
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  })
  return result
})

ipcMain.handle('select-files', async (_, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: options?.filters || [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
      { name: 'Videos', extensions: ['mp4', 'mov', 'avi'] },
      { name: 'Audio', extensions: ['mp3', 'wav', 'aac'] },
    ],
  })
  return result
})

ipcMain.handle('show-save-dialog', async (_, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options)
  return result
})

ipcMain.handle('open-external', async (_, url) => {
  await shell.openExternal(url)
})

// Database and storage operations
ipcMain.handle('get-app-path', () => {
  return app.getPath('userData')
})

ipcMain.handle('get-assets-path', () => {
  return join(app.getPath('userData'), 'assets')
})

// Database IPC handlers
ipcMain.handle('db-query', async (_, sql: string, params: any[] = []) => {
  if (!database) {
    throw new Error('Database not initialized')
  }
  
  console.log('db-query called with:', sql, params)
  
  return await new Promise((resolve, reject) => {
    database!.all(sql, params, (err, rows) => {
      if (err) {
        console.error('db-query error:', err)
        reject(err)
      } else {
        console.log('db-query result:', rows)
        resolve(rows)
      }
    })
  })
})

ipcMain.handle('db-execute', async (_, sql: string, params: any[] = []) => {
  console.log('db-execute called with:', sql, params)
  if (!database) {
    console.error('Database not initialized')
    throw new Error('Database not initialized')
  }
  
  return await new Promise((resolve, reject) => {
    database!.run(sql, params, function(err) {
      if (err) {
        console.error('db-execute error:', err)
        reject(err)
      } else {
        console.log('db-execute result:', { changes: this.changes, lastID: this.lastID })
        resolve({ changes: this.changes, lastID: this.lastID })
      }
    })
  })
})

ipcMain.handle('db-transaction', async (_, queries: Array<{ sql: string; params?: any[] }>) => {
  if (!database) {
    throw new Error('Database not initialized')
  }
  
  const results: any[] = []
  
  await new Promise((resolve, reject) => {
    database!.run('BEGIN TRANSACTION', (err) => {
      if (err) reject(err)
      else resolve(null)
    })
  })
  
  try {
    for (const query of queries) {
      const result = await new Promise((resolve, reject) => {
        database!.run(query.sql, query.params || [], function(err) {
          if (err) reject(err)
          else resolve({ changes: this.changes, lastID: this.lastID })
        })
      })
      results.push(result)
    }
    
    await new Promise((resolve, reject) => {
      database!.run('COMMIT', (err) => {
        if (err) reject(err)
        else resolve(null)
      })
    })
    return results
  } catch (error) {
    await new Promise((resolve, reject) => {
      database!.run('ROLLBACK', (err) => {
        if (err) reject(err)
        else resolve(null)
      })
    })
    throw error
  }
})
