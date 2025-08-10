import json
import pkg_resources
from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import String, Integer, Float, Scope
from xblock.scorable import ScorableXBlockMixin, Score
from xblockutils.studio_editable import StudioEditableXBlockMixin

class MCXBlock(StudioEditableXBlockMixin, ScorableXBlockMixin, XBlock):
    """
    Multiple Choice Question XBlock (static files)
    """

    display_name = String(
        default="Multiple Choice Question",
        scope=Scope.settings,
        help="Title of the block"
    )
    question = String(
        default="What is the capital of France?",
        scope=Scope.content,
        help="Question text"
    )
    choices = String(
        default=json.dumps(["London", "Berlin", "Paris", "Rome"]),
        scope=Scope.content,
        help="JSON list of choices"
    )
    correct_index = Integer(
        default=2,
        scope=Scope.content,
        help="Index of the correct choice (0-based)"
    )

    student_choice = Integer(
        default=-1,
        scope=Scope.user_state,
        help="The index of the choice the student selected"
    )

    # Persisted raw score components (for ScorableXBlockMixin compatibility)
    _raw_earned = Float(default=0.0, scope=Scope.user_state, help="Earned raw score")
    _raw_possible = Float(default=1.0, scope=Scope.user_state, help="Possible raw score")

    # Optional weight (mirrors other scorable blocks; used by LMS aggregation)
    weight = Float(default=1.0, scope=Scope.settings, help="Problem weight applied to raw score")

    editable_fields = ('display_name', 'question', 'choices', 'correct_index')

    def resource_string(self, path):
        """Helper to load static resources from the package."""
        return pkg_resources.resource_string(__name__, path).decode('utf-8')


    def student_view(self, context=None):
        frag = Fragment()
        # load static HTML and fill placeholders
        html = self.resource_string('static/mcxblock/student_view.html')
        try:
            choice_list = json.loads(self.choices)
        except Exception:
            choice_list = []
        html = html.replace('{{ question }}', self.question)
        html = html.replace('{{ choices_json }}', json.dumps(choice_list))
        html = html.replace('{{ selected }}', str(self.student_choice))
        frag.add_content(html)
        frag.add_css(self.resource_string('static/mcxblock/student_view.css'))
        frag.add_javascript(self.resource_string('static/mcxblock/student_view.js'))
        frag.initialize_js('MCXBlock')
        return frag

    @XBlock.json_handler
    def submit_answer(self, data, suffix=''):
        """
        Handle student answer submission.
        Expects: {"choice": <index>}
        Returns: {"correct": bool}
        """
        #print("[MCXBlock] Received data from student:", data)
        try:
            choice = int(data.get('choice', -1))
        except (ValueError, TypeError):
            choice = -1

        # Save student choice for persistence
        self.student_choice = choice

        # Check correctness
        correct = (choice == self.correct_index)

        # Compute and persist score via ScorableXBlockMixin API
        score = self.calculate_score()
        self.set_score(score)
        # Publish (using mixin helper for consistency)
        self._publish_grade(score)
        return {'correct': correct}

    # --- ScorableXBlockMixin required methods ---
    def has_submitted_answer(self):  # noqa: D401 (simple predicate)
        return self.student_choice != -1

    def get_score(self):
        return Score(raw_earned=self._raw_earned, raw_possible=self._raw_possible)

    def set_score(self, score):
        self._raw_earned = float(score.raw_earned)
        self._raw_possible = float(score.raw_possible)

    def calculate_score(self):
        # Single-question MCQ: full credit if selected index matches correct_index.
        raw_earned = 1.0 if self.student_choice == self.correct_index else 0.0
        return Score(raw_earned=raw_earned, raw_possible=1.0)

    # Legacy interface (some runtimes look for has_score / max_score)
    has_score = True
    def max_score(self):  # noqa: D401
        return 1.0

    def studio_view(self, context=None):
        frag = Fragment()
        html = self.resource_string('static/mcxblock/studio_view.html')
        html = html.replace('{{ question }}', self.question)
        html = html.replace('{{ choices }}', self.choices)
        html = html.replace('{{ correct_index }}', str(self.correct_index))
        frag.add_content(html)
        frag.add_css(self.resource_string('static/mcxblock/student_view.css'))
        frag.add_javascript(self.resource_string('static/mcxblock/studio_view.js'))
        frag.initialize_js('MCXBlockStudio')
        return frag

    @XBlock.json_handler
    def studio_submit(self, data, suffix=''):
        self.question = data.get('question', self.question)
        # choices may come as JSON string (from textarea) or array
        choices_val = data.get('choices', self.choices)
        if isinstance(choices_val, list):
            self.choices = json.dumps(choices_val)
        else:
            # try parsing; if fails, treat as newline-separated
            try:
                parsed = json.loads(choices_val)
                if isinstance(parsed, list):
                    self.choices = json.dumps(parsed)
                else:
                    # fallback: split lines
                    lines = [s.strip() for s in str(choices_val).splitlines() if s.strip()]
                    self.choices = json.dumps(lines)
            except Exception:
                lines = [s.strip() for s in str(choices_val).splitlines() if s.strip()]
                self.choices = json.dumps(lines)

        try:
            self.correct_index = int(data.get('correct_index', self.correct_index))
        except Exception:
            pass
        return {'result': 'success'}

    @staticmethod
    def workbench_scenarios():
        return [
            ("MCXBlock",
             """<vertical_demo>
                  <mcxblock/>
                </vertical_demo>
             """),
        ]
