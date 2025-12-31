import { DrawingModeHandler, DrawingContext } from './types';

/**
 * Double Arrow Drawing Mode Handler
 * Creates a line segment with arrowheads on both ends
 */
export const doubleArrowHandler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    context.setIsDrawing(true);
    context.setStartPoint({
      x: coords.usrCoords[1],
      y: coords.usrCoords[2],
    });

    // Create two invisible fixed points for the endpoints
    const p1 = context.board.create("point", [coords.usrCoords[1], coords.usrCoords[2]], {
      visible: false,
      fixed: true,
    });
    const p2 = context.board.create("point", [coords.usrCoords[1], coords.usrCoords[2]], {
      visible: false,
      fixed: true,
    });

    // Create a line segment with arrows on both ends
    // Using lastArrow and firstArrow properties for double-headed arrow
    const line = context.board.create("segment", [p1, p2], {
      strokeColor: "#3b82f6",
      strokeWidth: 2,
      fixed: true,
      lastArrow: { type: 2, size: 6 },  // Arrow at p2
      firstArrow: { type: 2, size: 6 }, // Arrow at p1
    });
    
    context.setCurrentShape({ line, p1, p2 });
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    if (!context.isDrawing || !context.currentShape || !context.startPoint) return;

    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const currentX = coords.usrCoords[1];
    const currentY = coords.usrCoords[2];

    // Update the positions of both endpoints
    context.board.suspendUpdate();
    context.currentShape.p1.setPosition((window as any).JXG.COORDS_BY_USER, [
      context.startPoint.x,
      context.startPoint.y,
    ]);
    context.currentShape.p2.setPosition((window as any).JXG.COORDS_BY_USER, [
      currentX,
      currentY,
    ]);
    context.board.unsuspendUpdate();
  },

  handleMouseUp: (e: MouseEvent, context: DrawingContext) => {
    if (!context.isDrawing || !context.currentShape) return;

    // Store all objects in the undo stack
    const shapeObjects = [
      context.currentShape.line,
      context.currentShape.p1,
      context.currentShape.p2
    ];
    context.undoStackRef.current.push(shapeObjects);
    context.redoStackRef.current = [];
    context.setVersion((v) => v + 1);

    // Reset drawing state
    context.setIsDrawing(false);
    context.setCurrentShape(null);
    context.setStartPoint(null);
  },
};
