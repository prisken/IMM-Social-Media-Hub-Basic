import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFiles: (options?: any) => ipcRenderer.invoke('select-files', options),
  showSaveDialog: (options?: any) => ipcRenderer.invoke('show-save-dialog', options),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  
  // App paths
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  getAssetsPath: () => ipcRenderer.invoke('get-assets-path'),
  
  // Database operations
  db: {
    query: (sql: string, params?: any[]) => ipcRenderer.invoke('db-query', sql, params),
    execute: (sql: string, params?: any[]) => ipcRenderer.invoke('db-execute', sql, params),
    transaction: (queries: Array<{ sql: string; params?: any[] }>) => 
      ipcRenderer.invoke('db-transaction', queries),
  },
  
  // File system operations
  fs: {
    readFile: (path: string) => ipcRenderer.invoke('fs-read-file', path),
    writeFile: (path: string, data: Buffer) => ipcRenderer.invoke('fs-write-file', path, data),
    copyFile: (src: string, dest: string) => ipcRenderer.invoke('fs-copy-file', src, dest),
    deleteFile: (path: string) => ipcRenderer.invoke('fs-delete-file', path),
    createDirectory: (path: string) => ipcRenderer.invoke('fs-create-directory', path),
    listDirectory: (path: string) => ipcRenderer.invoke('fs-list-directory', path),
    exists: (path: string) => ipcRenderer.invoke('fs-exists', path),
  },
})

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      selectFolder: () => Promise<any>
      selectFiles: (options?: any) => Promise<any>
      showSaveDialog: (options?: any) => Promise<any>
      openExternal: (url: string) => Promise<void>
      getAppPath: () => Promise<string>
      getAssetsPath: () => Promise<string>
      db: {
        query: (sql: string, params?: any[]) => Promise<any[]>
        execute: (sql: string, params?: any[]) => Promise<any>
        transaction: (queries: Array<{ sql: string; params?: any[] }>) => Promise<any>
      }
      fs: {
        readFile: (path: string) => Promise<Buffer>
        writeFile: (path: string, data: Buffer) => Promise<void>
        copyFile: (src: string, dest: string) => Promise<void>
        deleteFile: (path: string) => Promise<void>
        createDirectory: (path: string) => Promise<void>
        listDirectory: (path: string) => Promise<string[]>
        exists: (path: string) => Promise<boolean>
      }
    }
  }
}
