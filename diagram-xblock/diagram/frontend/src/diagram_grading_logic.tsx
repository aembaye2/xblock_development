/**
 * Diagram Grading Logic
 * 
 * This module contains all the grading functions and logic for evaluating
 * student drawings against expected drawings in the Diagram XBlock.
 * 
 * Supports multiple object types:
 * - Points, Segments/Lines, Circles, Triangles, Rectangles, Arrows, Curves
 * 
 * Supports multiple grading modes:
 * - Tolerance: Threshold-based (≥80% = pass)
 * - Partial: Fractional scores allowed
 * - Exact: All-or-nothing grading
 */

import type { BoardState } from "./canvas/components/DrawingBoard";

// ==================== Types and Interfaces ====================

export interface GradingConfig {
  mode?: 'exact' | 'partial' | 'tolerance'; // Grading mode
  tolerance?: number; // Tolerance for point matching
  partialCredit?: boolean; // Allow partial credit
  requireAll?: boolean; // Require all expected objects
  objectWeights?: { [key: string]: number }; // Weight for each object type
}

export interface GradingResult {
  score: number; // Normalized score (0.0 to 1.0)
  details: string; // Human-readable summary
  breakdown: GradingBreakdownItem[]; // Per-object breakdown
}

export interface GradingBreakdownItem {
  type: string; // Object type (point, segment, circle, etc.)
  expected: any; // Expected object data
  matched: boolean; // Whether a matching student object was found
  score: number; // Individual score for this object
  weight: number; // Weight applied to this object
  weightedScore: number; // Final weighted score
}

// ==================== Utility Functions ====================

/**
 * Calculate Euclidean distance between two points
 */
const dist = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

// ==================== Individual Object Grading Functions ====================

/**
 * Grade a single point
 * Returns 1.0 if point matches within tolerance, 0 otherwise
 */
export const gradePoint = (student: any, expected: any, tolerance: number): number => {
  if (!student?.point || !expected?.point) return 0;
  return dist(student.point, expected.point) <= tolerance ? 1 : 0;
};

/**
 * Grade a segment or line (with endpoint reversal check)
 * Segments can match in either direction (AB = BA)
 * Returns 1.0 if both endpoints match, 0 otherwise
 */
export const gradeSegment = (student: any, expected: any, tolerance: number): number => {
  if (!student?.point1 || !student?.point2 || !expected?.point1 || !expected?.point2) return 0;
  
  const directMatch = 
    dist(student.point1, expected.point1) <= tolerance && 
    dist(student.point2, expected.point2) <= tolerance;
  const swappedMatch = 
    dist(student.point1, expected.point2) <= tolerance && 
    dist(student.point2, expected.point1) <= tolerance;
  
  return (directMatch || swappedMatch) ? 1 : 0;
};

/**
 * Grade a circle (center and radius)
 * Full credit: Both center and radius match
 * Partial credit: 0.6 for center only, 0.4 for radius only
 * Returns score from 0.0 to 1.0
 */
export const gradeCircle = (student: any, expected: any, tolerance: number): number => {
  if (!student?.center || !expected?.center) return 0;
  
  const centerMatch = dist(student.center, expected.center) <= tolerance;
  const radiusDiff = Math.abs((student.radius || 0) - (expected.radius || 0));
  const radiusMatch = radiusDiff <= tolerance;
  
  // Both center and radius must match for full credit
  if (centerMatch && radiusMatch) return 1;
  
  // Partial credit: center correct (0.6) or radius correct (0.4)
  if (centerMatch) return 0.6;
  if (radiusMatch) return 0.4;
  return 0;
};

/**
 * Grade a triangle (all three vertices, order-independent)
 * Tries all 6 permutations to find the best match
 * Returns fraction of correct vertices (0, 0.33, 0.67, or 1.0)
 */
export const gradeTriangle = (student: any, expected: any, tolerance: number): number => {
  const sPoints = [student?.point1, student?.point2, student?.point3].filter(p => p);
  const ePoints = [expected?.point1, expected?.point2, expected?.point3].filter(p => p);
  
  if (sPoints.length !== 3 || ePoints.length !== 3) return 0;
  
  // Try all permutations to find best match
  const permutations = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2], 
    [1, 2, 0], [2, 0, 1], [2, 1, 0]
  ];
  
  let bestMatch = 0;
  for (const perm of permutations) {
    const matches = perm.reduce((count, idx, i) => {
      return count + (dist(sPoints[i], ePoints[idx]) <= tolerance ? 1 : 0);
    }, 0);
    bestMatch = Math.max(bestMatch, matches);
  }
  
  return bestMatch / 3; // Return fraction of correct vertices
};

/**
 * Grade a rectangle (all four vertices, order-independent)
 * Checks all rotations and reflections to find the best match
 * Returns fraction of correct vertices (0.0, 0.25, 0.5, 0.75, or 1.0)
 */
export const gradeRectangle = (student: any, expected: any, tolerance: number): number => {
  const sPoints = [student?.point1, student?.point2, student?.point3, student?.point4].filter(p => p);
  const ePoints = [expected?.point1, expected?.point2, expected?.point3, expected?.point4].filter(p => p);
  
  if (sPoints.length !== 4 || ePoints.length !== 4) return 0;
  
  // Check all rotations and reflections
  let bestMatch = 0;
  for (let rotation = 0; rotation < 4; rotation++) {
    for (let reflection = 0; reflection < 2; reflection++) {
      let matches = 0;
      for (let i = 0; i < 4; i++) {
        let idx = (i + rotation) % 4;
        if (reflection) idx = (4 - idx) % 4;
        if (dist(sPoints[i], ePoints[idx]) <= tolerance) matches++;
      }
      bestMatch = Math.max(bestMatch, matches);
    }
  }
  
  return bestMatch / 4;
};

/**
 * Grade an arrow (similar to segment but with direction)
 * Arrow direction matters - no endpoint reversal
 * Full credit: Both endpoints match
 * Partial credit: 0.5 for one endpoint matching
 * Returns score from 0.0 to 1.0
 */
export const gradeArrow = (student: any, expected: any, tolerance: number): number => {
  if (!student?.point1 || !student?.point2 || !expected?.point1 || !expected?.point2) return 0;
  
  // Arrow direction matters, so no swap check
  const startMatch = dist(student.point1, expected.point1) <= tolerance;
  const endMatch = dist(student.point2, expected.point2) <= tolerance;
  
  if (startMatch && endMatch) return 1;
  if (startMatch || endMatch) return 0.5; // Partial credit for one endpoint
  return 0;
};

/**
 * Grade a curve (compare control points)
 * Must have same number of control points
 * Returns fraction of matching control points (0.0 to 1.0)
 */
export const gradeCurve = (student: any, expected: any, tolerance: number): number => {
  const sPoints = student?.points || [];
  const ePoints = expected?.points || [];
  
  if (sPoints.length === 0 || ePoints.length === 0) return 0;
  if (sPoints.length !== ePoints.length) return 0;
  
  let matches = 0;
  for (let i = 0; i < sPoints.length; i++) {
    if (dist(sPoints[i], ePoints[i]) <= tolerance) matches++;
  }
  
  return matches / sPoints.length;
};

// ==================== Main Grading Function ====================

/**
 * Main grading function that handles multiple object types
 * 
 * Algorithm:
 * 1. Filter student and expected objects
 * 2. For each expected object, find best matching student object of same type
 * 3. Grade using type-specific grading function
 * 4. Apply grading mode (exact, partial, tolerance)
 * 5. Apply object weights
 * 6. Normalize and return final score with breakdown
 * 
 * @param state - Student's drawing state
 * @param expected - Expected drawing state
 * @param config - Grading configuration options
 * @returns Grading result with score, details, and breakdown
 */
export const gradeDrawing = (
  state: BoardState,
  expected: BoardState,
  config: GradingConfig = {}
): GradingResult => {
  const tolerance = config.tolerance ?? 0.8;
  const partialCredit = config.partialCredit ?? true;
  const requireAll = config.requireAll ?? false;
  const mode = config.mode ?? 'tolerance';
  const objectWeights = config.objectWeights ?? {};
  
  const studentObjects = state.objects.filter((o: any) => !o.isInitial);
  const expectedObjects = expected.objects.filter((o: any) => o.type);
  
  if (expectedObjects.length === 0) {
    return { score: 0, details: 'No expected objects defined', breakdown: [] };
  }
  if (studentObjects.length === 0) {
    return { score: 0, details: 'No objects drawn', breakdown: [] };
  }
  
  const breakdown: GradingBreakdownItem[] = [];
  let totalScore = 0;
  let totalWeight = 0;
  const matchedStudentIndices = new Set<number>();
  
  // Grade each expected object
  for (const expObj of expectedObjects) {
    const objType = expObj.type;
    const weight = objectWeights[objType] ?? 1;
    totalWeight += weight;
    
    // Find all student objects of the same type that haven't been matched yet
    const candidates = studentObjects
      .map((obj, idx) => ({ obj, idx }))
      .filter(({ obj, idx }) => obj.type === objType && !matchedStudentIndices.has(idx));
    
    let bestScore = 0;
    let bestIdx = -1;
    
    // Grade each candidate and pick the best match
    for (const { obj: stuObj, idx } of candidates) {
      let score = 0;
      
      switch (objType) {
        case 'point':
          score = gradePoint(stuObj, expObj, tolerance);
          break;
        case 'segment':
        case 'line':
          score = gradeSegment(stuObj, expObj, tolerance);
          break;
        case 'circle':
          score = gradeCircle(stuObj, expObj, tolerance);
          break;
        case 'triangle':
          score = gradeTriangle(stuObj, expObj, tolerance);
          break;
        case 'rectangle':
          score = gradeRectangle(stuObj, expObj, tolerance);
          break;
        case 'arrow':
        case 'doubleArrow':
          score = gradeArrow(stuObj, expObj, tolerance);
          break;
        case 'curve':
          score = gradeCurve(stuObj, expObj, tolerance);
          break;
        default:
          score = 0;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    }
    
    // Mark the best match as used
    if (bestIdx >= 0) {
      matchedStudentIndices.add(bestIdx);
    }
    
    // Apply mode-specific scoring
    let finalScore = bestScore;
    if (mode === 'exact' && bestScore < 1) {
      finalScore = 0; // Exact mode: no partial credit
    } else if (mode === 'partial' || partialCredit) {
      finalScore = bestScore; // Allow partial credit
    } else if (mode === 'tolerance') {
      finalScore = bestScore >= 0.8 ? 1 : 0; // Tolerance mode: threshold at 0.8
    }
    
    totalScore += finalScore * weight;
    
    breakdown.push({
      type: objType,
      expected: expObj,
      matched: bestIdx >= 0,
      score: finalScore,
      weight: weight,
      weightedScore: finalScore * weight
    });
  }
  
  // Normalize score
  const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  
  // If requireAll is true, need all objects to be correct
  const finalScore = requireAll && breakdown.some(b => b.score < 1) ? 0 : normalizedScore;
  
  // Generate details message
  const correctCount = breakdown.filter(b => b.score >= 0.95).length;
  const details = `${correctCount}/${expectedObjects.length} objects correct. Score: ${(finalScore * 100).toFixed(1)}%`;
  
  return { score: finalScore, details, breakdown };
};

// ==================== Feedback Generation ====================

/**
 * Generate user-friendly feedback message based on score
 * 
 * @param score - Normalized score (0.0 to 1.0)
 * @returns Feedback message with emoji
 */
export const generateFeedbackMessage = (score: number): string => {
  if (score >= 0.95) {
    return '✅ Excellent! All correct';
  } else if (score >= 0.8) {
    return '✅ Very good! Mostly correct';
  } else if (score >= 0.6) {
    return '⚠️ Partially correct';
  } else if (score >= 0.3) {
    return '⚠️ Needs improvement';
  } else {
    return '❌ Incorrect';
  }
};
