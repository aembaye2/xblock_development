import { useState } from "react";
import DrawingBoard, { type BoardState } from "../components/DrawingBoard";
import { questionText, expectedDrawing } from "../data/segmentQuestion";

// Type definitions for DrawingBoard configuration
type ToolType = "point" | "segment" | "triangle" | "circle" | "arrow" | "curve";
type ButtonType = "undo" | "redo" | "clear" | "downloadPNG" | "downloadJSON" | "submit";

export default function Home() {
  const [gradeResult, setGradeResult] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [showExpected, setShowExpected] = useState<boolean>(false);

  // Configure visible tools and buttons
  const visibleTools: ToolType[] = ["point", "segment", "triangle", "circle", "arrow", "curve"];
  const visibleButtons: ButtonType[] = ["undo", "redo", "clear", "downloadPNG", "downloadJSON", "submit"];

  // Initial drawing with a segment
  const initialDrawing: BoardState = {
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

  // Grading helpers
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const gradeSegment = (
    state: BoardState,
    expected: BoardState,
    tolerance = 0.6
  ): number => {
    const studentObjects = state.objects.filter((o: any) => !o.isInitial);
    const seg = studentObjects.find((o: any) => o.type === "segment" || o.type === "line");
    if (!seg) return 0;
    const s1 = seg.point1;
    const s2 = seg.point2;
    if (!s1 || !s2) return 0;

    const exp = expected.objects.find((o: any) => o.type === "segment" || o.type === "line");
    if (!exp) return 0;
    const e1 = exp.point1;
    const e2 = exp.point2;
    if (!e1 || !e2) return 0;

    const directMatch = dist(s1, e1) <= tolerance && dist(s2, e2) <= tolerance;
    const swappedMatch = dist(s1, e2) <= tolerance && dist(s2, e1) <= tolerance;
    return directMatch || swappedMatch ? 1 : 0;
  };

  const handleSubmit = (state: BoardState) => {
    const result = gradeSegment(state, expectedDrawing, 0.8);
    setScore(result);
    setGradeResult(result === 1 ? "✅ Correct" : "❌ Incorrect");
    setShowExpected(true);
    // Optionally send to backend here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Interactive Drawing Board
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Configurable for OpenEdX XBlocks and educational platforms
          </p>
        </div>
        
        <div className="mb-6 text-center">
          <p className="text-lg font-medium">{questionText}</p>
          {gradeResult && (
            <p className="mt-2 text-sm font-semibold">Result: {gradeResult} {score !== null && `(score: ${score})`}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-start">
          <div>
            <h2 className="text-lg font-semibold mb-2">Your Drawing</h2>
            <DrawingBoard
              tools={visibleTools}
              buttons={visibleButtons}
              initialState={initialDrawing}
              readOnlyInitial={true}
              onSubmit={handleSubmit}
              containerId="jxgbox-student"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Expected Drawing</h2>
            {!showExpected ? (
              <div className="w-[600px] h-[500px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-zinc-500">
                Expected drawing will be revealed after submission
              </div>
            ) : (
              <DrawingBoard
                tools={[]}
                buttons={[]}
                initialState={expectedDrawing}
                readOnlyInitial={true}
                containerId="jxgbox-expected"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
