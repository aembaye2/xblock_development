import { DrawingModeHandler, DrawingContext, generateShapeId } from './types';

export const segmentHandler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const x = coords.usrCoords[1];
    const y = coords.usrCoords[2];

    // First click - start the preview
    if (!context.isDrawing) {
      context.setIsDrawing(true);
      context.setStartPoint({ x, y });

      // Create a visual indicator at the start point
      const startCircle = context.board.create("point", [x, y], {
        size: 3,
        fillColor: "#3b82f6",
        strokeColor: "#3b82f6",
        fixed: true,
        name: '',
      });

      // Create preview segment with invisible endpoints
      const p1 = context.board.create("point", [x, y], {
        visible: false,
        fixed: true,
      });
      const p2 = context.board.create("point", [x, y], {
        visible: false,
        fixed: true,
      });
      const previewSegment = context.board.create("segment", [p1, p2], {
        strokeColor: "#3b82f6",
        strokeWidth: 2,
        dash: 2, // Dashed line for preview
        fixed: true,
      });

      context.setCurrentShape({ previewSegment, p1, p2, startCircle });
    } 
    // Second click - finalize the segment
    else {
      const { previewSegment, p1, p2, startCircle } = context.currentShape;

      // Remove preview objects
      context.board.removeObject(previewSegment);
      context.board.removeObject(p1);
      context.board.removeObject(p2);
      context.board.removeObject(startCircle);

      // Create final segment with visible, draggable endpoints
      const finalP1 = context.board.create("point", [context.startPoint.x, context.startPoint.y], {
        size: 3,
        fillColor: "#3b82f6",
        strokeColor: "#3b82f6",
        fixed: false,
        name: '',
      });
      const uid = generateShapeId();
      finalP1.__uid = uid;

      const finalP2 = context.board.create("point", [x, y], {
        size: 3,
        fillColor: "#3b82f6",
        strokeColor: "#3b82f6",
        fixed: false,
        name: '',
      });
      finalP2.__uid = uid;

      const finalSegment = context.board.create("segment", [finalP1, finalP2], {
        strokeColor: "#3b82f6",
        strokeWidth: 2,
        fixed: false,
      });

      finalSegment.__uid = uid;

      // Add to undo stack
      const shapeObjects = [finalSegment, finalP1, finalP2];
      context.undoStackRef.current.push(shapeObjects);
      context.redoStackRef.current = [];
      context.setVersion((v) => v + 1);

      // Reset state
      context.setIsDrawing(false);
      context.setCurrentShape(null);
      context.setStartPoint(null);
    }
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    // Only update preview if we're in drawing mode (after first click)
    if (!context.isDrawing || !context.currentShape || !context.startPoint) return;

    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const currentX = coords.usrCoords[1];
    const currentY = coords.usrCoords[2];

    // Update the preview segment's endpoint to follow the mouse
    context.board.suspendUpdate();
    context.currentShape.p2.setPosition((window as any).JXG.COORDS_BY_USER, [
      currentX,
      currentY,
    ]);
    context.board.unsuspendUpdate();
  },

  handleMouseUp: (e: MouseEvent, context: DrawingContext) => {
    // No longer needed for click-based approach
    // All logic is now in handleMouseDown
  },

  cleanup: (context: DrawingContext) => {
    // Clean up any preview objects when switching tools
    if (context.currentShape) {
      try {
        if (context.currentShape.previewSegment) context.board.removeObject(context.currentShape.previewSegment);
        if (context.currentShape.p1) context.board.removeObject(context.currentShape.p1);
        if (context.currentShape.p2) context.board.removeObject(context.currentShape.p2);
        if (context.currentShape.startCircle) context.board.removeObject(context.currentShape.startCircle);
      } catch (e) {
        // Ignore errors if objects already removed
      }
    }
    context.setCurrentShape(null);
    context.setIsDrawing(false);
    context.setStartPoint(null);
  },
};
