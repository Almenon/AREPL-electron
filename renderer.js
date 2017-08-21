// this file has interaction between browser and electron API
const {remote} = require('electron')
const {Menu, MenuItem, dialog, ipcRenderer} = remote
const fs = require('fs');
var editor = require("./src/app");

var modal = document.getElementById('myModal');
var modalText = document.getElementById('modalText');
var span = document.getElementsByClassName("close")[0];
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

require('electron').ipcRenderer.on('upgradeMessage', (event, message) => {
    console.log(message);
    if(modal.style.display == "none") modal.style.display = "block";
    modalText.textContent = message;
});

var FileMenu = new MenuItem({
      label: 'File',
      submenu: [
        {label: 'open', click () { openFile(); }},
        {label: 'save', click () { saveFile(); }}
      ]
});


function openFile(){
    dialog.showOpenDialog((filePaths) => {
        if(filePaths === undefined) return; //cancel was clicked

        //only single-file open is supported so there will always just be one file
        filePath = filePaths[0];

        fs.readFile(filePath, 'utf-8', (err, data) => {
            if(err){
                alert("An error ocurred reading the file :" + err.message);
                return;
            }

            // Change how to handle the file content
            editor.insertStringIntoEditor(data);
        });
    });
}


function saveFile(){
    dialog.showSaveDialog((filePath) => {
        if(filePath === undefined) return; //cancel was clicked

        content = editor.getEditorContents();

        fs.writeFile(filePath, content, (err) => {
            if(err){
                alert("An error ocurred creating the file "+ err.message)
            }
        });
    }); 
}

var applicationMenu = Menu.getApplicationMenu();
applicationMenu.insert(0,FileMenu);