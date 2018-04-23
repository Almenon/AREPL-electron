/*global $*/

module.exports.CodeMirrorUtils = class CodeMirrorUtils{
	constructor(cm){
		this.cm = cm
	}

	changePopups(e, result){
		$(".cm-variable").attr('title', JSON.stringify(result));
			// tippy('.cm-variable', 
			// {position: 'bottom',
			//  arrow: false, 
			//  duration:350})
			// sort of buggy so disabling
	}

	getVariable(event){
		var pos = this.cm.coordsChar({left: event.pageX, top: event.pageY})

		var tokenType = this.cm.getTokenTypeAt(pos)
		if(tokenType == "variable"){
			let token = this.cm.getTokenAt(pos).string
			if(token != ""){
				// not sure why token is sometimes empty.
				// It should have value is tokenType returned variable
				return token
			}
		}
	}

	/**
	 * returns cm contents with current line replaced by newLine.  actual contents remains unchanged.
	 * @param {string} newLine 
	 * @returns {string}
	 */
	replaceCurrentLine(newLine){
		let codeLines = this.cm.getValue().split('\n')
		let currentLine = this.cm.getCursor().line
		codeLines[currentLine] = newLine
		return codeLines.join('\n')	
	}

	/**
	 * @returns {string}
	 */
	getCurrentLine(){
		let codeLines = this.cm.getValue().split('\n')
		let currentLine = this.cm.getCursor().line
		return codeLines[currentLine]	
	}
}