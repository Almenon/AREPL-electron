import unittest
import pythonEvaluator
import jsonpickle


class TestPythonEvaluator(unittest.TestCase):

    def test_simple_code(self):
        returnInfo = pythonEvaluator.exec_input("x = 1")
        assert jsonpickle.decode(returnInfo['userVariables'])['x'] == 1

    def test_special_floats(self):
        returnInfo = pythonEvaluator.exec_input("""
x = float('infinity')
y = float('nan')
z = float('-infinity')
        """)
        assert jsonpickle.decode(returnInfo['userVariables'])['x'] == "Infinity"
        assert jsonpickle.decode(returnInfo['userVariables'])['y'] == "NaN"
        assert jsonpickle.decode(returnInfo['userVariables'])['z'] == "-Infinity"

    def test_import_does_not_show(self):
        # we only show local vars to user, no point in showing modules
        returnInfo = pythonEvaluator.exec_input("import json")
        assert jsonpickle.decode(returnInfo['userVariables']) == {}

if __name__ == '__main__':
    unittest.main()