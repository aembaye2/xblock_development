import { DrawingModeHandler, DrawingContext } from './types';

export const delete2Handler: DrawingModeHandler = {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => {
    const coords = context.getMouseCoords(e);
    if (!coords) return;

    // Get all elements under the mouse
    const objects = context.board.getAllUnderPoint(coords.scrCoords[1], coords.scrCoords[2]);
    if (!objects || objects.length === 0) return;

    // If one of the objects has a shared UID, delete all objects with that UID
    try {
      const withUid = objects.find((o: any) => o && o.__uid);
      if (withUid && withUid.__uid) {
        const uid = withUid.__uid;
        const toRemove = (context.board.objectsList || []).filter((o: any) => o && o.__uid === uid);
        const removed: any[] = [];
        for (const o of toRemove) {
          try { context.board.removeObject(o); removed.push(o); } catch (err) {}
        }
        try { context.board.update && context.board.update(); } catch (err) {}
        if (removed.length > 0) {
          context.undoStackRef.current.push(removed);
          context.redoStackRef.current = [];
          context.setVersion((v) => v + 1);
        }
        return;
      }
    } catch (err) {
      // ignore uid-based deletion errors and fall back to existing logic
    }

    // Traverse found elements to determine whether we clicked a polygon (or its border/vertex) or a standalone segment
    let polygonToDelete: any = null;
    let segmentToDelete: any = null;

    // Helper: try to find owner shapes that reference a given point
    const findOwnersForPoint = (pt: any) => {
      const owners: any[] = [];
      for (const obj of context.board.objectsList) {
        try {
          if (!obj) continue;
          // Polygons reference vertices
          if (obj.elType === 'polygon' && obj.vertices && obj.vertices.includes(pt)) {
            owners.push({ type: 'polygon', obj });
            continue;
          }

          // Lines/segments/arrows reference point1/point2
          if ((obj.elType === 'line' || obj.elType === 'segment' || obj.elType === 'arrow') && (obj.point1 === pt || obj.point2 === pt)) {
            owners.push({ type: 'segment', obj });
            continue;
          }

          // Circle references center
          if (obj.elType === 'circle' && obj.center === pt) {
            owners.push({ type: 'circle', obj });
            continue;
          }
        } catch (err) {
          // ignore
        }
      }
      return owners;
    };

    for (const el of objects) {
      if (!el) continue;

      // Skip non-deletable types early
      if (el.elType === 'axis' || el.elType === 'ticks' || el.elType === 'grid' || el.elType === 'text') {
        continue;
      }

      if (el.elType === 'polygon') {
        polygonToDelete = el;
        break;
      }

      // If this is a border line that belongs to a polygon, delete the whole polygon
      if (el.elType === 'line' && (el as any).parentPolygon) {
        polygonToDelete = (el as any).parentPolygon;
        break;
      }

      if (el.elType === 'point') {
        // Use helper to find owners
        const owners = findOwnersForPoint(el);
        if (owners.length > 0) {
          // Prefer polygon owners
          const polyOwner = owners.find(o => o.type === 'polygon');
          if (polyOwner) {
            polygonToDelete = polyOwner.obj;
            break;
          }
          const segOwner = owners.find(o => o.type === 'segment');
          if (segOwner) {
            segmentToDelete = segOwner.obj;
            break;
          }
          const circOwner = owners.find(o => o.type === 'circle');
          if (circOwner) {
            segmentToDelete = circOwner.obj; // treat circle similar for deletion handling below
            break;
          }
        }

        // As a fallback, check parentElements (some points have parents linking to shapes)
        if ((el as any).parentElements && (el as any).parentElements.length) {
          for (const p of (el as any).parentElements) {
            if (p.elType === 'polygon') { polygonToDelete = p; break; }
            if (p.elType === 'line' || p.elType === 'segment' || p.elType === 'arrow') { segmentToDelete = p; break; }
            if (p.elType === 'circle') { segmentToDelete = p; break; }
          }
          if (polygonToDelete || segmentToDelete) break;
        }
      }

      if (el.elType === 'line' && !(el as any).parentPolygon) {
        // Line that's not part of polygon -> treat as segment/line to delete
        segmentToDelete = el;
      }
    }

    // If we found a polygon, remove its borders, polygon object, and vertices
    if (polygonToDelete) {
      const vertices = (polygonToDelete.vertices || []).slice();
      const borders = (polygonToDelete.borders || []).slice();
      const removed: any[] = [];

      // Remove borders first
      for (const border of borders) {
        try {
          context.board.removeObject(border);
          removed.push(border);
        } catch (err) {}
      }

      // Remove polygon
      try {
        context.board.removeObject(polygonToDelete);
        removed.push(polygonToDelete);
      } catch (err) {}

      // Remove vertices
      for (const v of vertices) {
        try {
          context.board.removeObject(v);
          removed.push(v);
        } catch (err) {}
      }

      try { context.board.update && context.board.update(); } catch (err) {}

      // Push all removed pieces as one undo action
      if (removed.length > 0) {
        context.undoStackRef.current.push(removed);
        context.redoStackRef.current = [];
        context.setVersion((v) => v + 1);
      }

      return;
    }

    // If we found a segment/line, remove it and its endpoints
    if (segmentToDelete) {
      const p1 = (segmentToDelete as any).point1;
      const p2 = (segmentToDelete as any).point2;
      const removed: any[] = [];

      try {
        context.board.removeObject(segmentToDelete);
        removed.push(segmentToDelete);
      } catch (err) {}

      if (p1) {
        try { context.board.removeObject(p1); removed.push(p1); } catch (err) {}
      }
      if (p2) {
        try { context.board.removeObject(p2); removed.push(p2); } catch (err) {}
      }

      try { context.board.update && context.board.update(); } catch (err) {}

      if (removed.length > 0) {
        context.undoStackRef.current.push(removed);
        context.redoStackRef.current = [];
        context.setVersion((v) => v + 1);
      }

      return;
    }

    // No composite found — if top object is safe to delete, remove it
    const top = objects[0];
    if (top && top.elType && top.elType !== 'axis' && top.elType !== 'ticks' && top.elType !== 'grid' && top.elType !== 'text' && top.name !== 'x' && top.name !== 'y') {
      try {
        context.board.removeObject(top);
        context.undoStackRef.current.push([top]);
        context.redoStackRef.current = [];
        context.setVersion((v) => v + 1);
      } catch (err) {}
    }
  },

  handleMouseMove: (e: MouseEvent, context: DrawingContext) => {
    // Optional: Change cursor to indicate deletable objects
    const coords = context.getMouseCoords(e);
    if (!coords) return;
    const objects = context.board.getAllUnderPoint(coords.scrCoords[1], coords.scrCoords[2]);
    const boardEl = context.board.containerObj as HTMLElement;
    if (objects.length > 0 && objects[0].elType !== 'axis' && objects[0].elType !== 'ticks' && objects[0].elType !== 'grid' && objects[0].elType !== 'text' && objects[0].name !== 'x' && objects[0].name !== 'y') {
      // Show a delete-oriented cursor when hovering a deletable object
      boardEl.style.cursor = 'cell';
    } else {
      // Show the delete-mode cursor when not directly over an object
      boardEl.style.cursor = 'crosshair';
    }
  },

  cleanup: (context: DrawingContext) => {
    try {
      const boardEl = context.board && context.board.containerObj as HTMLElement;
      if (boardEl) boardEl.style.cursor = 'default';
    } catch (err) {}
  },

  handleMouseUp: (e: MouseEvent, context: DrawingContext) => {
    // Nothing to do on mouse up for delete mode
  },
};
