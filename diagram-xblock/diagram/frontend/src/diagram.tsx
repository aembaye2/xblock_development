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
import DrawingBoard from "./components/DrawingBoard";

const messages = {
  fa: faMessages,
  fr: frMessages,
};

interface InitData {
  question: string;
  attempts?: number;
  remaining_attempts?: number;
  // diagram app props
  index?: number;
  AssessName?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  scaleFactors?: number[];
  submitButtonClicked?: boolean;
  bgnumber?: number;
  // Can be an object (Fabric canvas data) or a URL string pointing to a .json file
  initialDiagram?: object | string;
  visibleModes?: string[];
  axisLabels?: [string, string];
  hideLabels?: boolean;
}

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
  const initialDiagramFromInit = initData.initialDiagram ?? {};
  const [initialDiagram, setInitialDiagram] = useState<any>(
    typeof initialDiagramFromInit === 'string' ? initialDiagramFromInit : initialDiagramFromInit
  );


  const renderSubmitButton = () => (
    <div style={{ marginTop: '8px' }}>
      <button
        type="button"
        onClick={async () => {
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

        <div className="diagram-container" style={{ flex: 2, minWidth: '400px' }}>
           <DrawingBoard 
          tools={["point", "segment", "triangle","circle", "arrow", "curve"]}
          buttons={["undo", "redo", "clear", "downloadPNG", "downloadJSON" ]}
        />
        </div>
      </div>

      {renderSubmitButton()}

      <div className="block-info2" style={{ marginTop: '24px', minWidth: '300px', width: '100%' }}>
        <h4>Diagram Summary</h4>
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

(globalThis as any).initDiagramXBlockStudentView = initStudentView;