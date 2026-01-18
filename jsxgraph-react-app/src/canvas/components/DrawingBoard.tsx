import { useEffect, useRef, useState } from "react";
import { 
  drawingModeHandlers, 
  handleTriangleEscape, 
  type DrawingMode, 
  type Point,
  type DrawingContext 
} from "@/canvas/libs/drawingModes";
import { ALL_DRAWING_TOOLS, TOOL_SETS, getToolsByIds } from "@/canvas/libs/drawingTools";
import { DrawingTools, ActionButtons } from "@/canvas/components/DrawingToolbar";

type ActionButton = "undo" | "redo" | "clear" | "downloadPNG" | "downloadJSON" | "submit";

export interface BoardState {
  version: string;
  boardSettings: {
    boundingBox: number[];
  };
  objects: any[];
  timestamp?: string;
}

interface DrawingBoardProps {
  // Specify which tools to display. Can be:
  // - Array of tool IDs: ["point", "segment", "circle"]
  // - Predefined set name: "basic" | "geometric" | "arrows" | "all" | "minimal"
  // - Defaults to "all" if not specified
  tools?: DrawingMode[] | keyof typeof TOOL_SETS;
  
  // Specify which action buttons to display
  // - Array of button IDs: ["undo", "redo", "downloadPNG", "submit"]
  // - Defaults to all buttons if not specified
  buttons?: ActionButton[];
  
  // Initial state to load (instructor's pre-drawn elements)
  initialState?: BoardState;
  
  // Make initial elements read-only (students can't modify/delete them)
  readOnlyInitial?: boolean;
  
  // Callback when user clicks submit button
  onSubmit?: (state: BoardState) => void;
  
  // Callback when board state changes
  onStateChange?: (state: BoardState) => void;

  // Optional container id for the JSXGraph board (allows multiple boards)
  containerId?: string;

  // Canvas size in pixels [width, height]
  boardPixelSize?: [number, number];

  // Axis labels
  xAxisLabel?: string;
  yAxisLabel?: string;

  // Bounding box [left, top, right, bottom]
  boundingBox?: [number, number, number, number];

  // Callback when PNG is downloaded
  onDownloadPNG?: () => void;

  // Callback when JSON is downloaded
  onDownloadJSON?: () => void;
}

export default function DrawingBoard({ 
  tools = "all",
  buttons = ["undo", "redo", "clear", "downloadPNG", "downloadJSON", "editAxes"],
  initialState,
  readOnlyInitial = false,
  onSubmit,
  onStateChange,
  containerId = "jxgbox",
  boardPixelSize = [600, 500],
  xAxisLabel = 'x',
  yAxisLabel = 'y',
  boundingBox = [0, 10, 10, 0],
  onDownloadPNG,
  onDownloadJSON,
}: DrawingBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<any>(null);
  const [mode, setMode] = useState<DrawingMode>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentShape, setCurrentShape] = useState<any>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  
  const undoStackRef = useRef<any[][]>([]);
  const redoStackRef = useRef<any[][]>([]);
  const [version, setVersion] = useState(0);
  const JSXGraphRef = useRef<any>(null);
  const initialObjectsRef = useRef<Set<string>>(new Set());
  const lastMouseEventRef = useRef<MouseEvent | null>(null);
  
  // Refs to track current state for event handlers
  const stateRef = useRef({ mode, isDrawing, startPoint, currentShape });

    const xLabelRef = useRef<any>(null);
    const yLabelRef = useRef<any>(null);
  // Extract canvas dimensions
  const [canvasWidth, canvasHeight] = boardPixelSize;

  // Determine which tools to display
  const displayTools = typeof tools === "string" 
    ? getToolsByIds(TOOL_SETS[tools]) 
    : getToolsByIds(tools);

  // Cleanup function when changing modes
  const cleanupCurrentMode = () => {
    if (mode && board) {
      const handler = drawingModeHandlers[mode];
      if (handler.cleanup) {
        const context = createDrawingContext();
        handler.cleanup(context);
      }
    }
    
    setCurrentShape(null);
    setIsDrawing(false);
    setStartPoint(null);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && boardRef.current) {
      const loadJSXGraph = async () => {
        const JSXGraphModule = await import("jsxgraph");
        const JSXGraph = (JSXGraphModule as any).JSXGraph || JSXGraphModule;
        JSXGraphRef.current = JSXGraph;
        
        // Make JXG globally available
        if (!window.hasOwnProperty('JXG')) {
          (window as any).JXG = JSXGraph;
        }
        
        // Add JSXGraph CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraph.css";
        document.head.appendChild(link);

        const newBoard = JSXGraph.initBoard(containerId, {
          boundingbox: boundingBox,
          axis: true,
          showCopyright: false,
          showNavigation: false,
          keepaspectratio: true,
          pan: {
            enabled: false,
          },
          zoom: {
            enabled: false,
          },
          defaultAxes: {
            x: {
              ticks: {
                label: {
                  fontsize: 16,
                },
              },
              name: 'x',
              withLabel: false, // we'll place a custom label at the positive end
              label: {
                fontsize: 18,
              },
            },
            y: {
              ticks: {
                label: {
                  fontsize: 16,
                },
              },
              name: 'y',
              withLabel: false, // we'll place a custom label at the positive end
              label: {
                fontsize: 18,
              },
            },
          },
        });

        // Place axis labels closer to axes and centered
        const bb = newBoard.getBoundingBox();
        const xLen = bb[2] - bb[0];
        const yLen = bb[1] - bb[3];

        // X-axis label centered below the axis
          xLabelRef.current = newBoard.create('text', [(bb[0] + bb[2]) / 2, -0.05 * yLen, xAxisLabel], {
          anchorX: 'center',
          anchorY: 'top',
          fontSize: 18,
          fixed: true,
          highlight: false,
        });

        // (graph title element removed)

        // Y-axis label centered to the left of the axis (rotated 90 degrees)
          yLabelRef.current = newBoard.create('text', [-0.08 * xLen, (bb[1] + bb[3]) / 2, yAxisLabel], {
          anchorX: 'center',
          anchorY: 'middle',
          fontSize: 18,
          fixed: true,
          highlight: false,
          rotate: 90,
        });

        setBoard(newBoard);
      };

      loadJSXGraph();
    }
  }, []);

    // Update axis labels when props change
    useEffect(() => {
      if (board && xLabelRef.current && yLabelRef.current) {
        xLabelRef.current.setText(xAxisLabel);
        yLabelRef.current.setText(yAxisLabel);
        board.update();
      }
    }, [board, xAxisLabel, yAxisLabel]);

  // Load initial state when board is ready
  useEffect(() => {
    if (board && initialState && JSXGraphRef.current) {
      loadStateIntoBoard(initialState);
    }
  }, [board, initialState]);

  // Function to load initial state into board
  const loadStateIntoBoard = (state: BoardState) => {
    if (!board || !JSXGraphRef.current) return;
    
    initialObjectsRef.current.clear();
    
    state.objects.forEach((objData: any) => {
      let createdObj: any = null;
      
      try {
        if (objData.type === 'point') {
          createdObj = board.create('point', [objData.coords.x, objData.coords.y], {
            ...objData.properties,
            fixed: readOnlyInitial,
          });
        } else if (objData.type === 'segment') {
          const p1 = board.create('point', [objData.point1.x, objData.point1.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          const p2 = board.create('point', [objData.point2.x, objData.point2.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          createdObj = board.create('segment', [p1, p2], {
            ...objData.properties,
            fixed: readOnlyInitial,
          });
          initialObjectsRef.current.add(p1.id);
          initialObjectsRef.current.add(p2.id);
        } else if (objData.type === 'line') {
          const p1 = board.create('point', [objData.point1.x, objData.point1.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          const p2 = board.create('point', [objData.point2.x, objData.point2.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          createdObj = board.create('line', [p1, p2], {
            ...objData.properties,
            fixed: readOnlyInitial,
          });
          initialObjectsRef.current.add(p1.id);
          initialObjectsRef.current.add(p2.id);
        } else if (objData.type === 'arrow') {
          const p1 = board.create('point', [objData.point1.x, objData.point1.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          const p2 = board.create('point', [objData.point2.x, objData.point2.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          createdObj = board.create('arrow', [p1, p2], {
            ...objData.properties,
            fixed: readOnlyInitial,
          });
          initialObjectsRef.current.add(p1.id);
          initialObjectsRef.current.add(p2.id);
        } else if (objData.type === 'circle') {
          const center = board.create('point', [objData.center.x, objData.center.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          createdObj = board.create('circle', [center, objData.radius], {
            ...objData.properties,
            fixed: readOnlyInitial,
          });
          initialObjectsRef.current.add(center.id);
        } else if (objData.type === 'triangle') {
          const p1 = board.create('point', [objData.point1.x, objData.point1.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          const p2 = board.create('point', [objData.point2.x, objData.point2.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          const p3 = board.create('point', [objData.point3.x, objData.point3.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          createdObj = board.create('polygon', [p1, p2, p3], {
            ...objData.properties,
            fixed: readOnlyInitial,
          });
          initialObjectsRef.current.add(p1.id);
          initialObjectsRef.current.add(p2.id);
          initialObjectsRef.current.add(p3.id);
        } else if (objData.type === 'rectangle') {
          const p1 = board.create('point', [objData.point1.x, objData.point1.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          const p2 = board.create('point', [objData.point2.x, objData.point2.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          const p3 = board.create('point', [objData.point3.x, objData.point3.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          const p4 = board.create('point', [objData.point4.x, objData.point4.y], {
            visible: false,
            fixed: readOnlyInitial,
          });
          createdObj = board.create('polygon', [p1, p2, p3, p4], {
            ...objData.properties,
            fixed: readOnlyInitial,
          });
          initialObjectsRef.current.add(p1.id);
          initialObjectsRef.current.add(p2.id);
          initialObjectsRef.current.add(p3.id);
          initialObjectsRef.current.add(p4.id);
        } else if (objData.type === 'curve') {
          if (objData.points && objData.points.length >= 2) {
            const points = objData.points.map((pt: any) => [pt.x, pt.y]);
            createdObj = board.create('curve', [
              points.map((p: any) => p[0]),
              points.map((p: any) => p[1])
            ], {
              ...objData.properties,
              fixed: readOnlyInitial,
            });
          }
        } else if (objData.type === 'polygon') {
          const points = objData.vertices.map((v: any) =>
            board.create('point', [v.x, v.y], {
              visible: false,
              fixed: readOnlyInitial,
            })
          );
          createdObj = board.create('polygon', points, {
            ...objData.properties,
            fixed: readOnlyInitial,
          });
          points.forEach((p: any) => initialObjectsRef.current.add(p.id));
        }
        
        if (createdObj) {
          initialObjectsRef.current.add(createdObj.id);
        }
      } catch (error) {
        console.error('Error loading object:', objData, error);
      }
    });
    
    board.update();
  };

  // Function to capture current board state
  const getCurrentState = (): BoardState => {
    if (!board) {
      return {
        version: '1.0',
        boardSettings: { boundingBox: Array.from(boundingBox) },
        objects: [],
      };
    }

    const objects: any[] = [];

    for (const id in board.objects) {
      const obj = board.objects[id];

      // Skip axes and grid elements
      if (obj.elType === 'axis' || obj.elType === 'ticks' || obj.elType === 'grid' || obj.name === 'x' || obj.name === 'y') {
        continue;
      }

      // Skip invisible objects
      if (!obj.visProp || !obj.visProp.visible) {
        continue;
      }

      const objData: any = {
        id: obj.id,
        type: obj.elType,
        name: obj.name || undefined,
        isInitial: initialObjectsRef.current.has(obj.id),
      };

      if (obj.elType === 'point') {
        objData.coords = { x: obj.X(), y: obj.Y() };
        objData.properties = {
          size: obj.visProp.size,
          fillColor: obj.visProp.fillcolor,
          strokeColor: obj.visProp.strokecolor,
          face: obj.visProp.face,
        };
      } else if (obj.elType === 'line' || obj.elType === 'segment' || obj.elType === 'arrow') {
        objData.point1 = obj.point1 ? { x: obj.point1.X(), y: obj.point1.Y() } : null;
        objData.point2 = obj.point2 ? { x: obj.point2.X(), y: obj.point2.Y() } : null;
        objData.properties = {
          strokeColor: obj.visProp.strokecolor,
          strokeWidth: obj.visProp.strokewidth,
        };
      } else if (obj.elType === 'polygon') {
        objData.vertices = obj.vertices.map((v: any) => ({ x: v.X(), y: v.Y() }));
        objData.properties = {
          fillColor: obj.visProp.fillcolor,
          fillOpacity: obj.visProp.fillopacity,
          strokeColor: obj.visProp.strokecolor,
          strokeWidth: obj.visProp.strokewidth,
        };
      } else if (obj.elType === 'circle') {
        objData.center = obj.center ? { x: obj.center.X(), y: obj.center.Y() } : null;
        objData.radius = obj.Radius();
        objData.properties = {
          fillColor: obj.visProp.fillcolor,
          fillOpacity: obj.visProp.fillopacity,
          strokeColor: obj.visProp.strokecolor,
          strokeWidth: obj.visProp.strokewidth,
        };
      } else if (obj.elType === 'curve') {
        objData.properties = {
          strokeColor: obj.visProp.strokecolor,
          strokeWidth: obj.visProp.strokewidth,
        };
      }

      objects.push(objData);
    }

    return {
      version: '1.0',
      boardSettings: {
        boundingBox: board.getBoundingBox(),
      },
      objects: objects,
      timestamp: new Date().toISOString(),
    };
  };

  // Notify parent of state changes
  useEffect(() => {
    if (board && onStateChange) {
      onStateChange(getCurrentState());
    }
  }, [version, board]);

  const getMouseCoords = (e: MouseEvent) => {
    if (!board) return null;
    const cPos = board.getCoordsTopLeftCorner();
    const absPos = {
      x: e.clientX - cPos[0],
      y: e.clientY - cPos[1],
    };
    return new (window as any).JXG.Coords(
      (window as any).JXG.COORDS_BY_SCREEN,
      [absPos.x, absPos.y],
      board
    );
  };

  // Create drawing context helper
  const createDrawingContext = (): DrawingContext => ({
    board,
    mode: stateRef.current.mode,
    isDrawing: stateRef.current.isDrawing,
    setIsDrawing,
    startPoint: stateRef.current.startPoint,
    setStartPoint,
    currentShape: stateRef.current.currentShape,
    setCurrentShape,
    selectedObject,
    setSelectedObject,
    undoStackRef,
    redoStackRef,
    setVersion,
    getMouseCoords,
  });

  // Update state ref whenever drawing state changes
  useEffect(() => {
    stateRef.current = { mode, isDrawing, startPoint, currentShape };
  }, [mode, isDrawing, startPoint, currentShape]);

  useEffect(() => {
    if (!board || !mode) return;

    // Set initial cursor for delete mode when entering
    try {
      const el = boardRef.current as HTMLElement | null;
      if (el) {
        if (mode === 'delete2') {
          el.style.cursor = 'crosshair';
        } else {
          el.style.cursor = 'default';
        }
      }
    } catch (err) {}

    const handler = drawingModeHandlers[mode];
    
    const handleMouseDown = (e: MouseEvent) => {
      const context = createDrawingContext();
      handler.handleMouseDown(e, context);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const context = createDrawingContext();
      handler.handleMouseMove(e, context);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const context = createDrawingContext();
      handler.handleMouseUp(e, context);
    };

    const handleDoubleClick = (e: MouseEvent) => {
      if (handler.handleDoubleClick) {
        const context = createDrawingContext();
        handler.handleDoubleClick(e, context);
      }
    };

    const boardElement = boardRef.current;
    if (boardElement) {
      // Track last mouse event for keyboard-based deletion
      const storeLastMouse = (ev: MouseEvent) => {
        lastMouseEventRef.current = ev;
      };
      boardElement.addEventListener('mousemove', storeLastMouse);
      // Keep selection when clicking on the board (clear if clicking empty space)
      const handleBoardClickClear = (ev: MouseEvent) => {
        const context = createDrawingContext();
        const coords = context.getMouseCoords(ev);
        if (!coords) return;
        const objects = board.getAllUnderPoint(coords.scrCoords[1], coords.scrCoords[2]);
        if (!objects || objects.length === 0) {
          setSelectedObject(null);
        }
      };
      boardElement.addEventListener('click', handleBoardClickClear);
      boardElement.addEventListener("mousedown", handleMouseDown);
      boardElement.addEventListener("mousemove", handleMouseMove);
      boardElement.addEventListener("mouseup", handleMouseUp);
      boardElement.addEventListener("dblclick", handleDoubleClick as any);
      boardElement.addEventListener("mouseleave", handleMouseUp);

      // Escape key handler to cancel triangle drawing
      const handleKeyDown = (ev: KeyboardEvent) => {
        if (ev.key === "Escape" && mode === "triangle") {
          const context = createDrawingContext();
          handleTriangleEscape(context);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      // Delete / Backspace key handler (global) - delete selected or hovered shape
      const handleGlobalDelete = (ev: KeyboardEvent) => {
        if (ev.key !== 'Delete' && ev.key !== 'Backspace') return;
        if (!board) return;

        // Helper to remove a collection of objects
        const removeObjects = (objs: any[]) => {
          const removed: any[] = [];
          for (const o of objs) {
            try { board.removeObject(o); removed.push(o); } catch (err) {}
          }
          if (removed.length > 0) {
            undoStackRef.current.push(removed);
            redoStackRef.current = [];
            setVersion(v => v + 1);
            try { board.update && board.update(); } catch (e) {}
            return true;
          }
          return false;
        };

        // 1) If user has an explicit selection, prefer deleting that
        const sel = selectedObject;
        if (sel) {
          try {
            if (sel.shapeId) {
              const toRemove = (board.objectsList || []).filter((o: any) => o && o.shapeId === sel.shapeId);
              if (toRemove.length && removeObjects(toRemove)) return;
            }
            if (sel.__uid) {
              const toRemove = (board.objectsList || []).filter((o: any) => o && o.__uid === sel.__uid);
              if (toRemove.length && removeObjects(toRemove)) return;
            }
            // fallback: remove the selected object itself
            if (removeObjects([sel])) return;
          } catch (err) {}
        }

        // 2) Try hovered object under last mouse position
        try {
          const lastEv = lastMouseEventRef.current as any;
          let candidates: any[] = [];
          if (lastEv) {
            const coords = getMouseCoords(lastEv as MouseEvent);
            if (coords) {
              candidates = board.getAllUnderPoint(coords.scrCoords[1], coords.scrCoords[2]) || [];
            }
          } else if ((board as any).getAllUnderMouse) {
            // fallback API
            candidates = (board as any).getAllUnderMouse(lastEv) || [];
          }

          if (candidates && candidates.length) {
            // Prefer shapeId
            for (const el of candidates) {
              if (el && el.shapeId) {
                const toRemove = (board.objectsList || []).filter((o: any) => o && o.shapeId === el.shapeId);
                if (toRemove.length && removeObjects(toRemove)) return;
              }
            }

            // Then try __uid grouping
            const byUid = candidates.find((o: any) => o && o.__uid);
            if (byUid && byUid.__uid) {
              const uid = byUid.__uid;
              const toRemove = (board.objectsList || []).filter((o: any) => o && o.__uid === uid);
              if (toRemove.length && removeObjects(toRemove)) return;
            }

            // Fallback: remove top-most safe object
            const top = candidates[0];
            if (top && top.elType && top.elType !== 'axis' && top.elType !== 'ticks' && top.elType !== 'grid' && top.elType !== 'text' && top.name !== 'x' && top.name !== 'y') {
              removeObjects([top]);
              return;
            }
          }
        } catch (err) {}
      };
      document.addEventListener('keydown', handleGlobalDelete);

      return () => {
        boardElement.removeEventListener("mousedown", handleMouseDown);
        boardElement.removeEventListener("mousemove", handleMouseMove);
        boardElement.removeEventListener("mouseup", handleMouseUp);
        boardElement.removeEventListener("dblclick", handleDoubleClick as any);
        boardElement.removeEventListener("mouseleave", handleMouseUp);
        document.removeEventListener("keydown", handleKeyDown);
        boardElement.removeEventListener('click', handleBoardClickClear);
        // Reset cursor when leaving mode
        try {
          const el = boardRef.current as HTMLElement | null;
          if (el) el.style.cursor = 'default';
        } catch (err) {}
      };
    }
  }, [board, mode, isDrawing, currentShape, startPoint]);

  const clearBoard = () => {
    // Show confirmation dialog before clearing
    if (
      !window.confirm(
        "Are you sure you want to clear the board? This will delete all drawings and cannot be undone."
      )
    ) {
      return;
    }
    if (!board) return;

    // Remove only user-created objects (points, segments, lines, polygons, arrows, circles, curves, text)
    const objectsList = [...(board.objectsList || [])];
    objectsList.forEach((obj: any) => {
      // Skip axes, grid, ticks
      if (obj.elType === 'axis' || obj.elType === 'grid' || obj.elType === 'ticks') return;

      // Remove common user element types
      if (
        obj.elType === 'point' ||
        obj.elType === 'segment' ||
        obj.elType === 'line' ||
        obj.elType === 'polygon' ||
        obj.elType === 'arrow' ||
        obj.elType === 'circle' ||
        obj.elType === 'curve' ||
        obj.elType === 'text'
      ) {
        try {
          board.removeObject(obj);
        } catch (e) {
          // ignore removal errors
        }
      }
    });

    // Clear preview/selection state
    setCurrentShape(null);
    setStartPoint(null);
    setIsDrawing(false);

    // Reset undo/redo stacks
    undoStackRef.current = [];
    redoStackRef.current = [];
    setVersion((v) => v + 1);

    // Ensure board re-renders
    try {
      board.update && board.update();
    } catch (e) {}

    // If axes/ticks were accidentally removed as non-user objects, recreate them
    try {
      const remaining = [...(board.objectsList || [])];
      const hasAxis = remaining.some((o: any) => o.elType === 'axis' || o.name === 'x' || o.name === 'y');
      if (!hasAxis && JSXGraphRef.current) {
        // Create X and Y axes with ticks and labels
        const xAxis = board.create('axis', [[0, 0], [1, 0]], { name: 'x', withLabel: true });
        const yAxis = board.create('axis', [[0, 0], [0, 1]], { name: 'y', withLabel: true });
        try { board.create('ticks', [xAxis]); } catch (e) {}
        try { board.create('ticks', [yAxis]); } catch (e) {}
        board.update && board.update();
      }
    } catch (err) {
      // ignore
    }
  };


  const undo = () => {
    const last = undoStackRef.current.pop();
    if (!last) return;
    
    // Hide all objects in the action
    last.forEach((obj) => {
      try {
        if (obj && typeof obj.setAttribute === "function") {
          obj.setAttribute({ visible: false });
        } else if (
          obj &&
          typeof obj.el === "object" &&
          typeof obj.el.setAttribute === "function"
        ) {
          obj.el.setAttribute({ visible: false });
        }
      } catch (e) {
        // Fallback: try remove
        try {
          if (obj && typeof obj.remove === "function") obj.remove();
        } catch {}
      }
    });
    
    redoStackRef.current.push(last);
    setVersion((v) => v + 1);
  };

  const redo = () => {
    const action = redoStackRef.current.pop();
    if (!action) return;
    
    action.forEach((obj) => {
      try {
        if (obj && typeof obj.setAttribute === "function") {
          obj.setAttribute({ visible: true });
        } else if (
          obj &&
          typeof obj.el === "object" &&
          typeof obj.el.setAttribute === "function"
        ) {
          obj.el.setAttribute({ visible: true });
        }
      } catch (e) {
        // Cannot recreate removed objects; ignore
      }
    });
    
    undoStackRef.current.push(action);
    setVersion((v) => v + 1);
  };

  //// Export the JSXGraph drawing to PNG using html2canvas
    const downloadPNG = async () => {
  if (!board) return;

  try {
    const svgElement = board.containerObj.querySelector('svg');
    if (!svgElement) throw new Error('SVG element not found');
    
    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    
    // Get SVG dimensions
    const bbox = svgElement.getBoundingClientRect();
    const width = bbox.width;
    const height = bbox.height;
    
    // Set explicit dimensions on the clone
    svgClone.setAttribute('width', width.toString());
    svgClone.setAttribute('height', height.toString());
    
    const svgString = new XMLSerializer().serializeToString(svgClone);
    const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // 2x for better quality
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Scale for better quality
    ctx.scale(2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      const png = canvas.toDataURL('image/png');
      
      const a = document.createElement('a');
      a.href = png;
      a.download = 'drawing.png';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        a.remove();
        // Call the callback if provided
        if (onDownloadPNG) {
          onDownloadPNG();
        }
      }, 100);
    };
    
    img.onerror = () => {
      throw new Error('Failed to load SVG image');
    };
    
    img.src = dataUrl;
  } catch (err) {
    console.error(err);
    alert('Failed to export drawing as PNG');
  }
};

  

  const downloadJSON = () => {
    if (!board) return;

    try {
      // Get all objects from the board
      const objects: any[] = [];
      
      for (const id in board.objects) {
        const obj = board.objects[id];
        
        // Skip axes and grid elements
        if (obj.elType === 'axis' || obj.elType === 'ticks' || obj.elType === 'grid' || 
            obj.name === 'x' || obj.name === 'y') {
          continue;
        }
        
        // Create a simplified representation of each object
        const objData: any = {
          id: obj.id,
          type: obj.elType,
          name: obj.name || undefined,
        };
        
        // Add type-specific data
        if (obj.elType === 'point') {
          objData.coords = {
            x: obj.X(),
            y: obj.Y(),
          };
          objData.properties = {
            size: obj.visProp.size,
            fillColor: obj.visProp.fillcolor,
            strokeColor: obj.visProp.strokecolor,
            face: obj.visProp.face,
          };
        } else if (obj.elType === 'line' || obj.elType === 'segment' || obj.elType === 'arrow') {
          objData.point1 = obj.point1 ? { x: obj.point1.X(), y: obj.point1.Y() } : null;
          objData.point2 = obj.point2 ? { x: obj.point2.X(), y: obj.point2.Y() } : null;
          objData.properties = {
            strokeColor: obj.visProp.strokecolor,
            strokeWidth: obj.visProp.strokewidth,
          };
        } else if (obj.elType === 'polygon') {
          objData.vertices = obj.vertices.map((v: any) => ({
            x: v.X(),
            y: v.Y(),
          }));
          objData.properties = {
            fillColor: obj.visProp.fillcolor,
            fillOpacity: obj.visProp.fillopacity,
            strokeColor: obj.visProp.strokecolor,
            strokeWidth: obj.visProp.strokewidth,
          };
        } else if (obj.elType === 'circle') {
          objData.center = obj.center ? { x: obj.center.X(), y: obj.center.Y() } : null;
          objData.radius = obj.Radius();
          objData.properties = {
            fillColor: obj.visProp.fillcolor,
            fillOpacity: obj.visProp.fillopacity,
            strokeColor: obj.visProp.strokecolor,
            strokeWidth: obj.visProp.strokewidth,
          };
        } else if (obj.elType === 'curve') {
          // For curves, try to get point data
          objData.properties = {
            strokeColor: obj.visProp.strokecolor,
            strokeWidth: obj.visProp.strokewidth,
          };
        }
        
        objects.push(objData);
      }
      
      const jsonData = {
        version: '1.0',
        boardSettings: {
          boundingBox: board.getBoundingBox(),
        },
        objects: objects,
        timestamp: new Date().toISOString(),
      };
      
      const jsonString = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'drawing.json';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        a.remove();
        URL.revokeObjectURL(url);
        // Call the callback if provided
        if (onDownloadJSON) {
          onDownloadJSON();
        }
      }, 100);
    } catch (err) {
      console.error(err);
      alert('Failed to export drawing as JSON');
    }
  };

  const handleModeChange = (newMode: DrawingMode) => {
    cleanupCurrentMode();
    setMode(newMode);
  };

  const deleteSelected = () => {
    if (!board) return;
    if (!selectedObject) {
      alert('No shape selected to delete');
      return;
    }

    try {
      board.removeObject(selectedObject);
      // push to undo stack
      undoStackRef.current.push([selectedObject]);
      redoStackRef.current = [];
      setVersion(v => v + 1);
      setSelectedObject(null);
    } catch (err) {
      console.error('Failed to delete selected object', err);
    }
  };

  const handleSubmit = () => {
    const state = getCurrentState();
    if (onSubmit) {
      onSubmit(state);
    } else {
      // Default behavior: show JSON in console
      console.log('Submitted state:', state);
      alert('Answer submitted! Check console for details.');
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 p-4">
      {/* Drawing Tools moved to the right-side toolbar (vertical) */}
      
      {/* Canvas with action buttons on the right side */}
      <div className="flex items-start gap-4">
        <div
          id={containerId}
          ref={boardRef}
          className="border-2 border-gray-300 rounded-lg shadow-lg"
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
        />
        
        {/* Right-side vertical palette: left = tools, right = action icons (aligned bottom) */}
        <div className="flex bg-white rounded-lg shadow-lg p-2 border border-gray-200" style={{ width: 96 }}>
          <div className="flex-shrink-0">
            <DrawingTools
              tools={displayTools}
              currentMode={mode}
              onModeChange={handleModeChange}
            />
          </div>

          <div className="flex flex-col justify-end ml-2">
            <ActionButtons
              onUndo={undo}
              onRedo={redo}
              onClear={clearBoard}
              onDownloadPNG={downloadPNG}
              onDownloadJSON={downloadJSON}
              onDeleteSelected={deleteSelected}
              canUndo={undoStackRef.current.length > 0}
              canRedo={redoStackRef.current.length > 0}
              buttons={buttons.filter(btn => btn !== "submit")}
              selectedObjectId={selectedObject ? selectedObject.id : null}
            />

            <div className="w-full flex justify-center mt-2">
              <button onClick={clearBoard} className="text-sm px-3 py-1 bg-gray-100 border rounded-md">Reset</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Submit button below canvas */}
      {buttons.includes("submit") && (
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Submit Answer
        </button>
      )}
    </div>
  );
}
