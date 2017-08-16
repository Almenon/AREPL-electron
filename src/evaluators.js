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

module.exports.PythonEvaluator = class{

	/**
	 * starts pythonEvaluator.py
	 */
	constructor(){
		this.PythonShell = require('python-shell');
		var workingDirectory = require('path').dirname(require.main.filename)
		this.pythonEvalFilePath = workingDirectory + '\\src\\python\\pythonEvaluator.py';
		
		this.resultHandler = require("./pythonResultHandler");
		this.results = this.resultHandler.results;

		this.startPython();
	}

	
	/**
	 * @param {string} code 
	 */
	execCode(code){
		this.pyshell.send(JSON.stringify(code));
		$(".spinner").css("visibility","visible");
		$("#stdout").text("");
	}

	/**
	 * todo: link up func to a button
	 */
	stopRunningExec(){
		this.pyshell.end(err => {
			if (err) throw err;
			console.log('finished');
		});
		this.startPython();
	}

	startPython(){
		this.pyshell = new this.PythonShell(this.pythonEvalFilePath);
		this.pyshell.on('message', message => {
			console.debug(message);
			this.resultHandler.handleResult(message);
		});
	}
}