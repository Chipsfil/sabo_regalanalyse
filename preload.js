const { contextBridge, ipcRenderer } = require('electron')
const { webFrame } = require('electron')

contextBridge.exposeInMainWorld('excelAPI', {
  importExcel: () => ipcRenderer.invoke('import-excel'),
  getExcelData: (sheetName) => ipcRenderer.invoke('get-excel-data', sheetName),
  reloadExcelFile: (sheetName) => ipcRenderer.invoke('reload-excel-file', sheetName),
  onFileLoaded: (callback) => ipcRenderer.on('file-loaded', callback),
  onUpdateLastPath: (callback) => ipcRenderer.on('update-last-path', callback),
})

contextBridge.exposeInMainWorld('electronAPI', {
  // Config functions
  getConfig: () => ipcRenderer.invoke('get-config'),
  setDirectory: (newDir) => ipcRenderer.invoke('set-directory', newDir),
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'), // Fixed channel name
  onDirectoryChanged: (callback) => ipcRenderer.on('directory-changed', callback),
  restartApp: () => ipcRenderer.send('restart-app'),
})

contextBridge.exposeInMainWorld('updaterAPI', {
  // Controllo aggiornamenti
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Eventi updater
  onUpdateChecking: (callback) => ipcRenderer.on('update-checking', callback),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, info) => callback(info)),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', (event, info) => callback(info)),
  onUpdateError: (callback) => ipcRenderer.on('update-error', (event, error) => callback(error)),
  onDownloadProgress: (callback) => ipcRenderer.on('update-download-progress', (event, progress) => callback(progress)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (event, info) => callback(info)),
})

webFrame.setZoomFactor(0.85)