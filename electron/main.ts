import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import * as path from 'path'
import { isDev } from './utils'
import Database from 'sqlite3'
import { promisify } from 'util'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import * as fs from 'fs'
import * as os from 'os'
import * as crypto from 'crypto'
import { ElectronOllama } from 'electron-ollama'

let mainWindow: BrowserWindow
let globalDatabase: Database.Database | null = null
let ollama: ElectronOllama | null = null

// Initialize Ollama
async function initializeOllama() {
  try {
    console.log('Initializing Ollama...')
    ollama = new ElectronOllama({
      basePath: app.getPath('userData'),
    })
    
    // Check if Ollama is running
    if (!(await ollama.isRunning())) {
      console.log('Ollama not running, starting...')
      const metadata = await ollama.getMetadata('latest')
      console.log('Starting Ollama server with metadata:', metadata)
      
      // Add timeout wrapper for the serve operation
      const servePromise = ollama.serve(metadata.version)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Ollama server startup timeout')), 30000) // 30 seconds
      })
      
      await Promise.race([servePromise, timeoutPromise])
      console.log('Ollama server started successfully')
    } else {
      console.log('Ollama server is already running')
    }
    
    console.log('Ollama initialized successfully')
    return true
  } catch (error) {
    console.error('Failed to initialize Ollama:', error)
    console.log('AI Assistant will fall back to external Ollama if available')
    return false
  }
}

// Initialize global database for users and organizations
async function initializeGlobalDatabase() {
  const userDataPath = app.getPath('userData')
  const dbPath = join(userDataPath, 'global.db')
  
  console.log('Using global database path:', dbPath)
  
  return new Promise<Database.Database>((resolve, reject) => {
    const db = new Database.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to open global database:', err)
        reject(err)
      } else {
        console.log('Global database opened successfully')
        resolve(db)
      }
    })
  })
}

// Hash password utility
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// Create global database tables (users and organizations only)
async function createGlobalTables(db: Database.Database) {
  const run = promisify(db.run.bind(db))
  
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME
    );
    
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      settings TEXT NOT NULL DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS user_organizations (
      user_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'owner',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, organization_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
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
    
    console.log('Global database tables created successfully')
  } catch (error) {
    console.error('Failed to create global database tables:', error)
    throw error
  }
}

// Create organization-specific database tables
async function createOrganizationTables(db: Database.Database) {
  const run = promisify(db.run.bind(db))
  
  const schema = `
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      hashtags TEXT NOT NULL DEFAULT '[]',
      platform TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      scheduled_at DATETIME,
      published_at DATETIME,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS media_files (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS post_media (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      media_file_id TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE,
      UNIQUE(post_id, media_file_id)
    );
    
    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      scheduled_at DATETIME NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
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
    
    console.log('Organization database tables created successfully')
  } catch (error) {
    console.error('Failed to create organization database tables:', error)
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
    // Initialize global database
    globalDatabase = await initializeGlobalDatabase()
    await createGlobalTables(globalDatabase)
    
    // Initialize Ollama (optional - app works without it)
    const ollamaInitialized = await initializeOllama()
    if (ollamaInitialized) {
      console.log('AI Assistant ready')
    } else {
      console.log('AI Assistant not available - Ollama initialization failed')
    }
    
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

// Reveal file in Finder/Explorer
ipcMain.handle('reveal-in-folder', async (event, filePath: string) => {
  try {
    await shell.showItemInFolder(filePath)
    return { success: true }
  } catch (error) {
    console.error('Failed to reveal file in folder:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// Global database IPC handlers
ipcMain.handle('global-db-query', async (_, sql: string, params: any[] = []) => {
  if (!globalDatabase) {
    throw new Error('Global database not initialized')
  }
  
  return await new Promise((resolve, reject) => {
    globalDatabase!.all(sql, params, (err, rows) => {
      if (err) {
        console.error('global-db-query error:', err)
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
})

ipcMain.handle('global-db-execute', async (_, sql: string, params: any[] = []) => {
  if (!globalDatabase) {
    throw new Error('Global database not initialized')
  }
  
  return await new Promise((resolve, reject) => {
    globalDatabase!.run(sql, params, function(err) {
      if (err) {
        console.error('global-db-execute error:', err)
        reject(err)
      } else {
        resolve({ changes: this.changes, lastID: this.lastID })
      }
    })
  })
})

// Organization database IPC handlers
ipcMain.handle('org-db-query', async (_, organizationId: string, sql: string, params: any[] = []) => {
  const userDataPath = app.getPath('userData')
  const orgDbPath = join(userDataPath, 'organizations', organizationId, 'database.db')
  
  return new Promise((resolve, reject) => {
    const db = new Database.Database(orgDbPath, (err) => {
      if (err) {
        console.error('Failed to open organization database:', err)
        reject(err)
        return
      }
      
      db.all(sql, params, (err, rows) => {
        db.close()
        if (err) {
          console.error('org-db-query error:', err)
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  })
})

ipcMain.handle('org-db-execute', async (_, organizationId: string, sql: string, params: any[] = []) => {
  const userDataPath = app.getPath('userData')
  const orgDbPath = join(userDataPath, 'organizations', organizationId, 'database.db')
  
  return new Promise((resolve, reject) => {
    const db = new Database.Database(orgDbPath, (err) => {
      if (err) {
        console.error('Failed to open organization database:', err)
        reject(err)
        return
      }
      
      db.run(sql, params, function(err) {
        db.close()
        if (err) {
          console.error('org-db-execute error:', err)
          reject(err)
        } else {
          resolve({ changes: this.changes, lastID: this.lastID })
        }
      })
    })
  })
})

// Create organization database and folder structure
ipcMain.handle('create-organization-db', async (_, organizationId: string) => {
  const userDataPath = app.getPath('userData')
  const orgDir = join(userDataPath, 'organizations', organizationId)
  const orgDbPath = join(orgDir, 'database.db')
  
  // Create organization directory
  if (!existsSync(orgDir)) {
    mkdirSync(orgDir, { recursive: true })
  }
  
  // Create organization database
  return new Promise((resolve, reject) => {
    const db = new Database.Database(orgDbPath, (err) => {
      if (err) {
        console.error('Failed to create organization database:', err)
        reject(err)
        return
      }
      
      createOrganizationTables(db).then(() => {
        db.close()
        resolve({ success: true })
      }).catch(reject)
    })
  })
})

// Authentication IPC handlers
ipcMain.handle('auth-create-user', async (_, name: string, password: string) => {
  if (!globalDatabase) {
    throw new Error('Global database not initialized')
  }
  
  const userId = generateId()
  const passwordHash = hashPassword(password)
  const now = new Date().toISOString()
  
  return new Promise((resolve, reject) => {
    globalDatabase!.run(
      'INSERT INTO users (id, name, password_hash, created_at) VALUES (?, ?, ?, ?)',
      [userId, name, passwordHash, now],
      function(err) {
        if (err) {
          console.error('Failed to create user:', err)
          reject(err)
        } else {
          resolve({ userId, name, createdAt: now })
        }
      }
    )
  })
})

ipcMain.handle('auth-login', async (_, name: string, password: string) => {
  if (!globalDatabase) {
    throw new Error('Global database not initialized')
  }
  
  const passwordHash = hashPassword(password)
  
  return new Promise((resolve, reject) => {
    globalDatabase!.get(
      'SELECT * FROM users WHERE name = ? AND password_hash = ?',
      [name, passwordHash],
      (err, row: any) => {
        if (err) {
          console.error('Login error:', err)
          reject(err)
        } else if (!row) {
          reject(new Error('Invalid credentials'))
        } else {
          // Update last login
          globalDatabase!.run(
            'UPDATE users SET last_login_at = ? WHERE id = ?',
            [new Date().toISOString(), row.id],
            () => {
              resolve(row)
            }
          )
        }
      }
    )
  })
})

ipcMain.handle('auth-create-organization', async (_, userId: string, name: string, description?: string) => {
  if (!globalDatabase) {
    throw new Error('Global database not initialized')
  }
  
  const organizationId = generateId()
  const now = new Date().toISOString()
  
  return new Promise((resolve, reject) => {
    globalDatabase!.run(
      'INSERT INTO organizations (id, user_id, name, description, settings, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [organizationId, userId, name, description || null, '{}', now, now],
      function(err) {
        if (err) {
          console.error('Failed to create organization:', err)
          reject(err)
        } else {
          // Create user_organizations relationship
          globalDatabase!.run(
            'INSERT INTO user_organizations (user_id, organization_id, role) VALUES (?, ?, ?)',
            [userId, organizationId, 'owner'],
            (err) => {
              if (err) {
                console.error('Failed to create user-organization relationship:', err)
                reject(err)
              } else {
                resolve({ organizationId, name, description, createdAt: now })
              }
            }
          )
        }
      }
    )
  })
})

ipcMain.handle('auth-get-user-organizations', async (_, userId: string) => {
  if (!globalDatabase) {
    throw new Error('Global database not initialized')
  }
  
  return new Promise((resolve, reject) => {
    globalDatabase!.all(
      `SELECT o.* FROM organizations o 
       INNER JOIN user_organizations uo ON o.id = uo.organization_id 
       WHERE uo.user_id = ? 
       ORDER BY o.created_at DESC`,
      [userId],
      (err, rows) => {
        if (err) {
          console.error('Failed to get user organizations:', err)
          reject(err)
        } else {
          resolve(rows)
        }
      }
    )
  })
})

// Delete user and all their data
ipcMain.handle('auth-delete-user', async (_, userId: string) => {
  if (!globalDatabase) {
    throw new Error('Global database not initialized')
  }
  
  return new Promise((resolve, reject) => {
    globalDatabase!.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        reject(err)
        return
      }
      
      // Get user's organizations first
      globalDatabase!.all(
        'SELECT id FROM organizations WHERE user_id = ?',
        [userId],
        (err, orgs) => {
          if (err) {
            globalDatabase!.run('ROLLBACK')
            reject(err)
            return
          }
          
          // Delete organization databases and folders
          const orgIds = orgs.map((org: any) => org.id)
          
          // Delete user_organizations relationships
          globalDatabase!.run(
            'DELETE FROM user_organizations WHERE user_id = ?',
            [userId],
            (err) => {
              if (err) {
                globalDatabase!.run('ROLLBACK')
                reject(err)
                return
              }
              
              // Delete organizations
              globalDatabase!.run(
                'DELETE FROM organizations WHERE user_id = ?',
                [userId],
                (err) => {
                  if (err) {
                    globalDatabase!.run('ROLLBACK')
                    reject(err)
                    return
                  }
                  
                  // Delete user
                  globalDatabase!.run(
                    'DELETE FROM users WHERE id = ?',
                    [userId],
                    (err) => {
                      if (err) {
                        globalDatabase!.run('ROLLBACK')
                        reject(err)
                        return
                      }
                      
                      globalDatabase!.run('COMMIT', (err) => {
                        if (err) {
                          reject(err)
                        } else {
                          // Delete organization folders
                          const userDataPath = app.getPath('userData')
                          orgIds.forEach((orgId: string) => {
                            const orgDir = join(userDataPath, 'organizations', orgId)
                            if (existsSync(orgDir)) {
                              try {
                                require('fs').rmSync(orgDir, { recursive: true, force: true })
                                console.log(`Deleted organization folder: ${orgDir}`)
                              } catch (error) {
                                console.error(`Failed to delete organization folder ${orgDir}:`, error)
                              }
                            }
                          })
                          resolve({ success: true })
                        }
                      })
                    }
                  )
                }
              )
            }
          )
        }
      )
    })
  })
})

// Delete organization and all its data
ipcMain.handle('auth-delete-organization', async (_, organizationId: string) => {
  if (!globalDatabase) {
    throw new Error('Global database not initialized')
  }
  
  return new Promise((resolve, reject) => {
    globalDatabase!.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        reject(err)
        return
      }
      
      // Delete user_organizations relationships
      globalDatabase!.run(
        'DELETE FROM user_organizations WHERE organization_id = ?',
        [organizationId],
        (err) => {
          if (err) {
            globalDatabase!.run('ROLLBACK')
            reject(err)
            return
          }
          
          // Delete organization
          globalDatabase!.run(
            'DELETE FROM organizations WHERE id = ?',
            [organizationId],
            (err) => {
              if (err) {
                globalDatabase!.run('ROLLBACK')
                reject(err)
                return
              }
              
              globalDatabase!.run('COMMIT', (err) => {
                if (err) {
                  reject(err)
                } else {
                  // Delete organization folder and database
                  const userDataPath = app.getPath('userData')
                  const orgDir = join(userDataPath, 'organizations', organizationId)
                  if (existsSync(orgDir)) {
                    try {
                      require('fs').rmSync(orgDir, { recursive: true, force: true })
                      console.log(`Deleted organization folder: ${orgDir}`)
                    } catch (error) {
                      console.error(`Failed to delete organization folder ${orgDir}:`, error)
                    }
                  }
                  resolve({ success: true })
                }
              })
            }
          )
        }
      )
    })
  })
})

// File system operations
ipcMain.handle('fs-read-file', async (_, path: string) => {
  try {
    return await fs.promises.readFile(path)
  } catch (error) {
    console.error('Failed to read file:', error)
    throw error
  }
})

ipcMain.handle('fs-write-file', async (_, path: string, data: Uint8Array) => {
  try {
    const buffer = Buffer.from(data)
    await fs.promises.writeFile(path, buffer)
  } catch (error) {
    console.error('Failed to write file:', error)
    throw error
  }
})

ipcMain.handle('fs-copy-file', async (_, src: string, dest: string) => {
  try {
    await fs.promises.copyFile(src, dest)
  } catch (error) {
    console.error('Failed to copy file:', error)
    throw error
  }
})

ipcMain.handle('fs-delete-file', async (_, path: string) => {
  try {
    await fs.promises.unlink(path)
  } catch (error) {
    console.error('Failed to delete file:', error)
    throw error
  }
})

ipcMain.handle('fs-create-directory', async (_, path: string) => {
  try {
    await fs.promises.mkdir(path, { recursive: true })
  } catch (error) {
    console.error('Failed to create directory:', error)
    throw error
  }
})

ipcMain.handle('fs-list-directory', async (_, path: string) => {
  try {
    return await fs.promises.readdir(path)
  } catch (error) {
    console.error('Failed to list directory:', error)
    throw error
  }
})

  ipcMain.handle('fs-exists', async (_, path: string) => {
    try {
      await fs.promises.access(path)
      return true
    } catch {
      return false
    }
  })

  // Handle serving media files
  ipcMain.handle('serve-media-file', async (_, filePath: string) => {
    try {
      // Read the file and convert to base64 data URL
      const fileBuffer = await fs.promises.readFile(filePath)
      const mimeType = getMimeTypeFromPath(filePath)
      const base64Data = fileBuffer.toString('base64')
      return `data:${mimeType};base64,${base64Data}`
    } catch (error) {
      console.error('Failed to serve media file:', error)
      throw error
    }
  })

  // Helper function to get MIME type from file extension
  function getMimeTypeFromPath(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

// Ollama IPC handlers
ipcMain.handle('ollama-check-status', async () => {
  if (!ollama) {
    return { available: false, error: 'Ollama not initialized' }
  }
  
  try {
    const isRunning = await ollama.isRunning()
    return { available: isRunning }
  } catch (error) {
    return { available: false, error: error instanceof Error ? error.message : String(error) }
  }
})

ipcMain.handle('ollama-get-models', async () => {
  if (!ollama) {
    return { models: [], error: 'Ollama not initialized' }
  }
  
  try {
    // Use fetch to get models from Ollama API
    const response = await fetch('http://localhost:11434/api/tags')
    const data = await response.json()
    return { models: data.models || [] }
  } catch (error) {
    return { models: [], error: error instanceof Error ? error.message : String(error) }
  }
})

ipcMain.handle('ollama-pull-model', async (_, modelName: string) => {
  if (!ollama) {
    return { success: false, error: 'Ollama not initialized' }
  }
  
  try {
    // Use fetch to pull model via Ollama API
    const response = await fetch('http://localhost:11434/api/pull', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName })
    })
    return { success: response.ok }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

ipcMain.handle('ollama-generate', async (_, modelName: string, prompt: string) => {
  if (!ollama) {
    return { response: '', error: 'Ollama not initialized' }
  }
  
  try {
    // Use fetch to generate via Ollama API
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
        stream: false
      })
    })
    const data = await response.json()
    return { response: data.response || '' }
  } catch (error) {
    return { response: '', error: error instanceof Error ? error.message : String(error) }
  }
})
