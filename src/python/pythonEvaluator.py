import json
import traceback
import jsonpickle
from copy import deepcopy

jsonpickle.set_encoder_options('json', ensure_ascii=False)

# copy all special vars (we want execd code to have similar locals as actual code)
# not copying builtins cause exec adds it in
# also when specialVars is deepCopied later on deepcopy cant handle builtins anyways
startingLocals = {}
specialVars = ['__doc__', '__file__', '__loader__', '__name__', '__package__', '__spec__']
for var in specialVars:
    startingLocals[var] = locals()[var]

def get_json_input():
    """
    input looks something like this {
    	setting: "SETUP" | "",
    	setupCode: "x=1", (to be used in future)
    	evalCode: "x=1"
    }
    """
    return json.loads(input())

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
        data = get_json_input()
        returnInfoJSON = exec_input(data['evalCode'])
        # 6q3co7 signifies to frontend that stdout is not due to a print in user's code
        print('6q3co7' + json.dumps(returnInfoJSON))