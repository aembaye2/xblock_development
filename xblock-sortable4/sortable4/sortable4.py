"""Sortable XBlock"""
import random
import pkg_resources
from xblock.core import XBlock
from xblock.exceptions import JsonHandlerError
from xblock.fields import Integer, Scope, String, List, Boolean, Float, Dict
from xblock.scorable import ScorableXBlockMixin, Score
from xblock.fragment import Fragment
from xblockutils.resources import ResourceLoader

from .utils import _, DummyTranslationService


loader = ResourceLoader(__name__)


@XBlock.needs('i18n')
class Sortable4XBlock(ScorableXBlockMixin ,XBlock):
    """
    An XBlock for sorting problems.
    """
    FEEDBACK_MESSAGES = [_('Incorrect ({}/{}) - Keep trying!'), _('Partially Correct ({}/{}) - Getting closer!'), _('Correct ({}/{}) - Great job!')]
    DEFAULT_DATA = ["Brazil", "France", "Japan", "Canada"]

    weight = Float(
        display_name=_("Problem Weight"),
        help=_("Defines the number of points the problem is worth."),
        scope=Scope.settings,
        default=1,
        enforce_type=True,
    )

    has_score = Boolean(
        display_name=_("Is Garded?"),
        help=_("A graded or ungraded problem"),
        scope=Scope.settings,
        default=True,
        enforce_type=True,
    )

    display_name = String(
        display_name=_("Title"),
        help=_("The title of the sorting problem. The title is displayed to learners."),
        scope=Scope.settings,
        default=_("Sorting Problem"),
        enforce_type=True,
    )

    question_text = String(
        display_name=_("Problem text"),
        help=_("The description of the problem or instructions shown to the learner."),
        scope=Scope.settings,
        default=_("Sort the following country names in alphabetical order"),
        enforce_type=True,
    )

    max_attempts = Integer(
        display_name=_("Maximum attempts"),
        help=_(
            "Defines the number of times a student can try to answer this problem. "
            "If the value is not set, infinite attempts are allowed."
        ),
        scope=Scope.settings,
        default=3,
        enforce_type=True,
    )

    item_background_color = String(
        display_name=_("Item background color"),
        help=_("The background color of Sortable4 items"),
        scope=Scope.settings,
        default="#f2f2f2",
        enforce_type=True,
    )

    item_text_color = String(
        display_name=_("Item text color"),
        help=_("The text color of sortable items"),
        scope=Scope.settings,
        default="#000000",
        enforce_type=True,
    )

    data = List(
        display_name=_("Sortable4 Items"),
        help=_("Order will be randomized when presented to students"),
        scope=Scope.content,
        default=DEFAULT_DATA,
        enforce_type=True,
    )

    attempts = Integer(
        help=_("Number of attempts learner used"),
        scope=Scope.user_state,
        default=0,
        enforce_type=True,
    )

    completed = Boolean(
        help=_("Indicates whether a learner has completed the problem successfully at least once"),
        scope=Scope.user_state,
        default=False,
        enforce_type=True,
    )

    raw_earned = Float(
        help=_("Keeps maximum score achieved by student as a raw value between 0 and 1."),
        scope=Scope.user_state,
        default=0,
        enforce_type=True,
    )

    raw_possible = Float(
        help=_("Maximum score available of the problem as a raw value between 0 and 1."),
        scope=Scope.user_state,
        default=1,
        enforce_type=True,
    )

    user_sequence = List(
        help = _("User selected sequence"),
        scope=Scope.user_state,
        default=[],
        enforce_type=True,
    )    
    
    @property
    def remaining_attempts(self):
        """Remaining number of attempts"""
        return self.max_attempts - self.attempts
    
    @property
    def score(self):
        """
        Returns learners saved score.
        """
        return Score(self.raw_earned, self.raw_possible)

    def max_score(self):  # pylint: disable=no-self-use
        """
        Return the problem's max score, which for DnDv2 always equals 1.
        Required by the grading system in the LMS.
        """
        return 1

    def set_score(self, score):
        """
        Sets the score on this block.
        Takes a Score namedtuple containing a raw
        score and possible max (for this block, we expect that this will
        always be 1).
        """
        self.raw_earned = score.raw_earned
        self.raw_possible = score.raw_possible

    def resource_string(self, path):  # pylint: disable=no-self-use
        """Handy helper for getting resources from our kit."""
        # First try pkg_resources (works for packaged installs). If the
        # frontend build created/updated files after installation (common
        # during development), fall back to reading the file directly from
        # the package directory on disk.
        try:
            data = pkg_resources.resource_string(__name__, path)
            return data.decode("utf8")
        except (FileNotFoundError, KeyError, IOError):
            import os
            base = os.path.dirname(__file__)
            full = os.path.join(base, path)
            with open(full, 'rb') as f:
                return f.read().decode('utf8')

    def shuffle_data_based_on_submission(self, submissions):
        """
        Get data based on last submission
        """
        data = []
        for index in submissions:
            data.append(self.data[index])
        return data
    
    def get_weighted_score(self):
        """
        Get weighted scores
        """
        return self.raw_earned*self.weight, self.raw_possible*self.weight

    def get_items_with_state(self, items):
        """
        Add correct status i.e True or False with every option
        """
        states = []
        if (len(items)==len(self.user_sequence)):
            states = [state==index for index, state in enumerate(self.user_sequence)]
        else:
            states = [False for _ in range(len(items))]
        return zip(items, states)
    
    def student_view_data(self):
        """
        Context for student view
        """
        items = self.data[:]
        if self.attempts and self.user_sequence:
            items = self.shuffle_data_based_on_submission(self.user_sequence)
        else:
            random.shuffle(items)

        user_score, max_score = self.get_weighted_score()
        is_correct = int(user_score)==int(max_score)
        return {
            'display_name': self.display_name,
            'question_text': self.question_text,
            'max_attempts': self.max_attempts,
            'attempts': self.attempts,
            'item_background_color': self.item_background_color,
            'item_text_color': self.item_text_color,
            'completed': self.completed,
            'graded': self.has_score,
            'user_score': user_score,
            'max_score': max_score,
            'error_indicator': self.attempts and is_correct,
            'success_indicator': self.attempts and not is_correct,
            'items': self.get_items_with_state(items)
        }
    
    def student_view(self, context=None):
        """
        The primary view of the Sortable4XBlock, shown to students
        when viewing courses.
        """
        frag = Fragment()

        # Inject minimal server-rendered DOM so the React frontend can mount.
        import html as _html
        ctx = self.student_view_data()
        items = list(ctx.get('items', []))

        items_html = ''.join(
            '<li class="item" draggable="true">{}</li>'.format(_html.escape(item))
            for item, _ in items
        )

        html_fragment = (
            '<div class="sortable-root">'
            f'<h3 class="problem-header">{_html.escape(ctx.get("display_name", ""))}</h3>'
            f'<p class="problem-statement">{_html.escape(ctx.get("question_text", ""))}</p>'
            '<ul class="items-list" role="list">'
            f'{items_html}'
            '</ul>'
            '<div class="action">'
            '<button id="submit-answer" class="submit btn-brand">Submit</button>'
            '<div class="submission-feedback">'
            '<div class="message"></div>'
            f'You have used <span class="attempts">{int(ctx.get("attempts", 0))}</span> of <span class="max-attempts">{int(ctx.get("max_attempts", 1))}</span> attempts'
            '</div>'
            '</div>'
            '</div>'
        )

        frag.add_content(html_fragment)
        # Load the files that the rollup build actually emits into public/
        frag.add_css(self.resource_string("public/sortable4.css"))
        frag.add_javascript(self.resource_string("public/sortable4.min.js"))
        frag.add_javascript(self.resource_string("public/xblock-runtime-bridge.js"))
        frag.add_javascript(self.resource_string("public/sortable_init.js"))
        frag.add_javascript(self.resource_string("public/sortable4.js"))

        # The React bundle exposes `Sortable4XBlock` as the initializer.
        frag.initialize_js('Sortable4XBlock')
        return frag

    def _get_submission_indexes(self, submission):
        """
        Get postions of submission list
        """
        assert len(submission) == len(self.data)
        user_submission = []
        for item in self.data:
            user_submission.append(submission.index(item))
        return user_submission 

    def _calculate_grade(self, submission):
        """
        Calculate grade based on correct possitions of strings
        """
        assert len(submission) == len(self.data)
        correctly_placed = 0
        for index, item in enumerate(self.data):
            if item == submission[index]:
                correctly_placed += 1
        grade = (correctly_placed / float(len(self.data)))
        return grade

    def _validate_do_attempt(self):
        """
        Validates if `submit_answer` handler should be executed
        """
        if not self.remaining_attempts:
            raise JsonHandlerError(
                409,
                self.i18n_service.gettext("Max number of attempts reached")
            )
    
    def _mark_complete_and_publish_grade(self, submission):
        """
        Calculate the score and update the XBlock state based on the submission
        """
        score = self._calculate_grade(submission)
        
        self.set_score(Score(score, self.max_score()))
        self.completed = int(self.raw_earned) or not self.remaining_attempts
        self.user_sequence = self._get_submission_indexes(submission)
        self.publish_grade(self.score, False)

        # and no matter what - emit progress event for current user
        self.runtime.publish(self, "progress", {})
    
    @XBlock.json_handler
    def submit_answer(self, submission, suffix=''):
        """
        Checks submitted solution and returns feedback.
        """
        self._validate_do_attempt()

        # Ensure submission is correctly formatted
        if isinstance(submission, list):
            submission_data = submission
        else:
            submission_data = list(self.data)  # Default to original data if submission format is wrong
        
        self.attempts += 1

        self._mark_complete_and_publish_grade(submission_data)
        
        earned = self.raw_earned*self.weight
        total = self.max_score()*self.weight
        
        # Select message based on score percentage
        score_percentage = self.raw_earned / self.max_score() if self.max_score() > 0 else 0
        message_index = 0  # Default to incorrect
        
        if score_percentage == 1.0:
            message_index = 2  # Correct
        elif score_percentage > 0:
            message_index = 1  # Partially correct
            
        message = Sortable4XBlock.FEEDBACK_MESSAGES[message_index].format(earned, total)
        
        return {
            'correct': int(self.raw_earned)==int(self.max_score()),
            'attempts': self.attempts,
            'grade': earned,
            'remaining_attempts': self.remaining_attempts,
            'state': self.user_sequence,
            'message': message,
        }

    def studio_view(self, context):
        """
        Editing view in Studio
        """
        frag = Fragment()

        # For the Studio view we also render a minimal editable structure so
        # the React studio bundle can mount into it. If you prefer the
        # original `static/html/sortable_edit.html`, restore that template.
        import html as _html
        ctx = self.student_view_data()
        items = list(ctx.get('items', []))

        items_html = ''.join(
            '<li class="item"><span class="item-text">{}</span></li>'.format(_html.escape(item))
            for item, _ in items
        )

        html_fragment = (
            '<div class="sortable-studio-root">'
            f'<h3 class="display-name">{_html.escape(ctx.get("display_name", ""))}</h3>'
            '<div class="items-list-edit">'
            f'{items_html}'
            '</div>'
            '</div>'
        )

        frag.add_content(html_fragment)
        frag.add_css(self.resource_string("public/sortable4.css"))
        frag.add_javascript(self.resource_string("public/sortable4.min.js"))
        frag.add_javascript(self.resource_string("public/xblock-runtime-bridge.js"))
        frag.add_javascript(self.resource_string("public/sortable_init.js"))
        frag.add_javascript(self.resource_string("public/sortable4.js"))

        frag.initialize_js('sortable4XBlockEdit')
        return frag

    @XBlock.json_handler
    def studio_submit(self, submissions, suffix=''):
        """
        Handles studio save.
        """
        self.display_name = submissions['display_name']
        self.max_attempts = submissions['max_attempts']
        self.question_text = submissions['question_text']
        self.item_background_color = submissions['item_background_color']
        self.item_text_color = submissions['item_text_color']
        self.has_score = bool(submissions['has_score'])
        self.weight = float(submissions['weight'])
        self.data = submissions['data']

        return {
            'result': 'success',
        }
    
    def publish_grade(self, score=None, only_if_higher=None):
        """
        Publishes the student's current grade to the system as an event
        """
        if not score:
            score = self.score
        self._publish_grade(score, only_if_higher)
        return {'grade': self.score.raw_earned, 'max_grade': self.score.raw_possible}

    @property
    def i18n_service(self):
        """ Obtains translation service """
        i18n_service = self.runtime.service(self, "i18n")
        if i18n_service:
            return i18n_service
        return DummyTranslationService()

    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("Sortable4XBlock",
             """<sortable4/>
             """),
            # ("Multiple SortableXBlock",
            #  """<vertical_demo>
            #     <sortable4/>
            #     <sortable4/>
            #     <sortable4/>
            #     </vertical_demo>
            #  """),
        ]
