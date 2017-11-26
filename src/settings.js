module.exports.settings = {
    delay: 300, //delay before executing code after typing
    restartDelay: 300, // when restart mode is active we add this to delay to delay longer
    keyMap: "sublime", // could use vim or emacs instead
    restart: false,
    autoChangeRestart: true, // automatically use restart mode if a GUI/graphing library detected

    // UI
    theme: "default", // suggested themes: 'eclipse', 'solarized_light', 'base16-light', etc... look at libraries/codemirror/theme for more
    editorHeight: 550, //editor includes input, output, and error width
    editorWidth: 500,
    show_to_level: 2, // 2 shows x=1 and x=[1,2], provides option to expand deeply nested data like x=[[1]]
    max_string_length: 70,  // 70 fits in 1280 screen

    // SHORTCUTS
	restartExec: "F1",
	toggleRealTimeEval: "F4",
    runOnce: "F5",
    printDir: "Ctrl-Enter"
}