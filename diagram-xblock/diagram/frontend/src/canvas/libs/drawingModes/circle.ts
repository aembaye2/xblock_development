import { DrawingModeHandler, DrawingContext } from './types';

export const circleHandler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    context.setIsDrawing(true);
    context.setStartPoint({
      x: coords.usrCoords[1],
      y: coords.usrCoords[2],
    });

    const center = context.board.create("point", [coords.usrCoords[1], coords.usrCoords[2]], {
      visible: false,
      fixed: true,
    });
    const radiusPoint = context.board.create("point", [coords.usrCoords[1], coords.usrCoords[2]], {
      visible: false,
      fixed: true,
    });
    const circle = context.board.create("circle", [center, radiusPoint], {
      fillColor: "#3b82f6",
      fillOpacity: 0.3,
      strokeColor: "#3b82f6",
      strokeWidth: 2,
      fixed: true,
    });
    
    context.setCurrentShape({ circle, center, radiusPoint });
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    if (!context.isDrawing || !context.currentShape || !context.startPoint) return;

    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const currentX = coords.usrCoords[1];
    const currentY = coords.usrCoords[2];

    context.board.suspendUpdate();
    context.currentShape.radiusPoint.setPosition((window as any).JXG.COORDS_BY_USER, [
      currentX,
      currentY,
    ]);
    context.board.unsuspendUpdate();
  },

  handleMouseUp: (e: MouseEvent, context: DrawingContext) => {
    if (!context.isDrawing || !context.currentShape) return;

    const shapeObjects = [
      context.currentShape.circle,
      context.currentShape.center,
      context.currentShape.radiusPoint
    ];
    context.undoStackRef.current.push(shapeObjects);
    context.redoStackRef.current = [];
    context.setVersion((v) => v + 1);

    context.setIsDrawing(false);
    context.setCurrentShape(null);
    context.setStartPoint(null);
  },
};
