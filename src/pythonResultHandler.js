/*global $, renderjson*/ //comment for eslint
let settings = require('./settings').settings
let {limit} = require('function-throttler')

const jsonRenderer = renderjson.set_icons('+', '-') // default icons look a bit wierd, overriding
.set_show_to_level(settings.show_to_level) 
.set_max_string_length(settings.max_string_length)

// just wrapping code in class so scope with printResult is preserved
module.exports.evalHandler =  class{

	constructor(){
		this.printResults = []
		this.results = {}

		// a program can print millions of lines so we need to throttle it to avoid lag
		let l = new limit()
		this.updatePrint = l.throttledUpdate(this.updatePrint, 50)
	}

	/**
	 * 
	 * @param {{ERROR:string, userVariables:Object, execTime:number, totalPyTime: number, totalTime:number}} pythonResults 
	 */
	handleResult(pythonResults){
		console.log(pythonResults.execTime)
		console.log(pythonResults.totalPyTime)
		console.log(pythonResults.totalTime)

		this.showErrorMsg(pythonResults.ERROR)
			
		if(pythonResults.userVariables != "" && pythonResults.userVariables != "{}"){
			this.results = pythonResults.userVariables
			$("#results").html(jsonRenderer(this.results))
		}
		this.printResults = [] //clear so empty for next program run
		$(".spinner").css("visibility","hidden")
	}

	/**
	 * prints error or hides it if empty string
	 * @param {string} error
	 */
	showErrorMsg(error){
		if(error != ""){
			$("#error").text("⚠ " + error)
			$("#error").show("fast")
		}
		else{
			$("#error").hide()
		}
	}

	/**
	 * @param {string} pythonResults 
	 */
	handlePrint(pythonResults){
		this.printResults.push(pythonResults)
		this.updatePrint(this.printResults)
	}
	
	/**
	 * @private
	 * @param {string[]} text 
	 */
	updatePrint(printLines){
		$("#stdout").text(printLines.join('\n'))
	}

	clearPrint(){
		this.printResults = []
		this.updatePrint([""])
	}

}