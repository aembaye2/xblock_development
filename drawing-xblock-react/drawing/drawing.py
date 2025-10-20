"""TO-DO: Write a description of what this XBlock is."""
import os
import json

from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import Integer, Scope, String, List, Float, Boolean
from xblock.exceptions import JsonHandlerError
from xblock.scorable import ScorableXBlockMixin, Score
from xblock.utils.resources import ResourceLoader

resource_loader = ResourceLoader(__name__)


# Dynamically load all .json files in initialdrawing_gallery as variables
import glob
gallery_dir = os.path.join(os.path.dirname(__file__), "initialdrawing_gallery")
for json_file in glob.glob(os.path.join(gallery_dir, "*.json")):
    var_name = os.path.splitext(os.path.basename(json_file))[0].upper()
    with open(json_file, "r") as f:
        globals()[var_name] = json.load(f)

class DrawingXBlock(ScorableXBlockMixin, XBlock):

    @XBlock.json_handler
    def send_drawing_json(self, data, suffix=''):
        """
        Receives drawing JSON from frontend and delegates processing to
        drawing_handlers.process_drawing_json for easier extension.
        """
        drawing = data.get('drawing')
        if not drawing:
            return {"result": "error", "message": "No drawing data received."}

        # Get values from XBlock fields
        scaleFactors = self.scaleFactors
        canvasWidth = self.canvasWidth
        canvasHeight = self.canvasHeight

        # Debug: print received data
        #print(f"Using XBlock fields: scaleFactors={scaleFactors}, canvasWidth={canvasWidth}, canvasHeight={canvasHeight}")

        ### Add this line to print the JSON to server logs
        #print(drawing)  # Outputs the drawing JSON to the server console/logs

        from .drawing_handlers import process_drawing_json
        summary = process_drawing_json(drawing, scaleFactors, canvasWidth, canvasHeight)
        return {"result": "success", "summary": summary}
    
    """
    TO-DO: document what your XBlock does.
    """

    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.

    question = String(
        default="Question: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod auctor urna, vel tincidunt elit varius id. Nullam in lacus ac odio vehicula tempus a ac magna. Ut sit amet orci orci. Nulla posuere purus nec orci blandit, sed interdum libero interdum. Sed lacinia libero ac sem vehicula, nec facilisis purus pretium. Fusce accumsan, odio euismod laoreet porttitor, felis nunc maximus odio, nec aliquet erat neque in velit. Nam iaculis ut risus id lacinia. Maecenas id metus sed libero tincidunt tristique ac ac metus. Proin lacinia vestibulum nisi, ac cursus lorem efficitur id. Integer sed magna tincidunt, suscipit mi non, mollis elit. Donec sed nulla turpis. Cras varius neque in nisi eleifend, ac euismod felis fermentum. Quisque ut gravida felis. Nam et lacus dolor. Integer ac cursus urna. Donec aliquam, lectus a facilisis vestibulum, turpis libero pretium enim, non maximus ante elit vel libero. Aliquam erat volutpat. Etiam sit amet eros sed purus fermentum vehicula. ", scope=Scope.content,
        help="Quiz question",
    )

    # Removed MCQ fields: options, correct, user_answer
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

    
    AssessName = String(
        display_name="quiz1",
        scope=Scope.settings,
        default="quiz1",
    )

    # Drawing-specific configuration fields
    index = Integer(
        default=0,
        scope=Scope.content,
        help="Drawing index",
    )

    canvasWidth = Integer(
        default=500,
        scope=Scope.settings,
        help="Canvas width in pixels",
    )

    canvasHeight = Integer(
        default=400,
        scope=Scope.settings,
        help="Canvas height in pixels",
    )

    scaleFactors = List(
        #scaleFactors = [xlim, ylim, bottom_margin, left_margin, top_margin, right_margin]
        default=[10, 20, 75, 84, 25, 35],
        scope=Scope.settings,
        help="Scale factors for the canvas",
    )

    submitButtonClicked = Boolean(
        default=False,
        scope=Scope.user_state,
        help="Whether the submit button has been clicked",
    )

    bgnumber = Integer(
        display_name="Background Number",
        scope=Scope.settings,
        default=0,
        help="Background image number (0-1) for selecting different backgrounds",
    )

    # Which drawing modes should be visible in the toolbar.
    # This is a list of mode keys (strings) that the frontend will use to
    # determine which tools to display. If empty or not provided, frontend  may choose to display all available modes.
    # Tools available:
    # "point","line","singlearrowhead","doublearrowhead","polygon","rect","circle",
    # "freedraw","coordinate","curve","curve4pts","text","transform", "color", "strokeWidth", "download"]
    visibleModes = List(
        display_name="Visible Modes",
        scope=Scope.settings,
        default=["line"], # <-- whitelist these tools
        help="List of drawing modes to show in the toolbar (mode keys). Empty by default to hide all tools.",
    )

    axis_labels = List(
        display_name="Axis Labels",
        scope=Scope.settings,
        default=["Quantity, Q", "Price, P"], # Example with long label and newline
        help="Labels for the X and Y axes",
    )

    hideLabels = Boolean(
        display_name="Hide Axis Labels",
        scope=Scope.settings,
        default=False,
        help="Whether to hide axis labels by default,",
    )

    initial_drawing = List(
        default= [], #LINE_INITIAL_DRAWING, #CURVE , #{}, #curve , LINE_INITIAL_DRAWING,  {}, #EMPTY_INITIAL_DRAWING, #RECTANGLE_INITIAL_DRAWING, #
        scope=Scope.content,
        help="Initial drawing data for the canvas (Fabric.js format)",
    )

    # TO-DO: change this view to display more interesting things.
    def student_view(self, context=None):
        frag = Fragment()
        frag.add_css_url(self.runtime.local_resource_url(self, 'public/drawing.css'))
        frag.add_javascript_url(self.runtime.local_resource_url(self, 'public/drawing.js'))

        # Only drawing-related fields are sent to the frontend
        init_data = {
            "question": self.question,
            "index": self.index,
            "AssessName": self.AssessName,
            "canvasWidth": self.canvasWidth,
            "canvasHeight": self.canvasHeight,
            "scaleFactors": self.scaleFactors,
            "submitButtonClicked": self.submitButtonClicked,
            "initialDrawing": self.initial_drawing,
            "visibleModes": self.visibleModes,
            "bgnumber": self.bgnumber,
            "axisLabels": self.axis_labels,
            "hideLabels": self.hideLabels,
        }
        init_data["attempts"] = self.attempts
        init_data["remaining_attempts"] = self.remaining_attempts
        frag.initialize_js('initDrawingXBlockStudentView', init_data)
        return frag


    def studio_view(self, context=None):
        frag = Fragment()
        frag.add_css_url(self.runtime.local_resource_url(self, 'public/drawing.css'))
        frag.add_javascript_url(self.runtime.local_resource_url(self, 'public/drawing_studio.js'))

        # Only drawing-related fields for editing in Studio
        init_data = {
            "question": self.question,
            "max_attempts": self.max_attempts,
            "weight": self.weight,
            "has_score": self.has_score,
            "index": self.index,
            "AssessName": self.AssessName,
            "canvasWidth": self.canvasWidth,
            "canvasHeight": self.canvasHeight,
            "scaleFactors": self.scaleFactors,
            "bgnumber": self.bgnumber,
            "visibleModes": self.visibleModes,
            "axisLabels": self.axis_labels,
            "hideLabels": self.hideLabels,
            "initialDrawing": self.initial_drawing,
        }
        frag.initialize_js('initDrawingXBlockStudioView', init_data)
        return frag

    @XBlock.json_handler
    def save_quiz(self, data, suffix=''):
    # Save question and drawing-related fields
        self.question = data.get('question', self.question)
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
        try:
            self.index = int(data.get('index', self.index))
        except Exception:
            pass
        
        self.AssessName = data.get('AssessName', self.AssessName)  # ✅ Fixed indentation
        
        try:
            self.canvasWidth = int(data.get('canvasWidth', self.canvasWidth))
        except Exception:
            pass
        try:
            self.canvasHeight = int(data.get('canvasHeight', self.canvasHeight))
        except Exception:
            pass
        
        self.scaleFactors = data.get('scaleFactors', self.scaleFactors)
        
        try:
            self.bgnumber = int(data.get('bgnumber', self.bgnumber))
        except Exception:
            pass
        
        self.visible_modes = data.get('visibleModes', self.visible_modes)
        self.axis_labels = data.get('axisLabels', self.axis_labels)
        
        try:
            self.hideLabels = bool(data.get('hideLabels', self.hideLabels))
        except Exception:
            pass
        
        self.initial_drawing = data.get('initialDrawing', self.initial_drawing)
        
        return {"result": "success"}


    # Removed MCQ answer/grade logic. Drawing blocks may implement their own grading if needed.

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
            ("DrawingXBlock based on react", "<drawing_xblock/>")
        ]
