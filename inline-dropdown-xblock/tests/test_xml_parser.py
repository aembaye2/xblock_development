"""
Test cases to cover XmlParser for InlineTextAndDropdownXBlock.
"""

import unittest

from lxml import etree

from inline_text_and_dropdown.xml_parser import XmlParser
from tests.data import testdata
from tests.utils import xml_string_to_xml, create_xml_skeleton

NEW_HINT = '[demandhint]New added hint[demandhint]'


class TestXmlParser(unittest.TestCase):
    """
    Tests that cover converting xml to markdown and vice versa.
    """

    def test_convert_to_xml(self):
        """
        Verify converting markdown to xml.
        """
        parser = XmlParser()
        result = XmlParser.convert_to_xml(parser, testdata.markdown_data)
        self.assertEqual(result, testdata.xml_data_default)

    def test_convert_to_markdown(self):
        """
        Verify converting xml to markdown.
        """
        parser = XmlParser()
        result = XmlParser.convert_to_markdown(parser, testdata.xml_data_default)
        self.assertEqual(result, testdata.markdown_data)

    def test_build_xml_problems(self):
        """
        Verify build xml part for problems.
        """
        root, body = create_xml_skeleton()
        result = XmlParser.build_xml_problems(root, testdata.problem_inputs)
        self.assertEqual(
            etree.tostring(root, pretty_print=True, encoding='unicode'),
            testdata.xml_data_with_added_dropdown
        )
        self.assertEqual(result, testdata.problem_ids)

    def test_separate_hints_from_body(self):
        """
        Verify separating hints from body.
        """
        demand_hints, body = XmlParser.separate_hints_from_body(testdata.prepared_markdown_with_hint.splitlines())
        self.assertEqual(demand_hints, testdata.demand_hints)
        self.assertEqual(body, testdata.separated_body)

    def test_separate_hints_from_body_with_empty_hints(self):
        """
        Verify separating hints from body which doesn't contains hints.
        """
        body_without_hints = testdata.prepared_markdown_with_hint.splitlines()[:-1]
        demand_hints, body = XmlParser.separate_hints_from_body(body_without_hints)
        self.assertFalse(demand_hints)
        self.assertEqual(body, testdata.body_without_hints)

    def test_separate_hints_from_body_with_multiple_hints(self):
        """
        Verify separating multiple hints from body.
        """
        data = testdata.prepared_markdown_with_hint.splitlines()
        data.append(NEW_HINT)
        expected_hints = testdata.demand_hints.copy()
        expected_hints.append(NEW_HINT)

        demand_hints, body = XmlParser.separate_hints_from_body(data)
        self.assertEqual(demand_hints, expected_hints)
        self.assertEqual(body, testdata.separated_body)

    def test_separate_hints_from_body_with_multiple_p_tags(self):
        """
        Verify separating hints from body with multiple paragraphs.
        """
        data = testdata.prepared_markdown_with_multiple_p_tags_and_hint.splitlines()
        demand_hints, body = XmlParser.separate_hints_from_body(data)
        self.assertEqual(demand_hints, testdata.demand_hints)
        self.assertEqual(body, testdata.separated_body_with_multiple_p_tags)

    def test_build_xml_body_with_single_p_tag(self):
        """
        Verify building xml body from markdown for body with single paragraph.
        """
        root, body = create_xml_skeleton()
        XmlParser.build_xml_body(body, testdata.separated_body, testdata.problem_ids)

        self.assertEqual(etree.tostring(body, pretty_print=True, encoding='unicode'), testdata.xml_body_single_p_tag)

    def test_build_xml_body_with_multiple_p_tags(self):
        """
        Verify building xml body from markdown for body with multiple paragraphs.
        """
        root, body = create_xml_skeleton()
        XmlParser.build_xml_body(body, testdata.separated_body_with_multiple_p_tags, testdata.problem_ids)
        self.assertEqual(
            etree.tostring(body, pretty_print=True, encoding='unicode'),
            testdata.xml_body_multiple_p_tags
        )

    def test_add_hints_to_xml(self):
        """
        Verify adding hints to xml according to markdown.
        """
        root, body = create_xml_skeleton()
        demand_hints = testdata.demand_hints.copy()
        demand_hints.append(NEW_HINT)
        XmlParser.add_hints_to_xml(root, demand_hints)
        self.assertEqual(
            etree.tostring(root, pretty_print=True, encoding='unicode'),
            testdata.xml_root_with_demandhint
        )

    def test_prepare_dropdown_options_for_markdown(self):
        """
        Verify that dropdown xml tag is parsed correctly for the markdown.
        """
        tree = xml_string_to_xml()
        expected_options_length = len(tree.findall('optionresponse'))
        input_fields = {}
        XmlParser.prepare_dropdown_options_for_markdown(tree, input_fields)
        self.assertEqual(len(input_fields), expected_options_length)
        self.assertEqual(input_fields, testdata.prepared_dropdown_data)

    def test_prepare_text_inputs_for_markdown(self):
        """
        Verify that text input xml tag is parsed correctly for the markdown.
        """
        tree = xml_string_to_xml()
        expected_inputs_length = len(tree.findall('stringresponse'))
        input_fields = {}
        XmlParser.prepare_text_inputs_for_markdown(tree, input_fields)
        self.assertEqual(len(input_fields), expected_inputs_length)
        self.assertEqual(input_fields, testdata.prepared_input_text_data)

    def test_stringify_p_tag(self):
        """
        Verify that paragraph is converted to string properly for markdown.
        """
        p_tag = xml_string_to_xml().find('//body/p')
        p_string = XmlParser.stringify_p_tag(p_tag, testdata.prepared_input_fields)
        self.assertEqual(p_string, testdata.p_string_tag)

    def test_prepare_body_for_markdown(self):
        """
        Verify that body parsed correctly for markdown.
        """
        parser = XmlParser()
        input_fields = testdata.prepared_input_fields
        prepared_data = []
        XmlParser.prepare_body_for_markdown(parser, xml_string_to_xml(), prepared_data, input_fields)
        self.assertEqual(prepared_data, testdata.prepared_body)

    def test_prepare_hints_for_markdown(self):
        """
        Verify that hints parsed correctly for markdown.
        """
        tree = xml_string_to_xml(testdata.xml_root_with_demandhint)
        prepared_data = []
        XmlParser.prepare_hints_for_markdown(tree, prepared_data)
        self.assertEqual(prepared_data, testdata.prepared_demand_hints)
