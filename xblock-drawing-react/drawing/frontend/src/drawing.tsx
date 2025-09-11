////////////////////////////////////////////////////////////////////////////////
// Remember: changes in this file will only take effect when you run          //
// npm run build       or      npm run watch                                  //
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Remember: changes in this file will only take effect when you run          //
// npm run build       or      npm run watch                                  //
////////////////////////////////////////////////////////////////////////////////

import React from 'react';
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
  nextButtonClicked?: boolean;
  bgnumber?: number; // New prop for selecting the background
}

interface Props {
  runtime: BoundRuntime;
  question: string;
  options: string[];
  correct: number;
  user_answer?: number;
  attempts?: number;
  remaining_attempts?: number;
}

const StudentView: React.FC<{ runtime: BoundRuntime; initData: InitData }> = ({ runtime, initData }) => {
  // Render the DrawingApp using initData from the XBlock
  const index = initData.index ?? 0
  const AssessName = initData.AssessName ?? initData.question ?? 'quiz1'
  const canvasWidth = initData.canvasWidth ?? 400
  const canvasHeight = initData.canvasHeight ?? 300
  const nextButtonClicked = initData.nextButtonClicked ?? false
  const bgnumber = initData.bgnumber ?? 1 // New prop for selecting the background
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '80%' }}>
      <div className="block-info" style={{ flex: 1, marginRight: '24px', minWidth: '200px' }}>
        <p>{initData.question}</p>
      </div>
      <div className="drawing-container" style={{ flex: 2, minWidth: '400px' }}>
        <DrawingApp
          index={index}
          AssessName={AssessName}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          nextButtonClicked={nextButtonClicked}
          modes={modes}
          bgnumber={bgnumber} // Pass the bgnumber prop to DrawingApp
        />
      </div>
    </div>
  )
}

function initStudentView(runtime: XBlockRuntime, container: HTMLDivElement | JQueryWrappedDiv, initData: InitData) {
  if ('jquery' in container) container = container[0];
  const languageCode = document.body.parentElement!.lang;
  const root = ReactDOM.createRoot(container!);
  // Debug: confirm init was called and container is correct
  // eslint-disable-next-line no-console
  console.log('initDrawingXBlockStudentView called. container=', container, 'initData=', initData);
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
