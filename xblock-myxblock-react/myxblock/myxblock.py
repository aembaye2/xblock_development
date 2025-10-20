"""TO-DO: Write a description of what this XBlock is."""
import os

from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import Integer, Scope, String, List, Float, Boolean
from xblock.exceptions import JsonHandlerError
from xblock.scorable import ScorableXBlockMixin, Score
from xblock.utils.resources import ResourceLoader

resource_loader = ResourceLoader(__name__)


class MyXBlock(ScorableXBlockMixin, XBlock):
    """
    TO-DO: document what your XBlock does.
    """

    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.

    display_name = String(
        display_name="Display Name",
        scope=Scope.settings,
        default="MyXBlock",
    )


    question = String(
        default="What is 2 + 2?", scope=Scope.content,
        help="Quiz question",
    )
    options = List(
        default=["2", "3", "4", "5"], scope=Scope.content,
        help="Answer options",
    )
    correct = Integer(
        default=2, scope=Scope.content,
        help="Index of correct answer",
    )
    user_answer = Integer(
        default=None, scope=Scope.user_state,
        help="User's answer index",
    )
    # Score stored per-user
    # Raw score storage (ScorableXBlockMixin pattern)
    raw_earned = Float(
        default=0.0, scope=Scope.user_state,
        help="Raw earned score (0..1)",
    )

    raw_possible = Float(
        default=1.0, scope=Scope.user_state,
        help="Raw possible score (usually 1)",
    )

    completed = Boolean(
        default=False, scope=Scope.user_state,
        help="Whether the user has submitted an answer",
    )

    # Block-level settings for grading
    weight = Float(
        display_name="Problem Weight",
        scope=Scope.settings,
        default=1.0,
        help="Number of points this problem is worth",
    )

    has_score = Boolean(
        display_name="Is Graded?",
        scope=Scope.settings,
        default=True,
        help="Whether this problem is graded",
    )

    max_attempts = Integer(
        display_name="Maximum attempts",
        scope=Scope.settings,
    default=3,
        help="Maximum number of attempts allowed for this problem (1 = single attempt)",
    )

    attempts = Integer(
        help="Number of attempts learner used",
        scope=Scope.user_state,
        default=0,
    )

    @property
    def remaining_attempts(self):
        """Remaining number of attempts"""
        return max(self.max_attempts - self.attempts, 0)



    def student_view(self, context=None):
        # Create an explicit container so React can mount reliably
        frag = Fragment()
        frag.add_content('<div id="myxblock"></div>')
        frag.add_css_url(self.runtime.local_resource_url(self, 'public/myxblock.css'))
        frag.add_javascript_url(self.runtime.local_resource_url(self, 'public/myxblock.js'))
        # Only include user_answer in init data if it's set for this user.
        init_data = {
            "question": self.question,
            "options": self.options,
            "correct": self.correct,
        }
        if self.user_answer is not None:
            init_data["user_answer"] = self.user_answer
        # pass attempt information to the frontend
        init_data["attempts"] = self.attempts
        init_data["remaining_attempts"] = self.remaining_attempts
        frag.initialize_js('initMyXBlockStudentView', init_data)
        return frag


    def studio_view(self, context=None):
        frag = Fragment()
        frag.add_content('<div id="myxblock-studio"></div>')
        frag.add_css_url(self.runtime.local_resource_url(self, 'public/myxblock.css'))
        frag.add_javascript_url(self.runtime.local_resource_url(self, 'public/myxblock_studio.js'))
        init_data = {
            "question": self.question,
            "options": self.options,
            "correct": self.correct,
            "max_attempts": self.max_attempts,
            "weight": self.weight,
            "has_score": self.has_score,
        }
        frag.initialize_js('initMyXBlockStudioView', init_data)
        return frag


    @XBlock.json_handler
    def submit_answer(self, data, suffix=''):
        answer = data.get('answer')
        # validate attempts
        if self.remaining_attempts <= 0:
            raise JsonHandlerError(409, "Max number of attempts reached")

        # store the user's answer
        self.user_answer = answer

        # increment attempts
        self.attempts += 1

        # compute correctness
        try:
            is_correct = (int(answer) == int(self.correct))
        except Exception:
            is_correct = False

        # set raw score and mark complete if correct or no remaining attempts
        raw_score = 1.0 if is_correct else 0.0
        self.set_score(Score(raw_score, self.max_score()))
        # completed if student got it correct or has no more remaining attempts
        self.completed = bool(int(self.raw_earned)) or (self.remaining_attempts <= 0)

        # publish grade to LMS using ScorableXBlockMixin helper
        try:
            self.publish_grade(self.score, False)
        except Exception:
            # best-effort: do not raise if publishing fails in workbench
            pass

        # emit progress event
        try:
            self.runtime.publish(self, 'progress', {})
        except Exception:
            pass

        earned = self.raw_earned * self.weight
        total = self.raw_possible * self.weight

        return {
            "correct": is_correct,
            "score": raw_score,
            "grade": earned,
            "max_grade": total,
            "attempts": self.attempts,
            "remaining_attempts": self.remaining_attempts,
        }


    @XBlock.json_handler
    def save_quiz(self, data, suffix=''):
        self.question = data.get('question', self.question)
        self.options = data.get('options', self.options)
        self.correct = data.get('correct', self.correct)
        # save grading settings
        try:
            self.max_attempts = int(data.get('max_attempts', self.max_attempts))
        except Exception:
            pass
        try:
            self.weight = float(data.get('weight', self.weight))
        except Exception:
            pass
        try:
            self.has_score = bool(data.get('has_score', self.has_score))
        except Exception:
            pass
        return {"result": "success"}

    def max_score(self):
        """Return max score for this component."""
        return 1.0

    @property
    def score(self):
        """Return a Score namedtuple per ScorableXBlockMixin contract."""
        return Score(self.raw_earned, self.raw_possible)

    def set_score(self, score):
        """Set raw earned/raw possible values from a Score namedtuple."""
        self.raw_earned = score.raw_earned
        self.raw_possible = score.raw_possible

    def publish_grade(self, score=None, only_if_higher=None):
        """Publish the student's current grade to the system as an event."""
        if not score:
            score = self.score
        # Delegate to ScorableXBlockMixin's internal publish if present
        try:
            self._publish_grade(score, only_if_higher)
        except Exception:
            # Fallback: publish raw grade event
            try:
                self.runtime.publish(
                    self,
                    'grade',
                    {'value': float(score.raw_earned), 'max_value': float(score.raw_possible)}
                )
            except Exception:
                pass


    

    @classmethod
    def workbench_scenarios(cls):
        """Scenarios for display in the workbench."""
        return [
            ("MyXBlock Quiz based on react", "<myxblock/>")
        ]
