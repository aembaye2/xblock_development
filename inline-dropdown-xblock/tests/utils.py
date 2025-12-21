"""
Utils method for tests.
"""

from io import StringIO

from lxml import etree
from lxml.etree import CDATA, Element, ElementTree, SubElement

from tests.data import testdata


def xml_string_to_xml(xml_string=None):
    """Gets string and converts to XML object"""
    xml_string = xml_string or testdata.xml_data_default
    return etree.parse(StringIO(xml_string))


def create_xml_skeleton():
    """Create root xml with empty body"""
    root = Element('inline_text_and_dropdown')
    root.set('schema_version', '1')
    body = SubElement(root, 'body')
    return root, body
