module.exports.results = {};
var printResults = [];
const identifier = "6q3co7";

/**
 * deserializes result and creates a JSON display, as well as handling error messages / stdout
 * @param {string} pythonResults a single line of text, possibly in JSON format 
 */
insertResult = function(pythonResults){

	//if result should have identifier, otherwise it is just a printout from users code
	if(pythonResults.startsWith(identifier)){

		pythonResults = pythonResults.replace(identifier,"");
		pythonResults = JSON.parse(pythonResults);

		if(pythonResults["ERROR"] != ""){
			errorText = pythonResults["ERROR"];
			errorText = formatPythonException(errorText);
			$("#error").show("fast");
			$("#error").text("⚠ " + errorText);
			$(".spinner").css("visibility","hidden");
		}
		else{
			$("#error").hide();
			$("#error").text("");
		}
		
		if(pythonResults["userVariables"] != "" && pythonResults["userVariables"] != "{}"){
			results = JSON.parse(pythonResults["userVariables"]);
			$("#results").html(
				renderjson.set_icons('+', '-').set_show_to_level(2)(results)
			)
			printResults = []; //clear so empty for next program run
		}
		$(".spinner").css("visibility","hidden");
	}
	else{
		printResults.push(pythonResults);
		$("#stdout").text(printResults.join('\n'));
		return;
	}
}

pyshell.on('message', function (message) {
  console.debug(message);
  insertResult(message);
});

/**
 * @param {string} err
 */
function formatPythonException(err){
	//unescape newlines
	err = errorText.replace(/\\n/g, "\n");

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