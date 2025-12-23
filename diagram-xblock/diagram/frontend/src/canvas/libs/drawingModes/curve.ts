import { DrawingModeHandler, DrawingContext } from './types';

// Curve mode state
let curvePointsRef: any[] = [];

export const curveHandler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    context.setIsDrawing(true);
    
    const x = coords.usrCoords[1];
    const y = coords.usrCoords[2];

    const newPoint = context.board.create("point", [x, y], {
      size: 2,
      visible: true,
      face: 'o',
      fillColor: '#10b981',
      strokeColor: '#065f46',
      fixed: false,
    });

    curvePointsRef.push(newPoint);
    context.setCurrentShape({ points: curvePointsRef, curve: null });
    
    context.setStartPoint({ x, y });
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    if (!context.isDrawing) return;

    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const currentX = coords.usrCoords[1];
    const currentY = coords.usrCoords[2];

    const pts = context.currentShape?.points || curvePointsRef || [];
    if (pts.length > 0) {
      context.board.suspendUpdate();
      const last = pts[pts.length - 1];
      last.setPosition((window as any).JXG.COORDS_BY_USER, [currentX, currentY]);
      context.board.unsuspendUpdate();
    }
  },

  handleMouseUp: (e: MouseEvent, context: DrawingContext) => {
    if (!context.isDrawing || !context.currentShape) return;

    const pts = context.currentShape?.points || curvePointsRef || [];
    if (pts.length === 0) {
      context.setIsDrawing(false);
      context.setCurrentShape(null);
      context.setStartPoint(null);
      return;
    }

    // Finalize the last point position
    const last = pts[pts.length - 1];
    last.setAttribute({ fixed: true });

    // If we have reached 4 points, create the Catmull-Rom spline and finish
    if (pts.length >= 4) {
      try {
        const c = context.board.create(
          "curve",
          (window as any).JXG.Math.Numerics.CatmullRomSpline(pts),
          {
            strokeWidth: 3,
            strokeColor: '#10b981',
          }
        );

        const shapeObjects = [c, ...pts];
        context.undoStackRef.current.push(shapeObjects);
        context.redoStackRef.current = [];
        context.setVersion((v) => v + 1);
      } catch (err) {
        console.error("Failed to create curve:", err);
      }

      // clear refs/state
      curvePointsRef = [];
      context.setCurrentShape(null);
      context.setIsDrawing(false);
      context.setStartPoint(null);
      return;
    }

    // If less than 4 points, leave points collected and allow more clicks/drags
    context.setIsDrawing(false);
    context.setStartPoint(null);
    context.setCurrentShape({ points: pts, curve: null });
  },

  cleanup: (context: DrawingContext) => {
    curvePointsRef = [];
  },
};
