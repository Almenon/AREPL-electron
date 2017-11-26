from copy import deepcopy
from customHandlers import handlers
import json
import jsonpickle
import traceback
from math import isnan
import ast
from time import time

class execArgs(object):
    def __init__(self, savedCode, evalCode, *args, **kwargs):
        self.savedCode = savedCode
        self.evalCode = evalCode
        #self.action = action

class returnInfoJson(object):
    def __init__(self, ERROR, userVariables, execTime, totalTime, *args, **kwargs):
        self.ERROR = ERROR
        self.userVariables = userVariables
        self.execTime = execTime
        self.totalTime = totalTime


class customPickler(jsonpickle.pickler.Pickler):
    """
    encodes float values like inf / nan as strings to follow JSON spec while keeping meaning
    Im doing this in custom class because handlers do not fire for floats
    """
    inf = float('inf')
    negativeInf = float('-inf')

    def _get_flattener(self, obj):
        if type(obj) == type(float()):
            if obj == self.inf:
                return lambda obj: 'Infinity'
            if obj == self.negativeInf:
                return lambda obj: '-Infinity'
            if isnan(obj):
                return lambda obj: 'NaN'
        return super(customPickler, self)._get_flattener(obj)


class UserError(Exception):
    """
    user errors should be caught and re-thrown with this
    Be warned that this exception can throw an exception.  Yes, you read that right.  I apolagize in advance.
    :raises: ValueError (varsSoFar gets pickled into JSON, which may result in any number of errors depending on what types are inside)
    """
    def __init__(self, message, varsSoFar={}):
        super().__init__(message)
        self.varsSoFar = pickle_user_vars(varsSoFar)

jsonpickle.pickler.Pickler = customPickler
jsonpickle.set_encoder_options('json', ensure_ascii=False)
jsonpickle.set_encoder_options('json', allow_nan=False) # nan is not deseriazable by javascript
for handler in handlers:
    jsonpickle.handlers.register(handler['type'], handler['handler'])

# copy all special vars (we want execd code to have similar locals as actual code)
# not copying builtins cause exec adds it in
# also when specialVars is deepCopied later on deepcopy cant handle builtins anyways
startingLocals = {}
specialVars = ['__doc__', '__file__', '__loader__', '__name__', '__package__', '__spec__']
for var in specialVars:
    startingLocals[var] = locals()[var]
    
oldSavedLines = []
savedLocals = {}

def get_imports(parsedText, text):
    """
    :param parsedText: the result of ast.parse(text)
    :returns: empty string if no imports, otherwise string containing all imports
    """

    child_nodes = [l for l in ast.iter_child_nodes(parsedText)]

    imports = []
    savedCode = text.split('\n')
    for node in child_nodes:
        if(isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom)):
            importLine = savedCode[node.lineno-1]
            imports.append(importLine)

    imports = '\n'.join(imports)
    return imports


def exec_saved(savedLines):
    savedLocals = deepcopy(startingLocals)
    try:
        exec(savedLines, savedLocals)
    except Exception:
        errorMsg = traceback.format_exc()        
        raise UserError(errorMsg, savedLocals)
    
    # deepcopy cant handle imported modules, so remove them
    savedLocals = {k:v for k,v in savedLocals.items() if str(type(v)) != "<class 'module'>"}

    return savedLocals


def get_eval_locals_from_saved(savedLines):
    global oldSavedLines
    global savedLocals

    # "saved" code we only ever run once and save locals, vs. codeToExec which we exec as the user types
    # although if saved code has changed we need to re-run it
    if savedLines != oldSavedLines:
        savedLocals = exec_saved(savedLines)
        oldSavedLines = savedLines

    if savedLines != "":
        return deepcopy(savedLocals)
    else: 
        return deepcopy(startingLocals)    

def pickle_user_vars(userVars):
    # filter out non-user vars, no point in showing them
    userVariables = {k:v for k,v in userVars.items() if str(type(v)) != "<class 'module'>"
                     and k not in specialVars+['__builtins__']}

    # json dumps cant handle any object type, so we need to use jsonpickle
    # still has limitations but can handle much more
    return jsonpickle.encode(userVariables, max_depth=100) # any depth above 245 resuls in error and anything above 100 takes too long to process
    

def copy_saved_imports_to_exec(codeToExec, savedLines):
    """
    copies imports in savedLines to the top of codeToExec
    :raises: SyntaxError if err in savedLines
    """
    if savedLines.strip() != "":
        try:
            savedCodeAST = ast.parse(savedLines)
        except SyntaxError:
            errorMsg = traceback.format_exc()        
            raise UserError(errorMsg)

        imports = get_imports(savedCodeAST, savedLines)
        codeToExec = imports + '\n' + codeToExec

        # to make sure line # in errors is right we need to pad codeToExec with newlines
        numLinesToAdd = len(savedLines.split('\n')) - len(imports.split('\n'))
        for i in range(numLinesToAdd):
            codeToExec = '\n' + codeToExec

    return codeToExec


def exec_input(codeToExec, savedLines=""):
    """
    returns info about the executed code (local vars, errors, and timing)
    :rtype: returnInfoJson
    """

    evalLocals = get_eval_locals_from_saved(savedLines)

    # re-import imports. (pickling imports from saved code was unfortunately not possible)
    codeToExec = copy_saved_imports_to_exec(codeToExec, savedLines)

    try:
        start = time()
        exec(codeToExec, evalLocals)
        execTime = time()-start
    except Exception:
        errorMsg = traceback.format_exc()        
        raise UserError(errorMsg, evalLocals)

    userVariables = pickle_user_vars(evalLocals)

    return returnInfoJson("", userVariables, execTime, None)


if __name__ == '__main__':

    while True:
        
        try:
            data = json.loads(input())
            data = execArgs(**data)
        except json.JSONDecodeError as e:
            # probably just due to user passing in stdin to program without input
            # in which case program completes and we get the stdin, which we ignore
            print('6q3co6' + str(e))
            continue

        start = time()
        returnInfo = returnInfoJson("",{},None,None)

        try:
            returnInfo = exec_input(data.evalCode, data.savedCode)
        except (KeyboardInterrupt, SystemExit):
            raise
        except UserError as e:
            errorMsg = str(e).replace("\n", "\\n")
            returnInfo.ERROR = errorMsg
            returnInfo.userVariables = e.varsSoFar
        except Exception:
            errorMsg = traceback.format_exc()
            errorMsg = errorMsg.replace("\n", "\\n")
            returnInfo.ERROR = "Sorry, AREPL has ran into an error\\n\\n" + errorMsg

        returnInfo.totalPyTime = time() - start

        # 6q3co7 signifies to frontend that stdout is not due to a print in user's code
        print('6q3co7' + json.dumps(returnInfo, default=lambda x:x.__dict__))