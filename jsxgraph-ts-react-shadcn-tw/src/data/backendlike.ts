import { type BoardState } from "@/canvas/components/DrawingBoard";

// Type definitions for DrawingBoard configuration
type ToolType = "point" | "segment" | "triangle" | "circle" | "arrow" | "curve";
type ButtonType = "undo" | "redo" | "clear" | "downloadPNG" | "downloadJSON" | "submit";

// Question text displayed to the student
export const questionText = `Draw a line segment connecting the points (0, 0) and (9, 9).`;

// Expected drawing for grading comparison
export const expectedDrawing: BoardState = {
  version: "1.0",
  boardSettings: { boundingBox: [-1, 11, 11, -1] },
  objects: [
    {
      id: "expected_segment_1",
      type: "segment",
      point1: { x: 0, y: 0 },
      point2: { x: 9, y: 9 },
      properties: { strokeColor: "#059669", strokeWidth: 2 },
      isInitial: true,
    },
  ],
};

// Initial drawing state with a pre-drawn segment
export const initialDrawing: BoardState = {
  version: "1.0",
  boardSettings: {
    boundingBox: [-1, 11, 11, -1],
  },
  objects: [
    {
      id: "initial_segment_1",
      type: "segment",
      point1: { x: 0, y: 8 },
      point2: { x: 8, y: 0 },
      properties: {
        strokeColor: "#2563eb",
        strokeWidth: 2,
      },
      isInitial: true,
    },
  ],
};

// Configure visible tools for the drawing board
export const visibleTools: ToolType[] = ["point", "segment", "triangle", "circle", "arrow", "curve"];

// Configure visible buttons on the toolbar
export const visibleButtons: ButtonType[] = ["undo", "redo", "clear", "downloadPNG", "downloadJSON", "submit"];

// Grading tolerance for point matching
export const gradingTolerance = 0.8;

// nominal correct answer (1 for correct, 0 for incorrect) - kept for reference
export const expectedAnswer = 1;

export default { 
  questionText, 
  expectedDrawing, 
  expectedAnswer, 
  initialDrawing,
  visibleTools,
  visibleButtons,
  gradingTolerance
};
