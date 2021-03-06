// this file has interaction between browser and electron API
const {remote, ipcRenderer} = require('electron')
const {dialog} = remote
const fs = require('fs')
var editor = require("../app")

ipcRenderer.on('openFileMenuClick',()=>{
    openFile()
})
ipcRenderer.on('saveFileMenuClick',()=>{
    saveFile()
})


function openFile(){
    dialog.showOpenDialog((filePaths) => {
        if(filePaths === undefined) return //cancel was clicked

        //only single-file open is supported so there will always just be one file
        let filePath = filePaths[0]

        fs.readFile(filePath, 'utf-8', (err, data) => {
            if(err){
                alert("An error ocurred reading the file :" + err.message)
                return
            }

            // Change how to handle the file content
            editor.insertStringIntoEditor(data)
        })
    })
}


function saveFile(){
    dialog.showSaveDialog((filePath) => {
        if(filePath === undefined) return //cancel was clicked

        let content = editor.getEditorContents()

        fs.writeFile(filePath, content, (err) => {
            if(err){
                alert("An error ocurred creating the file "+ err.message)
            }
        })
    })
}