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
  type GradingConfig, 
  gradeDrawing, 
  generateFeedbackMessage 
} from './diagram_grading_logic';

const messages = {
  fa: faMessages,
  fr: frMessages,
};

// Frontend fallback defaults (used only if backend omits fields)
const DEFAULT_QUESTION_TEXT = 'Frontend fallback question: draw a line from (0,0) to (9,9).';
const DEFAULT_VISIBLE_TOOLS = ['point', 'segment', 'triangle', 'circle', 'arrow', 'curve'];
const DEFAULT_VISIBLE_BUTTONS = ['undo', 'redo', 'clear', 'downloadPNG', 'downloadJSON', 'submit'];
const DEFAULT_GRADING_TOLERANCE = 0.8;
const DEFAULT_EXPECTED_DRAWING: BoardState = {
  version: '1.0',
  boardSettings: { boundingBox: [-1, 11, 11, -1] },
  objects: []
};
const DEFAULT_INITIAL_DRAWING: BoardState = {
  version: '1.0',
  boardSettings: { boundingBox: [-1, 11, 11, -1] },
  objects: []
};

interface InitData {
  attempts?: number;
  remaining_attempts?: number;
  // Identifiers for localStorage
  index?: number;
  AssessName?: string;
  // DrawingBoard component props
  questionText?: string;
  visibleTools?: string[];
  visibleButtons?: string[];
  expectedDrawing?: string;
  initialDrawingState?: string;
  gradingTolerance?: number;
  gradingConfig?: GradingConfig;
}

const StudentView: React.FC<{ runtime: BoundRuntime; initData: InitData }> = ({ runtime, initData }) => {
  const index = initData.index ?? 1;
  const AssessName = initData.AssessName ?? 'quiz1';
  const [summaryMsg, setSummaryMsg] = useState<string>('');

  // DrawingBoard props - backend should supply these; otherwise we fall back to obvious frontend defaults
  const questionText = initData.questionText ?? DEFAULT_QUESTION_TEXT;
  const visibleTools = initData.visibleTools ?? DEFAULT_VISIBLE_TOOLS;
  const visibleButtons = initData.visibleButtons ?? DEFAULT_VISIBLE_BUTTONS;
  const gradingTolerance = initData.gradingTolerance ?? DEFAULT_GRADING_TOLERANCE;
  
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
        setExpectedDrawing(DEFAULT_EXPECTED_DRAWING);
      }
    } else {
      setExpectedDrawing(DEFAULT_EXPECTED_DRAWING);
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
        setInitialDrawingState(DEFAULT_INITIAL_DRAWING);
      }
    } else {
      setInitialDrawingState(DEFAULT_INITIAL_DRAWING);
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



  const handleSubmit = async (state: BoardState) => {
    if (expectedDrawing) {
      // Use the comprehensive grading function
      const gradingConfig: GradingConfig = initData.gradingConfig ?? {
        mode: 'tolerance',
        tolerance: gradingTolerance,
        partialCredit: true,
        requireAll: false
      };
      
      const result = gradeDrawing(state, expectedDrawing, gradingConfig);
      setScore(result.score);
      
      // Generate feedback message
      const resultMessage = generateFeedbackMessage(result.score);
      
      setGradeResult(`${resultMessage} - ${result.details}`);
      setShowExpected(true);
      
      // Send grade and details to backend
      try {
        const res = await runtime.postHandler('submit_grade', { 
          grade: result.score,
          breakdown: result.breakdown,
          details: result.details
        });
        const serverSummary = res?.summary || res?.message;
        setSummaryMsg(serverSummary || `Submitted grade: ${(result.score * 100).toFixed(1)}%`);
      } catch (err) {
        console.error('submit_grade error', err);
        setSummaryMsg(`Submitted grade: ${(result.score * 100).toFixed(1)}% (backend error)`);
      }
      return;
    }

    // If no expectedDrawing, still send a neutral grade
    const fallbackGrade = 0;
    try {
      const res = await runtime.postHandler('submit_grade', { grade: fallbackGrade });
      const serverSummary = res?.summary || res?.message;
      setSummaryMsg(serverSummary || 'Submitted (no expected drawing set).');
    } catch (err) {
      console.error('submit_grade error', err);
      setSummaryMsg('Submitted (backend error, no expected drawing set).');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto py-8 px-4 max-w-[1800px]">
        <div className="space-y-6">
          {/* Row 1: Question and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-md">
              <h2 className="text-base font-semibold mb-2 text-zinc-900 dark:text-zinc-50">Question</h2>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{questionText}</p>
              {gradeResult && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                    Result: {gradeResult}
                  </p>
                  {score !== null && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      Score: {(score * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-md">
              <h3 className="text-base font-semibold mb-2 text-zinc-900 dark:text-zinc-50">Message from Server: </h3>
              <div className="text-green-600 dark:text-green-400 font-medium text-xs">
                {summaryMsg ? summaryMsg : 'Draw something and submit to check your answer.'}
              </div>
            </div>
          </div>

          {/* Row 2: Two canvases side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Your Drawing */}
            <div>
              {initialDrawingState && (
                <DrawingBoard
                  tools={visibleTools as any}
                  buttons={visibleButtons as any}
                  initialState={initialDrawingState}
                  readOnlyInitial={true}
                  onSubmit={handleSubmit}
                  containerId="jxgbox-student"
                />
              )}
            </div>

            {/* Expected Drawing */}
            <div>
              <h2 className="text-base font-semibold mb-2 text-zinc-900 dark:text-zinc-50">Expected Drawing</h2>
              {!showExpected ? (
                <div className="w-full h-[400px] border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800">
                  <p className="text-center px-4 text-xs">Expected drawing will be revealed after submission</p>
                </div>
              ) : (
                combinedExpectedDrawing && (
                  <DrawingBoard
                    tools={[]}
                    buttons={[]}
                    initialState={combinedExpectedDrawing}
                    readOnlyInitial={true}
                    containerId="jxgbox-expected"
                  />
                )
              )}
            </div>
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