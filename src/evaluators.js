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

		let rootPath = process.cwd();
		if(rootPath.endsWith("arepl-win32-x64")){
		  rootPath = rootPath + '/resources/app';
		}

		this.pythonEvalFilePath = rootPath + '/src/python/';

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
	 * @param {string} message 
	 */
	sendStdin(message){
		this.pyshell.send(message);
	}

	/**
	 * kills python process and restarts.  Force-kills if necessary.
	 */
	restart(){
		
		var restarting = false;

		// register callback for restart
		// using childProcess callback instead of pyshell callback
		// (pyshell callback only happens when process exits voluntarily)
		this.pyshell.childProcess.on('exit',()=>{
			restarting = true;
			this.startPython();
		});

		// pyshell has 50 ms to die gracefully
		var dead = this.pyshell.childProcess.kill();
		if(!dead) console.info("pyshell refused to die")

		setTimeout(()=>{
			if(!dead && !restarting){
				// murder the process with extreme prejudice
				dead = this.pyshell.childProcess.kill('SIGKILL');
				if(!dead){
					console.error("the python process simply cannot be killed!")
				}
			}
		}, 50);
	}


	startPython(){
		console.log("Starting Python...")
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