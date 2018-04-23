const {Menu, dialog} = require('electron')
const defaultMenu = require('./makeDefaultMenu');

const helpSubmenu = [
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
    }
  ]

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
* custom settings: edit src/settings.js and reload the app

⚠ PRE-ALPHA FEATURES: ⚠
* These may not work correctly.  Please report any bugs you find *
Control-Enter: prints result of current line, or attributes of variable if the current line ends with a '.'.  
#$save: saves state so everything before the line only gets run once, instead of every time you type
Auto-restart: if you import in a gui / plotting / graphing library the python evaluator restarts whenever you make a change

QUESTIONS?:
* email me at almenon214@gmail.com
    `})
}

const fileMenu = {
  label: 'File',
  submenu: [
    {label: 'open', click(){} }, //click has to be intialized later on when mainWindow is passed in
    {label: 'save', click(){} },
  ]
}

/**
 * sets Application menu to custom AREPL menu
 * @returns {object[]} menu template
 */
module.exports.makeMenu = function(mainWindow){
  var template = defaultMenu()
  var helpMenuIndex = 3
  var fileMenuIndex = 0
  if(process.platform == "darwin"){
    helpMenuIndex++
    fileMenuIndex++
  }

  // Help menu modfications
  template[helpMenuIndex].submenu = helpSubmenu

  // File menu modificatoins
  template.splice(fileMenuIndex,0,fileMenu)
  template[fileMenuIndex].submenu[0].click = () => {
    mainWindow.webContents.send('openFileMenuClick', null)
  }
  template[fileMenuIndex].submenu[1].click = () => {
    mainWindow.webContents.send('saveFileMenuClick', null)
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  return template
}