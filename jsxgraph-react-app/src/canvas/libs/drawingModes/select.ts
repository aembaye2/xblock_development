import type { DrawingModeHandler, DrawingContext } from './types';

export const selectHandler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const { board, getMouseCoords, setCurrentShape, setIsDrawing } = context;

    const coords = getMouseCoords(e);
    if (!coords) return;

    // Find object under mouse
    const objects = board.getAllObjectsUnderMouse(e);
    const selectableObjects = objects.filter((obj: any) =>
      obj.getType() === 'point' ||
      obj.getType() === 'line' ||
      obj.getType() === 'circle' ||
      obj.getType() === 'polygon' ||
      obj.getType() === 'text'
    );

    if (selectableObjects.length > 0) {
      const selectedObject = selectableObjects[0];
      setCurrentShape(selectedObject);
      setIsDrawing(true);

      // Store initial position and fixed state for dragging
      selectedObject._mouseStartX = coords.usrCoords[1];
      selectedObject._mouseStartY = coords.usrCoords[2];
      selectedObject._wasFixed = selectedObject.getAttribute('fixed');
      
      // Store initial positions for different object types
      if (selectedObject.getType() === 'point') {
        selectedObject._initialX = selectedObject.X();
        selectedObject._initialY = selectedObject.Y();
      } else if (selectedObject.getType() === 'line') {
        // Store initial positions of both endpoints
        if (selectedObject.point1) {
          selectedObject.point1._initialX = selectedObject.point1.X();
          selectedObject.point1._initialY = selectedObject.point1.Y();
        }
        if (selectedObject.point2) {
          selectedObject.point2._initialX = selectedObject.point2.X();
          selectedObject.point2._initialY = selectedObject.point2.Y();
        }
      } else if (selectedObject.getType() === 'circle') {
        // Store initial position of center
        if (selectedObject.center) {
          selectedObject.center._initialX = selectedObject.center.X();
          selectedObject.center._initialY = selectedObject.center.Y();
        }
      } else if (selectedObject.getType() === 'polygon') {
        // Store initial positions of all vertices
        selectedObject.vertices.forEach((vertex: any, index: number) => {
          if (vertex !== selectedObject.vertices[selectedObject.vertices.length - 1]) { // Skip closing vertex
            vertex._initialX = vertex.X();
            vertex._initialY = vertex.Y();
          }
        });
      } else if (selectedObject.getType() === 'text') {
        selectedObject._initialX = selectedObject.X();
        selectedObject._initialY = selectedObject.Y();
      }
      
      // Temporarily make the object movable
      selectedObject.setAttribute({fixed: false});
    }
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    const { board, currentShape, isDrawing, getMouseCoords } = context;

    if (!isDrawing || !currentShape) return;

    const coords = getMouseCoords(e);
    if (!coords) return;

    const dx = coords.usrCoords[1] - currentShape._mouseStartX;
    const dy = coords.usrCoords[2] - currentShape._mouseStartY;

    // Move the object
    if (currentShape.getType() === 'point') {
      currentShape.moveTo([
        currentShape._initialX + dx,
        currentShape._initialY + dy
      ]);
    } else if (currentShape.getType() === 'line') {
      // For lines, move both endpoints
      const point1 = currentShape.point1;
      const point2 = currentShape.point2;

      if (point1 && point1._initialX !== undefined) {
        point1.moveTo([
          point1._initialX + dx,
          point1._initialY + dy
        ]);
      }
      if (point2 && point2._initialX !== undefined) {
        point2.moveTo([
          point2._initialX + dx,
          point2._initialY + dy
        ]);
      }
    } else if (currentShape.getType() === 'circle') {
      // For circles, move the center
      const center = currentShape.center;
      if (center && center._initialX !== undefined) {
        center.moveTo([
          center._initialX + dx,
          center._initialY + dy
        ]);
      }
    } else if (currentShape.getType() === 'polygon') {
      // For polygons, move all vertices
      currentShape.vertices.forEach((vertex: any) => {
        if (vertex !== currentShape.vertices[currentShape.vertices.length - 1] && vertex._initialX !== undefined) { // Skip the closing vertex
          vertex.moveTo([
            vertex._initialX + dx,
            vertex._initialY + dy
          ]);
        }
      });
    } else if (currentShape.getType() === 'text') {
      currentShape.moveTo([
        currentShape._initialX + dx,
        currentShape._initialY + dy
      ]);
    }

    board.update();
  },

  handleMouseUp: (e: MouseEvent, context: DrawingContext) => {
    const { setCurrentShape, setIsDrawing, undoStackRef, setVersion } = context;

    if (context.isDrawing && context.currentShape) {
      // Restore the original fixed state
      context.currentShape.setAttribute({fixed: context.currentShape._wasFixed});
      
      // Save state for undo
      const allObjects = context.board.getAllObjects();
      const currentState = allObjects.map((obj: any) => ({
        id: obj.id,
        coords: obj.coords ? obj.coords.usrCoords : null,
        properties: obj.getProperties ? obj.getProperties() : {}
      }));
      undoStackRef.current.push(currentState);
      setVersion(prev => prev + 1);
    }

    setCurrentShape(null);
    setIsDrawing(false);
  },

  cleanup: (context: DrawingContext) => {
    // Restore fixed state if there's a current shape
    if (context.currentShape && context.currentShape._wasFixed !== undefined) {
      context.currentShape.setAttribute({fixed: context.currentShape._wasFixed});
    }
    context.setCurrentShape(null);
    context.setIsDrawing(false);
    context.setStartPoint(null);
  }
};