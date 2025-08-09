import json
import pkg_resources
from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import String, Integer, Scope
from xblockutils.studio_editable import StudioEditableXBlockMixin

class MCXBlock(StudioEditableXBlockMixin, XBlock):
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

        # Compute grade
        grade = 1.0 if correct else 0.0

        #print(f"[MCXBlock] Publishing grade: value={grade}, max_value=1.0")
        # Publish grade to LMS
        self.runtime.publish(self, 'grade', {
            'value': grade,
            'max_value': 1.0
        })

        # Also update XBlock grading state for LMS
        self._grade = grade  # Optional: if you have a @XBlock.json_handler that returns scores

        return {'correct': correct}

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
