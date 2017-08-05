module.exports.results = {};
var printResults = [];

/**
 * deserializes result and creates a JSON display, as well as handling error messages / stdout
 * @param {string} pythonResults a single line of text, possibly in JSON format 
 */
insertResult = function(pythonResults){
	if(pythonResults.slice(0,5) == "ERROR"){
			errorText = pythonResults.slice(5);
			errorText = formatPythonException(errorText);
			$("#error").show("fast");
			$("#error").text("⚠ " + errorText);
			noError = false;
			$(".spinner").css("visibility","hidden");
			return;
	}
	else if(pythonResults[0] == "R"){
		pythonResults = pythonResults.slice(1);
		results = JSON.parse(pythonResults);
		//resultText = JSON.stringify(results, null, 2);
		$("#results").html(renderjson.set_icons('+', '-').set_show_to_level(2)(results))
		$("#error").hide();
		printResults = []; //clear so empty for next program run
	}
	else{
		//users code has a print to stdout, so who knows what we are getting.  May not be JSON.
		printResults.push(pythonResults);
		$("#stdout").text(printResults.join('\n'));
		return;
	}
	noError = true;
	$("#error").text("");
	$(".spinner").css("visibility","hidden");
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

	//top level stack frame is python exec file so remove it
	err = err.split('\n');

	err = [err[0]].concat(err.slice(3));
	return err.join('\n');
}