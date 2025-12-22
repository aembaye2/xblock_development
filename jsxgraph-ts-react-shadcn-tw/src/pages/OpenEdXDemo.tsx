import { useState } from "react";
import DrawingBoard, { type BoardState } from "@/components/DrawingBoard";

// Example: Instructor creates this initial state
const instructorDrawing: BoardState = {
  version: "1.0",
  boardSettings: {
    boundingBox: [-1, 11, 11, -1],
  },
  objects: [
    {
      id: "initial_point_A",
      type: "point",
      coords: { x: 2, y: 3 },
      properties: {
        size: 3,
        fillColor: "#ff0000",
        strokeColor: "#ff0000",
        face: "o",
      },
      isInitial: true,
    },
    {
      id: "initial_point_B", 
      type: "point",
      coords: { x: 6, y: 7 },
      properties: {
        size: 3,
        fillColor: "#ff0000",
        strokeColor: "#ff0000",
        face: "o",
      },
      isInitial: true,
    },
  ],
};

export default function OpenEdXDemoPage() {
  const [submittedState, setSubmittedState] = useState<BoardState | null>(null);
  const [gradeResult, setGradeResult] = useState<string | null>(null);

  // This function would be called by OpenEdX XBlock
  const handleSubmit = (state: BoardState) => {
    console.log("Student submitted:", state);
    setSubmittedState(state);
    
    // Grade the submission
    const grade = gradeSubmission(state);
    setGradeResult(grade);
    
    // In real OpenEdX, you would send this to the backend:
    // fetch('/xblock/submit', {
    //   method: 'POST',
    //   body: JSON.stringify(state)
    // })
  };

  // Example grading logic
  const gradeSubmission = (state: BoardState): string => {
    // Check if student drew a line segment connecting the two points
    const studentObjects = state.objects.filter(obj => !obj.isInitial);
    
    // Look for a segment
    const segment = studentObjects.find(obj => 
      obj.type === 'segment' || obj.type === 'line'
    );
    
    if (!segment) {
      return "❌ Incorrect: No line segment found. Please draw a line connecting points A and B.";
    }
    
    // Check if the segment connects the two initial points (approximately)
    const p1 = segment.point1;
    const p2 = segment.point2;
    
    const connectsAB = (
      (Math.abs(p1.x - 2) < 0.5 && Math.abs(p1.y - 3) < 0.5 &&
       Math.abs(p2.x - 6) < 0.5 && Math.abs(p2.y - 7) < 0.5) ||
      (Math.abs(p2.x - 2) < 0.5 && Math.abs(p2.y - 3) < 0.5 &&
       Math.abs(p1.x - 6) < 0.5 && Math.abs(p1.y - 7) < 0.5)
    );
    
    if (connectsAB) {
      return "✅ Correct! You successfully drew a line segment connecting points A and B.";
    } else {
      return "❌ Incorrect: The line segment doesn't connect points A and B. Try again.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            OpenEdX XBlock Demo
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Example of instructor setup with student interaction and grading
          </p>
        </div>

        {/* Question Card */}
        <div className="max-w-4xl mx-auto mb-8 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Question: Draw a Line Segment
          </h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-4">
            Two points A and B are shown on the coordinate plane below (red circles).
          </p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Task: Draw a line segment that connects point A to point B.
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              💡 <strong>Tip:</strong> Use the segment tool to draw a line between the two points.
              The red points cannot be moved or deleted.
            </p>
          </div>
        </div>

        {/* Drawing Board */}
        <DrawingBoard
          tools={["segment", "point"]}
          buttons={["undo", "redo", "submit"]}
          initialState={instructorDrawing}
          readOnlyInitial={true}
          onSubmit={handleSubmit}
        />

        {/* Results Display */}
        {gradeResult && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className={`p-6 rounded-lg shadow-lg ${
              gradeResult.startsWith("✅") 
                ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-500" 
                : "bg-red-50 dark:bg-red-900/20 border-2 border-red-500"
            }`}>
              <h3 className="text-xl font-semibold mb-2">
                {gradeResult.startsWith("✅") ? "Grade: 100%" : "Grade: 0%"}
              </h3>
              <p className="text-lg">{gradeResult}</p>
            </div>
          </div>
        )}

        {/* Submission Details (for debugging) */}
        {submittedState && (
          <details className="max-w-4xl mx-auto mt-8 p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <summary className="cursor-pointer font-semibold text-lg mb-2">
              View Submitted State (Debug)
            </summary>
            <pre className="text-xs overflow-auto p-4 bg-zinc-50 dark:bg-zinc-900 rounded">
              {JSON.stringify(submittedState, null, 2)}
            </pre>
          </details>
        )}

        {/* Instructions for Developers */}
        <div className="max-w-4xl mx-auto mt-12 p-6 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">How This Works</h3>
          <ol className="list-decimal list-inside space-y-2 text-zinc-700 dark:text-zinc-300">
            <li>
              <strong>Instructor Setup:</strong> The instructor creates an initial drawing
              (two red points in this case) and defines the question.
            </li>
            <li>
              <strong>Student Interaction:</strong> Students see the initial drawing
              (read-only) and use the tools to complete the task.
            </li>
            <li>
              <strong>Submission:</strong> When students click "Submit", their drawing
              state is captured and sent to the grading function.
            </li>
            <li>
              <strong>Automated Grading:</strong> The grading function checks if the
              student's answer meets the criteria (in this case, drawing a connecting line).
            </li>
            <li>
              <strong>Feedback:</strong> Students receive immediate feedback about their answer.
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
