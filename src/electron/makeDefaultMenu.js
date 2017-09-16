// taken from https://electron.atom.io/docs/api/menu/ and https://github.com/carter-thaxton/electron-default-menu
// with a bit of minor refactoring by yours truly

const template = [
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
            label: 'Learn More',
            click: function() { require("electron").shell.openExternal('http://electron.atom.io') }
        }
      ]
    }
];

function adaptTemplateForMac(template){
    template.unshift({
        label: require("electron").app.getName(),
        submenu: [
        {role: 'about'},
        {type: 'separator'},
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
        ]
    })
    
    // Edit menu
    template[1].submenu.push(
        {type: 'separator'},
        {label: 'Speech', submenu: [
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

    return template;
}

/**
 * Creates a default menu for electron apps
 * default is composed of Edit, View, window, and help
 * @returns {Object[]}  a menu object to be passed to electron.Menu
 */
module.exports = function(){
    if (process.platform === 'darwin'){
        return adaptTemplateForMac(template);
    }
    return template;
}


