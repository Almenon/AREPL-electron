from copy import deepcopy
from customHandlers import handlers
import json
import jsonpickle
import traceback
from math import isnan


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

def exec_input(codeToExec):
    """
    returns the jsonpickled local variables and any errors
    {userVariables: '', ERROR: ''}
    """
    evalLocals = deepcopy(startingLocals)
    returnInfo = {
        'ERROR':"",
        'userVariables':""
    }

    try:
        exec(codeToExec, evalLocals)
    except (KeyboardInterrupt, SystemExit):
        raise
    except Exception:
        errorMsg = traceback.format_exc()
        errorMsg = errorMsg.replace("\n", "\\n")
        returnInfo['ERROR'] = errorMsg

    # filter out non-user vars, no point in showing them
    userVariables = {k:v for k,v in evalLocals.items() if str(type(v)) != "<class 'module'>"
                     and k not in specialVars+['__builtins__']}

    # json dumps cant handle any object type, so we need to use jsonpickle
    # still has limitations but can handle much more
    try:
        returnInfo['userVariables'] = jsonpickle.encode(userVariables, max_depth=100) # any depth above 245 resuls in error and anything above 100 takes too long to process
    except (KeyboardInterrupt, SystemExit):
        raise
    except Exception:
        errorMsg = traceback.format_exc()
        errorMsg = errorMsg.replace("\n", "\\n")
        returnInfo['ERROR'] = "There has been a error when trying to display your variables. Sorry :( \n\n" + errorMsg

    return returnInfo


if __name__ == '__main__':
    while True:
        data = input()
        try:
            data = json.loads(data)
        except json.JSONDecodeError as e:
            # probably just due to user passing in stdin to program without input
            # in which case program completes and we get the stdin, which we ignore
            print('6q3co6' + str(e))
            continue
        returnInfoJSON = exec_input(data['evalCode'])
        # 6q3co7 signifies to frontend that stdout is not due to a print in user's code
        print('6q3co7' + json.dumps(returnInfoJSON))