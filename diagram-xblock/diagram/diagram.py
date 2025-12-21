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

resource_loader = ResourceLoader(__name__)


"""
TO-DO: document what your XBlock does.
"""

class DiagramXBlock(ScorableXBlockMixin, XBlock):

    @XBlock.json_handler
    def send_diagram_json(self, data, suffix=''):
        """
        Receives diagram JSON from frontend and delegates processing to
        diagram_handlers.process_diagram_json for easier extension.
        """
        diagram = data.get('diagram')
        if not diagram:
            return {"result": "error", "message": "No diagram data received."}

        # Get values from XBlock fields
        scaleFactors = self.scaleFactors
        canvasWidth = self.canvasWidth
        canvasHeight = self.canvasHeight

        # Debug: print received data
        #print(f"Using XBlock fields: scaleFactors={scaleFactors}, canvasWidth={canvasWidth}, canvasHeight={canvasHeight}")

        ### Add this line to print the JSON to server logs
        #print(diagram)  # Outputs the diagram JSON to the server console/logs

        from .diagram_handlers import process_diagram_json
        summary = process_diagram_json(diagram, scaleFactors, canvasWidth, canvasHeight)
        return {"result": "success", "summary": summary}
    


    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.

    question = String(
        default="Question: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod auctor urna, vel tincidunt elit varius id. Nullam in lacus ac odio vehicula tempus a ac magna. Ut sit amet orci orci. Nulla posuere purus nec orci blandit, sed interdum libero interdum. Sed lacinia libero ac sem vehicula, nec facilisis purus pretium. Fusce accumsan, odio euismod laoreet porttitor, felis nunc maximus odio, nec aliquet erat neque in velit. Nam iaculis ut risus id lacinia. Maecenas id metus sed libero tincidunt tristique ac ac metus. Proin lacinia vestibulum nisi, ac cursus lorem efficitur id. Integer sed magna tincidunt, suscipit mi non, mollis elit. Donec sed nulla turpis. Cras varius neque in nisi eleifend, ac euismod felis fermentum. Quisque ut gravida felis. Nam et lacus dolor. Integer ac cursus urna. Donec aliquam, lectus a facilisis vestibulum, turpis libero pretium enim, non maximus ante elit vel libero. Aliquam erat volutpat. Etiam sit amet eros sed purus fermentum vehicula. ", scope=Scope.content,
        help="Quiz question",
    )
    
#     LINE = {
#   "version": "5.5.2",
#   "objects": [
#     {
#       "type": "line",
#       "version": "5.5.2",
#       "originX": "center",
#       "originY": "center",
#       "left": 256.06,
#       "top": 248,
#       "width": 346,
#       "height": 150,
#       "x1": -173,
#       "y1": -75,
#       "x2": 173,
#       "y2": 75,
#       "stroke": "#000000",
#       "strokeWidth": 2,
#       "visible": True
#     }
#   ]
# }
    LINE = '{"version": "5.5.2", "objects": [{"type": "line", "version": "5.5.2", "originX": "center", "originY": "center", "left": 256.06, "top": 248, "width": 346, "height": 150, "x1": -173, "y1": -75, "x2": 173, "y2": 75, "stroke": "#000000", "strokeWidth": 2, "visible": true}]}'

    # Store initial diagram as a simple string. Historically this field
    # contained a JSON string of the Fabric.js canvas; to avoid storing
    # large JSON objects in Studio we now default to a URL that points to
    # a JSON file. Studio can save either a URL (string) or a JSON object
    # (stored as a JSON string). Frontend will fetch the URL when needed.
    initial_diagram = String(
        default=LINE, #"", #'https://github.com/aembaye2/xblock_development/blob/main/circle.json',
        scope=Scope.content,
        help="Initial diagram source: either a URL (string) pointing to a .json file or a JSON string/object representing Fabric.js data",
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

    # Diagram-specific configuration fields
    index = Integer(
        default=0,
        scope=Scope.content,
        help="Diagram index",
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

    # Which diagram modes should be visible in the toolbar.
    # This is a list of mode keys (strings) that the frontend will use to
    # determine which tools to display. If empty or not provided, frontend  may choose to display all available modes.
    # Tools available:
    # "point","line","singlearrowhead","doublearrowhead","polygon","rect","circle",
    # "freedraw","coordinate","curve","curve4pts","text","transform", "color", "strokeWidth", "download"]
    visibleModes = List(
        display_name="Visible Modes",
        scope=Scope.settings,
        default=["point","line","triangle","singlearrowhead","doublearrowhead","polygon","rect","circle",
     "freedraw","coordinate","curve","curve4pts","text","transform", "color", "strokeWidth", "download"], # <-- whitelist these tools
        help="List of diagram modes to show in the toolbar (mode keys). Empty by default to hide all tools.",
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

    

    # TO-DO: change this view to display more interesting things.
    def student_view(self, context=None):
        frag = Fragment()
        frag.add_css_url(self.runtime.local_resource_url(self, 'public/diagram.css'))
        frag.add_javascript_url(self.runtime.local_resource_url(self, 'public/diagram.js'))

        # Only diagram-related fields are sent to the frontend
        init_data = {
            "question": self.question,
            "index": self.index,
            "AssessName": self.AssessName,
            "canvasWidth": self.canvasWidth,
            "canvasHeight": self.canvasHeight,
            "scaleFactors": self.scaleFactors,
            "submitButtonClicked": self.submitButtonClicked,
            # `initial_diagram` may be a URL string (http/https) or a JSON
            # string/object. Send it to the frontend as-is so the client can
            # decide whether to fetch the URL or use the provided JSON.
            "initialDiagram": self.initial_diagram,
            "visibleModes": self.visibleModes,
            "bgnumber": self.bgnumber,
            "axisLabels": self.axis_labels,
            "hideLabels": self.hideLabels,
        }
        init_data["attempts"] = self.attempts
        init_data["remaining_attempts"] = self.remaining_attempts
        frag.initialize_js('initDiagramXBlockStudentView', init_data)
        return frag


    def studio_view(self, context=None):
        frag = Fragment()
        frag.add_css_url(self.runtime.local_resource_url(self, 'public/diagram.css'))
        frag.add_javascript_url(self.runtime.local_resource_url(self, 'public/diagram_studio.js'))

        # Only diagram-related fields for editing in Studio
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
            # send stored value to the studio editor JS. This may be a URL
            # (string) or a JSON string/object. Studio will present a URL
            # input and/or a JSON editor depending on the stored value.
            "initialDiagram": self.initial_diagram,
        }
        frag.initialize_js('initDiagramXBlockStudioView', init_data)
        return frag

    @XBlock.json_handler
    def studio_save(self, data, suffix=''):
    # Save question and diagram-related fields
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
        
    # `visibleModes` is the field defined on this XBlock (camelCase).
    # Previously this line used `visible_modes` (snake_case) which does not
    # match the declared field name and could raise AttributeError when
    # trying to access the fallback value. Use the correct field name so
    # changes persist to the XBlock settings.
        self.visibleModes = data.get('visibleModes', self.visibleModes)
        self.axis_labels = data.get('axisLabels', self.axis_labels)
        
        try:
            self.hideLabels = bool(data.get('hideLabels', self.hideLabels))
        except Exception:
            pass
        
        # Validate and sanitize incoming initialDiagram from Studio before storing.
        # Accept either:
        #  - a URL string (http/https) which we store directly as a string, or
        #  - a JSON string/object which we sanitize and store as a JSON string.
        new_initial = data.get('initialDiagram', None)
        if new_initial is not None:
            try:
                # If it's a string that looks like a URL, store as-is.
                if isinstance(new_initial, str) and new_initial.strip().lower().startswith(('http://', 'https://')):
                    self.initial_diagram = new_initial.strip()
                    saved_initial = new_initial.strip()
                else:
                    # Accept either a JSON string or an object/list from Studio.
                    if isinstance(new_initial, str):
                        parsed = json.loads(new_initial)
                    else:
                        parsed = new_initial

                    sanitized = validate_initial_diagram(parsed)
                    # Store as JSON string in the field
                    self.initial_diagram = json.dumps(sanitized)
                    saved_initial = sanitized
            except Exception:
                logging.exception("Invalid initialDiagram provided in Studio; keeping previous value")
        
        # Return saved/sanitized initial diagram to the Studio editor so the UI
        # can update its preview / textarea with the canonical form.
        # Return the raw stored value to the Studio editor so it can decide
        # whether to show it as a URL or JSON. If the stored value is a
        # JSON string we attempt to parse it so the editor receives a
        # canonical object; otherwise return the string (URL) as-is.
        try:
            if isinstance(self.initial_diagram, str) and self.initial_diagram.strip().lower().startswith(('http://', 'https://')):
                current_initial = self.initial_diagram.strip()
            elif isinstance(self.initial_diagram, str):
                current_initial = json.loads(self.initial_diagram)
            else:
                current_initial = self.initial_diagram
        except Exception:
            logging.exception("Failed to parse stored initial_diagram; returning empty list")
            current_initial = []

        return {"result": "success", "initialDiagram": current_initial}


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


# Validator for initial diagram data used by the Studio editor.
def validate_initial_diagram(data, max_items=1000, max_bytes=100000):
    """
    Normalize and validate an initial diagram payload.

    Accepts either a full Fabric.js canvas-like object (with an 'objects'
    list) or a plain list of object dicts. Returns a sanitized list of
    objects (with numeric fields converted to floats) and enforces a
    maximum number of items and a maximum serialized size in bytes.

    Raises ValueError on invalid input or if size limits are exceeded.
    """
    # If a full canvas object is provided, extract the objects list
    if isinstance(data, dict) and 'objects' in data:
        items = data.get('objects')
    else:
        items = data

    if not isinstance(items, list):
        raise ValueError('initial diagram must be a list or a canvas object with an "objects" list')

    # Truncate to max_items
    if max_items is not None and len(items) > max_items:
        items = items[:max_items]

    sanitized = []
    for item in items:
        if not isinstance(item, dict):
            # skip non-dict items
            continue
        clean = {}
        for k, v in item.items():
            # Convert numeric-like values to floats
            if isinstance(v, (int, float)):
                clean[k] = float(v)
            elif isinstance(v, str):
                # try to parse numeric strings
                try:
                    if '.' in v or 'e' in v.lower():
                        clean[k] = float(v)
                    else:
                        # preserve non-numeric strings like color codes
                        maybe_int = int(v)
                        clean[k] = float(maybe_int)
                except Exception:
                    clean[k] = v
            else:
                # preserve lists, dicts, booleans, None, etc.
                clean[k] = v
        sanitized.append(clean)

    # Enforce serialized size limit
    try:
        s = json.dumps(sanitized)
        if max_bytes is not None and len(s.encode('utf-8')) > max_bytes:
            raise ValueError('initial diagram exceeds maximum allowed size')
    except (TypeError, ValueError):
        # If serialization fails, raise ValueError to signal invalid input
        raise

    return sanitized


