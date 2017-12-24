/*global $, CodeMirror, renderjson*/ //comment for eslint

var utils = require("./utils")
var evals = require("arepl-backend")
var cmUtils = require("./cmUtils")
var evalHandler = require("./pythonResultHandler")
var printDir = require("./printDir")
var settings = require("./settings").settings
const pyGuiLibraryIsPresent = require("./pyGuiLibraryIsPresent").pythonGuiLibraryIsPresent

var cm //codemirror
var stopAtLine = -1
var realTimeEvalEnabled = true
let PythonEvaluator = new evals.PythonEvaluator()
let myEvalHandler = new evalHandler.evalHandler()

// why the heck does javascript have "this" be so mutable? increadibly annoying...
// binding this to the class so it doesn't get overwritten by PythonEvaluator
PythonEvaluator.onPrint = myEvalHandler.handlePrint.bind(myEvalHandler)
PythonEvaluator.onResult = myEvalHandler.handleResult.bind(myEvalHandler)

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
	cm.on("changes",()=>{
		let delay = settings.delay + settings.restartDelay*settings.restart //multiplying a number by a boolean... it feels so wrong yet so right
		utils.delay(handleInput, delay)}) 
	cm.on('gutterClick', handleGutterClick)
	
	$(".CodeMirror").mousemove(handleMouseMove)
	$("#stdin").keyup((e) => {if(e.key == "Enter") handleSTDIN()})

	$('.CodeMirror').resizable({
		handles: 'e,s,se', // right, bottom, and bottom-right corner
		resize: function(event, ui) {
			changeEditorSize(ui.size.width, ui.size.height)
		  },
	});

	changeEditorSize(settings.editorWidth, settings.editorHeight)
})

/**
 * changes the size of the editor, input, output, and error as a group
 * @param {number} w in pixels
 * @param {number} h in pixels
 */
function changeEditorSize(w,h){
	let errorPadding = parseInt($('#error').css('padding'))*2
	
	cm.setSize(w, h);
	$('#stdin').width(w);
	$('#error').width(w-errorPadding);
	$('#stdout').width(w);
	$('#leftContainer').width(w);
}

var shortcuts = {}

shortcuts[settings.restartExec] = restartExec
shortcuts[settings.runOnce] = runOnce
shortcuts[settings.toggleRealTimeEval] = toggleRealTimeEval

window.onkeydown = (e) => {
	let functionToRun = shortcuts[e.key];
	if(functionToRun != undefined) functionToRun();
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
	var text = $("#stdin").val()
	$("#stdin").val("")
	PythonEvaluator.sendStdin(text)
}

/**
 * displays variable's value if hovering over variable
 */
function handleMouseMove(event){
	var variable = cmUtils.getVariable(cm, event)
	if(variable == undefined) return

	var result = myEvalHandler.results[variable]
	if(result == undefined) console.debug("no token found in results. Token: " + variable + " Results: " + myEvalHandler.results)

	cmUtils.changePopups(event, result)
}

/**
 * sets a breakpoint
 */
function handleGutterClick(cm, lineNum) {
	
	// if there is break clear all UI related to it (break, firstline, color)
	if(stopAtLine != -1){
	  cm.setGutterMarker(stopAtLine, "breakpoints",null)
	  cm.removeLineClass(stopAtLine,"background","noEvalFirst")
	  for(var i=stopAtLine; i<cm.lineCount(); i++){
		  cm.removeLineClass(i,"background","noEval")
	  }
	}

	// if user removes break, set stopAtLine to no stop indicator
	if(lineNum == stopAtLine) stopAtLine = -1
	
	// else add break & firstline & color & lineNum
	else{
		cm.setGutterMarker(lineNum, "breakpoints", utils.makeMarker())
		cm.addLineClass(lineNum,"background","noEvalFirst")
		for(i=lineNum; i<cm.lineCount(); i++){
			cm.addLineClass(i,"background","noEval")
		}
		stopAtLine = lineNum
	}

	//refresh results
	handleInput()
}

/**
 * @param {string} codeLines 
 */
function evalCode(codeLines){
	codeLines = codeLines.split('\n')
	let savedLines = [];

	if( codeLines.length == 0 || codeLines.length == 1 && codeLines[0].trim().length == 0) return

	if(stopAtLine > -1){
		codeLines = getCodeUntillBreakpoint(codeLines)
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
	});

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

/**
 * has side-effect of updating breakpoint if line deleted
 * @param {string[]} codeLines 
 */
function getCodeUntillBreakpoint(codeLines){
	var lineStop = stopAtLine+1 //switch to one-based indexing
	if(lineStop > codeLines.length){
		lineStop = stopAtLine = -1 //user got rid of new line, so get rid of unnecessary break
		console.debug("stop at line " + lineStop + " the number of lines: " + codeLines.length)
	}
	else if(lineStop > 0){
		codeLines = codeLines.slice(0,lineStop-1)
		if(codeLines[codeLines.length-1] == ""){ //newline
			cm.addLineClass(lineStop,"background","noEval")
		}
	}
	return codeLines
}