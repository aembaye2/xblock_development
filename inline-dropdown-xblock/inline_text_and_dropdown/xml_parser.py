"""  XML Parser for Inline Text and Dropdown XBlock """
import ast
import re
from io import StringIO
from itertools import chain

from lxml import etree
from lxml.etree import CDATA, Element, ElementTree, SubElement

NEW_LINE = '\n'


class XmlParser:
    """
    Parses XML to Text and vice versa.
    """

    def convert_to_xml(self, markdown_data):
        """
        Text to xml converter

        Converts text according to markdown symbols

        :param markdown_data: string
        :return: formed xml as string
        """
        # Get values in the [] brackets and update it to the input tag with id
        match_criteria = re.findall(r'\[\[[^][]*]\]|\[[^][]*]', markdown_data)
        counter = 0
        problem_inputs = {}

        for el in match_criteria:
            if re.search(r'(\[\[|\[\=)', el):
                counter += 1
                problem_inputs['<input_ref input="i{}"/>'.format(counter)] = el

        # Create xml
        root = Element('inline_text_and_dropdown')
        root.set('schema_version', '1')
        body = SubElement(root, 'body')

        # Form input tag according to id and add problems xml to the root
        problems = self.build_xml_problems(root, problem_inputs)

        # As soon as problems xml is formed - update markdown_data with tags instead of problems in markdown format
        for tag, problem in sorted(problem_inputs.items()):
            markdown_data = markdown_data.replace(problem, tag, 1)

        separated_data = markdown_data.splitlines()
        demand_hints, body_data = self.separate_hints_from_body(separated_data)

        # Form body tag and add children
        self.build_xml_body(body, body_data, problems)

        # Add hints to the xml
        if demand_hints:
            self.add_hints_to_xml(root, demand_hints)

        return etree.tostring(root, pretty_print=True, encoding='unicode')

    def convert_to_markdown(self, xml_data):
        """
        Xml to text converter.

        Converts xml to user friendly text with markdown.

        :param xml_data: string with xml structure
        :return: formed string
        """

        tree = etree.parse(StringIO(xml_data))

        input_fields = {}
        prepared_data = []

        self.prepare_dropdown_options_for_markdown(tree, input_fields)
        self.prepare_text_inputs_for_markdown(tree, input_fields)
        self.prepare_body_for_markdown(tree, prepared_data, input_fields)
        self.prepare_hints_for_markdown(tree, prepared_data)

        return ''.join(prepared_data)

    @staticmethod
    def stringify_p_tag(node, input_fields):
        """
        Parses the <p> tag and get all it's values, swap input tags to it's text view.
        """
        node_children_text_and_tails = list(
            chain(*([c.text, etree.tostring(c, encoding=str, with_tail=False), c.tail] for c in node.getchildren()))
        )
        parts = list(filter(None, ([node.text] + node_children_text_and_tails)))
        for el in parts:
            if 'input_ref' in el:
                input_id = etree.fromstring(el).attrib['input']
                input_ref = '{}'.format(input_fields[input_id])
                parts[parts.index(el)] = input_ref
        parts.append(NEW_LINE)

        return ''.join(parts)

    @staticmethod
    def build_xml_problems(root, problems):
        """
        Build xml part for problems.
        """
        problem_ids = {}
        id_index = 1
        reg = ('[', ']')
        for key, value in sorted(problems.items()):
            problem_id = key.split('"')[id_index]
            problem_ids[key] = problem_id
            for i in reg:
                value = value.replace(i, '')
            if value.startswith('='):
                possible_answers = value.split(' or= ')
                # First element in the possible answer is always answer, separate it from additional answers
                answer = possible_answers.pop(0).replace('= ', '')
                string_response = SubElement(root, 'stringresponse', id=problem_id, answer=answer)

                for additional_answer in possible_answers:
                    SubElement(string_response, 'additional_answer', answer=additional_answer)
            else:
                options = value.split(', ')
                option_response = SubElement(root, 'optionresponse')
                option_input = SubElement(option_response, 'optioninput', id=problem_id)
                for item in options:
                    correct = False
                    if item.startswith('('):
                        correct = True
                        item = item.replace('(', '').replace(')', '')
                    option = SubElement(option_input, 'option', correct=str(correct))
                    option.text = item
        return problem_ids

    @staticmethod
    def build_xml_body(body, separated_data, problems):
        """
        Build xml part for body.
        """
        tag_index = 0
        tail_index = 1
        for el in separated_data:
            p_tag = [i for i in re.split('(<input_ref[^<]*)', el) if i]
            if p_tag:
                for value in p_tag:
                    if value.startswith('<input_ref'):
                        text_with_tag = [i for i in re.split('(<[^>]*>)', value) if i]
                        input_id = problems.get(text_with_tag[tag_index])
                        if input_id:
                            input_ref = SubElement(p, 'input_ref', input=input_id)
                            input_ref.tail = text_with_tag[tail_index] if len(text_with_tag) > 1 else None
                        continue
                    p = SubElement(body, 'p')
                    p.text = value
            if not el:
                SubElement(body, 'br')

    @staticmethod
    def separate_hints_from_body(separated_data):
        """
        Separate hints from the body.
        """
        demand_hints = []
        for el in separated_data:
            if el.startswith('[demandhint]'):
                demand_hints.append(el)
        body_data = [i for i in separated_data if i not in demand_hints]
        return demand_hints, body_data

    @staticmethod
    def add_hints_to_xml(root, demand_hints):
        """
        Adds hints to xml.
        """
        demand_hints_tag = SubElement(root, 'demandhint')
        for demand_hint in demand_hints:
            hints = filter(bool, demand_hint.splitlines())
            for hint in hints:
                hint = hint.replace('[demandhint]', '')
                hint_tag = SubElement(demand_hints_tag, 'hint')
                hint_tag.text = hint

    @staticmethod
    def prepare_dropdown_options_for_markdown(tree, input_fields):
        """
        Gets optioninput data from xml for the dropdown options and collects it in proper format.
        """
        for optioninput in tree.iter('optioninput'):
            input_id = optioninput.get('id')
            answers = []
            for option in optioninput:
                text = option.text
                if ast.literal_eval(option.attrib['correct']):
                    text = '({})'.format(text)
                answers.append(text)
            options = '[[{}]]'.format(', '.join(answers))
            input_fields[input_id] = options

    @staticmethod
    def prepare_text_inputs_for_markdown(tree, input_fields):
        """
        Gets stringresponse data from xml for the text inputs and collects it in proper format.
        """
        additional_answer_string = ''
        for stringinput in tree.iter('stringresponse'):
            input_id = stringinput.get('id')
            answer = stringinput.get('answer')
            if stringinput.getchildren():
                additional_answers = []
                for i in stringinput.getchildren():
                    additional_answers.append(' or= {}'.format(i.get('answer')))
                    additional_answer_string = ''.join(additional_answers)

            string_answer = '[= {}{}]'.format(answer, additional_answer_string)
            input_fields[input_id] = string_answer

    def prepare_body_for_markdown(self, tree, prepared_data, input_fields):
        """
        Gets body from xml and adds it to the prepared data.
        """
        for element in tree.xpath('//body'):
            for value in element.iterchildren():
                if value.tag == 'p':
                    vop = self.stringify_p_tag(value, input_fields)
                elif value.tag == 'br':
                    vop = NEW_LINE
                prepared_data.append(vop)

    @staticmethod
    def prepare_hints_for_markdown(tree, prepared_data):
        """
        Gets demandhint from xml and adds it to the prepared data.
        """
        demand_hints = tree.find('demandhint')
        if demand_hints:
            for hint in demand_hints:
                hint = '[demandhint]{}[demandhint]'.format(hint.text)
                prepared_data.append(hint)
                prepared_data.append(NEW_LINE)
