""" An XBlock to for Multiple Choice Questions """

import pkg_resources

from django.template import Template, Context

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String, List, Boolean, Float
from xblock.fragment import Fragment
from xblock.scorable import ScorableXBlockMixin, Score
from xblock.validation import ValidationMessage

from xblockutils.studio_editable import StudioEditableXBlockMixin


class McqsXBlock(ScorableXBlockMixin, XBlock, StudioEditableXBlockMixin):
    """
    Multiple Choice Questions XBlock
    """
    display_name = String(default='MCQS')
    block_name = String(default='MCQS')
    editable_fields = ('question', 'choices', 'correct_choice', 'hint')

    question = String(
        display_name='Question',
        default='What is the capital city of Germany?',
        scope=Scope.content, help='Question statement'
    )
    choices = List(
        display_name='Choices',
        default=['Berlin', 'Munich', 'Frankfurt', 'Hamburg'],
        scope=Scope.content, help='Choices for MCQs'
    )
    correct_choice = Integer(
        display_name='Correct Choice',
        default=1, scope=Scope.content,
        help='Index of correct choice among given choices. For example if third choice is correct, enter 3'
    )
    hint = String(
        display_name='Hint',
        default='Think hard!', scope=Scope.content, help='Hint for the User'
    )

    user_choice = Integer(default=None, scope=Scope.user_state, help='Index of choice selected by User')
    correct = Boolean(default=False, scope=Scope.user_state, help='User selection is correct or not')
    # persisted score values for ScorableXBlockMixin
    _raw_earned = Float(default=0.0, scope=Scope.user_state, help='Earned raw score')
    _raw_possible = Float(default=1.0, scope=Scope.user_state, help='Possible raw score')

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
            validation.add(ValidationMessage(ValidationMessage.ERROR, u"Please enter at least two choices"))

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
            earned = 1.0
        else:
            response['correct_choice'] = self.correct_choice
            earned = 0.0

        # compute and persist score using ScorableXBlockMixin
        score = Score(raw_earned=earned, raw_possible=1.0)
        self.set_score(score)
        try:
            # publish grade to LMS (mixin helper)
            self._publish_grade(score)
        except Exception:
            # don't let publishing errors break response
            pass

        # include grade info in response for client-side confirmation
        response['grade'] = score.raw_earned
        response['max_grade'] = score.raw_possible
        return response

    # --- ScorableXBlockMixin required methods ---
    def has_submitted_answer(self):
        return self.user_choice is not None

    def get_score(self):
        return Score(raw_earned=self._raw_earned, raw_possible=self._raw_possible)

    def set_score(self, score):
        try:
            self._raw_earned = float(score.raw_earned)
            self._raw_possible = float(score.raw_possible)
        except Exception:
            pass

    def calculate_score(self):
        raw_earned = 1.0 if self.correct else 0.0
        return Score(raw_earned=raw_earned, raw_possible=1.0)

    def publish_grade(self, score=None, only_if_higher=None):
        """
        Publish the student's current grade to the system as an event and return a dict
        with the grade and max grade.
        """
        if not score:
            score = self.get_score()
        try:
            # use mixin helper to publish; some runtimes expect two args
            self._publish_grade(score, only_if_higher)
        except Exception:
            # best-effort; ignore failures in dev environments
            pass
        return {'grade': score.raw_earned, 'max_grade': score.raw_possible}

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
            # ("Multiple McqsXBlock",
            #  """<vertical_demo>
            #     <mcqs/>
            #     <mcqs/>
            #     <mcqs/>
            #     </vertical_demo>
            #  """),
        ]
