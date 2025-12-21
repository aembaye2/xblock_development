"""Tests for DiagramXBlock save_quiz handler"""

import unittest
from unittest import TestCase
from xblock.fields import ScopeIds
from xblock.test.toy_runtime import ToyRuntime

from diagram import DiagramXBlock


class TestDiagramSaveQuiz(TestCase):
    def test_save_quiz_updates_fields(self):
        """Calling the save_quiz json handler should return success and update fields."""
        scope_ids = ScopeIds('user', 'course', 'block', 'usage')
        block = DiagramXBlock(ToyRuntime(), scope_ids=scope_ids)

        payload = {
            'question': 'Updated question from test',
            'max_attempts': 5,
            'weight': 3.5,
            'has_score': False,
            'index': 7,
            'AssessName': 'test-assess',
            'canvasWidth': 640,
            'canvasHeight': 480,
            'scaleFactors': [1, 2, 3, 4, 5, 6],
            'bgnumber': 2,
            'visibleModes': ['point', 'line', 'rect'],
            'axisLabels': ['X label', 'Y label'],
            'hideLabels': True,
            'initialDiagram': [{'type': 'rect', 'left': 10, 'top': 20}],
        }

        result = block.save_quiz(payload)

        # Handler should return a success dict
        self.assertIsInstance(result, dict)
        self.assertEqual(result.get('result'), 'success')

        # Fields on the block instance should be updated
        self.assertEqual(block.question, payload['question'])
        self.assertEqual(int(block.max_attempts), int(payload['max_attempts']))
        self.assertAlmostEqual(float(block.weight), float(payload['weight']))
        self.assertEqual(bool(block.has_score), bool(payload['has_score']))
        self.assertEqual(int(block.index), int(payload['index']))
        self.assertEqual(block.AssessName, payload['AssessName'])
        self.assertEqual(int(block.canvasWidth), int(payload['canvasWidth']))
        self.assertEqual(int(block.canvasHeight), int(payload['canvasHeight']))
        self.assertEqual(list(block.scaleFactors), list(payload['scaleFactors']))
        self.assertEqual(int(block.bgnumber), int(payload['bgnumber']))
        # visibleModes is the camelCase field; ensure it was set
        self.assertEqual(list(block.visibleModes), list(payload['visibleModes']))
        # axis_labels is stored with snake_case backing field
        self.assertEqual(list(block.axis_labels), list(payload['axisLabels']))
        self.assertEqual(bool(block.hideLabels), bool(payload['hideLabels']))
        self.assertEqual(list(block.initial_diagram), list(payload['initialDiagram']))
