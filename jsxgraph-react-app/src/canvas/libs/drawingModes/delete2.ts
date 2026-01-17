import { DrawingModeHandler, DrawingContext } from './types';

export const delete2Handler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    // Get the object under the mouse
    const objects = context.board.getAllUnderPoint(coords.scrCoords[1], coords.scrCoords[2]);
    
    if (objects.length > 0) {
      // Get the top object (first in the list)
      const obj = objects[0];
      
      // Don't delete axes, grid elements, or text labels
      if (obj.elType === 'axis' || obj.elType === 'ticks' || obj.elType === 'grid' || obj.elType === 'text') {
        return;
      }

      // Don't delete objects with specific names (like axis labels)
      if (obj.name === 'x' || obj.name === 'y') {
        return;
      }
      
      // Find all objects that depend on this one and delete them
      const objectsToDelete: any[] = [obj];
      
      // If this is a point, also delete any segments/lines/arrows that use it
      if (obj.elType === 'point') {
        for (const id in context.board.objects) {
          const boardObj = context.board.objects[id];
          if (boardObj.elType === 'segment' || boardObj.elType === 'line' || boardObj.elType === 'arrow') {
            if (boardObj.point1 === obj || boardObj.point2 === obj) {
              objectsToDelete.push(boardObj);
            }
          } else if (boardObj.elType === 'circle') {
            if (boardObj.center === obj) {
              objectsToDelete.push(boardObj);
            }
          } else if (boardObj.elType === 'polygon') {
            if (boardObj.vertices && boardObj.vertices.includes(obj)) {
              objectsToDelete.push(boardObj);
            }
          }
        }
      }
      
      // Delete all objects
      objectsToDelete.forEach(item => {
        context.board.removeObject(item);
      });
      
      // Add to undo stack
      context.undoStackRef.current.push(objectsToDelete);
      context.redoStackRef.current = [];
      context.setVersion((v) => v + 1);
    }
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    // Optional: Change cursor to indicate deletable objects
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    const objects = context.board.getAllUnderPoint(coords.scrCoords[1], coords.scrCoords[2]);
    if (objects.length > 0 && objects[0].elType !== 'axis' && objects[0].elType !== 'ticks' && objects[0].elType !== 'grid' && objects[0].elType !== 'text' && objects[0].name !== 'x' && objects[0].name !== 'y') {
      (context.board.containerObj as HTMLElement).style.cursor = 'pointer';
    } else {
      (context.board.containerObj as HTMLElement).style.cursor = 'default';
    }
  },

  handleMouseUp: (e: MouseEvent, context: DrawingContext) => {
    // Nothing to do on mouse up for delete mode
  },
};
