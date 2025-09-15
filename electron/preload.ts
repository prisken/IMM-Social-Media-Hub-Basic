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
  
  // Global database operations
  globalDb: {
    query: (sql: string, params?: any[]) => ipcRenderer.invoke('global-db-query', sql, params),
    execute: (sql: string, params?: any[]) => ipcRenderer.invoke('global-db-execute', sql, params),
  },
  
  // Organization database operations
  orgDb: {
    query: (organizationId: string, sql: string, params?: any[]) => 
      ipcRenderer.invoke('org-db-query', organizationId, sql, params),
    execute: (organizationId: string, sql: string, params?: any[]) => 
      ipcRenderer.invoke('org-db-execute', organizationId, sql, params),
  },
  
  // Organization management
  createOrganizationDb: (organizationId: string) => 
    ipcRenderer.invoke('create-organization-db', organizationId),
  
  // Authentication
  auth: {
    createUser: (name: string, password: string) => 
      ipcRenderer.invoke('auth-create-user', name, password),
    login: (name: string, password: string) => 
      ipcRenderer.invoke('auth-login', name, password),
    createOrganization: (userId: string, name: string, description?: string) => 
      ipcRenderer.invoke('auth-create-organization', userId, name, description),
    getUserOrganizations: (userId: string) => 
      ipcRenderer.invoke('auth-get-user-organizations', userId),
    deleteUser: (userId: string) => 
      ipcRenderer.invoke('auth-delete-user', userId),
    deleteOrganization: (organizationId: string) => 
      ipcRenderer.invoke('auth-delete-organization', organizationId),
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
      globalDb: {
        query: (sql: string, params?: any[]) => Promise<any[]>
        execute: (sql: string, params?: any[]) => Promise<any>
      }
      orgDb: {
        query: (organizationId: string, sql: string, params?: any[]) => Promise<any[]>
        execute: (organizationId: string, sql: string, params?: any[]) => Promise<any>
      }
      createOrganizationDb: (organizationId: string) => Promise<any>
      auth: {
        createUser: (name: string, password: string) => Promise<any>
        login: (name: string, password: string) => Promise<any>
        createOrganization: (userId: string, name: string, description?: string) => Promise<any>
        getUserOrganizations: (userId: string) => Promise<any[]>
        deleteUser: (userId: string) => Promise<any>
        deleteOrganization: (organizationId: string) => Promise<any>
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
