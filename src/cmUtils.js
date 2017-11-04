/*global $*/

module.exports.changePopups = function(e, result){
	$(".cm-variable").attr('title', JSON.stringify(result));
	  	// tippy('.cm-variable', 
        // {position: 'bottom',
        //  arrow: false, 
		//  duration:350});
		// sort of buggy so disabling
}

module.exports.getVariable = function(cm, event){
	var pos = cm.coordsChar({left: event.pageX, top: event.pageY});

	var tokenType = cm.getTokenTypeAt(pos);
	if(tokenType == "variable"){
		let token = cm.getTokenAt(pos).string;
		if(token != "") return token //not sure why token is sometimes empty.  It should have value is tokenType returned variable
    }
}

/**
 * returns cm contents with current line replaced by newLine.  actual contents remains unchanged.
 * @param {string} newLine 
 * @returns {string}
 */
module.exports.replaceCurrentLine = (cm, newLine) => {
	let codeLines = cm.getValue().split('\n')
	let currentLine = cm.getCursor().line
	codeLines[currentLine] = newLine
	return codeLines.join('\n')	
}

/**
 * @returns {string}
 */
module.exports.getCurrentLine = (cm) => {
	let codeLines = cm.getValue().split('\n')
	let currentLine = cm.getCursor().line
	return codeLines[currentLine]	
}