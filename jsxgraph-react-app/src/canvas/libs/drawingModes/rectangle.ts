import { DrawingModeHandler, DrawingContext, generateShapeId } from './types';

export const rectangleHandler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const x = coords.usrCoords[1];
    const y = coords.usrCoords[2];
    // Start drawing on mousedown when not already drawing
    if (!context.isDrawing) {
      context.setIsDrawing(true);
      context.setStartPoint({ x, y });

      // Visual start marker
      const startCircle = context.board.create('point', [x, y], {
        size: 3,
        fillColor: '#7C3AED',
        strokeColor: '#7C3AED',
        fixed: true,
        name: '',
      });

      // Invisible corner control points for preview
      const p1 = context.board.create('point', [x, y], { visible: false, fixed: true });
      const p2 = context.board.create('point', [x, y], { visible: false, fixed: true });
      const p3 = context.board.create('point', [x, y], { visible: false, fixed: true });
      const p4 = context.board.create('point', [x, y], { visible: false, fixed: true });

      const previewRect = context.board.create('polygon', [p1, p2, p3, p4], {
        fillColor: '#A78BFA',
        fillOpacity: 0.2,
        borders: {
          strokeColor: '#7C3AED',
          strokeWidth: 2,
          dash: 2,
        },
        fixed: true,
      });

      // Store start coords on the current shape so move handler can read them reliably
      context.setCurrentShape({ previewRect, points: [p1, p2, p3, p4], startCircle, startX: x, startY: y, _finalized: false });
    }
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    // Update preview only when preview exists
    const cs = context.currentShape as any;
    // If preview was finalized (second click), don't update
    if (cs && cs._finalized) return;
    if (!cs || !cs.points) return;

    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const currentX = coords.usrCoords[1];
    const currentY = coords.usrCoords[2];

    const startX = cs.startX ?? context.startPoint?.x;
    const startY = cs.startY ?? context.startPoint?.y;
    if (startX === undefined || startY === undefined) return;

    context.board.suspendUpdate();
    try {
      cs.points[0].setPosition((window as any).JXG.COORDS_BY_USER, [startX, startY]);
      cs.points[1].setPosition((window as any).JXG.COORDS_BY_USER, [currentX, startY]);
      cs.points[2].setPosition((window as any).JXG.COORDS_BY_USER, [currentX, currentY]);
      cs.points[3].setPosition((window as any).JXG.COORDS_BY_USER, [startX, currentY]);
    } catch (err) {
      // ignore if preview points removed
    }
    context.board.unsuspendUpdate();
  },

  handleMouseUp: (e: MouseEvent, context: DrawingContext) => {
    // Finalize rectangle on mouse up (drag-to-draw)
    const cs = context.currentShape as any;
    if (!context.isDrawing || !cs || cs._finalized) return;

    const coords = context.getMouseCoords(e);
    if (!coords) return;
    const x = coords.usrCoords[1];
    const y = coords.usrCoords[2];

    const startX = cs.startX ?? context.startPoint?.x;
    const startY = cs.startY ?? context.startPoint?.y;
    if (startX === undefined || startY === undefined) return;

    // Mark finalized and reset drawing state
    cs._finalized = true;
    context.setIsDrawing(false);
    context.setCurrentShape(null);
    context.setStartPoint(null);

    // Remove preview objects
    try {
      if (cs.previewRect) context.board.removeObject(cs.previewRect);
      if (cs.points && cs.points.length) cs.points.forEach((p: any) => context.board.removeObject(p));
      if (cs.startCircle) context.board.removeObject(cs.startCircle);
    } catch (err) {}

    // Create final corner points (visible & draggable)
    const uid = generateShapeId();

    const finalP1 = context.board.create('point', [startX, startY], {
      size: 3,
      fillColor: '#7C3AED',
      strokeColor: '#7C3AED',
      fixed: false,
    });
    finalP1.__uid = uid;

    const finalP2 = context.board.create('point', [x, startY], {
      size: 3,
      fillColor: '#7C3AED',
      strokeColor: '#7C3AED',
      fixed: false,
    });
    finalP2.__uid = uid;

    const finalP3 = context.board.create('point', [x, y], {
      size: 3,
      fillColor: '#7C3AED',
      strokeColor: '#7C3AED',
      fixed: false,
    });
    finalP3.__uid = uid;

    const finalP4 = context.board.create('point', [startX, y], {
      size: 3,
      fillColor: '#7C3AED',
      strokeColor: '#7C3AED',
      fixed: false,
    });
    finalP4.__uid = uid;

    const finalRect = context.board.create('polygon', [finalP1, finalP2, finalP3, finalP4], {
      fillColor: '#A78BFA',
      fillOpacity: 0.3,
      borders: {
        strokeColor: '#7C3AED',
        strokeWidth: 2,
      },
      fixed: false,
    });

    finalRect.__uid = uid;

    // Push to undo stack
    const shapeObjects = [finalRect, finalP1, finalP2, finalP3, finalP4];
    context.undoStackRef.current.push(shapeObjects);
    context.redoStackRef.current = [];
    context.setVersion((v) => v + 1);
  },

  cleanup: (context: DrawingContext) => {
    const cs = context.currentShape as any;
    if (cs) {
      try {
        if (cs.previewRect) context.board.removeObject(cs.previewRect);
        if (cs.points && cs.points.length) cs.points.forEach((p: any) => context.board.removeObject(p));
        if (cs.startCircle) context.board.removeObject(cs.startCircle);
      } catch (err) {
        // ignore
      }
    }
    context.setCurrentShape(null);
    context.setIsDrawing(false);
    context.setStartPoint(null);
  },
};
