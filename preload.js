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
  
  // Update functions
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', callback),
})

webFrame.setZoomFactor(0.85)