import json
import traceback
import jsonpickle

jsonpickle.set_encoder_options('json', ensure_ascii=False)


def get_json_input():
    return json.loads(input())
    # input look something like this {
    # 	setting: "SETUP" | "",
    # 	setupCode: "x=1", (to be used in future)
    # 	evalCode: "x=1"
    # }

while True:
    data = get_json_input()

    evalLocals = {}
    returnInfo = {
        'ERROR':"",
        'userVariables':""
    }

    try:
        exec(data['evalCode'], evalLocals)
    except (KeyboardInterrupt, SystemExit):
        raise
    except Exception:
        errorMsg = traceback.format_exc()
        errorMsg = errorMsg.replace("\n", "\\n")
        returnInfo['ERROR'] = errorMsg

    # filter out non-user vars, no point in showing them
    userVariables = {k:v for k,v in evalLocals.items() if str(type(v)) != "<class 'module'>" and k != "__builtins__"}

    # json dumps cant handle any object type, so we need to use jsonpickle
    # still has limitations but can handle much more
    returnInfo['userVariables'] = jsonpickle.encode(userVariables)

    # 6q3co7 signifies to frontend that stdout is not due to a print in user's code
    print('6q3co7' + json.dumps(returnInfo))