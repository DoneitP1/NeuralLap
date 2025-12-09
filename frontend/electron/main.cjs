const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 400,
        height: 800,
        x: width - 420,
        y: 50,
        frame: false,          // Frameless for custom overlay
        transparent: true,     // Transparent background
        alwaysOnTop: true,     // Overlay mode
        hasShadow: false,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For easier prototyping; tighten for prod
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // Load the app
    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
    mainWindow.loadURL(startUrl);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools({ mode: 'detach' });

    // Make click-through (optional, toggleable later)
    // mainWindow.setIgnoreMouseEvents(true, { forward: true });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
