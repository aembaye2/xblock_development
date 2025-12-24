# Grading System Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     STUDENT SUBMITS DRAWING                 │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│           Filter Objects (Remove Initial Objects)           │
│  Student: [obj1, obj2, obj3, ...]                          │
│  Expected: [exp1, exp2, exp3, ...]                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    FOR EACH EXPECTED OBJECT                 │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Group by Type │
                    └────────┬───────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
     ┌──────────┐     ┌──────────┐    ┌──────────┐
     │  Points  │     │ Segments │    │ Circles  │  ... etc
     └────┬─────┘     └────┬─────┘    └────┬─────┘
          │                │               │
          └────────────────┼───────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │  Find Best Match for Each Type │
          │  (Compare all candidates)      │
          └────────────┬───────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌────────┐    ┌─────────┐    ┌──────────┐
   │ Point  │    │ Segment │    │  Circle  │
   │Grading │    │ Grading │    │ Grading  │
   └───┬────┘    └────┬────┘    └────┬─────┘
       │              │              │
       └──────────────┼──────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │    Individual Score (0-1)   │
        │  • Point: exact match       │
        │  • Segment: endpoints       │
        │  • Circle: center + radius  │
        │  • Triangle: 3 vertices     │
        │  • Rectangle: 4 vertices    │
        │  • Arrow: directional       │
        │  • Curve: control points    │
        └──────────────┬──────────────┘
                       │
                       ▼
        ┌─────────────────────────────┐
        │   Apply Grading Mode        │
        ├─────────────────────────────┤
        │ • EXACT: score < 1 → 0      │
        │ • PARTIAL: keep score       │
        │ • TOLERANCE: ≥0.8 → 1       │
        └──────────────┬──────────────┘
                       │
                       ▼
        ┌─────────────────────────────┐
        │   Apply Object Weight       │
        │  weightedScore = score × w  │
        └──────────────┬──────────────┘
                       │
                       ▼
        ┌─────────────────────────────┐
        │   Add to Total Score        │
        │  totalScore += weightedScore│
        └──────────────┬──────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     ALL OBJECTS GRADED                      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 Normalize Score (0.0 - 1.0)                 │
│         finalScore = totalScore / totalWeight               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  requireAll?   │
                    └────┬───────┬───┘
                    YES  │       │ NO
                         │       │
                    ┌────▼───┐   │
                    │Any < 1?│   │
                    └────┬───┘   │
                    YES  │  NO   │
                         │   │   │
                    ┌────▼───▼───▼───┐
                    │  score = 0     │
                    │  OR            │
                    │  keep score    │
                    └────────┬───────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Generate Feedback Message                  │
│  ≥95%: ✅ Excellent! All correct                           │
│  ≥80%: ✅ Very good! Mostly correct                        │
│  ≥60%: ⚠️  Partially correct                               │
│  ≥30%: ⚠️  Needs improvement                               │
│  <30%: ❌ Incorrect                                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Create Detailed Breakdown                      │
│  [{                                                         │
│    type: "circle",                                          │
│    expected: {...},                                         │
│    matched: true,                                           │
│    score: 0.6,                                              │
│    weight: 2.0,                                             │
│    weightedScore: 1.2                                       │
│  }, ...]                                                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                Send to Backend                              │
│  {                                                          │
│    grade: 0.76,                                             │
│    breakdown: [...],                                        │
│    details: "3/4 objects correct. Score: 76.0%"            │
│  }                                                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Display to Student                             │
│  • Feedback message with emoji                              │
│  • Percentage score                                         │
│  • Expected drawing revealed                                │
│  • Server response message                                  │
└─────────────────────────────────────────────────────────────┘
```

## Example Scoring Calculation

### Scenario: Draw a cross with a circle

**Expected Objects:**
1. Horizontal segment (weight: 1.0)
2. Vertical segment (weight: 1.0)
3. Circle (weight: 2.0)

**Total Weight:** 1 + 1 + 2 = 4.0

**Student Submission:**
- Horizontal segment: Perfect ✓ → score = 1.0
- Vertical segment: One endpoint off → score = 0.5
- Circle: Center perfect, radius off → score = 0.6

**Calculation:**
```
totalScore = (1.0 × 1.0) + (0.5 × 1.0) + (0.6 × 2.0)
           = 1.0 + 0.5 + 1.2
           = 2.7

finalScore = 2.7 / 4.0 = 0.675 = 67.5%
```

**Result:** ⚠️ Partially correct - 2/3 objects correct. Score: 67.5%

## Type-Specific Grading Details

### Point Matching
```
student.point = (5.2, 3.8)
expected.point = (5.0, 4.0)
tolerance = 0.5

distance = sqrt((5.2-5.0)² + (3.8-4.0)²)
         = sqrt(0.04 + 0.04)
         = 0.28

0.28 ≤ 0.5 ? YES → score = 1.0 ✓
```

### Circle Matching
```
student: center (5.1, 5.0), radius 2.9
expected: center (5.0, 5.0), radius 3.0
tolerance = 0.5

centerDist = sqrt((5.1-5.0)² + (5.0-5.0)²) = 0.1 ✓
radiusDiff = |2.9 - 3.0| = 0.1 ✓

Both ≤ tolerance → score = 1.0 ✓
```

### Triangle Matching (Order-Independent)
```
student: A(1,1), B(4,1), C(2.5,4)
expected: P(1,1), Q(2.5,4), R(4,1)

Try all 6 permutations:
- ABC vs PQR: A≈P✓, B≈Q✗, C≈R✗ → 1/3
- ABC vs PRQ: A≈P✓, B≈R✓, C≈Q✓ → 3/3 ★
- ... (other permutations)

Best match: 3/3 → score = 1.0 ✓
```
