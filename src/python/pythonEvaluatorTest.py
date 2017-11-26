import unittest
import pythonEvaluator
import jsonpickle


class TestPythonEvaluator(unittest.TestCase):

    def test_simple_code(self):
        returnInfo = pythonEvaluator.exec_input("x = 1")
        assert jsonpickle.decode(returnInfo.userVariables)['x'] == 1

    def test_special_floats(self):
        returnInfo = pythonEvaluator.exec_input("""
x = float('infinity')
y = float('nan')
z = float('-infinity')
        """)
        assert jsonpickle.decode(returnInfo.userVariables)['x'] == "Infinity"
        assert jsonpickle.decode(returnInfo.userVariables)['y'] == "NaN"
        assert jsonpickle.decode(returnInfo.userVariables)['z'] == "-Infinity"

    def test_import_does_not_show(self):
        # we only show local vars to user, no point in showing modules
        returnInfo = pythonEvaluator.exec_input("import json")
        assert jsonpickle.decode(returnInfo.userVariables) == {}

    def test_save(self):
        returnInfo = pythonEvaluator.exec_input("","from random import random\nx=random()#$save")
        randomVal = jsonpickle.decode(returnInfo.userVariables)['x']
        returnInfo = pythonEvaluator.exec_input("z=3","from random import random\nx=random()#$save")
        assert jsonpickle.decode(returnInfo.userVariables)['x'] == randomVal

    def test_import(self): # imports in saved section should be able to be referenced in exec section
        returnInfo = pythonEvaluator.exec_input("z=math.sin(0)","import math#$save")
        assert jsonpickle.decode(returnInfo.userVariables)['z'] == 0

    def test_has_error(self):
        with self.assertRaises(pythonEvaluator.UserError):
            returnInfo = pythonEvaluator.exec_input("x")

#   class pickling does work - but not when unit testing for some reason
#   "Can't pickle <class 'pythonEvaluator.l'>: it's not found as pythonEvaluator.l"
#   not sure why it's trying to find the class in pythonEvaluator - it's not going to be there
#   todo: investigate issue

#    def test_can_pickle_class(self):
#         code = """
# class l():
# 	def __init__(self,x):
# 		self.x = x  #$save"""
#         returnInfo = pythonEvaluator.exec_input("",code)
#         randomVal = jsonpickle.decode(returnInfo['userVariables'])['l']
#         returnInfo = pythonEvaluator.exec_input("z=3",code)
#         randomVal = jsonpickle.decode(returnInfo['userVariables'])['l']

if __name__ == '__main__':
    unittest.main()