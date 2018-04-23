/**
 * returns true if text has not changed
 */
module.exports.noChange = function(oldText, text){
    // in future this should be syntax-aware so we dont care about unimportant chars like spaces
    // simple replace of spaces is not possible.  ex: what if spaces are a important part of string?
	// need regex or better yet tokenization
    return (oldText.length == text.length) && oldText.every(function(element, index) {
    	return element === text[index]; 
	});
}

/**
 * taken from https://codemirror.net/demo/marker.html
 */
module.exports.makeMarker = function() {
  var marker = document.createElement("div")
  marker.style.color = "#822"
  marker.innerHTML = "●"
  return marker
}

/**
 * thanks to https://stackoverflow.com/a/1909508/6629672
 */
module.exports.delay = (function(){
  var timer = 0
  return function(callback, ms){
    clearTimeout (timer)
    timer = setTimeout(callback, ms)
  }
})()

/**
 * line -> func(line)
 * OR line -> func1(func2(line)) ...
 * @param {string} line 
 * @param {string|string[]} func
 * @returns {string}
 */
function wrapLineWithFunc(line, func){
	if(typeof func == "string" || func.length == 1) return func + '(' + line + ')'
	else return wrapLineWithFunc(func[func.length-1] + '(' + line + ')', func.slice(0,func.length-1))
}
module.exports.wrapLineWithFunc = wrapLineWithFunc