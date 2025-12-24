"""TO-DO: Write a description of what this XBlock is."""
import os
import json
import logging

from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import Integer, Scope, String, List, Float, Boolean
from xblock.exceptions import JsonHandlerError
from xblock.scorable import ScorableXBlockMixin, Score
from xblock.utils.resources import ResourceLoader
from xblockutils.studio_editable import StudioEditableXBlockMixin

resource_loader = ResourceLoader(__name__)

"""
TO-DO: document what your XBlock does.
"""

class DiagramXBlock(StudioEditableXBlockMixin, ScorableXBlockMixin, XBlock):

    @XBlock.json_handler
    def submit_grade(self, data, suffix=''):
        """
        Receives grade (preferred) or diagram data from frontend.
        If a grade is provided, store/publish it; otherwise process diagram JSON.
        """
        # If grade is provided, record and return summary
        if 'grade' in data:
            try:
                grade_val = float(data.get('grade', 0.0))
            except Exception:
                grade_val = 0.0

            # Bound grade between 0 and 1 for this problem
            grade_val = max(0.0, min(1.0, grade_val))
            self.raw_earned = grade_val
            self.raw_possible = 1.0
            try:
                self.publish_grade()
            except Exception:
                # If publish fails, continue gracefully
                logging.exception("Failed to publish grade")

            return {"result": "success", "summary": f"Received grade: {grade_val}"}

        diagram = data.get('diagram')
        if not diagram:
            return {"result": "error", "message": "No diagram data received."}
        return {"result": "success", "summary": summary}

    # Backward compatibility: keep old handler name temporarily
    @XBlock.json_handler
    def send_diagram_json(self, data, suffix=''):
        return self.submit_grade(data, suffix)
    


    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.

    # Raw score storage (ScorableXBlockMixin pattern) - internal only, not passed to frontend
    raw_earned = Float(
        default=0.0, scope=Scope.user_state,
        help="Raw earned score (0..1)",
    )

    raw_possible = Float(
        default=1.0, scope=Scope.user_state,
        help="Raw possible score (usually 1)",
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

    AssessName = String(
        display_name="Assessment Name",
        scope=Scope.settings,
        default="quiz1",
        help="Unique name for this assessment",
    )

    # Diagram-specific configuration fields
    index = Integer(
        display_name="Diagram Index",
        default=0,
        scope=Scope.content,
        help="Diagram index",
    )

    # DrawingBoard component configuration
    questionText = String(
        display_name="Question Text",
        scope=Scope.settings,
        default="Draw the following: 1) A horizontal segment from (1,1) to (4,1), 2) A rectangle with corners at (6,2), (9,2), (9,5), and (6,5), 3) A curve passing through points (1,7), (2,9), (4,9), and (5,7).",
        help="Question text displayed to the student for the drawing task",
    )

    visibleTools = List(
        display_name="Visible Tools",
        scope=Scope.settings,
        default=["point", "segment", "rectangle", "curve"],
        help="List of drawing tools to show in the DrawingBoard toolbar",
    )

    visibleButtons = List(
        display_name="Visible Buttons",
        scope=Scope.settings,
        default=["undo", "redo", "clear", "downloadPNG", "submit"], #"downloadJSON", 
        help="List of buttons to show in the DrawingBoard toolbar",
    )

    expectedDrawing = String(
        display_name="Expected Drawing",
        scope=Scope.settings,
        default='{"version":"1.0","boardSettings":{"boundingBox":[-1,11,11,-1]},"objects":[{"id":"expected_segment_1","type":"segment","point1":{"x":1,"y":1},"point2":{"x":4,"y":1},"properties":{"strokeColor":"#059669","strokeWidth":2},"isInitial":true},{"id":"expected_rectangle_1","type":"rectangle","point1":{"x":6,"y":2},"point2":{"x":9,"y":2},"point3":{"x":9,"y":5},"point4":{"x":6,"y":5},"properties":{"strokeColor":"#059669","strokeWidth":2},"isInitial":true},{"id":"expected_curve_1","type":"curve","points":[{"x":1,"y":7},{"x":2,"y":9},{"x":4,"y":9},{"x":5,"y":7}],"properties":{"strokeColor":"#059669","strokeWidth":2},"isInitial":true}]}',
        help="Expected drawing for grading comparison (BoardState JSON)",
    )

    initialDrawingState = String(
        display_name="Initial Drawing State",
        scope=Scope.settings,
        default='{"version":"1.0","boardSettings":{"boundingBox":[-1,11,11,-1]},"objects":[{"id":"initial_segment_1","type":"segment","point1":{"x":0,"y":10},"point2":{"x":5,"y":0},"properties":{"strokeColor":"#2563eb","strokeWidth":2},"isInitial":true}]}',
        help="Initial drawing state with pre-drawn objects (BoardState JSON)",
    )

    gradingTolerance = Float(
        display_name="Grading Tolerance",
        scope=Scope.settings,
        default=0.8,
        help="Grading tolerance for point matching",
    )

    

    # TO-DO: change this view to display more interesting things.
    def student_view(self, context=None):
        frag = Fragment()
        frag.add_css_url(self.runtime.local_resource_url(self, 'public/diagram.css'))
        frag.add_javascript_url(self.runtime.local_resource_url(self, 'public/diagram.js'))

        # Normalize JSON fields so the frontend gets objects (not raw strings)
        try:
            expected_obj = (
                json.loads(self.expectedDrawing)
                if isinstance(self.expectedDrawing, str) else self.expectedDrawing
            )
        except Exception:
            logging.exception("Failed to parse expectedDrawing; sending as empty object")
            expected_obj = {}

        try:
            initial_obj = (
                json.loads(self.initialDrawingState)
                if isinstance(self.initialDrawingState, str) else self.initialDrawingState
            )
        except Exception:
            logging.exception("Failed to parse initialDrawingState; sending as empty object")
            initial_obj = {}

        # Only fields actually used by the drawing board are sent to the frontend
        init_data = {
            "index": self.index,
            "AssessName": self.AssessName,
            # DrawingBoard component props
            "questionText": self.questionText,
            "visibleTools": self.visibleTools,
            "visibleButtons": self.visibleButtons,
            "expectedDrawing": expected_obj,
            "initialDrawingState": initial_obj,
            "gradingTolerance": self.gradingTolerance,
            "attempts": self.attempts,
            "remaining_attempts": self.remaining_attempts,
        }
        frag.initialize_js('initDiagramXBlockStudentView', init_data)
        return frag


    # Removed MCQ answer/grade logic. Diagram blocks may implement their own grading if needed.

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
            ("DiagramXBlock based on react", "<diagram_xblock/>")
        ]


