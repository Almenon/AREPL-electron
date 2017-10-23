/*global $, CodeMirror, renderjson*/ //comment for eslint

var utils = require("./utils")
var evals = require("./evaluators")
var cmUtils = require("./cmUtils")
var evalHandler = require("./pythonResultHandler")

var cm //codemirror
var stopAtLine = -1
var realTimeEvalEnabled = true
var PythonEvaluator = new evals.PythonEvaluator()
var myEvalHandler = new evalHandler.evalHandler()

// why the heck does javascript have "this" be so mutable? increadibly annoying...
// binding this to the class so it doesn't get overwritten by PythonEvaluator
PythonEvaluator.onPrint = myEvalHandler.handlePrint.bind(myEvalHandler)
PythonEvaluator.onResult = myEvalHandler.handleResult.bind(myEvalHandler)

///////////////////////////////////////////////////////////////
//				CODEMIRROR SETUP AND INPUT HANDLERS			
////////////////////////////////////////////////////////////////

$(function(){ //reference html elements after page load
	cm = CodeMirror.fromTextArea(document.getElementById("ide"), {
		mode: "python",
		lineNumbers: true,
		gutters: ["CodeMirror-linenumbers", "breakpoints"],
		keyMap: "sublime",
		matchBrackets: true,
	})
	cm.on("changes",()=>{utils.delay(handleInput, 300)}) //delay 300ms to wait for user to finish typing
	cm.on('gutterClick', handleGutterClick)
	
	$(".CodeMirror").mousemove(handleMouseMove)
	$("#stdin").keyup((e) => {if(e.key == "Enter") handleSTDIN()})

	$('.CodeMirror').resizable({
		handles: 'e,s,se', // right, bottom, and bottom-right corner
		resize: function(event, ui) {
			let errorPadding = parseInt($('#error').css('padding'))*2

			cm.setSize(ui.size.width, ui.size.height);
			$('#stdin').width(ui.size.width);
			$('#error').width(ui.size.width-errorPadding);
			$('#stdout').width(ui.size.width);
			$('#leftContainer').width(ui.size.width);
		  },
	});
})

var shortcuts = {
	"F1": restartExec,
	"F4": toggleRealTimeEval,
	"F5": runOnce
}

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
	var text = cm.getValue().split('\n')
	evalCode(text)
}

function runOnce(){
	if(realTimeEvalEnabled) return //no point in running once if realTimeEval is enabled

	var text = cm.getValue().split('\n')
	evalCode(text)
}

function handleSTDIN(){
	if(!PythonEvaluator.running){
		var text = cm.getValue().split('\n')
		evalCode(text)
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
 * @param {string[]} codeLines 
 */
function evalCode(codeLines){
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
	PythonEvaluator.execCode(data)
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