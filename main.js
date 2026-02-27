const { app, protocol, BrowserWindow, ipcMain, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const XLSX = require('xlsx')
const fs = require('fs')

// Add this near the top with your other requires
let mainWindow = null; // Track the main window instance

// Memory storage
let currentWorkbook = null
let currentFilePath = null

// Config management
const configPath = path.join(app.getPath('userData'), 'config.json')

// ===== CONSTANTS =====
const CONFIG = {
  PROTOCOL_NAME: 'app',
  IMAGE_DIR_NAME: 'Bildern',
  NO_IMAGE_PATH: 'no-image.png',
  DEFAULT_IMAGE_DIR: '',
  WINDOW_WIDTH: 1000,
  WINDOW_HEIGHT: 600
}

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
}

// ===== AUTO UPDATER CONFIGURATION =====
// Configurazione per aggiornamenti automatici
autoUpdater.autoDownload = false // Non scaricare automaticamente
autoUpdater.autoInstallOnAppQuit = true // Installa quando l'app viene chiusa

// Log degli eventi di aggiornamento
autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = 'info'

// Eventi AutoUpdater
autoUpdater.on('checking-for-update', () => {
  console.log('Controllo aggiornamenti...')
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-checking')
  }
})

autoUpdater.on('update-available', (info) => {
  console.log('Aggiornamento disponibile:', info.version)
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes
    })
  }
})

autoUpdater.on('update-not-available', (info) => {
  console.log('Nessun aggiornamento disponibile')
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-not-available', {
      version: info.version
    })
  }
})

autoUpdater.on('error', (err) => {
  console.error('Errore aggiornamento:', err)
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-error', {
      error: err.message || 'Errore sconosciuto'
    })
  }
})

autoUpdater.on('download-progress', (progressObj) => {
  const logMessage = `Velocità download: ${progressObj.bytesPerSecond} - Scaricato ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
  console.log(logMessage)
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-download-progress', {
      percent: Math.round(progressObj.percent),
      transferred: progressObj.transferred,
      total: progressObj.total,
      bytesPerSecond: progressObj.bytesPerSecond
    })
  }
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('Aggiornamento scaricato:', info.version)
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-downloaded', {
      version: info.version
    })
  }
})

function getConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath))
  } catch (e) {
    return { initialized: false, Dir: app.getPath('desktop') }
  }
}

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

// Add this with your other IPC handlers in main.js
ipcMain.handle('open-directory-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select Directory for Bilder'
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return { success: true, filePaths: result.filePaths }
  }
  return { success: false }
})

function createWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    icon: path.join(__dirname, 'build/icon.png'),
    maximizable: true,
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    }
  });

  mainWindow.maximize();
  mainWindow.show();
  mainWindow.loadFile('index.html');

  // Clean up when window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  loadLastFile(mainWindow);
}

async function loadLastFile(win) {
  const lastPath = await win.webContents.executeJavaScript(
    'localStorage.getItem("lastExcelPath");'
  )

  if (lastPath) {
    try {
      if (fs.existsSync(lastPath)) {
        currentWorkbook = XLSX.readFile(lastPath)
        currentFilePath = lastPath
        win.webContents.send('file-loaded', { success: true, filePath: currentFilePath })
      } else {
        win.webContents.executeJavaScript('localStorage.removeItem("lastExcelPath");')
      }
    } catch (error) {
      console.error('Error loading last file:', error)
      win.webContents.executeJavaScript('localStorage.removeItem("lastExcelPath");')
    }
  }
}

// Excel File Handlers
ipcMain.handle('import-excel', async (event) => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (filePaths.length > 0) {
    currentWorkbook = XLSX.readFile(filePaths[0])
    currentFilePath = filePaths[0]
    event.sender.send('update-last-path', filePaths[0])
    return { success: true, filePath: currentFilePath }
  }
  return { success: false }
})

ipcMain.handle('get-excel-data', (_, sheetName) => {
  if (!currentWorkbook) return null
  
  if (sheetName) {
    if (!currentWorkbook.SheetNames.includes(sheetName)) {
      throw new Error(`Sheet '${sheetName}' not found`)
    }
    return XLSX.utils.sheet_to_json(currentWorkbook.Sheets[sheetName], { header: 1, defval: '' })
  }
  
  return currentWorkbook.SheetNames.slice(1, 11).map(name => ({
    name,
    data: XLSX.utils.sheet_to_json(currentWorkbook.Sheets[name], { header: 1, defval: '' })
  }))
})

ipcMain.handle('reload-excel-file', (_, sheetName) => {
  if (!currentFilePath) return null
  
  try {
    currentWorkbook = XLSX.readFile(currentFilePath)
    
    if (sheetName) {
      if (!currentWorkbook.SheetNames.includes(sheetName)) {
        throw new Error(`Sheet '${sheetName}' not found`)
      }
      return XLSX.utils.sheet_to_json(currentWorkbook.Sheets[sheetName], { header: 1, defval: '' })
    }
    
    return currentWorkbook.SheetNames.slice(1, 11).map(name => ({
      name,
      data: XLSX.utils.sheet_to_json(currentWorkbook.Sheets[name], { header: 1, defval: '' })
    }))
  } catch (error) {
    console.error('Error reloading Excel file:', error)
    return null
  }
})

// Config Handlers
ipcMain.handle('get-config', () => getConfig())

ipcMain.handle('set-directory', async (event, newDir) => {
  try {
    const config = getConfig();
    config.Dir = newDir;
    config.initialized = true;
    saveConfig(config);
    
    // Update protocol handler with new directory
    setupProtocolHandler();
    
    // Safely notify renderer if window exists
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('directory-changed', newDir);
    }
    
    return { success: true, newDir };
  } catch (error) {
    console.error('Error setting directory:', error);
    return { success: false, error: error.message };
  }
});

// Keep track of whether we've registered the protocol
let isProtocolRegistered = false

function setupProtocolHandler() {
  const config = getConfig()
  const bildernDir = config.Dir
  // const bildernDir = path.join(Dir, 'Bildern')

  // Unregister first if already registered
  if (isProtocolRegistered) {
    protocol.unhandle('app')
  }

  protocol.handle('app', (request) => {
    const url = new URL(request.url)
    const decodedPathSegments = url.pathname
      .split('/')
      .filter(Boolean)
      .map(segment => decodeURIComponent(segment))
    
    const filePath = path.join(bildernDir, ...decodedPathSegments)
    
    try {
      return new Response(fs.readFileSync(filePath), {
        headers: {
          'Content-Type': getMimeType(filePath)
        }
      })
    } catch (error) {
      console.error('Failed to load file:', filePath, error)
      return new Response('Not found', { status: 404 })
    }
  })

  isProtocolRegistered = true
  console.log('Protocol handler updated for directory:', bildernDir)
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  }
  return MIME_TYPES[ext] || 'application/octet-stream'
}

// ===== AUTO UPDATER IPC HANDLERS =====
// Controllo manuale aggiornamenti
ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates()
    return { success: true, updateInfo: result.updateInfo }
  } catch (error) {
    console.error('Errore controllo aggiornamenti:', error)
    return { success: false, error: error.message }
  }
})

// Scarica aggiornamento
ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate()
    return { success: true }
  } catch (error) {
    console.error('Errore download aggiornamento:', error)
    return { success: false, error: error.message }
  }
})

// Installa aggiornamento e riavvia
ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall(false, true)
  return { success: true }
})

// Ottieni versione corrente
ipcMain.handle('get-app-version', () => {
  return { version: app.getVersion() }
})

// App Lifecycle
app.whenReady().then(() => {
  // Initialize config
  const config = getConfig()
  if (!config.initialized) {
    config.initialized = true
    saveConfig(config)
  }

  // Setup protocol handler
  setupProtocolHandler()

  createWindow()

  // Controlla aggiornamenti automaticamente all'avvio (dopo 3 secondi)
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      autoUpdater.checkForUpdates()
    }
  }, 3000)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Add this IPC listener
ipcMain.on('restart-app', () => {
  console.log('Restarting application...');
  app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
  app.exit(0);
});