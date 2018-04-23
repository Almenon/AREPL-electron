/*global $, renderjson*/ //comment for eslint
let settings = require('./settings').settings

const jsonRenderer = renderjson.set_icons('+', '-') // default icons look a bit wierd, overriding
.set_show_to_level(settings.show_to_level) 
.set_max_string_length(settings.max_string_length)

// just wrapping code in class so scope with printResult is preserved
module.exports.evalHandler =  class{

	constructor(){
		this.printResults = []
		this.results = {}
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

	handlePrint(pythonResults){
		this.printResults.push(pythonResults)
		$("#stdout").text(this.printResults.join('\n'))
	}

}