import { DrawingModeHandler, DrawingContext } from './types';

export const segmentHandler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    context.setIsDrawing(true);
    context.setStartPoint({
      x: coords.usrCoords[1],
      y: coords.usrCoords[2],
    });

    const p1 = context.board.create("point", [coords.usrCoords[1], coords.usrCoords[2]], {
      visible: false,
      fixed: true,
    });
    const p2 = context.board.create("point", [coords.usrCoords[1], coords.usrCoords[2]], {
      visible: false,
      fixed: true,
    });
    const segment = context.board.create("segment", [p1, p2], {
      strokeColor: "#3b82f6",
      strokeWidth: 2,
      fixed: true,
    });
    
    context.setCurrentShape({ segment, p1, p2 });
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    if (!context.isDrawing || !context.currentShape || !context.startPoint) return;

    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const currentX = coords.usrCoords[1];
    const currentY = coords.usrCoords[2];

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

    const shapeObjects = [context.currentShape.segment, context.currentShape.p1, context.currentShape.p2];
    context.undoStackRef.current.push(shapeObjects);
    context.redoStackRef.current = [];
    context.setVersion((v) => v + 1);

    context.setIsDrawing(false);
    context.setCurrentShape(null);
    context.setStartPoint(null);
  },
};
