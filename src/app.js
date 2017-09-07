var utils = require("./utils");
var evals = require("./evaluators");
var cmUtils = require("./cmUtils");

var cm; //codemirror
var noError = true;
var stopAtLine = -1;
var PythonEvaluator = new evals.PythonEvaluator();
var realTimeEvalEnabled = true;

///////////////////////////////////////////////////////////////
//				CODEMIRROR SETUP AND INPUT HANDLERS			
////////////////////////////////////////////////////////////////

$(function(){ //reference html elements after page load
	cm = CodeMirror.fromTextArea(document.getElementById("ide"), {
		mode: "python",
		lineNumbers: true,
		gutters: ["CodeMirror-linenumbers", "breakpoints"],
		keyMap: "sublime",
		extraKeys: {
			"F1": restartExec,
			"F4": toggleRealTimeEval,
			"F5": runOnce
		},
		matchBrackets: true,
	});
	cm.on("changes",(doc, changes)=>{utils.delay(handleInput, 300)}); //delay 300ms to wait for user to finish typing
	$(".CodeMirror").mousemove(handleMouseMove);
	$("#stdin").keyup((e) => {if(e.key == "Enter") handleSTDIN()});
	cm.on('gutterClick', handleGutterClick)
});

module.exports.insertStringIntoEditor = function(content){
	cm.setValue(content);
};
module.exports.getEditorContents = function(){
	return cm.getValue();
};

function toggleRealTimeEval(){realTimeEvalEnabled = !realTimeEvalEnabled}

function restartExec(){
	PythonEvaluator.restart();
	$(".spinner").css("visibility","hidden");
}

/**
 * evaluates codemirror content
 */
function handleInput(){
	if(!realTimeEvalEnabled) return;
	var text = cm.getValue().split('\n')
	if(text.length == 1 && text[0].length == 0) return;
	evalCode(text)
}

function runOnce(){
	if(realTimeEvalEnabled) return; //no point in running once if realTimeEval is enabled

	realTimeEvalEnabled = true;
	handleInput();
	realTimeEvalEnabled = false;
}

function handleSTDIN(){
	var text = $("#stdin").val();
	$("#stdin").val("");
	PythonEvaluator.sendStdin(text);
}

/**
 * displays variable's value if hovering over variable
 */
function handleMouseMove(event){
	var variable = cmUtils.getVariable(cm, event);
	if(variable == undefined) return;

	var result = results[variable];
	if(result == undefined) console.debug("no token found in results. Token: " + token + " Results: " + results);

	cmUtils.changePopups(event, result);
}

/**
 * sets a breakpoint
 */
function handleGutterClick(cm, lineNum) {
	
	// if there is break clear all UI related to it (break, firstline, color)
	if(stopAtLine != -1){
	  cm.setGutterMarker(stopAtLine, "breakpoints",null);
	  cm.removeLineClass(stopAtLine,"background","noEvalFirst");
	  for(i=stopAtLine; i<cm.lineCount(); i++){
		  cm.removeLineClass(i,"background","noEval");
	  }
	}

	// get new break line
	var info = cm.lineInfo(lineNum);

	// if user removes break, set stopAtLine to no stop indicator
	if(lineNum == stopAtLine) stopAtLine = -1;
	
	// else add break & firstline & color & lineNum
	else{
		cm.setGutterMarker(lineNum, "breakpoints", utils.makeMarker())
		cm.addLineClass(lineNum,"background","noEvalFirst");
		for(i=lineNum; i<cm.lineCount(); i++){
			cm.addLineClass(i,"background","noEval");
		}
		stopAtLine = lineNum;
	}

	//refresh results
	handleInput();
};

/**
 * @param {string[]} codeLines 
 */
function evalCode(codeLines){

	if(stopAtLine > -1){
		codeLines = getCodeUntillBreakpoint(codeLines);
	}

	if(codeLines.length == 0){
		$("#results").html(renderjson({}));
		$("#error").hide();
		$("#error").text("");
		return;
	}

	data = {
		evalCode: codeLines.join('\n')
	}
	
	$(".spinner").css("visibility","visible");
	$("#stdout").text("");
	PythonEvaluator.execCode(data);
}

/**
 * has side-effect of updating breakpoint if line deleted
 * @param {string[]} codeLines 
 */
function getCodeUntillBreakpoint(codeLines){
	var lineStop = stopAtLine+1; //switch to one-based indexing
	if(lineStop > codeLines.length){
		lineStop = stopAtLine = -1; //user got rid of new line, so get rid of unnecessary break
		console.debug("stop at line " + lineStop + " the number of lines: " + codeLines.length);
	}
	else if(lineStop > 0){
		codeLines = codeLines.slice(0,lineStop-1);
		if(codeLines[codeLines.length-1] == ""){ //newline
			cm.addLineClass(lineStop,"background","noEval");
		}
	}
	return codeLines;
}