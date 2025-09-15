import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { isDev } from './utils'
import Database from 'sqlite3'
import { promisify } from 'util'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import * as os from 'os'
import * as crypto from 'crypto'

let mainWindow: BrowserWindow
let globalDatabase: Database.Database | null = null

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
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
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
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      scheduled_at DATETIME NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS post_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      media_template TEXT,
      hashtags TEXT,
      platform TEXT NOT NULL,
      type TEXT NOT NULL,
      is_default BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
