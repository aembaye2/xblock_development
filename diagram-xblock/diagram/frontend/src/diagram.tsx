//
////////////////////////////////////////////////////////////////////////////////
// Remember: changes in this file will only take effect when you run
// npm run build       or      npm run watch
////////////////////////////////////////////////////////////////////////////////

import './styles/tailwind.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { BoundRuntime, type JQueryWrappedDiv, type XBlockRuntime } from './xblock-utils';
import faMessages from '../lang/compiled/fa.json';
import frMessages from '../lang/compiled/fr.json';
import DrawingBoard, { type BoardState } from "./canvas/components/DrawingBoard";

import { 
  questionText as defaultQuestionText, 
  expectedDrawing as defaultExpectedDrawing, 
  initialDrawing as defaultInitialDrawing,
  visibleTools as defaultVisibleTools,
  visibleButtons as defaultVisibleButtons,
  gradingTolerance as defaultGradingTolerance
} from "./canvas/data/backendlike";

const messages = {
  fa: faMessages,
  fr: frMessages,
};

interface InitData {
  question: string;
  attempts?: number;
  remaining_attempts?: number;
  // Identifiers for localStorage
  index?: number;
  AssessName?: string;
  submitButtonClicked?: boolean;
  // DrawingBoard component props
  questionText?: string;
  visibleTools?: string[];
  visibleButtons?: string[];
  expectedDrawing?: string;
  initialDrawingState?: string;
  gradingTolerance?: number;
}

const StudentView: React.FC<{ runtime: BoundRuntime; initData: InitData }> = ({ runtime, initData }) => {
  const index = initData.index ?? 1;
  const AssessName = initData.AssessName ?? 'quiz1';
  const [submitButtonClicked, setSubmitButtonClicked] = useState<boolean>(initData.submitButtonClicked ?? false);
  const [summaryMsg, setSummaryMsg] = useState<string>('');

  // DrawingBoard props - use backend values if provided, otherwise fallback to backendlike defaults
  const questionText = initData.questionText ?? defaultQuestionText;
  const visibleTools = initData.visibleTools ?? defaultVisibleTools;
  const visibleButtons = initData.visibleButtons ?? defaultVisibleButtons;
  const gradingTolerance = initData.gradingTolerance ?? defaultGradingTolerance;
  
  // Parse expected and initial drawing states
  const [expectedDrawing, setExpectedDrawing] = useState<BoardState | null>(null);
  const [initialDrawingState, setInitialDrawingState] = useState<BoardState | null>(null);
  const [combinedExpectedDrawing, setCombinedExpectedDrawing] = useState<BoardState | null>(null);
  const [gradeResult, setGradeResult] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [showExpected, setShowExpected] = useState<boolean>(false);

  useEffect(() => {
    // Parse expectedDrawing
    if (initData.expectedDrawing) {
      try {
        const parsed = typeof initData.expectedDrawing === 'string' 
          ? JSON.parse(initData.expectedDrawing) 
          : initData.expectedDrawing;
        setExpectedDrawing(parsed);
      } catch (e) {
        console.error('Failed to parse expectedDrawing:', e);
        setExpectedDrawing(defaultExpectedDrawing);
      }
    } else {
      setExpectedDrawing(defaultExpectedDrawing);
    }

    // Parse initialDrawingState
    if (initData.initialDrawingState) {
      try {
        const parsed = typeof initData.initialDrawingState === 'string' 
          ? JSON.parse(initData.initialDrawingState) 
          : initData.initialDrawingState;
        setInitialDrawingState(parsed);
      } catch (e) {
        console.error('Failed to parse initialDrawingState:', e);
        setInitialDrawingState(defaultInitialDrawing);
      }
    } else {
      setInitialDrawingState(defaultInitialDrawing);
    }
  }, [initData.expectedDrawing, initData.initialDrawingState]);

  // Combine initial drawing and expected drawing when both are available
  useEffect(() => {
    if (expectedDrawing && initialDrawingState) {
      const combined: BoardState = {
        ...expectedDrawing,
        objects: [
          ...(initialDrawingState.objects || []),
          ...(expectedDrawing.objects || [])
        ]
      };
      setCombinedExpectedDrawing(combined);
    }
  }, [expectedDrawing, initialDrawingState]);

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

  const handleSubmit = async (state: BoardState) => {
    if (expectedDrawing) {
      const result = gradeSegment(state, expectedDrawing, gradingTolerance);
      setScore(result);
      setGradeResult(result === 1 ? "✅ Correct" : "❌ Incorrect");
      setShowExpected(true);
    }

    // Send to backend
    setSubmitButtonClicked(true);
    setTimeout(async () => {
      const key = `${AssessName}-canvasDiagram-${index}`;
      const raw = localStorage.getItem(key);
      let parsed = null;
      if (raw) {
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          parsed = raw;
        }
      }

      if (parsed) {
        try {
          const result = await runtime.postHandler('send_diagram_json', { diagram: parsed });
          setSummaryMsg(result.summary || 'No summary returned.');
        } catch (err) {
          console.error('send_diagram_json error', err);
          setSummaryMsg('Error sending diagram to backend.');
        }
      } else {
        setSummaryMsg('No diagram data found.');
      }

      setSubmitButtonClicked(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto py-8 px-4 max-w-[1800px]">
        {/* Three columns side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Column 1: Question and Summary */}
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-md">
              <h2 className="text-base font-semibold mb-2 text-zinc-900 dark:text-zinc-50">Question</h2>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{questionText}</p>
              {gradeResult && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                    Result: {gradeResult} {score !== null && `(score: ${score})`}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-md">
              <h3 className="text-base font-semibold mb-2 text-zinc-900 dark:text-zinc-50">Diagram Summary</h3>
              <div className="text-green-600 dark:text-green-400 font-medium text-xs">
                {summaryMsg ? summaryMsg : 'Draw something and submit to check your answer.'}
              </div>
            </div>
          </div>

          {/* Column 2: Your Drawing */}
          <div>
            <h2 className="text-base font-semibold mb-2 text-zinc-900 dark:text-zinc-50">Your Drawing</h2>
            {initialDrawingState && (
              <div className="scale-90 origin-top-left">
                <DrawingBoard
                  tools={visibleTools as any}
                  buttons={visibleButtons as any}
                  initialState={initialDrawingState}
                  readOnlyInitial={true}
                  onSubmit={handleSubmit}
                  containerId="jxgbox-student"
                />
              </div>
            )}
          </div>

          {/* Column 3: Expected Drawing */}
          <div>
            <h2 className="text-base font-semibold mb-2 text-zinc-900 dark:text-zinc-50">Expected Drawing</h2>
            {!showExpected ? (
              <div className="w-full h-[400px] border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800">
                <p className="text-center px-4 text-xs">Expected drawing will be revealed after submission</p>
              </div>
            ) : (
              combinedExpectedDrawing && (
                <div className="scale-90 origin-top-left">
                  <DrawingBoard
                    tools={[]}
                    buttons={[]}
                    initialState={combinedExpectedDrawing}
                    readOnlyInitial={true}
                    containerId="jxgbox-expected"
                  />
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Loader for XBlock React view
function initStudentView(runtime: XBlockRuntime, container: HTMLDivElement | JQueryWrappedDiv, initData: InitData) {
  if ('jquery' in container) container = container[0];
  const languageCode = document.body.parentElement!.lang;
  const root = ReactDOM.createRoot(container!);
  root.render(
    <IntlProvider messages={(messages as any)[languageCode]} locale={languageCode} defaultLocale="en">
      <StudentView runtime={new BoundRuntime(runtime, container)} initData={initData} />
    </IntlProvider>
  );
}

(globalThis as any).initDiagramXBlockStudentView = initStudentView;