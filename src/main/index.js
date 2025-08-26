import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { AppDatabase } from './database';
import { MediaManager } from './media-manager';
import { OllamaManager } from './ollama-manager';
class IMMMarketingHub {
    constructor() {
        this.mainWindow = null;
        this.database = new AppDatabase();
        this.mediaManager = new MediaManager();
        this.ollamaManager = new OllamaManager();
    }
    async initialize() {
        await this.database.initialize();
        await this.mediaManager.initialize();
        await this.ollamaManager.initialize();
        this.setupIPC();
        this.createWindow();
    }
    createWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 1200,
            minHeight: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            },
            titleBarStyle: 'default',
            show: false
        });
        // Load the app
        if (process.env.NODE_ENV === 'development') {
            this.mainWindow.loadURL('http://localhost:5173');
            this.mainWindow.webContents.openDevTools();
        }
        else {
            this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
        }
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
        });
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }
    setupIPC() {
        // Database operations
        ipcMain.handle('db:initialize', async () => {
            return await this.database.initialize();
        });
        ipcMain.handle('db:get-settings', async () => {
            return await this.database.getSettings();
        });
        ipcMain.handle('db:update-settings', async (event, settings) => {
            return await this.database.updateSettings(settings);
        });
        // Media operations
        ipcMain.handle('media:upload', async (event, filePath) => {
            return await this.mediaManager.uploadFile(filePath);
        });
        ipcMain.handle('media:get-files', async () => {
            return await this.mediaManager.getFiles();
        });
        ipcMain.handle('media:delete-file', async (event, fileId) => {
            return await this.mediaManager.deleteFile(fileId);
        });
        // Ollama operations
        ipcMain.handle('ollama:check-status', async () => {
            return await this.ollamaManager.checkStatus();
        });
        ipcMain.handle('ollama:get-models', async () => {
            return await this.ollamaManager.getModels();
        });
        ipcMain.handle('ollama:pull-model', async (event, modelName) => {
            return await this.ollamaManager.pullModel(modelName);
        });
        ipcMain.handle('ollama:generate', async (event, prompt, modelName) => {
            return await this.ollamaManager.generate(prompt, modelName);
        });
        // File dialog
        ipcMain.handle('dialog:open-file', async () => {
            const result = await dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
                    { name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv'] },
                    { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt'] },
                    { name: 'Audio', extensions: ['mp3', 'wav', 'm4a'] }
                ]
            });
            return result.filePaths?.[0] || null;
        });
    }
}
// App lifecycle
app.whenReady().then(async () => {
    const app = new IMMMarketingHub();
    await app.initialize();
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        const app = new IMMMarketingHub();
        app.initialize();
    }
});
