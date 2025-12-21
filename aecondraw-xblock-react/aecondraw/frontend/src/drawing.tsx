//
////////////////////////////////////////////////////////////////////////////////
// Remember: changes in this file will only take effect when you run
// npm run build       or      npm run watch
////////////////////////////////////////////////////////////////////////////////

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { BoundRuntime, type JQueryWrappedDiv, type XBlockRuntime } from './xblock-utils';
import faMessages from '../lang/compiled/fa.json';
import frMessages from '../lang/compiled/fr.json';
import DrawingBoard, { type BoardState } from './components/DrawingBoard';
import type { DrawingMode } from './lib/drawingModes';
import './styles.css';

const messages = {
  fa: faMessages,
  fr: frMessages,
};

interface InitData {
  question: string;
  attempts?: number;
  remaining_attempts?: number;
  // drawing app props
  index?: number;
  AssessName?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  scaleFactors?: number[];
  submitButtonClicked?: boolean;
  bgnumber?: number;
  // Can be an object (JSXGraph board state) or a URL string pointing to a .json file
  initialDrawing?: object | string;
  visibleModes?: string[];
  axisLabels?: [string, string];
  hideLabels?: boolean;
}

// Map old FabricJS mode names to JSXGraph mode names
const modeMapping: Record<string, DrawingMode> = {
  'point': 'point',
  'line': 'segment',
  'singlearrowhead': 'arrow',
  'doublearrowhead': 'doubleArrow',
  'triangle': 'triangle',
  'rect': 'rectangle',
  'circle': 'circle',
  'polygon': 'triangle', // Map polygon to triangle for now
  'curve': 'curve',
  'curve4pts': 'curve',
};

const StudentView: React.FC<{ runtime: BoundRuntime; initData: InitData }> = ({ runtime, initData }) => {
  const index = initData.index ?? 1;
  const AssessName = initData.AssessName ?? 'quiz1';
  const canvasWidth = initData.canvasWidth ?? 500;
  const canvasHeight = initData.canvasHeight ?? 400;
  const scaleFactors = initData.scaleFactors ?? [100, 200, 75, 84, 25, 35];
  const [summaryMsg, setSummaryMsg] = useState<string>('');
  const bgnumber = initData.bgnumber ?? 0;
  const axisLabels = initData.axisLabels ?? ['q', 'p'];
  const hideLabels = initData.hideLabels ?? false;
  const initialDrawingFromInit = initData.initialDrawing ?? {};
  const [initialDrawing, setInitialDrawing] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentBoardState, setCurrentBoardState] = useState<BoardState | null>(null);

  // Map visible modes from old format to new format
  const visibleModesRaw = initData.visibleModes ?? [];
  const visibleModes: DrawingMode[] = visibleModesRaw
    .map(mode => modeMapping[mode])
    .filter((mode): mode is DrawingMode => mode !== null && mode !== undefined);

  // Calculate bounding box from scaleFactors
  // scaleFactors = [xlim, ylim, bottom_margin, left_margin, top_margin, right_margin]
  const [xlim, ylim, bottomMargin, leftMargin, topMargin, rightMargin] = scaleFactors;
  const boundingBox: [number, number, number, number] = [
    -leftMargin / 10,  // xMin
    ylim + topMargin / 10, // yMax
    xlim + rightMargin / 10, // xMax
    -bottomMargin / 10 // yMin
  ];

  // If initialDrawingFromInit is a URL string, fetch it and parse json.
  useEffect(() => {
    let cancelled = false;
    async function maybeFetch() {
      if (typeof initialDrawingFromInit === 'string' && /^https?:\/\//i.test(initialDrawingFromInit)) {
        // Convert GitHub blob URL to raw.githubusercontent.com so fetch gets JSON
        let fetchUrl = initialDrawingFromInit;
        try {
          const ghMatch = initialDrawingFromInit.match(/^https:\/\/github.com\/(.+?)\/(.+?)\/blob\/(.+?)\/(.+)$/i);
          if (ghMatch) {
            const owner = ghMatch[1];
            const repo = ghMatch[2];
            const branch = ghMatch[3];
            const path = ghMatch[4];
            fetchUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
          }
        } catch (e) {
          // if conversion fails, fallback to original URL
          fetchUrl = initialDrawingFromInit;
        }
        
        try {
          const res = await fetch(fetchUrl);
          if (!res.ok) throw new Error(`Failed to fetch initial drawing: ${res.status}`);
          const json = await res.json();
          if (!cancelled) setInitialDrawing(json);
        } catch (err) {
          console.error('Error fetching initial drawing URL', err);
          if (!cancelled) setInitialDrawing(null);
        }
      } else if (typeof initialDrawingFromInit === 'object' && initialDrawingFromInit !== null) {
        // It's already an object, use it directly
        setInitialDrawing(initialDrawingFromInit);
      } else {
        setInitialDrawing(null);
      }
    }
    maybeFetch();
    return () => { cancelled = true; };
  }, [initialDrawingFromInit]);

  const handleSubmit = async (state: BoardState) => {
    setIsSubmitting(true);
    
    try {
      // Send the board state to the backend
      const result = await runtime.postHandler('send_drawing_json', { 
        drawing: JSON.stringify(state)
      });
      
      setSummaryMsg(result.summary || 'Submission successful!');
    } catch (err) {
      console.error('send_drawing_json error', err);
      setSummaryMsg('Error sending drawing to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStateChange = (state: BoardState) => {
    setCurrentBoardState(state);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '80%', marginBottom: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
        <div className="block-info" style={{ flex: 1, marginRight: '24px', minWidth: '300px' }}>
          <p>{initData.question}</p>
        </div>

        <div className="drawing-container" style={{ flex: 2, minWidth: '400px' }}>
          <DrawingBoard
            tools={visibleModes.length > 0 ? visibleModes : "all"}
            buttons={["undo", "redo", "clear", "downloadPNG", "downloadJSON", "submit"]}
            initialState={initialDrawing}
            readOnlyInitial={true}
            onSubmit={handleSubmit}
            onStateChange={handleStateChange}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            boundingBox={boundingBox}
            axisLabels={axisLabels}
            hideLabels={hideLabels}
          />
        </div>
      </div>

      <div className="block-info2" style={{ marginTop: '24px', minWidth: '300px', width: '100%' }}>
        <h4>Drawing Summary</h4>
        <div style={{ overflowX: 'auto', color: summaryMsg ? 'green' : 'black', fontWeight: summaryMsg ? 'bold' : 'normal' }}>
          {summaryMsg ? summaryMsg : 'Draw something and then Click Submit to check your answer.'}
        </div>
      </div>
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

(globalThis as any).initAecondrawXBlockStudentView = initStudentView;