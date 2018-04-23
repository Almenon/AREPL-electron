var utils = require("./utils")

/**
 * Wraps current line in print() or print(dir()) if line ends in .
 * @param {string} codeLines 
 * @param {number} currentLineNum
 * @returns {string}
 */
function printDir(codeLines, currentLineNum){
	// todo: flash a highlight for line that is printed
	// https://codemirror.net/demo/markselection.html
	// tho might be simpler to implement myself
	// codeMirrorEditor.setLineClass(actualLineNumber, 'background', 'printed')
	codeLines = codeLines.split('\n')

	let currentLine = codeLines[currentLineNum]
	let newLine = ""
	let variableRegex = /(^[^=]+)=[^=]/
	let intellisense = false
	
	if(currentLine.endsWith('.')){
		intellisense = true
		currentLine = currentLine.slice(0,-1) //get rid of . to avoid syntax err
	}

	let matches = variableRegex.exec(currentLine)
	if (matches != null){
		newLine = matches[1] // first capture group: "x" in "x=1"
	} else { newLine = currentLine }

	let tabs = /^\s*/.exec(newLine)[0]
	
	if(intellisense){
		newLine = utils.wrapLineWithFunc(newLine, ["print", "dir"])
	}
	else{
		newLine = utils.wrapLineWithFunc(newLine, "print")
	}
	
	newLine = tabs + newLine // need to preserving spacing in front, spacing is critical for python

	// put new code on next line (if we are printing "x=1" we want print(x) on next line)
	codeLines.splice(currentLineNum+1,0,newLine)
	codeLines[currentLineNum] = currentLine // we might need to remove . from currentLine so update that too
	return codeLines.join('\n')
}

module.exports.printDir = printDir