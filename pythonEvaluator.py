import json
import jsonpickle
import traceback

jsonpickle.set_encoder_options('json', ensure_ascii=False)


def get_json_input():
    return json.loads(input())
    # input look something like this {
    # 	setting: "SETUP" | "",
    # 	setupCode: "x=1", (to be used in future)
    # 	evalCode: "x=1"
    # }


def print_results(results):
    # frontend knows R is followed by results
    print('R' + jsonpickle.encode(results))

while True:
    data = get_json_input()

    evalLocals = {}

    try:
        exec(data['evalCode'], evalLocals)
    except (KeyboardInterrupt, SystemExit):
        raise
    except Exception as e:
        # escape newlines in traceback to avoid multiple prints.  Simpler for frontend to pick it up
        errorMsg = traceback.format_exc().replace("\n","\\n")
        # frontend knows ERROR is followed by traceback
        print('ERROR' + errorMsg)
        continue

    # filter out non-user vars, no point in showing them
    userVariables = {k:v for k,v in evalLocals.items() if str(type(v)) != "<class 'module'>" and k != "__builtins__"} 
    print_results(userVariables)