import { DrawingModeHandler, DrawingContext, generateShapeId } from './types';

// Polygon mode state
let polygonPointsRef: any[] = [];
let polygonSegmentsRef: any[] = [];
let previewSegmentRef: any = null;
let previewPointRef: any = null;

/**
 * Update or create polygon segments based on current points
 * @param context - Drawing context
 * @param includePreview - Whether to include the preview segment
 */
function updatePolygon(context: DrawingContext, includePreview: boolean = false) {
  // Remove preview segment if it exists
  if (previewSegmentRef) {
    context.board.removeObject(previewSegmentRef);
    previewSegmentRef = null;
  }

  // If we have at least 1 point and should show preview
  if (includePreview && previewPointRef && polygonPointsRef.length >= 1) {
    const lastPoint = polygonPointsRef[polygonPointsRef.length - 1];
    previewSegmentRef = context.board.create("segment", [lastPoint, previewPointRef], {
      strokeWidth: 2,
      strokeColor: '#9ca3af',
      dash: 2,
      fixed: true,
      highlight: false,
    });
  }

  context.board.update();
}

/**
 * Finish the polygon by closing it and preparing for cleanup
 * @param context - Drawing context
 */
function finishPolygon(context: DrawingContext) {
  if (polygonPointsRef.length < 3) return; // Need at least 3 points for a polygon

  // Create closing segment from last point to first point
  const firstPoint = polygonPointsRef[0];
  const lastPoint = polygonPointsRef[polygonPointsRef.length - 1];
  
  const closingSegment = context.board.create("segment", [lastPoint, firstPoint], {
    strokeWidth: 2,
    strokeColor: '#8b5cf6',
    fixed: false,
    highlight: false,
  });
  
  polygonSegmentsRef.push(closingSegment);

  // Assign a shared UID to all polygon parts (segments + points)
  const uid = generateShapeId();
  for (const s of polygonSegmentsRef) {
    try { s.__uid = uid; } catch (e) {}
  }
  for (const p of polygonPointsRef) {
    try { p.__uid = uid; } catch (e) {}
  }

  // Keep all points draggable (don't lock them)
  polygonPointsRef.forEach((p) => {
    p.setAttribute({
      fixed: false,
      highlight: false,
    });
  });

  // Store all polygon objects in undo stack
  const shapeObjects = [...polygonSegmentsRef, ...polygonPointsRef];
  context.undoStackRef.current.push(shapeObjects);
  context.redoStackRef.current = [];
  context.setVersion((v) => v + 1);

  // Clear state
  polygonPointsRef = [];
  polygonSegmentsRef = [];
  
  // Remove preview elements
  if (previewSegmentRef) {
    context.board.removeObject(previewSegmentRef);
    previewSegmentRef = null;
  }
  if (previewPointRef) {
    context.board.removeObject(previewPointRef);
    previewPointRef = null;
  }

  context.setCurrentShape(null);
  context.setIsDrawing(false);
  context.setStartPoint(null);
}

/**
 * Polygon Drawing Mode Handler
 * Click to add vertices, double-click to close the polygon
 */
export const polygonHandler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const x = coords.usrCoords[1];
    const y = coords.usrCoords[2];

    // Check if clicking near an existing point to avoid creating duplicate points
    for (let p of polygonPointsRef) {
      const dx = p.X() - x;
      const dy = p.Y() - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.5) {
        // Too close to existing point, ignore this click
        return;
      }
    }

    // Create draggable control point
    const newPoint = context.board.create("point", [x, y], {
      size: 4,
      visible: true,
      face: 'o',
      fillColor: '#8b5cf6',
      strokeColor: '#6d28d9',
      fixed: false,
      snapToGrid: false,
      showInfobox: true,
      withLabel: false,
    });

    // Update polygon segments when point is dragged
    newPoint.on('drag', function() {
      // Redraw affected segments
      context.board.update();
    });

    // If this is not the first point, create a segment from the previous point
    if (polygonPointsRef.length > 0) {
      const previousPoint = polygonPointsRef[polygonPointsRef.length - 1];
      const segment = context.board.create("segment", [previousPoint, newPoint], {
        strokeWidth: 2,
        strokeColor: '#8b5cf6',
        fixed: false,
        highlight: false,
      });
      polygonSegmentsRef.push(segment);
    }

    polygonPointsRef.push(newPoint);
    
    context.setCurrentShape({ points: polygonPointsRef, segments: polygonSegmentsRef });
    context.setIsDrawing(true);
    context.setStartPoint({ x, y });
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    // Only show preview if we have at least 1 point
    if (polygonPointsRef.length < 1) {
      // Clean up any lingering preview elements
      if (previewSegmentRef) {
        context.board.removeObject(previewSegmentRef);
        previewSegmentRef = null;
      }
      if (previewPointRef) {
        context.board.removeObject(previewPointRef);
        previewPointRef = null;
      }
      return;
    }

    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const currentX = coords.usrCoords[1];
    const currentY = coords.usrCoords[2];

    // Remove old preview point if it exists
    if (previewPointRef) {
      context.board.removeObject(previewPointRef);
      previewPointRef = null;
    }

    // Create invisible preview point at mouse position
    previewPointRef = context.board.create("point", [currentX, currentY], {
      name: "",
      visible: false,
      fixed: true,
      withLabel: false,
    });

    // Update polygon with preview segment
    updatePolygon(context, true);
  },

  handleMouseUp: (e: MouseEvent, context: DrawingContext) => {
    // For polygon mode, we don't need to do anything on mouse up
    // The point is already created on mouse down
  },

  handleDoubleClick: (e: MouseEvent, context: DrawingContext) => {
    // Double-click to finish and close the polygon
    if (polygonPointsRef.length >= 3) {
      finishPolygon(context);
    }
  },

  cleanup: (context: DrawingContext) => {
    // Finish any incomplete polygon when switching modes
    if (polygonPointsRef.length >= 3) {
      finishPolygon(context);
    } else {
      // Remove any incomplete points and segments
      polygonPointsRef.forEach((p) => context.board.removeObject(p));
      polygonSegmentsRef.forEach((s) => context.board.removeObject(s));
      polygonPointsRef = [];
      polygonSegmentsRef = [];
    }
    
    // Remove preview elements
    if (previewSegmentRef) {
      context.board.removeObject(previewSegmentRef);
      previewSegmentRef = null;
    }
    if (previewPointRef) {
      context.board.removeObject(previewPointRef);
      previewPointRef = null;
    }
    
    context.setCurrentShape(null);
    context.setIsDrawing(false);
    context.setStartPoint(null);
  },
};
