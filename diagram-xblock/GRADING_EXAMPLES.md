# Grading Configuration Examples

This file provides practical examples of grading configurations for different educational scenarios.

## Example 1: Basic Geometry - Drawing a Line

**Question**: Draw a line from point (2, 3) to point (7, 8)

**Expected Drawing**:
```json
{
  "version": "1.0",
  "boardSettings": { "boundingBox": [-1, 11, 11, -1] },
  "objects": [
    {
      "id": "expected_line_1",
      "type": "segment",
      "point1": { "x": 2, "y": 3 },
      "point2": { "x": 7, "y": 8 },
      "properties": { "strokeColor": "#059669", "strokeWidth": 2 }
    }
  ]
}
```

**Grading Config**:
```json
{
  "gradingConfig": {
    "mode": "tolerance",
    "tolerance": 1.0,
    "partialCredit": false,
    "requireAll": true
  }
}
```

---

## Example 2: Circle Drawing with Partial Credit

**Question**: Draw a circle with center at (5, 5) and radius 3

**Expected Drawing**:
```json
{
  "version": "1.0",
  "boardSettings": { "boundingBox": [-1, 11, 11, -1] },
  "objects": [
    {
      "id": "expected_circle_1",
      "type": "circle",
      "center": { "x": 5, "y": 5 },
      "radius": 3,
      "properties": { "strokeColor": "#059669", "strokeWidth": 2 }
    }
  ]
}
```

**Grading Config**:
```json
{
  "gradingConfig": {
    "mode": "partial",
    "tolerance": 0.8,
    "partialCredit": true,
    "requireAll": false
  }
}
```

**Grading Behavior**:
- Correct center + correct radius = 100%
- Correct center only = 60%
- Correct radius only = 40%
- Neither correct = 0%

---

## Example 3: Triangle Construction

**Question**: Construct a triangle with vertices at (2, 2), (8, 2), and (5, 7)

**Expected Drawing**:
```json
{
  "version": "1.0",
  "boardSettings": { "boundingBox": [-1, 11, 11, -1] },
  "objects": [
    {
      "id": "expected_triangle_1",
      "type": "triangle",
      "point1": { "x": 2, "y": 2 },
      "point2": { "x": 8, "y": 2 },
      "point3": { "x": 5, "y": 7 },
      "properties": { "strokeColor": "#059669", "strokeWidth": 2 }
    }
  ]
}
```

**Grading Config**:
```json
{
  "gradingConfig": {
    "mode": "partial",
    "tolerance": 1.0,
    "partialCredit": true,
    "requireAll": false
  }
}
```

**Grading Behavior**:
- All 3 vertices correct = 100%
- 2 vertices correct = 67%
- 1 vertex correct = 33%
- 0 vertices correct = 0%

---

## Example 4: Complex Multi-Object Problem

**Question**: Draw the following:
1. A horizontal base line from (1, 2) to (9, 2)
2. A vertical line from (5, 2) to (5, 8)
3. A circle centered at (5, 5) with radius 2

**Expected Drawing**:
```json
{
  "version": "1.0",
  "boardSettings": { "boundingBox": [-1, 11, 11, -1] },
  "objects": [
    {
      "id": "base_line",
      "type": "segment",
      "point1": { "x": 1, "y": 2 },
      "point2": { "x": 9, "y": 2 },
      "properties": { "strokeColor": "#059669", "strokeWidth": 2 }
    },
    {
      "id": "vertical_line",
      "type": "segment",
      "point1": { "x": 5, "y": 2 },
      "point2": { "x": 5, "y": 8 },
      "properties": { "strokeColor": "#059669", "strokeWidth": 2 }
    },
    {
      "id": "center_circle",
      "type": "circle",
      "center": { "x": 5, "y": 5 },
      "radius": 2,
      "properties": { "strokeColor": "#059669", "strokeWidth": 2 }
    }
  ]
}
```

**Grading Config** (Weighted):
```json
{
  "gradingConfig": {
    "mode": "partial",
    "tolerance": 0.8,
    "partialCredit": true,
    "requireAll": false,
    "objectWeights": {
      "segment": 1.0,
      "circle": 2.0
    }
  }
}
```

**Weight Distribution**:
- Base line: weight 1.0 (25% of total)
- Vertical line: weight 1.0 (25% of total)
- Circle: weight 2.0 (50% of total)

---

## Example 5: Arrow Direction Exercise

**Question**: Draw an arrow from point A (2, 5) pointing to point B (8, 5)

**Expected Drawing**:
```json
{
  "version": "1.0",
  "boardSettings": { "boundingBox": [-1, 11, 11, -1] },
  "objects": [
    {
      "id": "arrow_1",
      "type": "arrow",
      "point1": { "x": 2, "y": 5 },
      "point2": { "x": 8, "y": 5 },
      "properties": { "strokeColor": "#059669", "strokeWidth": 2 }
    }
  ]
}
```

**Grading Config**:
```json
{
  "gradingConfig": {
    "mode": "partial",
    "tolerance": 1.0,
    "partialCredit": true,
    "requireAll": false
  }
}
```

**Grading Behavior** (Direction matters!):
- Correct start + correct end = 100%
- Correct start OR correct end = 50%
- Wrong direction (B to A) = 50% at best
- Completely wrong = 0%

---

## Example 6: Rectangle with Strict Grading

**Question**: Draw a rectangle with corners at (2, 2), (8, 2), (8, 6), and (2, 6)

**Expected Drawing**:
```json
{
  "version": "1.0",
  "boardSettings": { "boundingBox": [-1, 11, 11, -1] },
  "objects": [
    {
      "id": "rectangle_1",
      "type": "rectangle",
      "point1": { "x": 2, "y": 2 },
      "point2": { "x": 8, "y": 2 },
      "point3": { "x": 8, "y": 6 },
      "point4": { "x": 2, "y": 6 },
      "properties": { "strokeColor": "#059669", "strokeWidth": 2 }
    }
  ]
}
```

**Grading Config** (All-or-nothing):
```json
{
  "gradingConfig": {
    "mode": "exact",
    "tolerance": 0.5,
    "partialCredit": false,
    "requireAll": true
  }
}
```

**Grading Behavior**:
- Perfect match = 100%
- Any deviation = 0%

---

## Example 7: Multiple Triangles (Pattern Recognition)

**Question**: Draw two equilateral triangles to form a Star of David

**Expected Drawing**:
```json
{
  "version": "1.0",
  "boardSettings": { "boundingBox": [-1, 11, 11, -1] },
  "objects": [
    {
      "id": "triangle_up",
      "type": "triangle",
      "point1": { "x": 5, "y": 2 },
      "point2": { "x": 2, "y": 7 },
      "point3": { "x": 8, "y": 7 },
      "properties": { "strokeColor": "#059669", "strokeWidth": 2 }
    },
    {
      "id": "triangle_down",
      "type": "triangle",
      "point1": { "x": 5, "y": 8 },
      "point2": { "x": 2, "y": 3 },
      "point3": { "x": 8, "y": 3 },
      "properties": { "strokeColor": "#059669", "strokeWidth": 2 }
    }
  ]
}
```

**Grading Config**:
```json
{
  "gradingConfig": {
    "mode": "tolerance",
    "tolerance": 1.0,
    "partialCredit": true,
    "requireAll": false
  }
}
```

**Grading Behavior**:
- Both triangles correct = 100%
- One triangle correct = 50%
- Partial matches accumulate

---

## Example 8: Curve Drawing

**Question**: Draw a smooth curve passing through points (1,2), (3,5), (5,6), (7,5), (9,2)

**Expected Drawing**:
```json
{
  "version": "1.0",
  "boardSettings": { "boundingBox": [-1, 11, 11, -1] },
  "objects": [
    {
      "id": "curve_1",
      "type": "curve",
      "points": [
        { "x": 1, "y": 2 },
        { "x": 3, "y": 5 },
        { "x": 5, "y": 6 },
        { "x": 7, "y": 5 },
        { "x": 9, "y": 2 }
      ],
      "properties": { "strokeColor": "#059669", "strokeWidth": 2 }
    }
  ]
}
```

**Grading Config**:
```json
{
  "gradingConfig": {
    "mode": "partial",
    "tolerance": 1.5,
    "partialCredit": true,
    "requireAll": false
  }
}
```

**Grading Behavior**:
- Score = (number of correct control points) / (total control points)
- In this case: 5 points total, so each contributes 20%

---

## Python Backend Example

Here's how to configure these in the XBlock Python code:

```python
# In diagram.py or similar

# Example 1: Simple segment
self.expected_drawing = json.dumps({
    "version": "1.0",
    "boardSettings": {"boundingBox": [-1, 11, 11, -1]},
    "objects": [{
        "id": "seg1",
        "type": "segment",
        "point1": {"x": 2, "y": 3},
        "point2": {"x": 7, "y": 8},
        "properties": {"strokeColor": "#059669", "strokeWidth": 2}
    }]
})

self.grading_config = {
    "mode": "tolerance",
    "tolerance": 1.0,
    "partialCredit": False,
    "requireAll": True
}

# Example 2: Weighted multi-object
self.expected_drawing = json.dumps({
    "version": "1.0",
    "boardSettings": {"boundingBox": [-1, 11, 11, -1]},
    "objects": [
        {
            "id": "base",
            "type": "segment",
            "point1": {"x": 1, "y": 2},
            "point2": {"x": 9, "y": 2},
            "properties": {"strokeColor": "#059669", "strokeWidth": 2}
        },
        {
            "id": "circle",
            "type": "circle",
            "center": {"x": 5, "y": 5},
            "radius": 2,
            "properties": {"strokeColor": "#059669", "strokeWidth": 2}
        }
    ]
})

self.grading_config = {
    "mode": "partial",
    "tolerance": 0.8,
    "partialCredit": True,
    "requireAll": False,
    "objectWeights": {
        "segment": 1.0,
        "circle": 2.0
    }
}
```

---

## Testing Your Configuration

1. Set up the expected drawing and grading config
2. Test with intentionally incorrect drawings:
   - Off by small amount (test tolerance)
   - Missing objects (test requireAll)
   - Partially correct (test partialCredit)
3. Verify score matches expectations
4. Adjust tolerance and weights as needed
