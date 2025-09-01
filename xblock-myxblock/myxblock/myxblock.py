"""TO-DO: Write a description of what this XBlock is."""
import os

from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import Integer, Scope, String, List
from xblock.utils.resources import ResourceLoader

resource_loader = ResourceLoader(__name__)


class MyXBlock(XBlock):
    """
    TO-DO: document what your XBlock does.
    """

    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.


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

    display_name = String(
        display_name="Display Name",
        scope=Scope.settings,
        default="MyXBlock",
    )


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
        }
        frag.initialize_js('initMyXBlockStudioView', init_data)
        return frag


    @XBlock.json_handler
    def submit_answer(self, data, suffix=''):
        answer = data.get('answer')
        self.user_answer = answer
        return {
            "correct": answer == self.correct
        }

    @XBlock.json_handler
    def save_quiz(self, data, suffix=''):
        self.question = data.get('question', self.question)
        self.options = data.get('options', self.options)
        self.correct = data.get('correct', self.correct)
        return {"result": "success"}

    @classmethod
    def workbench_scenarios(cls):
        """Scenarios for display in the workbench."""
        return [
            ("MyXBlock", "<myxblock/>")
        ]
