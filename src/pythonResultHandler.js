module.exports.results = {};
var printResults = [];
const identifier = "6q3co7";
const jsonRenderer = renderjson.set_icons('+', '-') // default icons look a bit wierd, overriding
.set_show_to_level(2) // 2 shows x=1 and x=[1,2], provides option to expand  deeply nested data like x=[[1]]
.set_max_string_length(70); // 70 fits in 1280 screen

/**
 * deserializes result and creates a JSON display, as well as handling error messages / stdout
 * @param {string} pythonResults a single line of text, possibly in JSON format 
 */
module.exports.handleResult = function(pythonResults){

	//if result should have identifier, otherwise it is just a printout from users code
	if(pythonResults.startsWith(identifier)){

		pythonResults = pythonResults.replace(identifier,"");
		pythonResults = JSON.parse(pythonResults);

		if(pythonResults["ERROR"] != ""){
			var errorText = pythonResults["ERROR"];
			errorText = formatPythonException(errorText);
			$("#error").text("⚠ " + errorText);
			$("#error").show("fast");
		}
		else{
			$("#error").hide();
		}
		
		if(pythonResults["userVariables"] != "" && pythonResults["userVariables"] != "{}"){
			results = JSON.parse(pythonResults["userVariables"]);
			$("#results").html(jsonRenderer(results))
		}
		printResults = []; //clear so empty for next program run
		$(".spinner").css("visibility","hidden");
	}
	else{
		printResults.push(pythonResults);
		$("#stdout").text(printResults.join('\n'));
	}
}

/**
 * @param {string} err
 */
function formatPythonException(err){

	//unescape newlines
	err = err.replace(/\\n/g, "\n");

	if(err.startsWith("There has been a error when trying to display your variables")){
		// formatting would not work for this exception because it happens outside of exec()
		return err;
	}

	//replace File "<string>" (pointless)
	err = err.replace(/File \"<string>\", /g, "");

	err = err.split('\n');

	// error includes is caught in pythonEvaluator so it includes that stack frame
	// user should not see it, so remove:
	err = [err[0]].concat(err.slice(3));		
	return err.join('\n');
}

/* example error
"Traceback (most recent call last):
  File "pythonEvaluator.py", line 26, in <module>
    exec(data['evalCode'], evalLocals)
  line 4, in <module>
NameError: name 'y' is not defined
"
*/