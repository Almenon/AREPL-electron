module.exports.changePopups = function(e, result){
	$(".cm-variable").attr('title', JSON.stringify(result));
	  	// tippy('.cm-variable', 
        // {position: 'bottom',
        //  arrow: false, 
		//  duration:350});
		// sort of buggy so disabling
}

module.exports.getVariable = function(event){
	var pos = cm.coordsChar({left: event.pageX, top: event.pageY});

	var tokenType = cm.getTokenTypeAt(pos);
	if(tokenType == "variable"){
		token = cm.getTokenAt(pos).string;
		if(token != "") return token //not sure why token is sometimes empty.  It should have value is tokenType returned variable
    }
}