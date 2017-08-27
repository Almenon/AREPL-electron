// taken from https://electron.atom.io/docs/api/menu/
// with a bit of minor refactoring by yours truly
const {app, Menu, ipcMain, dialog} = require('electron')

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
          label: 'Documentation',  
          click () { documentation() }
        },
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
];

function documentation(){
    dialog.showMessageBox({detail: `SHORTCUTS:
F1: restart python
F4: toggles real-time eval on and off
F5: runs code once (if real-time eval is off)
other shortcuts: see https://codemirror.net/demo/sublime.html

FEATURES:
* Real-time execution of code.  Don't type in anything you don't want to run repeatedly! Can be toggled off/on with F5
* click on left bar to the right of line numbers to stop code evaluation at that line (sorta like a breakpoint)
* hover over vars to see their value
* view to the right displays local variables only (so variables inside functions are not displayed)

QUESTIONS?:
* email me at almenon214@gmail.com
    `});
};

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