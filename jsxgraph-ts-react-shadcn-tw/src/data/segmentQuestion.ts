import { type BoardState } from "@/components/DrawingBoard";

export const questionText = `Draw a line segment connecting the points (0, 0) and (9, 9).`;

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

// nominal correct answer (1 for correct, 0 for incorrect) - kept for reference
export const expectedAnswer = 1;

export default { questionText, expectedDrawing, expectedAnswer };
