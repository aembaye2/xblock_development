# Grading System Guide for Diagram XBlock

## Overview

The diagram XBlock now includes an enhanced grading system that supports multiple object types and different grading strategies. This guide explains how the grading system works and how to configure it.

## Supported Object Types

The grading system can evaluate the following geometric objects:

1. **Point** - Single coordinate (x, y)
2. **Segment/Line** - Two endpoints
3. **Circle** - Center point and radius
4. **Triangle** - Three vertices
5. **Rectangle** - Four vertices
6. **Arrow/DoubleArrow** - Directional line with start and end
7. **Curve** - Series of control points

## Grading Modes

### 1. Tolerance Mode (Default)
- Uses a distance tolerance to determine if points match
- Scores ≥ 0.8 are considered correct (scored as 1.0)
- Scores < 0.8 are considered incorrect (scored as 0)
- Best for most educational scenarios

### 2. Partial Credit Mode
- Allows partial credit for partially correct answers
- Scores range from 0.0 to 1.0 based on accuracy
- Useful for complex problems where partial understanding should be rewarded

### 3. Exact Mode
- Requires perfect matches with no tolerance for error
- Any deviation results in a score of 0
- Useful for precision-focused exercises

## Grading Strategies by Object Type

### Point Grading
- Compares distance between student and expected point
- **Full credit (1.0)**: Distance ≤ tolerance
- **No credit (0.0)**: Distance > tolerance

### Segment/Line Grading
- Compares both endpoints
- Endpoints can be in either order (e.g., AB = BA)
- **Full credit (1.0)**: Both endpoints match within tolerance
- **No credit (0.0)**: One or both endpoints don't match

### Circle Grading
- Compares center position and radius
- **Full credit (1.0)**: Both center and radius match
- **Partial credit (0.6)**: Only center matches
- **Partial credit (0.4)**: Only radius matches
- **No credit (0.0)**: Neither matches

### Triangle Grading
- Compares all three vertices
- Order-independent (all permutations checked)
- **Score**: Fraction of correct vertices (0/3, 1/3, 2/3, or 3/3)
- **Full credit (1.0)**: All three vertices match

### Rectangle Grading
- Compares all four vertices
- Checks all rotations and reflections
- **Score**: Fraction of correct vertices (0.0 to 1.0)
- **Full credit (1.0)**: All four vertices match in any valid orientation

### Arrow Grading
- Compares start and end points
- **Direction matters** - no endpoint reversal
- **Full credit (1.0)**: Both points match
- **Partial credit (0.5)**: One point matches
- **No credit (0.0)**: No points match

### Curve Grading
- Compares all control points in order
- **Score**: Fraction of matching control points
- Must have same number of control points

## Configuration Options

### GradingConfig Interface

```typescript
interface GradingConfig {
  mode?: 'exact' | 'partial' | 'tolerance';  // Grading mode
  tolerance?: number;                         // Distance tolerance (default: 0.8)
  partialCredit?: boolean;                    // Allow partial credit (default: true)
  requireAll?: boolean;                       // Require all objects correct (default: false)
  objectWeights?: { [key: string]: number };  // Custom weights for object types
}
```

### Example Configurations

#### Basic Configuration (Default)
```json
{
  "gradingConfig": {
    "mode": "tolerance",
    "tolerance": 0.8,
    "partialCredit": true,
    "requireAll": false
  }
}
```

#### Strict All-or-Nothing Grading
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

#### Weighted Objects
```json
{
  "gradingConfig": {
    "mode": "partial",
    "tolerance": 0.8,
    "partialCredit": true,
    "objectWeights": {
      "circle": 2.0,
      "triangle": 1.5,
      "segment": 1.0,
      "point": 0.5
    }
  }
}
```

## Multi-Object Grading

When multiple expected objects are defined:

1. Each expected object is graded independently
2. Student objects are matched to expected objects of the same type
3. Each student object is matched to at most one expected object
4. The best-matching student object is selected for each expected object
5. Weighted scores are summed and normalized

### Example: Multiple Objects

If the expected drawing contains:
- 2 points (weight 1.0 each)
- 1 circle (weight 2.0)
- 1 triangle (weight 1.5)

Total weight = 1 + 1 + 2 + 1.5 = 5.5

If student scores:
- Point 1: 1.0 (correct)
- Point 2: 1.0 (correct)
- Circle: 0.6 (center only)
- Triangle: 0.67 (2 of 3 vertices)

Final score = (1.0×1 + 1.0×1 + 0.6×2 + 0.67×1.5) / 5.5
            = (1 + 1 + 1.2 + 1.0) / 5.5
            = 4.2 / 5.5
            = 0.76 (76%)

## Result Messages

The system provides automatic feedback based on score:

- **≥ 95%**: ✅ Excellent! All correct
- **≥ 80%**: ✅ Very good! Mostly correct
- **≥ 60%**: ⚠️ Partially correct
- **≥ 30%**: ⚠️ Needs improvement
- **< 30%**: ❌ Incorrect

## Backend Integration

The frontend sends detailed grading information to the backend:

```json
{
  "grade": 0.76,
  "breakdown": [
    {
      "type": "point",
      "expected": {...},
      "matched": true,
      "score": 1.0,
      "weight": 1.0,
      "weightedScore": 1.0
    },
    // ... more objects
  ],
  "details": "3/4 objects correct. Score: 76.0%"
}
```

## Best Practices

1. **Set appropriate tolerance**: 
   - Use 0.5-1.0 for precise diagrams
   - Use 1.0-2.0 for sketchy diagrams

2. **Use object weights** for complex problems:
   - Higher weights for more important objects
   - Equal weights for uniform importance

3. **Choose the right mode**:
   - `tolerance`: Most educational scenarios
   - `partial`: Encourage partial solutions
   - `exact`: High-precision requirements

4. **Set requireAll cautiously**:
   - `true`: All-or-nothing grading (harsh)
   - `false`: Partial credit encouraged (gentler)

## Troubleshooting

### Common Issues

1. **Score always 0**: Check if tolerance is too small
2. **Score always 1**: Check if tolerance is too large
3. **Wrong objects matched**: Ensure object types match between expected and student drawings
4. **Unexpected partial credit**: Review partialCredit and mode settings

## Future Enhancements

Planned improvements:
- Angle measurement grading
- Perpendicularity/parallelism checking
- Area and perimeter comparison
- Symmetry detection
- Multi-step problem support
