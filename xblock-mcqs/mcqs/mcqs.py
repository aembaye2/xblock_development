""" An XBlock to for Multiple Choice Questions """

import pkg_resources

from django.template import Template, Context

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String, List, Boolean
from xblock.fragment import Fragment
from xblock.validation import ValidationMessage

from xblockutils.studio_editable import StudioEditableXBlockMixin


class McqsXBlock(XBlock, StudioEditableXBlockMixin):
    """
    Multiple Choice Questions XBlock
    """
    display_name = String(default='MCQS')
    block_name = String(default='MCQS')
    editable_fields = ('question', 'choices', 'correct_choice', 'hint')

    question = String(
        display_name='Question',
        default='Which of the following languages is more suited to a structured program?',
        scope=Scope.content, help='Question statement'
    )
    choices = List(
        display_name='Choices',
        default=['PL/1', 'FORTRAN', 'BASIC', 'PASCAL'],
        scope=Scope.content, help='Choices for MCQs'
    )
    correct_choice = Integer(
        display_name='Correct Choice',
        default=4, scope=Scope.content,
        help='Index of correct choice among given choices. For example if third choice is correct, enter 3'
    )
    hint = String(
        display_name='Hint',
        default='Think hard!', scope=Scope.content, help='Hint for the User'
    )

    user_choice = Integer(default=None, scope=Scope.user_state, help='Index of choice selected by User')
    correct = Boolean(default=False, scope=Scope.user_state, help='User selection is correct or not')

    def resource_string(self, path):
        """
        Handy helper for getting resources from our kit.
        """
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def student_view(self, context=None):
        """
        The primary view of the McqsXBlock, shown to students
        when viewing courses.
        """
        if context is None:
            context = {}

        context.update({'self': self})

        html = Template(self.resource_string("static/html/mcqs.html")).render(Context(context))
        frag = Fragment(html)
        frag.add_css(self.resource_string("static/css/mcqs.css"))
        frag.add_javascript(self.resource_string("static/js/src/mcqs.js"))
        frag.initialize_js('McqsXBlock')
        return frag

    def validate_field_data(self, validation, data):
        """
        Perform validation on Studio submitted data
        """
        if not data.question.strip():
            validation.add(ValidationMessage(ValidationMessage.ERROR, u"Question is required."))

        # there must be two choices to choose from
        if not data.choices or len(data.choices) < 2:
            validation.add(ValidationMessage(ValidationMessage.ERROR, u"Please enter atleast two choices"))

        if data.correct_choice not in range(1, len(data.choices) + 1):
            validation.add(ValidationMessage(
                ValidationMessage.ERROR,
                u"Correct choice must be from 1 to {}".format(len(data.choices))
            ))

    @XBlock.json_handler
    def check_answer(self, data, suffix=''):
        """
        Check answer for submitted response
        """
        response = dict(correct=False)

        ans = int(data.get('ans', 0))

        # store user response
        self.user_choice = ans

        if ans == self.correct_choice:
            self.correct = True
            response['correct'] = True
        else:
            response['correct_choice'] = self.correct_choice

        return response

    @XBlock.json_handler
    def get_hint(self, data, suffix=''):
        """
        Give hint for the question
        """
        response = dict(hint=self.hint)

        return response

    @staticmethod
    def workbench_scenarios():
        """
        A canned scenario for display in the workbench.
        """
        return [
            ("McqsXBlock",
             """<mcqs/>
             """),
            ("Multiple McqsXBlock",
             """<vertical_demo>
                <mcqs/>
                <mcqs/>
                <mcqs/>
                </vertical_demo>
             """),
        ]
