/**
 * @param {string} code 
 */
module.exports.JSEvaluator = function(code){
		try {
			eval(code)
		} catch (SyntaxError) {
			//todo
		}
}

const identifier = "6q3co7"
const jsonErrorIdentifier = "6q3co6"

module.exports.PythonEvaluator = class{

	
	/**
	 * starts pythonEvaluator.py
	 */
	constructor(){
		this.evaling = false
		this.running = false
		this.PythonShell = require('python-shell')

		let rootPath = process.cwd()
		if(rootPath.includes("arepl-win32")){
		  rootPath = rootPath + '/resources/app'
		}
		else if(__dirname.includes("arepl-darwin")){ //mac prod build
			rootPath = __dirname.replace("/src","")

			//needed for Mac to prevent ENOENT
			process.env.PATH = ["/usr/local/bin", process.env.PATH].join(":")
		}

		this.pythonEvalFolderPath = rootPath + '/src/python/'

		// for non-windows OS it is best to use python3 instead of python
		// Mac and Ubuntu both have python being v2 by default
		// archlinux and freebsd both use v3 as default, but also provide python3 command
		this.pythonPath = process.platform != "win32" ? "python3" : "python"

		this.startPython()
	}

	
	/**
	 * does not do anything if program is already running
	 * @param {{evalCode:string}} code 
	 */
	execCode(code){
		if(this.evaling) return
		this.evaling = true
		this.startTime = Date.now()
		this.pyshell.send(JSON.stringify(code))
	}

	/**
	 * @param {string} message 
	 */
	sendStdin(message){
		this.pyshell.send(message)
	}

	/**
	 * kills python process and restarts.  Force-kills if necessary after 50ms.
	 * After process restarts the callback passed in is invoked
	 */
	restart(callback=()=>{}){
		
		var restarting = false

		// register callback for restart
		// using childProcess callback instead of pyshell callback
		// (pyshell callback only happens when process exits voluntarily)
		this.pyshell.childProcess.on('exit',()=>{
			restarting = true
			this.evaling = false
			this.startPython()
			callback()
		})

		// pyshell has 50 ms to die gracefully
		this.running = !this.pyshell.childProcess.kill()
		if(this.running) console.info("pyshell refused to die")
		else this.evaling = false

		setTimeout(()=>{
			if(this.running && !restarting){
				// murder the process with extreme prejudice
				this.running = !this.pyshell.childProcess.kill('SIGKILL')
				if(this.running){
					console.error("the python process simply cannot be killed!")
				}
				else this.evaling = false
			}
		}, 50)
	}

	startPython(){
		console.log("Starting Python...")
		this.pyshell = new this.PythonShell('pythonEvaluator.py', {
			scriptPath: this.pythonEvalFolderPath,
			pythonPath: this.pythonPath,
		})
		this.pyshell.on('message', message => {
			console.info(message)
			this.handleResult(message)
		})
		this.running = true
	}

	/**
	 * Overwrite this with your own handler.
	 * is called when program fails or completes
	 * @param {{ERROR:string, userVariables:Object, execTime:number, totalPyTime:number, totalTime:number}} foo
	 */
	onResult(foo){}

	/**
	 * Overwrite this with your own handler.
	 * Is called when program prints
	 * @param {string} foo
	 */
	onPrint(foo){}

	/**
	 * handles pyshell results and calls onResult / onPrint
	 * @param {string} results 
	 */
	handleResult(results) {
		let pyResult = {
			"ERROR":"",
			"userVariables": "",
			"execTime":0,
			"totalPyTime":0
		}

        //result should have identifier, otherwise it is just a printout from users code
        if(results.startsWith(identifier)){
			this.evaling = false
            results = results.replace(identifier,"")
			pyResult = JSON.parse(results)
			
			pyResult.execTime = pyResult.execTime*1000 // convert into ms
			pyResult.totalPyTime = pyResult.totalPyTime*1000
			
			if(pyResult.userVariables != "") pyResult.userVariables = JSON.parse(pyResult.userVariables)

            if(pyResult.ERROR != ""){
                pyResult.ERROR = this.formatPythonException(pyResult.ERROR)
			}

			pyResult.totalTime = Date.now()-this.startTime
			this.onResult(pyResult)
		}
		else if(results.startsWith(jsonErrorIdentifier)){
			results = results.replace(jsonErrorIdentifier)
			console.warn("error in python evaluator converting stdin to JSON. " +
			"User probably just sent stdin without input() in his program.\n" + results)
		}
        else{
			// get rid of \r at end (present in windows)
			if(results.endsWith('\r')) results = results.slice(0, results.length-1);
            this.onPrint(results)
		}
	}

	/**
	 * checks syntax without executing code
	 * @param {string} code
	 * @returns {Promise}
	 */
	async checkSyntax(code){
		// note that this should really be done in pythonEvaluator.py
		// but communication with that happens through just one channel (stdin/stdout)
		// so for now i prefer to keep this seperate

		code = code.replace(/\n/g,"\\n") // command has to be executed on one line
		let compileCommand = `${this.pythonPath} -c "compile('${code}','','exec')"`
		let exec = require('child_process').exec

		return new Promise((resolve, reject) => {
			exec(compileCommand, (error, stdout, stderr) => {
				if(error == null) resolve()
				else reject(stderr)
			})
		})
	}

	/**
	 * gets rid of unnecessary exception data, among other things
	 * @param {string} err
	 * @example err:
	 * "Traceback (most recent call last):
	 *   File "pythonEvaluator.py", line 26, in <module>
	 * 	exec(data['evalCode'], evalLocals)
	 *   line 4, in <module>
	 * NameError: name 'y' is not defined"
	 * @returns {string}
	 */
	formatPythonException(err){
	
		//unescape newlines
		err = err.replace(/\\n/g, "\n")
	
		if(err.startsWith("There has been a error when trying to display your variables")){
			// formatting would not work for this exception because it happens outside of exec()
			return err
		}
	
		//replace File "<string>" (pointless)
		err = err.replace(/File \"<string>\", /g, "")
	
		err = err.split('\n')
	
		// error includes is caught in pythonEvaluator so it includes that stack frame
		// user should not see it, so remove:
		err = [err[0]].concat(err.slice(3))		
		return err.join('\n')
	}
}