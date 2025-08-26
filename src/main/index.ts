import { app, BrowserWindow } from 'electron';
import { AppManager } from './app-manager';

class IMMMarketingHub {
  private appManager: AppManager;

  constructor() {
    this.appManager = new AppManager();
  }

  async initialize(): Promise<void> {
    await this.appManager.initialize();
  }

  async shutdown(): Promise<void> {
    await this.appManager.shutdown();
  }
}

// App lifecycle management
const marketingHub = new IMMMarketingHub();

app.whenReady().then(async () => {
  try {
    await marketingHub.initialize();
  } catch (error) {
    console.error('Failed to initialize IMM Marketing Hub:', error);
    app.quit();
  }
});

app.on('window-all-closed', async () => {
  try {
    await marketingHub.shutdown();
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    marketingHub.initialize();
  }
});

app.on('before-quit', async () => {
  try {
    await marketingHub.shutdown();
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
}); 