import re
import datetime
from jsonpickle.handlers import BaseHandler

class DatetimeHandler(BaseHandler):
    ### better represention of datetime, see https://github.com/jsonpickle/jsonpickle/issues/109 ###
    def flatten(self, obj, data):
        x = {"date/time": str(obj)}
        return x

class regexMatchHandler(BaseHandler):
    ### better represention of datetime, see https://github.com/jsonpickle/jsonpickle/issues/109 ###
    def flatten(self, obj, data):
        return {
            "py/object": "_sre.SRE_Match",
            "match": obj.group(0),
            "groups": obj.groups(),
            "span": obj.span()
        }

handlers = [
    {
        'type':datetime.date,
        'handler':DatetimeHandler
    },
    {
        'type':datetime.time,
        'handler':DatetimeHandler
    },
    {
        'type':datetime.datetime,
        'handler':DatetimeHandler
    },
    {
        'type':type(re.search('','')),
        'handler':regexMatchHandler
    },
]