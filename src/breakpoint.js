let utils = require('./utils')

let breakpoint = -1

/**
 * side-effect: if a breakpoint already exists it clears it
 * @param {number} lineNum
 */
module.exports.colorLinesAfterBreakpoint = function(cm, lineNum){
	
	// if there is break clear all UI related to it (break, firstline, color)
	if(breakpoint != -1){
	  cm.setGutterMarker(breakpoint, "breakpoints",null)
	  cm.removeLineClass(breakpoint,"background","noEvalFirst")
	  for(let i=breakpoint; i<cm.lineCount(); i++){
		  cm.removeLineClass(i,"background","noEval")
	  }
	}

	// if user removes break, set stopAtLine to no stop indicator
	if(lineNum == breakpoint) breakpoint = -1
	
	// else add break & firstline & color & lineNum
	else{
		cm.setGutterMarker(lineNum, "breakpoints", utils.makeMarker())
		cm.addLineClass(lineNum,"background","noEvalFirst")
		for(let i=lineNum; i<cm.lineCount(); i++){
			cm.addLineClass(i,"background","noEval")
		}
		breakpoint = lineNum
	}
}

/**
 * @param {string[]} codeLines 
 */
module.exports.getCodeUntillBreakpoint = function(codeLines){
	let lineStop = breakpoint+1 //switch to one-based indexing
	if(lineStop > codeLines.length){
		lineStop = breakpoint = -1 //user got rid of new line, so get rid of unnecessary break
		console.debug("stop at line " + lineStop + " the number of lines: " + codeLines.length)
	}
	else if(lineStop > 0){
		codeLines = codeLines.slice(0,lineStop-1)
	}
	return codeLines
}

/**
 * @param {string[]} codeLines 
 */
module.exports.recolorLinesAfterBreakpoint = function(cm, codeLines){
    let lineStop = breakpoint+1 //switch to one-based indexing
	if(lineStop < codeLines.length && lineStop > 0){
		codeLines = codeLines.slice(0,lineStop-1)
		if(codeLines[codeLines.length-1] == ""){ //newline
			cm.addLineClass(lineStop,"background","noEval")
		}
	}
}

/**
 * basically just breakpoint > -1
 */
module.exports.breakPointActive = function(){
    return breakpoint > -1
}