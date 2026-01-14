import { DrawingModeHandler, DrawingContext, Point } from './types';

// Triangle mode state
let trianglePointsRef: Point[] = [];
let trianglePreviewRef: any = null;
let triangleDrawingRef: boolean = false;

export const triangleHandler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const x = coords.usrCoords[1];
    const y = coords.usrCoords[2];
    const points = trianglePointsRef;

    // For triangle mode, only set isDrawing if not finalizing (third click)
    const isTriangleThirdClick = points.length === 2;
    
    if (!isTriangleThirdClick) {
      context.setIsDrawing(true);
    }
    
    context.setStartPoint({ x, y });

    // First click: add first vertex and preview segment to cursor
    if (points.length === 0) {
      points.push({ x, y });
      const startCircle = context.board.create("point", [x, y], {
        size: 3,
        fillColor: "#f59e0b",
        strokeColor: "#f59e0b",
        fixed: true,
        name: '',
      });

      const previewP1 = context.board.create("point", [x, y], { visible: false, fixed: true });
      const previewP2 = context.board.create("point", [x, y], { visible: false, fixed: true });
      const previewLine = context.board.create("segment", [previewP1, previewP2], {
        strokeColor: "#f59e0b",
        strokeWidth: 2,
        fixed: true,
      });

      context.setCurrentShape({ startCircle, previewLine });
      triangleDrawingRef = true;
      return;
    }

    // Second click: add second vertex and start preview triangle
    if (points.length === 1) {
      points.push({ x, y });

      if (context.currentShape?.previewLine) {
        try {
          if (context.currentShape.previewLine.point1) context.board.removeObject(context.currentShape.previewLine.point1);
          if (context.currentShape.previewLine.point2) context.board.removeObject(context.currentShape.previewLine.point2);
          context.board.removeObject(context.currentShape.previewLine);
        } catch (err) {
          // ignore
        }
      }

      const p1 = context.board.create("point", [points[0].x, points[0].y], { visible: false, fixed: true });
      const p2 = context.board.create("point", [points[1].x, points[1].y], { visible: false, fixed: true });
      const p3 = context.board.create("point", [x, y], { visible: false, fixed: true });
      const previewTriangle = context.board.create("polygon", [p1, p2, p3], {
        fillColor: "#fbbf24",
        fillOpacity: 0.2,
        borders: {
          strokeColor: "#f59e0b",
          strokeWidth: 2,
        },
        fixed: true,
      });

      trianglePreviewRef = { previewTriangle, p1, p2, p3 };
      context.setCurrentShape({ ...context.currentShape, previewTriangle, p3 });
      triangleDrawingRef = true;
      return;
    }

    // If already have two points, ignore single click — we'll finalize on dblclick.
    if (points.length >= 2) {
      return;
    }
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    if (!context.isDrawing || !context.currentShape || !context.startPoint) return;

    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const currentX = coords.usrCoords[1];
    const currentY = coords.usrCoords[2];

    context.board.suspendUpdate();

    // Use triangleDrawingRef to synchronously allow/disable preview updates
    if (!triangleDrawingRef) {
      context.board.unsuspendUpdate();
      return;
    }

    const points = trianglePointsRef;

    // If we have one point, update preview line from first point to cursor
    if (points.length === 1 && context.currentShape?.previewLine) {
      try {
        context.currentShape.previewLine.point2.setPosition((window as any).JXG.COORDS_BY_USER, [currentX, currentY]);
      } catch (err) {
        // ignore if previewLine was removed
      }
    }

    // If we have two points, update preview triangle's third point to follow cursor
    if (points.length === 2 && trianglePreviewRef?.p3) {
      try {
        trianglePreviewRef.p3.setPosition((window as any).JXG.COORDS_BY_USER, [currentX, currentY]);
      } catch (err) {
        // ignore if preview points were removed
      }
    }

    context.board.unsuspendUpdate();
  },

  handleMouseUp: (e: MouseEvent, context: DrawingContext) => {
    // Triangle is handled entirely in mousedown with click-based approach
    return;
  },

  handleDoubleClick: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const points = trianglePointsRef;
    if (points.length !== 2) return;

    const x = coords.usrCoords[1];
    const y = coords.usrCoords[2];

    // Finalize triangle on double click
    points.push({ x, y });
    triangleDrawingRef = false;
    context.setIsDrawing(false);
    const cs = context.currentShape;
    context.setCurrentShape(null);

    // Remove preview objects
    if (trianglePreviewRef) {
      const { previewTriangle, p1, p2, p3 } = trianglePreviewRef;
      try {
        if (previewTriangle) context.board.removeObject(previewTriangle);
        if (p1) context.board.removeObject(p1);
        if (p2) context.board.removeObject(p2);
        if (p3) context.board.removeObject(p3);
      } catch (err) {}
    }

    if (cs?.startCircle) {
      try {
        context.board.removeObject(cs.startCircle);
      } catch (err) {}
    }

    // Create final triangle using coordinate arrays
    const finalTriangle = context.board.create("polygon", [
      [points[0].x, points[0].y],
      [points[1].x, points[1].y],
      [points[2].x, points[2].y],
    ], {
      fillColor: "#fbbf24",
      fillOpacity: 0.2,
      borders: {
        strokeColor: "#f59e0b",
        strokeWidth: 2,
      },
      fixed: true,
    });

    // Add to undo stack
    context.undoStackRef.current.push([finalTriangle]);
    context.redoStackRef.current = [];
    context.setVersion((v) => v + 1);

    // Update board and reset state
    try {
      finalTriangle.setAttribute({ fixed: true });
      finalTriangle.update && finalTriangle.update();
      context.board.update && context.board.update();
    } catch (err) {}

    trianglePointsRef = [];
    trianglePreviewRef = null;
    triangleDrawingRef = false;
    context.setCurrentShape(null);
    context.setStartPoint(null);
  },

  cleanup: (context: DrawingContext) => {
    // Clean up triangle preview objects
    if (trianglePreviewRef) {
      const { previewTriangle, p1, p2, p3 } = trianglePreviewRef;
      try {
        if (previewTriangle) context.board.removeObject(previewTriangle);
        if (p1) context.board.removeObject(p1);
        if (p2) context.board.removeObject(p2);
        if (p3) context.board.removeObject(p3);
      } catch (e) {
        // Ignore errors if objects already removed
      }
      trianglePreviewRef = null;
    }
    
    if (context.currentShape?.startCircle) {
      try {
        context.board.removeObject(context.currentShape.startCircle);
      } catch (e) {
        // Ignore
      }
    }
    
    if (context.currentShape?.previewLine) {
      try {
        context.board.removeObject(context.currentShape.previewLine);
        if (context.currentShape.previewLine.point1) context.board.removeObject(context.currentShape.previewLine.point1);
        if (context.currentShape.previewLine.point2) context.board.removeObject(context.currentShape.previewLine.point2);
      } catch (e) {
        // Ignore
      }
    }
    
    trianglePointsRef = [];
    triangleDrawingRef = false;
  },
};

// Export a function to handle Escape key
export const handleTriangleEscape = (context: DrawingContext) => {
  if (!triangleDrawingRef || !context.board) return false;

  // Remove any preview objects and reset state
  try {
    if (trianglePreviewRef) {
      const { previewTriangle, p1, p2, p3 } = trianglePreviewRef;
      if (previewTriangle) context.board.removeObject(previewTriangle);
      if (p1) context.board.removeObject(p1);
      if (p2) context.board.removeObject(p2);
      if (p3) context.board.removeObject(p3);
    }
    
    if (context.currentShape?.previewLine) {
      try {
        if (context.currentShape.previewLine.point1) context.board.removeObject(context.currentShape.previewLine.point1);
        if (context.currentShape.previewLine.point2) context.board.removeObject(context.currentShape.previewLine.point2);
        context.board.removeObject(context.currentShape.previewLine);
      } catch (err) {}
    }
    
    if (context.currentShape?.startCircle) {
      try { 
        context.board.removeObject(context.currentShape.startCircle); 
      } catch (err) {}
    }
  } catch (err) {}

  trianglePointsRef = [];
  trianglePreviewRef = null;
  triangleDrawingRef = false;
  context.setCurrentShape(null);
  context.setIsDrawing(false);
  context.setStartPoint(null);
  
  return true;
};
