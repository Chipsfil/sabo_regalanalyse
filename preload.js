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

  // OTA Update functions
  downloadUpdate: () => ipcRenderer.send('download-update'),
  installUpdate: () => ipcRenderer.send('install-update'),
  onCheckingForUpdate: (callback) => ipcRenderer.on('checking-for-update', callback),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_event, percent) => callback(percent)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  onUpdateError: (callback) => ipcRenderer.on('update-error', (_event, message) => callback(message)),
})

webFrame.setZoomFactor(0.85)