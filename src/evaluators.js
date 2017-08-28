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
		const path = require('path');
		var workingDirectory = path.dirname(require.main.filename);
		if(workingDirectory.endsWith("app.asar")){
			this.pythonEvalFilePath = path.parse(workingDirectory).dir;
		}
		else{
			this.pythonEvalFilePath = workingDirectory + '/src/python/'
		}

		// for non-windows OS it is best to use python3 instead of python
		// Mac and Ubuntu both have python being v2 by default
		// archlinux and freebsd both use v3 as default, but also provide python3 command
		this.pythonPath = process.platform != "win32" ? "python3" : "python";
		
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
		this.pyshell = new this.PythonShell('pythonEvaluator.py', {
			scriptPath: this.pythonEvalFilePath,
			pythonPath: this.pythonPath,
		});
		this.pyshell.on('message', message => {
			console.debug(message);
			this.resultHandler.handleResult(message);
		});
	}
}