// taken from https://electron.atom.io/docs/api/menu/
// with a bit of minor refactoring by yours truly
const {app, Menu, ipcMain} = require('electron')

const template = [
    {
      label: 'File',
      submenu: [
        {label: 'open', click: ()=>{}}, //click initialized later on
        {label: 'save', click: ()=>{}},
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'pasteandmatchstyle'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Github Repository',
          click () { require('electron').shell.openExternal('https://github.com/Almenon/AREPL') }
        },
        {
          label: 'Search or report a issue',
          click () { require('electron').shell.openExternal('https://github.com/Almenon/AREPL/issues') }
        },
        {
          label: 'Releases',
          click () { require('electron').shell.openExternal('https://github.com/Almenon/AREPL/releases') }
        }
      ]
    }
  ]

if (process.platform === 'darwin'){

  // File menu
  template[0].label = app.getName();
  template[0].submenu.push([
          {role: 'about'},
          {type: 'separator'},
          {role: 'services', submenu: []},
          {type: 'separator'},
          {role: 'hide'},
          {role: 'hideothers'},
          {role: 'unhide'},
          {type: 'separator'},
          {role: 'quit'}
        ]);
  
  // Edit menu
  template[1].submenu.push(
    {type: 'separator'},
    {
      label: 'Speech',
      submenu: [
        {role: 'startspeaking'},
        {role: 'stopspeaking'}
      ]
    }
  )

  // Window menu
  template[3].submenu = [
    {role: 'close'},
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ]
}

module.exports.makeMenu = function(mainWindow){
  // File menu
  template[0].submenu[0].click = (menuItem, browserWindow, event) => {
    mainWindow.webContents.send('openFileMenuClick', null);
  }
  template[0].submenu[1].click = (menuItem, browserWindow, event) => {
    mainWindow.webContents.send('saveFileMenuClick', null);
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}