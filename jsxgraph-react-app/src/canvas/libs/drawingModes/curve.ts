import { DrawingModeHandler, DrawingContext } from './types';

// Curve mode state
let curvePointsRef: any[] = [];
let currentCurveRef: any = null;
let previewPointRef: any = null;
let mouseMoveListenerRef: any = null;

/**
 * Update or create the curve based on current points
 * @param context - Drawing context
 * @param includePreview - Whether to include the preview point in the curve
 */
function updateCurve(context: DrawingContext, includePreview: boolean = false) {
  // Remove current curve if it exists
  if (currentCurveRef) {
    context.board.removeObject(currentCurveRef);
    currentCurveRef = null;
  }

  // Determine which points to use
  let pointsForCurve = curvePointsRef;
  if (includePreview && previewPointRef && curvePointsRef.length >= 1) {
    pointsForCurve = [...curvePointsRef, previewPointRef];
  }

  // Create new curve if we have enough points (2 or more)
  if (pointsForCurve.length >= 2) {
    try {
      currentCurveRef = context.board.create(
        "cardinalspline",
        [pointsForCurve, 1, "centripetal"],
        {
          strokeWidth: 3,
          strokeColor: '#10b981',
          highlight: false,
        }
      );
    } catch (err) {
      console.error("Failed to create curve:", err);
    }
  }

  context.board.update();
}

/**
 * Finish the current curve and prepare for a new one or cleanup
 * @param context - Drawing context
 * @param startNew - Whether to start a new curve after finishing
 */
function finishCurve(context: DrawingContext, startNew: boolean = false) {
  if (curvePointsRef.length < 2) return;

  // Lock current points
  curvePointsRef.forEach((p) => {
    p.setAttribute({
      fixed: true,
      highlight: false,
    });
  });

  // Store completed curve in undo stack
  const shapeObjects = currentCurveRef ? [currentCurveRef, ...curvePointsRef] : [...curvePointsRef];
  context.undoStackRef.current.push(shapeObjects);
  context.redoStackRef.current = [];
  context.setVersion((v) => v + 1);

  // Clear state
  curvePointsRef = [];
  currentCurveRef = null;
  
  // Remove preview point
  if (previewPointRef) {
    context.board.removeObject(previewPointRef);
    previewPointRef = null;
  }

  context.setCurrentShape(null);
  
  if (!startNew) {
    context.setIsDrawing(false);
    context.setStartPoint(null);
  }
}

export const curveHandler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const x = coords.usrCoords[1];
    const y = coords.usrCoords[2];

    // Check if clicking near an existing point to avoid creating duplicate points
    for (let p of curvePointsRef) {
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
      fillColor: '#10b981',
      strokeColor: '#065f46',
      fixed: false,
      snapToGrid: false,
      showInfobox: true,
      withLabel: false,
    });

    // Update curve when point is dragged
    newPoint.on('drag', function() {
      updateCurve(context, false);
    });

    curvePointsRef.push(newPoint);
    
    // Update the curve immediately if we have 2+ points
    updateCurve(context, false);
    
    context.setCurrentShape({ points: curvePointsRef, curve: currentCurveRef });
    context.setIsDrawing(true);
    context.setStartPoint({ x, y });
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    // Only show preview if we have at least 1 point and are in drawing mode
    if (curvePointsRef.length < 1) {
      // Clean up any lingering preview point
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
      visible: false, // Make it invisible
      fixed: true,
      withLabel: false,
    });

    // Update curve with preview
    updateCurve(context, true);
  },

  handleMouseUp: (e: MouseEvent, context: DrawingContext) => {
    // For curve mode, we don't need to do anything on mouse up
    // The point is already created on mouse down
  },

  handleDoubleClick: (e: MouseEvent, context: DrawingContext) => {
    // Double-click to finish current curve
    if (curvePointsRef.length >= 2) {
      finishCurve(context, false);
    }
  },

  cleanup: (context: DrawingContext) => {
    // Finish any incomplete curve when switching modes
    if (curvePointsRef.length >= 2) {
      finishCurve(context, false);
    } else {
      // Remove any incomplete points and curve
      curvePointsRef.forEach((p) => context.board.removeObject(p));
      if (currentCurveRef) {
        context.board.removeObject(currentCurveRef);
      }
      curvePointsRef = [];
      currentCurveRef = null;
    }
    
    // Remove preview point
    if (previewPointRef) {
      context.board.removeObject(previewPointRef);
      previewPointRef = null;
    }
    
    context.setCurrentShape(null);
    context.setIsDrawing(false);
    context.setStartPoint(null);
  },
};
