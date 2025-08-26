import { contextBridge, ipcRenderer } from 'electron';
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Database operations
    db: {
        initialize: () => ipcRenderer.invoke('db:initialize'),
        getSettings: () => ipcRenderer.invoke('db:get-settings'),
        updateSettings: (settings) => ipcRenderer.invoke('db:update-settings', settings),
    },
    // Media operations
    media: {
        upload: (filePath) => ipcRenderer.invoke('media:upload', filePath),
        getFiles: () => ipcRenderer.invoke('media:get-files'),
        deleteFile: (fileId) => ipcRenderer.invoke('media:delete-file', fileId),
    },
    // Ollama operations
    ollama: {
        checkStatus: () => ipcRenderer.invoke('ollama:check-status'),
        getModels: () => ipcRenderer.invoke('ollama:get-models'),
        pullModel: (modelName) => ipcRenderer.invoke('ollama:pull-model', modelName),
        generate: (prompt, modelName) => ipcRenderer.invoke('ollama:generate', prompt, modelName),
    },
    // File dialog
    dialog: {
        openFile: () => ipcRenderer.invoke('dialog:open-file'),
    },
});
