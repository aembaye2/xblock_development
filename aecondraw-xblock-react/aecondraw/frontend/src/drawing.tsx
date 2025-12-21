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
// import "./App.css"
// use the drawing canvas package from local files instead
import { DrawingApp } from './components/canvas/DrawingApp';
import { modes } from './components/canvas/modesfile';
// Use the drawing canvas package from npm instead
// import { DrawingApp, modes } from 'ae-drawable-canvas';

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
  // Can be an object (Fabric canvas data) or a URL string pointing to a .json file
  initialDrawing?: object | string;
  visibleModes?: string[];
  axisLabels?: [string, string];
  hideLabels?: boolean;
}

// No MCQ Props needed

const StudentView: React.FC<{ runtime: BoundRuntime; initData: InitData }> = ({ runtime, initData }) => {
  const index = initData.index ?? 1;
  const AssessName = initData.AssessName ?? 'quiz1';
  const canvasWidth = initData.canvasWidth ?? 500;
  const canvasHeight = initData.canvasHeight ?? 400;
  const scaleFactors = initData.scaleFactors ?? [100, 200, 75, 84, 25, 35];
  const [submitButtonClicked, setSubmitButtonClicked] = useState<boolean>(initData.submitButtonClicked ?? false);
  const [summaryMsg, setSummaryMsg] = useState<string>('');
  const bgnumber = initData.bgnumber ?? 0;
  const axisLabels = initData.axisLabels ?? ['q', 'p'];
  const hideLabels = initData.hideLabels ?? false;
  const initialDrawingFromInit = initData.initialDrawing ?? {};
  const [initialDrawing, setInitialDrawing] = useState<any>(
    typeof initialDrawingFromInit === 'string' ? initialDrawingFromInit : initialDrawingFromInit
  );

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
          // keep the URL string in state so DrawingApp can decide what to do
          if (!cancelled) setInitialDrawing(initialDrawingFromInit);
        }
      } else {
        // not a URL: use the provided object/JSON value
        setInitialDrawing(initialDrawingFromInit);
      }
    }
    maybeFetch();
    return () => { cancelled = true; };
  }, [initialDrawingFromInit]);
  const visibleModes = initData.visibleModes ?? undefined;

  const renderSubmitButton = () => (
    <div style={{ marginTop: '8px' }}>
      <button
        type="button"
        onClick={async () => {
          setSubmitButtonClicked(true);
          setTimeout(async () => {
            const key = `${AssessName}-canvasDrawing-${index}`;
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
                const result = await runtime.postHandler('send_drawing_json', { drawing: parsed });
                setSummaryMsg(result.summary || 'No summary returned.');
              } catch (err) {
                console.error('send_drawing_json error', err);
                setSummaryMsg('Error sending drawing to backend.');
              }
            } else {
              setSummaryMsg('No drawing data found.');
            }

            setSubmitButtonClicked(false);
          }, 200);
        }}
      >
        Submit
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '80%', marginBottom: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
        <div className="block-info" style={{ flex: 1, marginRight: '24px', minWidth: '300px' }}>
          <p>{initData.question}</p>
        </div>

        <div className="drawing-container" style={{ flex: 2, minWidth: '400px' }}>
          <DrawingApp
            index={index}
            AssessName={AssessName}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            scaleFactors={scaleFactors}
            submitButtonClicked={submitButtonClicked}
            modes={modes}
            visibleModes={visibleModes}
            bgnumber={bgnumber}
            axisLabels={axisLabels}
            initialDrawing={initialDrawing}
            hideLabels={hideLabels}
          />
        </div>
      </div>

      {renderSubmitButton()}

      <div className="block-info2" style={{ marginTop: '24px', minWidth: '300px', width: '100%' }}>
        <h4>Drawing Summary</h4>
        <div style={{ overflowX: 'auto', color: 'green', fontWeight: 'bold' }}>
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