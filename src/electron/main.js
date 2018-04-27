const {app, Menu, BrowserWindow} = require('electron')
const { autoUpdater } = require("electron-updater");

const path = require('path')
const url = require('url')
const makeMenu = require('./makeMenu')

const {tmpdir} = require('os')
const {writeFileSync} = require('fs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let menuTemplate

//electron-context-menu necessary for menu upon right-click
require('electron-context-menu')({
    prepend: (params, browserWindow) => [{
        label: 'Rainbow',
        // Only show it when right-clicking images 
        visible: params.mediaType === 'image'
    }]
})

function isDevMode(){
  const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
  const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
  return isEnvSet ? getFromEnv : (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath));
}

/**
 * if update-availible event fired handler will append menu item to download latest release
 * i reccomend doing calling this after menu creation and before checking for update
 */
function registerAutoUpdateHandlers(){
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...')
  })
  autoUpdater.on('update-available', (info) => {
    const updateAvailibleMenu = {
      label: "New update availible",
      submenu: [{
        label: "release info",
        click: () => { require('electron').shell.openExternal('https://github.com/Almenon/AREPL/releases') }
      }]
    }
    menuTemplate.push(updateAvailibleMenu)
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  })
  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available.')
  })
  autoUpdater.on('error', (err) => {
    writeFileSync(path.join(tmpdir(), "areplLog\\error.txt"), err)
    console.error(err)
  })
}

function createWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800, 
    height: 800, 
    title: 'AREPL ' + app.getVersion()
  })

  let indexPath = "/view/index.html"
  let fullIndexPath = process.cwd()
  if(fullIndexPath.endsWith("arepl-win32-x64")){ //production build
    fullIndexPath = fullIndexPath + '/resources/app' + indexPath
  }
  else if(__dirname.includes("arepl-darwin")){ //mac prod build
    fullIndexPath = __dirname // "/Users/anon/Documents/AREPL/arepl-darwin-x64/arepl.app/Contents/Resources/app/src/electron"
    fullIndexPath = fullIndexPath.replace("src/electron",indexPath)
  }
  else{
    fullIndexPath = fullIndexPath + indexPath
  }

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: fullIndexPath,
    protocol: 'file:',
    slashes: true
  }))

  menuTemplate = makeMenu.makeMenu(mainWindow)

  registerAutoUpdateHandlers()
  autoUpdater.autoDownload = false
  autoUpdater.checkForUpdates()
  
  if(isDevMode()){
    mainWindow.webContents.openDevTools()
    require('devtron').install()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})