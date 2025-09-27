
////////////////////////////////////////////////////////////////////////////////
// Remember: changes in this file will only take effect when you run          //
// npm run build       or      npm run watch                                  //
////////////////////////////////////////////////////////////////////////////////

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { BoundRuntime, type JQueryWrappedDiv, type XBlockRuntime } from './xblock-utils';
import faMessages from '../lang/compiled/fa.json';
import frMessages from '../lang/compiled/fr.json';
//import "./App.css"
// user the drawing canvas package from local files instead
import { DrawingApp } from "./components/canvas/DrawingApp"
import { modes } from "./components/canvas/modesfile"
// Use the drawing canvas package from npm instead
//import { DrawingApp, modes } from 'ae-drawable-canvas';


const messages = {
  fa: faMessages,
  fr: frMessages,
};

interface InitData {
  question: string;
  options: string[];
  correct: number;
  user_answer?: number;
  attempts?: number;
  remaining_attempts?: number;
  // drawing app props
  index?: number;
  AssessName?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  scaleFactors?: number[];
  submitButtonClicked?: boolean;
  bgnumber?: number; // New prop for selecting the background
}

interface Props {
  runtime: BoundRuntime;
  question: string;
  options: string[]
  correct: number;
  user_answer?: number;
  attempts?: number;
  remaining_attempts?: number;
}

const StudentView: React.FC<{ runtime: BoundRuntime; initData: InitData }> = ({ runtime, initData }) => {
  // Render the DrawingApp using initData from the XBlock
  const index = initData.index ?? 1
  const AssessName = initData.AssessName ?? initData.question ?? 'quiz1'
  const canvasWidth = initData.canvasWidth ?? 500
  const canvasHeight = initData.canvasHeight ?? 400
  const scaleFactors= initData.scaleFactors ?? [100, 200, 75, 84, 25, 35] // default scaleFactor
  // local UI state to trigger saving the canvas JSON to localStorage
  const [submitButtonClicked, setSubmitButtonClicked] = useState<boolean>(initData.submitButtonClicked ?? false)
  const [summaryMsg, setSummaryMsg] = useState<string>("");
  const bgnumber = initData.bgnumber ?? 0 // New prop for selecting the background
  
  // Render the Submit button and its behavior
  const renderSubmitButton = () => {
    return (
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
              // Send to backend via the XBlock runtime and display backend summary
              if (parsed) {
                try {
                  const result = await runtime.postHandler('send_drawing_json', { drawing: parsed });
                  setSummaryMsg(result.summary || "No summary returned.");
                } catch (err) {
                  console.error('send_drawing_json error', err);
                  setSummaryMsg("Error sending drawing to backend.");
                }
              } else {
                setSummaryMsg("No drawing data found.");
              }
              setSubmitButtonClicked(false);
            }, 200);
          }}
        >
          Submit
        </button>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '80%', marginBottom: '24px', }}>
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
            bgnumber={bgnumber}
          />
        </div>
      </div>
      {renderSubmitButton()}
      <div className="block-info2" style={{marginTop: '24px', minWidth: '300px', width: '100%' }}>
        <h4>Drawing Summary</h4>
        <div style={{ overflowX: 'auto', color: 'green', fontWeight: 'bold' }}>
          {summaryMsg ? summaryMsg : "Draw something and then Click Submit to check your answer."}
        </div>
      </div>
    </div>
  );
}

// Loader for XBlock React view
function initStudentView(runtime: XBlockRuntime, container: HTMLDivElement | JQueryWrappedDiv, initData: InitData) {
  if ('jquery' in container) container = container[0];
  const languageCode = document.body.parentElement!.lang;
  const root = ReactDOM.createRoot(container!);
  root.render(
    <IntlProvider messages={(messages as any)[languageCode]} locale={languageCode} defaultLocale="en">
      <StudentView
        runtime={new BoundRuntime(runtime, container)}
        initData={initData}
      />
    </IntlProvider>
  );
}

(globalThis as any).initDrawingXBlockStudentView = initStudentView;