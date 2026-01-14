// Shared types for drawing modes

export type DrawingMode = "point" | "segment" | "arrow" | "doubleArrow" | "triangle" | "rectangle" | "circle" | "curve" | "text" | "polygon" | "select" | null;

export interface Point {
  x: number;
  y: number;
}

export interface DrawingModeHandler {
  handleMouseDown: (e: MouseEvent, context: DrawingContext) => void;
  handleMouseMove: (e: MouseEvent, context: DrawingContext) => void;
  handleMouseUp: (e: MouseEvent, context: DrawingContext) => void;
  handleDoubleClick?: (e: MouseEvent, context: DrawingContext) => void;
  cleanup?: (context: DrawingContext) => void;
}

export interface DrawingContext {
  board: any;
  mode: DrawingMode;
  isDrawing: boolean;
  setIsDrawing: (value: boolean) => void;
  startPoint: Point | null;
  setStartPoint: (point: Point | null) => void;
  currentShape: any;
  setCurrentShape: (shape: any) => void;
  undoStackRef: React.MutableRefObject<any[][]>;
  redoStackRef: React.MutableRefObject<any[][]>;
  setVersion: React.Dispatch<React.SetStateAction<number>>;
  getMouseCoords: (e: MouseEvent) => any;
}
