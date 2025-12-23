import { DrawingModeHandler, DrawingContext } from './types';

export const rectangleHandler: DrawingModeHandler = {
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
    const p3 = context.board.create("point", [coords.usrCoords[1], coords.usrCoords[2]], {
      visible: false,
      fixed: true,
    });
    const p4 = context.board.create("point", [coords.usrCoords[1], coords.usrCoords[2]], {
      visible: false,
      fixed: true,
    });
    
    const polygon = context.board.create("polygon", [p1, p2, p3, p4], {
      fillColor: "#3b82f6",
      fillOpacity: 0.3,
      strokeColor: "#3b82f6",
      strokeWidth: 2,
      fixed: true,
    });
    
    context.setCurrentShape({ polygon, points: [p1, p2, p3, p4] });
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    if (!context.isDrawing || !context.currentShape || !context.startPoint) return;

    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const currentX = coords.usrCoords[1];
    const currentY = coords.usrCoords[2];

    context.board.suspendUpdate();
    const { points } = context.currentShape;
    points[0].setPosition((window as any).JXG.COORDS_BY_USER, [
      context.startPoint.x,
      context.startPoint.y,
    ]);
    points[1].setPosition((window as any).JXG.COORDS_BY_USER, [
      currentX,
      context.startPoint.y,
    ]);
    points[2].setPosition((window as any).JXG.COORDS_BY_USER, [
      currentX,
      currentY,
    ]);
    points[3].setPosition((window as any).JXG.COORDS_BY_USER, [
      context.startPoint.x,
      currentY,
    ]);
    context.board.unsuspendUpdate();
  },

  handleMouseUp: (e: MouseEvent, context: DrawingContext) => {
    if (!context.isDrawing || !context.currentShape) return;

    const shapeObjects = [context.currentShape.polygon, ...context.currentShape.points];
    context.undoStackRef.current.push(shapeObjects);
    context.redoStackRef.current = [];
    context.setVersion((v) => v + 1);

    context.setIsDrawing(false);
    context.setCurrentShape(null);
    context.setStartPoint(null);
  },
};
