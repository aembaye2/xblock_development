# OpenEdX XBlock Integration Guide

This guide shows how to integrate the JSXGraph Drawing Board into an OpenEdX XBlock with instructor setup, student interaction, and automated grading.

## Features for OpenEdX

1. **Initial State Loading** - Instructor can pre-draw elements
2. **Read-Only Elements** - Prevent students from modifying instructor's drawings
3. **State Capture** - Capture student's complete drawing
4. **Submit Callback** - Send student work to OpenEdX for grading
5. **Automated Grading** - Validate student answers programmatically

## Quick Demo

Visit `/openedx-demo` to see a working example with:
- Instructor's pre-drawn points
- Student drawing a connecting line
- Automated grading
- Immediate feedback

## Component API

### Props

```typescript
interface DrawingBoardProps {
  // Drawing tools available to students
  tools?: DrawingMode[] | "all" | "basic" | "geometric";
  
  // Action buttons to display
  buttons?: ("undo" | "redo" | "clear" | "downloadPNG" | "downloadJSON" | "submit")[];
  
  // Instructor's pre-drawn elements
  initialState?: BoardState;
  
  // Make initial elements read-only (recommended: true)
  readOnlyInitial?: boolean;
  
  // Called when student clicks submit
  onSubmit?: (state: BoardState) => void;
  
  // Called whenever board changes (optional)
  onStateChange?: (state: BoardState) => void;
}
```

### BoardState Type

```typescript
interface BoardState {
  version: string;
  boardSettings: {
    boundingBox: number[];
  };
  objects: Array<{
    id: string;
    type: string;
    isInitial?: boolean;  // Whether this was part of instructor's drawing
    // ... coordinates and properties
  }>;
  timestamp?: string;
}
```

## Workflow

### 1. Instructor Creates Initial Drawing

```tsx
// Instructor uses the tool to create initial drawing
// and exports it as JSON
const instructorSetup: BoardState = {
  version: "1.0",
  boardSettings: { boundingBox: [-1, 11, 11, -1] },
  objects: [
    {
      id: "point_A",
      type: "point",
      coords: { x: 2, y: 3 },
      properties: {
        size: 3,
        fillColor: "#ff0000",
        strokeColor: "#ff0000",
      },
      isInitial: true,
    },
    // ... more objects
  ],
};
```

### 2. Student Views Question and Interacts

```tsx
<DrawingBoard
  tools={["segment", "point"]}
  buttons={["undo", "redo", "submit"]}
  initialState={instructorSetup}
  readOnlyInitial={true}
  onSubmit={handleSubmit}
/>
```

### 3. Grading Logic

```typescript
function gradeSubmission(state: BoardState): { score: number; feedback: string } {
  // Filter to get only student-added objects
  const studentObjects = state.objects.filter(obj => !obj.isInitial);
  
  // Implement your grading logic
  // Example: Check if student drew a segment connecting two points
  const hasSegment = studentObjects.some(obj => 
    obj.type === 'segment' && 
    connectsPoints(obj, targetPoint1, targetPoint2)
  );
  
  return {
    score: hasSegment ? 100 : 0,
    feedback: hasSegment 
      ? "Correct! You successfully connected the points."
      : "Incorrect. Please draw a line segment connecting points A and B."
  };
}
```

## OpenEdX XBlock Implementation

### Python XBlock Structure

```python
from xblock.core import XBlock
from xblock.fields import Scope, String, List, Boolean, Float
from xblock.fragment import Fragment
import json

class JSXGraphXBlock(XBlock):
    """
    XBlock for JSXGraph drawing exercises
    """
    
    # Instructor settings
    display_name = String(
        default="JSXGraph Drawing Exercise",
        scope=Scope.settings,
        help="Display name for this block"
    )
    
    question_text = String(
        default="Draw the requested shape",
        scope=Scope.settings,
        help="Question to display to students"
    )
    
    initial_state = String(
        default="{}",
        scope=Scope.settings,
        help="JSON string of initial board state"
    )
    
    available_tools = List(
        default=["point", "segment", "circle"],
        scope=Scope.settings,
        help="Tools available to students"
    )
    
    available_buttons = List(
        default=["undo", "redo", "submit"],
        scope=Scope.settings,
        help="Buttons available to students"
    )
    
    read_only_initial = Boolean(
        default=True,
        scope=Scope.settings,
        help="Make initial elements read-only"
    )
    
    # Grading configuration
    grading_type = String(
        default="automatic",
        scope=Scope.settings,
        help="Grading type: automatic or manual"
    )
    
    grading_criteria = String(
        default="{}",
        scope=Scope.settings,
        help="JSON string of grading criteria"
    )
    
    # Student data
    student_answer = String(
        default="",
        scope=Scope.user_state,
        help="Student's submitted answer"
    )
    
    student_score = Float(
        default=0.0,
        scope=Scope.user_state,
        help="Student's score"
    )
    
    def student_view(self, context=None):
        """
        View shown to students
        """
        html = self.resource_string("static/html/jsxgraph_student.html")
        
        frag = Fragment(html.format(
            question_text=self.question_text,
            initial_state=self.initial_state,
            tools=json.dumps(self.available_tools),
            buttons=json.dumps(self.available_buttons),
            read_only_initial=str(self.read_only_initial).lower(),
        ))
        
        frag.add_css(self.resource_string("static/css/jsxgraph.css"))
        frag.add_javascript(self.resource_string("static/js/jsxgraph_student.js"))
        frag.initialize_js('JSXGraphXBlock')
        
        return frag
    
    @XBlock.json_handler
    def submit_answer(self, data, suffix=''):
        """
        Handle student submission
        """
        self.student_answer = json.dumps(data)
        
        # Grade the submission
        if self.grading_type == "automatic":
            result = self.grade_automatically(data)
            self.student_score = result['score']
            return {
                'success': True,
                'score': result['score'],
                'feedback': result['feedback']
            }
        else:
            # Manual grading - just store the answer
            return {
                'success': True,
                'message': 'Answer submitted for grading'
            }
    
    def grade_automatically(self, student_state):
        """
        Automatic grading based on criteria
        """
        criteria = json.loads(self.grading_criteria)
        student_objects = [obj for obj in student_state['objects'] 
                          if not obj.get('isInitial', False)]
        
        # Implement grading logic based on criteria
        # Example: Check for specific object types
        required_types = criteria.get('required_types', [])
        has_required = all(
            any(obj['type'] == req_type for obj in student_objects)
            for req_type in required_types
        )
        
        if has_required:
            return {
                'score': 1.0,
                'feedback': 'Correct! You drew all required shapes.'
            }
        else:
            return {
                'score': 0.0,
                'feedback': f'Missing required shapes: {required_types}'
            }
    
    def studio_view(self, context=None):
        """
        View shown to instructors for configuration
        """
        html = self.resource_string("static/html/jsxgraph_studio.html")
        
        frag = Fragment(html.format(
            display_name=self.display_name,
            question_text=self.question_text,
            initial_state=self.initial_state,
            tools=json.dumps(self.available_tools),
            buttons=json.dumps(self.available_buttons),
            grading_criteria=self.grading_criteria,
        ))
        
        frag.add_javascript(self.resource_string("static/js/jsxgraph_studio.js"))
        frag.initialize_js('JSXGraphStudioXBlock')
        
        return frag
    
    @XBlock.json_handler
    def studio_submit(self, data, suffix=''):
        """
        Handle studio configuration changes
        """
        self.display_name = data.get('display_name', self.display_name)
        self.question_text = data.get('question_text', self.question_text)
        self.initial_state = data.get('initial_state', self.initial_state)
        self.available_tools = data.get('tools', self.available_tools)
        self.available_buttons = data.get('buttons', self.available_buttons)
        self.grading_criteria = data.get('grading_criteria', self.grading_criteria)
        
        return {'result': 'success'}
```

### HTML Template (Student View)

```html
<!-- static/html/jsxgraph_student.html -->
<div class="jsxgraph-xblock">
  <div class="question-text">
    <h3>{question_text}</h3>
  </div>
  
  <div id="jsxgraph-container"></div>
  
  <div class="feedback-area" id="feedback" style="display: none;">
    <div class="feedback-content"></div>
  </div>
</div>

<script>
  // This will be initialized by React/Next.js component
  const initialState = {initial_state};
  const tools = {tools};
  const buttons = {buttons};
  const readOnlyInitial = {read_only_initial};
</script>
```

### JavaScript Handler (Student View)

```javascript
// static/js/jsxgraph_student.js
function JSXGraphXBlock(runtime, element) {
    const submitUrl = runtime.handlerUrl(element, 'submit_answer');
    
    // Render React component
    ReactDOM.render(
        React.createElement(DrawingBoard, {
            tools: tools,
            buttons: buttons,
            initialState: initialState,
            readOnlyInitial: readOnlyInitial,
            onSubmit: function(state) {
                // Send to OpenEdX
                fetch(submitUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(state)
                })
                .then(response => response.json())
                .then(data => {
                    // Show feedback
                    const feedback = element.querySelector('#feedback');
                    const content = feedback.querySelector('.feedback-content');
                    
                    content.innerHTML = `
                        <strong>Score: ${(data.score * 100).toFixed(0)}%</strong>
                        <p>${data.feedback}</p>
                    `;
                    feedback.style.display = 'block';
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to submit answer');
                });
            }
        }),
        element.querySelector('#jsxgraph-container')
    );
}
```

## Example Grading Scenarios

### Scenario 1: Draw a Perpendicular Line

```typescript
function gradePerpendicularLine(state: BoardState) {
  const initial = state.objects.filter(obj => obj.isInitial);
  const student = state.objects.filter(obj => !obj.isInitial);
  
  // Get the initial line
  const initialLine = initial.find(obj => obj.type === 'segment');
  
  // Get student's line
  const studentLine = student.find(obj => obj.type === 'segment');
  
  if (!studentLine) {
    return { score: 0, feedback: "Please draw a line segment." };
  }
  
  // Calculate slopes
  const slope1 = (initialLine.point2.y - initialLine.point1.y) / 
                 (initialLine.point2.x - initialLine.point1.x);
  const slope2 = (studentLine.point2.y - studentLine.point1.y) / 
                 (studentLine.point2.x - studentLine.point1.x);
  
  // Check if perpendicular (slopes multiply to -1)
  const isPerpendicular = Math.abs(slope1 * slope2 + 1) < 0.1;
  
  return {
    score: isPerpendicular ? 100 : 0,
    feedback: isPerpendicular 
      ? "Correct! The line is perpendicular."
      : "The line is not perpendicular to the given line."
  };
}
```

### Scenario 2: Complete a Triangle

```typescript
function gradeTriangleCompletion(state: BoardState) {
  const initial = state.objects.filter(obj => obj.isInitial);
  const student = state.objects.filter(obj => !obj.isInitial);
  
  // Initial setup: two points given
  const givenPoints = initial.filter(obj => obj.type === 'point');
  
  // Student should add: third point and form triangle
  const studentPoints = student.filter(obj => obj.type === 'point');
  const triangle = student.find(obj => obj.type === 'polygon');
  
  if (studentPoints.length < 1) {
    return { score: 0, feedback: "Please add the third point." };
  }
  
  if (!triangle || triangle.vertices.length !== 3) {
    return { score: 0, feedback: "Please connect the points to form a triangle." };
  }
  
  return {
    score: 100,
    feedback: "Correct! You completed the triangle."
  };
}
```

### Scenario 3: Graph a Function

```typescript
function gradeFunction(state: BoardState) {
  const student = state.objects.filter(obj => !obj.isInitial);
  
  // Check if student drew points following y = x^2
  const points = student.filter(obj => obj.type === 'point');
  
  if (points.length < 3) {
    return { score: 0, feedback: "Please plot at least 3 points." };
  }
  
  // Check if points follow the curve
  let correctPoints = 0;
  for (const point of points) {
    const expectedY = Math.pow(point.coords.x, 2);
    if (Math.abs(point.coords.y - expectedY) < 0.5) {
      correctPoints++;
    }
  }
  
  const accuracy = correctPoints / points.length;
  
  return {
    score: accuracy * 100,
    feedback: `${correctPoints} out of ${points.length} points are correct.`
  };
}
```

## Best Practices

### 1. Clear Instructions
Always provide clear, specific instructions about what students should draw.

### 2. Visual Cues
Use colored elements in the initial state to highlight important points or lines.

### 3. Limited Tools
Only enable the tools students need for the specific task.

### 4. Read-Only Enforcement
Set `readOnlyInitial={true}` to prevent students from accidentally modifying your setup.

### 5. Immediate Feedback
Use `onSubmit` to provide instant feedback when possible.

### 6. Partial Credit
Implement grading logic that awards partial credit for partially correct answers.

### 7. Multiple Attempts
Allow students to revise and resubmit until they get the correct answer.

## Testing

Visit `/openedx-demo` to test the complete workflow:
1. View the question with instructor's initial drawing
2. Draw your answer using the provided tools
3. Submit and receive automated feedback
4. View the submitted state structure

## Support

For more examples and documentation, see:
- `BUTTON_VISIBILITY_GUIDE.md` - Button configuration
- `API_COMPARISON.md` - API examples
- `app/openedx-demo/page.tsx` - Working example code
