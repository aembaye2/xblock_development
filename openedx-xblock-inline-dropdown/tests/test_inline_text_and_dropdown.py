"""
Test cases to cover InlineTextAndDropdownXBlock functionality for InlineTextAndDropdownXBlock.
"""

import unittest
from io import StringIO

from inline_text_and_dropdown.inline_text_and_dropdown import InlineTextAndDropdownXBlock as InlineBlock
from lxml import etree
from mock import patch
from tests.data import testdata


class TestInlineTextAndDropdownXBlock(unittest.TestCase):
    """
    Tests for InlineTextAndDropdownXBlock.
    """

    @patch('inline_text_and_dropdown.InlineTextAndDropdownXBlock')
    def test_do_shuffle(self, mock_xblock):
        """
        Verify that options are shuffled.
        """
        mock_xblock.runtime.seed = 1
        expected_options = ['pineapple', 'banana', 'pear', 'apple']
        options = list(testdata.options_for_shuffle)
        actual_result = InlineBlock.do_shuffle(mock_xblock, options)
        self.assertEqual(actual_result, expected_options)

    @patch('inline_text_and_dropdown.InlineTextAndDropdownXBlock')
    def test_do_shuffle_with_another_seed(self, mock_xblock):
        """
        Verify that options shuffled differently with another seed.
        """
        mock_xblock.runtime.seed = 8
        expected_options = ['banana', 'pear', 'pineapple', 'apple']
        options = list(testdata.options_for_shuffle)
        actual_result = InlineBlock.do_shuffle(mock_xblock, options)
        self.assertEqual(actual_result, expected_options)

    @patch('inline_text_and_dropdown.InlineTextAndDropdownXBlock')
    def test_problem_with_randomize_disabled(self, mock_xblock):
        """
        Verify that dropdown options are not randomized if randomization is disabled.
        """
        xml = testdata.xml_data_expanded
        tree = etree.parse(StringIO(xml))
        options = [item for item in tree.iter() if item.tag == 'option'][::-1]
        expected_result = testdata.options_string_data
        mock_xblock.do_shuffle.return_value = options
        mock_xblock.randomize = False

        actual_result = InlineBlock._get_body(mock_xblock, xml)

        mock_xblock.do_shuffle.assert_not_called()
        self.assertIn(expected_result, actual_result)

    @patch('inline_text_and_dropdown.InlineTextAndDropdownXBlock')
    def test_problem_with_randomize_enabled(self, mock_xblock):
        """
        Verify that dropdown options are randomized if randomization is enabled.
        """
        xml = testdata.xml_data_expanded
        tree = etree.parse(StringIO(xml))
        options = [item for item in tree.iter() if item.tag == 'option'][::-1]
        expected_result = testdata.options_string_data_randomized
        mock_xblock.do_shuffle.return_value = options
        mock_xblock.randomize = True

        actual_result = InlineBlock._get_body(mock_xblock, xml)

        mock_xblock.do_shuffle.assert_called()
        self.assertIn(expected_result, actual_result)
