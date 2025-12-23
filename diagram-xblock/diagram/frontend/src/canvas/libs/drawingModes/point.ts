import { DrawingModeHandler, DrawingContext } from './types';

export const pointHandler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const point = context.board.create("point", [coords.usrCoords[1], coords.usrCoords[2]], {
      size: 4,
      face: 'circle',
      fillColor: "#3b82f6",
      strokeColor: "#3b82f6",
      fixed: true,
    });
    
    context.setCurrentShape(point);
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    // Points don't need mouse move handling
  },

  handleMouseUp: (e: MouseEvent, context: DrawingContext) => {
    if (!context.currentShape) return;

    context.undoStackRef.current.push([context.currentShape]);
    context.redoStackRef.current = [];
    context.setVersion((v) => v + 1);

    context.setIsDrawing(false);
    context.setCurrentShape(null);
    context.setStartPoint(null);
  },
};
