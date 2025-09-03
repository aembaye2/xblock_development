""" Inline Text and Dropdown XBlock main Python class"""

import logging
import random
import textwrap
from io import StringIO

import pkg_resources
from django.template import Context, Template
from django.utils.translation import gettext as _
from django.utils.translation import ngettext
from lxml import etree
from lxml.etree import Element, ElementTree, SubElement
from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import Boolean, Dict, Float, Integer, List, Scope, String
from xblockutils.resources import ResourceLoader
from xblockutils.settings import ThemableXBlockMixin, XBlockWithSettingsMixin
try:
    from xmodule.progress import Progress
except Exception:
    # xmodule is provided by Open edX; provide a lightweight local fallback
    class Progress:
        """Minimal fallback for xmodule.progress.Progress used in get_progress()."""
        def __init__(self, earned, possible):
            self.earned = earned
            self.possible = possible
            try:
                self.progress = float(earned) / float(possible) if possible else 0.0
            except Exception:
                self.progress = 0.0

        def __repr__(self):
            return f"Progress(earned={self.earned}, possible={self.possible})"

from inline_text_and_dropdown.xml_parser import XmlParser

log = logging.getLogger(__name__)
loader = ResourceLoader(__name__)


@XBlock.needs('i18n')
class InlineTextAndDropdownXBlock(XBlock, XBlockWithSettingsMixin, ThemableXBlockMixin):
    """
    Icon of the XBlock. Values : [other (default), video, problem]
    """
    icon_class = 'problem'

    """
    Fields
    """
    display_name = String(
        display_name=_('Display Name'),
        default=_('Inline Text and Dropdown'),
        scope=Scope.settings,
        help=_('This name appears in the horizontal navigation at the top of the page'))

    hints = List(
        default=[],
        scope=Scope.content,
        help=_('Hints for the question'),
    )

    question_string = String(
        help=_('Default question content '),
        scope=Scope.content,
        default=textwrap.dedent("""
            <inline_text_and_dropdown schema_version="1">
                <body>
                    <p>A fruit is the fertilized ovary of a tree or plant and contains seeds. Given this, a <input_ref input="i1"/> is consider a fruit, while a <input_ref input="i2"/> is considered a vegetable. This text field should be filled with the correct answer <input_ref input="i3"/> and submitted.</p>
                </body>
                <optionresponse>
                	<optioninput id="i1">
                		<option correct="True">tomato</option>
                		<option correct="False">potato</option>
                	</optioninput>
                </optionresponse>
                <optionresponse>
                	<optioninput id="i2">
                		<option correct="False">cucumber</option>
                		<option correct="True">onion</option>
                	</optioninput>
                </optionresponse>
                <stringresponse answer="the correct answer" id="i3">
                    <additional_answer answer="optional acceptable variant of the correct answer"/>
                    <additional_answer answer="correct"/>
	            </stringresponse>
            </inline_text_and_dropdown>
        """))

    score = Float(
        default=0.0,
        scope=Scope.user_state,
    )

    correctness = Dict(
        help=_('Correctness of input values'),
        scope=Scope.user_state,
        default={},
    )

    answers_order = Dict(
        help=_('Order of selections in body'),
        scope=Scope.user_state,
        default={},
    )

    answers = Dict(
        help=_('Saved student input values'),
        scope=Scope.user_state,
        default={},
    )

    student_correctness = Dict(
        help=_('Saved student correctness values'),
        scope=Scope.user_state,
        default={},
    )

    feedback = Dict(
        help=_('Feedback for input values'),
        scope=Scope.user_state,
        default={},
    )

    current_feedback = String(
        help=_('Current feedback state'),
        scope=Scope.user_state,
        default='',
    )

    completed = Boolean(
        help=_('Indicates whether the learner has completed the problem at least once'),
        scope=Scope.user_state,
        default=False,
    )

    weight = Integer(
        display_name=_('Weight'),
        help=_('This assigns an integer value representing the weight of this problem'),
        default=2,
        scope=Scope.settings,
    )
    randomize = Boolean(
        display_name=_('Randomize'),
        help=_('Enable randomization of the dropdown values.'),
        scope=Scope.settings,
        default=False
    )
    show_correctness = Boolean(
        display_name=_('Show Correctness'),
        help=_('Enable displaying grades and correctness for answers'),
        scope=Scope.settings,
        default=False
    )
    show_reset_button = Boolean(
        display_name=_('Show Reset Button'),
        help=_('Determines whether a \'Reset\' button is shown so the user may reset their answer.'),
        scope=Scope.settings,
        default=False
    )
    seed = Integer(
        help=_("Random seed for this student"),
        scope=Scope.user_state
    )
    enable_advanced_editor = Boolean(
        display_name=_('Enable Advanced Editor'),
        help=_('If enabled - changes the editor to advanced mode with xml editing.'),
        scope=Scope.settings,
        default=False
    )
    has_score = True

    """
    Main functions
    """
    def student_view(self, context=None):
        """
        The primary view of the XBlock, shown to students when viewing courses.
        """
        problem_progress = self._get_problem_progress()
        prompt = self._get_body(self.question_string)

        attributes = ''
        context = {
            'display_name': self.display_name,
            'problem_progress': problem_progress,
            'attributes': attributes,
            'show_correctness': self.show_correctness,
            'show_reset_button': self.show_reset_button,
        }
        html = self.render_template('static/html/inline_text_and_dropdown_view.html', context)
        frag = Fragment(html.format(prompt=prompt))
        frag.add_css(self.resource_string('static/css/inline_text_and_dropdown.css'))
        frag.add_javascript(self.resource_string('static/js/inline_text_and_dropdown_view.js'))
        frag.initialize_js('InlineTextAndDropdownXBlockInitView')
        return frag

    def studio_view(self, context=None):
        """
        The secondary view of the XBlock, shown to teachers when editing the XBlock.
        """
        xml_data = self.question_string
        markdown_data = ''

        if not self.enable_advanced_editor:
            markdown_data = XmlParser().convert_to_markdown(xml_data)

        context = {
            'display_name': self.display_name,
            'weight': self.weight,
            'randomize': self.randomize,
            'show_correctness': self.show_correctness,
            'show_reset_button': self.show_reset_button,
            'enable_advanced_editor': self.enable_advanced_editor,
            'xml_data': xml_data if self.enable_advanced_editor else markdown_data,
        }

        frag = Fragment()
        frag.add_content(loader.render_django_template('static/html/inline_text_and_dropdown_edit.html',
                                                       context=context,
                                                       i18n_service=self.i18n_service))
        frag.add_css(self.resource_string('static/css/inline_text_and_dropdown_edit.css'))
        frag.add_javascript(self.load_resource('static/js/inline_text_and_dropdown_edit.js'))
        frag.initialize_js('InlineTextAndDropdownXBlockInitEdit')
        return frag

    def max_score(self):
        """
        Returns the configured number of possible points for this component.
        Arguments:
            None
        Returns:
            float: The number of possible points for this component
        """
        return self.weight if self.has_score else None

    @XBlock.json_handler
    def student_submit(self, submissions, suffix=''):
        """
        Save student answer
        """

        self.answers = submissions['answers']
        self.answers_order = submissions['answers_order']

        self.current_feedback = ''

        correct_count = 0

        # use sorted selection_order to iterate through selections dict
        for key, pos in sorted(self.answers_order.items(), key=lambda kv: (kv[1], kv[0])):
            answer = self.answers.get(key)
            is_correct_selection = self.correctness[key].get(answer)
            is_correct_text_input = self.get_correct_answer_for_text_input(answer, key)
            if is_correct_selection == 'True' or is_correct_text_input:
                default_feedback = '<p class="correct"><strong>({}) {}</strong></p>'.format(pos, _('Correct'))
                if answer in self.feedback[key]:
                    if self.feedback[key][answer]:
                        self.current_feedback += '<p class="correct"><strong>({}) {}: </strong>{}</p>'\
                            .format(pos, _('Correct'), self.feedback[key][answer])
                    else:
                        self.current_feedback += default_feedback
                else:
                    self.current_feedback += default_feedback
                self.student_correctness[key] = 'True'
                correct_count += 1
            else:
                default_feedback = '<p class="incorrect"><strong>({}) {}</strong></p>'.format(pos, _('Incorrect'))
                if answer in self.feedback[key]:
                    if self.feedback[key][answer]:
                        self.current_feedback += '<p class="incorrect"><strong>({}) {}: </strong>{}</p>'\
                            .format(pos, _('Incorrect'), self.feedback[key][answer])
                    else:
                        self.current_feedback += default_feedback
                else:
                    self.current_feedback += default_feedback
                self.student_correctness[key] = 'False'

        if not self.show_correctness:
            self.current_feedback = _('Answer submitted.')

        self.score = float(self.weight) * correct_count / len(self.correctness)
        self._publish_grade()

        self.runtime.publish(self, 'answers_provided', {
            'answers': self.answers,
            'correctness': self.student_correctness,
        })
        self._publish_problem_check()

        self.completed = True

        result = {
            'success': True,
            'problem_progress': self._get_problem_progress(),
            'submissions': self.answers,
            'feedback': self.current_feedback,
            'correctness': self.student_correctness,
            'answers_order': self.answers_order,
        }
        return result

    @XBlock.json_handler
    def student_reset(self, submissions, suffix=''):
        """
        Reset student answer
        """

        self.score = 0.0
        self.current_feedback = ''
        self.answers = {}
        self.student_correctness = {}

        self._publish_grade()

        self.completed = False

        result = {
            'success': True,
            'problem_progress': self._get_problem_progress(),
        }
        return result

    @XBlock.json_handler
    def studio_submit(self, submissions, suffix=''):
        """
        Save studio edits
        """

        self.display_name = submissions['display_name']
        self.randomize = submissions['randomize']
        self.show_reset_button = submissions['show_reset_button']
        self.show_correctness = submissions['show_correctness']
        try:
            weight = int(submissions['weight'])
        except ValueError:
            weight = 0
        if weight > 0:
            self.weight = weight
        content = submissions['data']

        if not self.enable_advanced_editor:
            content = XmlParser().convert_to_xml(content)
        self.enable_advanced_editor = submissions['enable_advanced_editor']

        try:
            etree.parse(StringIO(content))
            self.question_string = content
        except etree.XMLSyntaxError as e:
            return {
                'result': 'error',
                'message': e.message
            }

        return {
            'result': 'success',
        }

    @XBlock.json_handler
    def send_xblock_id(self, submissions, suffix=''):
        return {
            'result': 'success',
            'xblock_id': str(self.scope_ids.usage_id),
            'user_id': self.scope_ids.user_id,
        }

    @XBlock.json_handler
    def restore_state(self, submissions, suffix=''):
        return {
            'result': 'success',
            'answers': self.answers,
            'correctness': self.student_correctness,
            'answers_order': self.answers_order,
            'current_feedback': self.current_feedback,
            'completed': self.completed,
        }

    @XBlock.json_handler
    def send_hints(self, submissions, suffix=''):
        tree = etree.parse(StringIO(self.question_string))
        raw_hints = tree.xpath('/inline_text_and_dropdown/demandhint/hint')

        decorated_hints = list()

        if len(raw_hints) == 1:
            hint = 'Hint: ' + etree.tostring(raw_hints[0], encoding='unicode')
            decorated_hints.append(hint)
        else:
            for i in range(len(raw_hints)):
                hint = 'Hint ({number} of {total}): {hint}'.format(
                    number=i + 1,
                    total=len(raw_hints),
                    hint=etree.tostring(raw_hints[i], encoding='unicode'))
                decorated_hints.append(hint)

        hints = decorated_hints

        return {
            'result': 'success',
            'hints': hints,
        }

    @XBlock.json_handler
    def publish_event(self, data, suffix=''):
        try:
            event_type = data.pop('event_type')
        except KeyError:
            return {'result': 'error', 'message': _('Missing event_type in JSON data')}

        data['user_id'] = self.scope_ids.user_id
        data['component_id'] = self._get_unique_id()
        self.runtime.publish(self, event_type, data)

        return {'result': 'success'}

    """
    Util functions
    """
    def load_resource(self, resource_path):
        """
        Gets the content of a resource
        """

        resource_content = pkg_resources.resource_string(__name__, resource_path)
        return str(resource_content, encoding='utf-8')

    def render_template(self, template_path, context={}):
        """
        Evaluate a template by resource path, applying the provided context
        """

        template_str = str(self.load_resource(template_path))
        return Template(template_str).render(Context(context))

    def resource_string(self, path):
        """
        Handy helper for getting resources from our kit.
        """
        data = pkg_resources.resource_string(__name__, path)
        return data.decode('utf-8')

    def _get_body(self, xmlstring):
        """
        Helper method
        """

        tree = etree.parse(StringIO(xmlstring))

        for input_ref in tree.iter('input_ref'):
            for optioninput in tree.iter('optioninput'):
                select = Element('select')
                valuecorrectness = {}
                valuefeedback = {}
                if optioninput.attrib['id'] == input_ref.attrib['input']:
                    newoption = SubElement(input_ref, 'option')
                    newoption.text = ''
                    options = optioninput.iter('option')
                    if self.randomize:
                        options = self.do_shuffle(optioninput.getchildren())
                    for option in options:
                        newoption = SubElement(input_ref, 'option')
                        newoption.text = option.text
                        valuecorrectness[option.text] = option.attrib['correct']
                        for optionhint in option.iter('optionhint'):
                            valuefeedback[option.text] = optionhint.text
                    input_ref.tag = 'select'
                    input_ref.attrib['xblock_id'] = str(self.scope_ids.usage_id)
                    self.correctness[optioninput.attrib['id']] = valuecorrectness
                    self.feedback[optioninput.attrib['id']] = valuefeedback

            for stringinput in tree.iter('stringresponse'):
                inputtext = Element('textline')
                valuecorrectness = {}
                valuefeedback = {}
                if stringinput.attrib['id'] == input_ref.attrib['input']:
                    possible_answers = [stringinput.attrib['answer']]
                    alt_answers = stringinput.getchildren()
                    if alt_answers:
                        for answer in alt_answers:
                            possible_answers.append(answer.attrib['answer'])
                    valuecorrectness['answer'] = possible_answers
                    input_ref.tag = 'input'
                    input_ref.attrib['xblock_id'] = str(self.scope_ids.usage_id)
                    self.correctness[stringinput.attrib['id']] = valuecorrectness
                    self.feedback[stringinput.attrib['id']] = valuefeedback


        body = tree.xpath('/inline_text_and_dropdown/body')

        bodystring = etree.tostring(body[0], encoding='unicode')

        return bodystring

    def do_shuffle(self, options):
        """
        Returns list of the shuffled options if randomize is enabled for dropdown values
        """
        self.seed = self.runtime.seed
        random.Random(self.seed).shuffle(options)
        return options

    def _get_unique_id(self):
        try:
            unique_id = self.location.name
        except AttributeError:
            # workaround for xblock workbench
            unique_id = 'workbench-workaround-id'
        return unique_id

    def _get_problem_progress(self):
        """
        Returns a statement of progress for the XBlock, which depends
        on the user's current score
        """
        result = ''
        if self.score == 0.0:
            result = ngettext(
                '{weight} point possible',
                '{weight} points possible',
                self.weight,
            ).format(
                weight=self.weight
            )
        else:
            score_string = '{0:g}'.format(self.score)
            result = ngettext(
                score_string + '/' + "{weight} point",
                score_string + '/' + "{weight} points",
                self.weight,
            ).format(
                weight=self.weight
            )
        return result

    def _publish_grade(self):
        self.runtime.publish(
            self,
            'grade',
            {
                'value': self.score,
                'max_value': self.weight,
            }
        )

    def _publish_problem_check(self):
        self.runtime.publish(
            self,
            'problem_check',
            {
                'grade': self.score,
                'max_grade': self.weight,
            }
        )

    def get_correct_answer_for_text_input(self, answer, key):
        """
        Checks for the answer if it is a text input answer, if yes, checks the answer according to possible answers.
        """
        correct_answer = None
        possible_text_answers = self.correctness[key].get('answer')
        if possible_text_answers:
            for text_answer in possible_text_answers:
                if text_answer == answer:
                    correct_answer = answer
                    break

        return correct_answer

    def get_progress(self):
        """
        Get weighted earned / weighted possible scores.
        """
        weighted_earned = self.score
        weighted_possible = self.weight

        if weighted_possible:
            try:
                return Progress(weighted_earned, weighted_possible)
            except (TypeError, ValueError):
                log.exception('Got bad progress.')

        return

    def is_attempted(self):
        """
        Has assignment been submitted?
        """
        return self.completed

    @property
    def i18n_service(self):
        """ Obtains translation service """
        i18n_service = self.runtime.service(self, "i18n")
        if i18n_service:
            return i18n_service
    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("In-line-drop-down",
             """<inline-text-and-dropdown/>
             """),
        ]