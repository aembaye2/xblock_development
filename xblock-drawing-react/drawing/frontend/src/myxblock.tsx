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
// Use the drawing canvas package
import { DrawingApp, modes } from 'ae-drawable-canvas';


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
  const canvasWidth = initData.canvasWidth ?? 500
  const canvasHeight = initData.canvasHeight ?? 400
  const nextButtonClicked = initData.nextButtonClicked ?? false

  return (
    <>
    <div className="block-info">
        <p>{initData.question}</p>
    </div>
      <div className="drawing-container">
        <DrawingApp
          index={index}
          AssessName={AssessName}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          nextButtonClicked={nextButtonClicked}
          modes={modes}
        />
      </div>
    </>
  )
}

function initStudentView(runtime: XBlockRuntime, container: HTMLDivElement | JQueryWrappedDiv, initData: InitData) {
  if ('jquery' in container) container = container[0];
  const languageCode = document.body.parentElement!.lang;
  const root = ReactDOM.createRoot(container!);
  // Debug: confirm init was called and container is correct
  // eslint-disable-next-line no-console
  console.log('initMyXBlockStudentView called. container=', container, 'initData=', initData);
  root.render(
    <IntlProvider messages={(messages as any)[languageCode]} locale={languageCode} defaultLocale="en">
      <StudentView
        runtime={new BoundRuntime(runtime, container)}
        initData={initData}
      />
    </IntlProvider>
  );
}

(globalThis as any).initMyXBlockStudentView = initStudentView;
