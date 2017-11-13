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
	// codeMirrorEditor.setLineClass(actualLineNumber, 'background', 'printed');
	codeLines = codeLines.split('\n')

	let currentLine = codeLines[currentLineNum]
	
	if(currentLine.endsWith('.')){ // user wants intellisense - what are attributes of var?
		currentLine = currentLine.slice(0,-1) //get rid of . to avoid syntax err
		currentLine = utils.wrapLineWithFunc(currentLine, ["print", "dir"])
	}
	else{
		currentLine = utils.wrapLineWithFunc(currentLine, "print")
	}
	
	codeLines[currentLineNum] = currentLine
	return codeLines.join('\n')
}

module.exports.printDir = printDir