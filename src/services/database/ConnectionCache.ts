import { Database } from 'sqlite3'

interface CachedConnection {
  db: Database.Database
  lastUsed: number
  organizationId: string
}

class DatabaseConnectionCache {
  private connections: Map<string, CachedConnection> = new Map()
  private readonly MAX_CONNECTIONS = 5
  private readonly CONNECTION_TIMEOUT = 5 * 60 * 1000 // 5 minutes

  async getConnection(organizationId: string): Promise<Database.Database> {
    const cached = this.connections.get(organizationId)
    
    if (cached && this.isConnectionValid(cached)) {
      cached.lastUsed = Date.now()
      return cached.db
    }

    // Create new connection
    const db = await this.createConnection(organizationId)
    this.cacheConnection(organizationId, db)
    return db
  }

  private async createConnection(organizationId: string): Promise<Database.Database> {
    return new Promise((resolve, reject) => {
      const { app } = require('electron')
      const { join } = require('path')
      
      const userDataPath = app.getPath('userData')
      const orgDbPath = join(userDataPath, 'organizations', organizationId, 'database.db')
      
      const db = new Database.Database(orgDbPath, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(db)
        }
      })
    })
  }

  private cacheConnection(organizationId: string, db: Database.Database): void {
    // Clean up old connections if we're at the limit
    if (this.connections.size >= this.MAX_CONNECTIONS) {
      this.cleanupOldConnections()
    }

    this.connections.set(organizationId, {
      db,
      lastUsed: Date.now(),
      organizationId
    })
  }

  private isConnectionValid(connection: CachedConnection): boolean {
    const now = Date.now()
    return (now - connection.lastUsed) < this.CONNECTION_TIMEOUT
  }

  private cleanupOldConnections(): void {
    const now = Date.now()
    const entries = Array.from(this.connections.entries())
    
    // Sort by last used time (oldest first)
    entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed)
    
    // Remove the oldest connection
    const [oldestKey, oldestConnection] = entries[0]
    oldestConnection.db.close()
    this.connections.delete(oldestKey)
  }

  closeConnection(organizationId: string): void {
    const connection = this.connections.get(organizationId)
    if (connection) {
      connection.db.close()
      this.connections.delete(organizationId)
    }
  }

  closeAllConnections(): void {
    for (const [key, connection] of this.connections) {
      connection.db.close()
    }
    this.connections.clear()
  }

  getConnectionCount(): number {
    return this.connections.size
  }

  getConnectionInfo(): Array<{ organizationId: string; lastUsed: number }> {
    return Array.from(this.connections.values()).map(conn => ({
      organizationId: conn.organizationId,
      lastUsed: conn.lastUsed
    }))
  }
}

// Singleton instance
export const connectionCache = new DatabaseConnectionCache()
