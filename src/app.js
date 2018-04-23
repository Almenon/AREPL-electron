/*global $, CodeMirror, renderjson*/ //comment for eslint

let utils = require("./utils")
let evals = require("arepl-backend")
let {CodeMirrorUtils} = require("./cmUtils")
let evalHandler = require("./pythonResultHandler")
let printDir = require("./printDir")
let settings = require("./settings").settings
let breakpoint = require("./breakpoint")
const pyGuiLibraryIsPresent = require("./pyGuiLibraryIsPresent").pythonGuiLibraryIsPresent

/**@type {CodeMirror.EditorFromTextArea}*/
let cm
/**@type {CodeMirrorUtils}*/
let cmUtils

let realTimeEvalEnabled = true
let PythonEvaluator = new evals.PythonEvaluator()
let myEvalHandler = new evalHandler.evalHandler()

// why the heck does javascript have "this" be so mutable? increadibly annoying...
// binding this to the class so it doesn't get overwritten by PythonEvaluator
PythonEvaluator.onPrint = myEvalHandler.handlePrint.bind(myEvalHandler)
PythonEvaluator.onResult = myEvalHandler.handleResult.bind(myEvalHandler)

PythonEvaluator.startPython()

let extraKeys = {}
extraKeys[settings.printDir] = ()=>{
	let codeLines = printDir.printDir(cm.getValue(), cm.getCursor().line)
	evalCode(codeLines)
}

///////////////////////////////////////////////////////////////
//				CODEMIRROR SETUP AND INPUT HANDLERS			
////////////////////////////////////////////////////////////////

$(function(){ //reference html elements after page load
	cm = CodeMirror.fromTextArea(document.getElementById("ide"), {
		mode: "python",
		lineNumbers: true,
		gutters: ["CodeMirror-linenumbers", "breakpoints"],
		keyMap: settings.keyMap,
		matchBrackets: true,
		extraKeys: extraKeys,
		theme: settings.theme
	})
	cmUtils = new CodeMirrorUtils(cm)

	cm.on("changes",()=>{
		let delay = settings.delay + settings.restartDelay*settings.restart
		utils.delay(handleInput, delay)}) 
	cm.on('gutterClick', (cm, lineNum)=>{
			breakpoint.colorLinesAfterBreakpoint(cm, lineNum)
			handleInput() //re-run w/ breakpoint
		}
	)
	
	$(".CodeMirror").mousemove(handleMouseMove)
	$("#stdin").keyup((e) => {if(e.key == "Enter") handleSTDIN()})

	$('.CodeMirror').resizable({
		handles: 'e,s,se', // right, bottom, and bottom-right corner
		resize: function(event, ui) {
			changeEditorSize(ui.size.width, ui.size.height)
		  },
	})

	changeEditorSize(settings.editorWidth, settings.editorHeight)
})

/**
 * changes the size of the editor, input, output, and error as a group
 * @param {number} w in pixels
 * @param {number} h in pixels
 */
function changeEditorSize(w,h){
	let errorPadding = parseInt($('#error').css('padding'))*2
	
	cm.setSize(w, h)
	$('#stdin').width(w)
	$('#error').width(w-errorPadding)
	$('#stdout').width(w)
	$('#leftContainer').width(w)
}

let shortcuts = {}

shortcuts[settings.restartExec] = restartExec
shortcuts[settings.runOnce] = runOnce
shortcuts[settings.toggleRealTimeEval] = toggleRealTimeEval

window.onkeydown = (e) => {
	let functionToRun = shortcuts[e.key]
	if(functionToRun != undefined) functionToRun()
}
module.exports.insertStringIntoEditor = function(content){
	cm.setValue(content)
}
module.exports.getEditorContents = function(){
	return cm.getValue()
}

function toggleRealTimeEval(){realTimeEvalEnabled = !realTimeEvalEnabled}

function restartExec(){
	PythonEvaluator.restart()
	$(".spinner").css("visibility","hidden")
}

/**
 * evaluates codemirror content
 */
function handleInput(){
	if(!realTimeEvalEnabled) return
	evalCode(cm.getValue())
}

function runOnce(){
	evalCode(cm.getValue())
}

function handleSTDIN(){
	if(!PythonEvaluator.running){
		evalCode(cm.getValue())
	}
	let text = $("#stdin").val()
	$("#stdin").val("")
	PythonEvaluator.sendStdin(text)
}

/**
 * displays variable's value if hovering over variable
 */
function handleMouseMove(event){
	let variable = cmUtils.getVariable(event)
	if(variable == undefined) return

	let result = myEvalHandler.results[variable]
	if(result == undefined){
		console.debug("no token found in results. Token: " + variable +
					  " Results: " + myEvalHandler.results)
	}

	cmUtils.changePopups(event, result)
}


/**
 * @param {string} codeLines 
 */
function evalCode(codeLines){
	codeLines = codeLines.split('\n')
	let savedLines = []

	if( codeLines.length == 0 || codeLines.length == 1 && codeLines[0].trim().length == 0) return

	if(breakpoint.breakPointActive()){
		codeLines = breakpoint.getCodeUntillBreakpoint(codeLines)
		breakpoint.recolorLinesAfterBreakpoint(cm, codeLines)
	}

	if(codeLines.length == 0){
		$("#results").html(renderjson({}))
		$("#error").hide()
		$("#error").text("")
		return
	}

	// split code into saved and unsaved part
	codeLines.forEach((line,i)=>{
		if(line.endsWith('#$save')){
			savedLines = codeLines.slice(0,i+1)
			codeLines = codeLines.slice(i+1,codeLines.length)
		}
	})

	let data = {
		savedCode: savedLines.join('\n'),
		evalCode: codeLines.join('\n')
	}
	
	$(".spinner").css("visibility","visible")
	$("#stdout").text("")

	if(settings.autoChangeRestart){
		settings.restart = pyGuiLibraryIsPresent(data.savedCode + data.evalCode)
	}

	if(settings.restart){
		PythonEvaluator.checkSyntax(data.savedCode + data.evalCode)
		.then(()=>{
			PythonEvaluator.restart(PythonEvaluator.execCode.bind(PythonEvaluator, data))
		})
		.catch((error)=>{
			myEvalHandler.showErrorMsg(error)
		})
	}
	else PythonEvaluator.execCode(data)
}