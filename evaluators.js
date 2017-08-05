/**
 * @param {string} code 
 */
module.exports.JSEvaluator = function(code){
		try {
			eval(code);
		} catch (SyntaxError) {
			//todo
		}
}

/**
 * @param {string} code 
 */
module.exports.PythonEvaluator = function(code){
	pyshell.send(JSON.stringify(code));
	$(".spinner").css("visibility","visible");
	$("#stdout").text("");
}