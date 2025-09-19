////////////////////////////////////////////////////////////////////////////////
// Remember: changes in this file will only take effect when you run          //
// npm run build       or      npm run watch                                  //
////////////////////////////////////////////////////////////////////////////////
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
  const index = initData.index ?? 1
  const AssessName = initData.AssessName ?? initData.question ?? 'quiz1'
  const canvasWidth = initData.canvasWidth ?? 400
  const canvasHeight = initData.canvasHeight ?? 300
  // local UI state to trigger saving the canvas JSON to localStorage
  const [nextButtonClicked, setNextButtonClicked] = useState<boolean>(initData.nextButtonClicked ?? false)
  const [savedJson, setSavedJson] = useState<any>(null)
  const bgnumber = initData.bgnumber ?? 1 // New prop for selecting the background
  
  // Render the save button and its behavior
  const renderSaveButton = () => {
    return (
      <div style={{ marginTop: '8px' }}>
        <button
          type="button"
          onClick={() => {
            // Toggle nextButtonClicked to trigger the save effect in DrawableCanvas
            setNextButtonClicked(true)
            // small timeout to allow DrawableCanvas to react and save to localStorage
            setTimeout(() => {
              const key = `${AssessName}-canvasDrawing-${index}`
              const raw = localStorage.getItem(key)
              if (raw) {
                try {
                  const parsed = JSON.parse(raw)
                  setSavedJson(parsed)
                } catch (e) {
                  setSavedJson(raw)
                }
              } else {
                setSavedJson(null)
              }
              // reset the trigger
              setNextButtonClicked(false)
            }, 200)
          }}
        >
          Save canvas to localStorage and show JSON
        </button>
      </div>
    )
  }

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
            nextButtonClicked={nextButtonClicked}
            modes={modes}
            bgnumber={bgnumber} 
          />
        </div>
      </div>
      {renderSaveButton()}
      <div className="block-info2" style={{marginTop: '24px', minWidth: '300px', width: '100%' }}>
        <h4>Saved canvas JSON (DataFrame view)</h4>
        <div style={{ overflowX: 'auto' }}>
          <DataFrameView data={savedJson} />
        </div>
      </div>
    </div>
  )
}

// Render JSON as a horizontal dataframe/table
const DataFrameView: React.FC<{ data: any }> = ({ data }) => {
  if (!data) {
    return <div>No saved canvas JSON yet. Click the button to trigger saving.</div>
  }

  // If fabric canvas JSON, look for objects array
  let rows: any[] = []
  if (Array.isArray(data)) {
    rows = data
  } else if (data && Array.isArray(data.objects)) {
    rows = data.objects
  } else if (typeof data === 'object') {
    // Single object -> show its keys as columns (one row)
    rows = [data]
  } else {
    // Fallback: display primitive value
    return <pre>{String(data)}</pre>
  }

  // Collect all column keys across rows
  const columnsSet = new Set<string>()
  rows.forEach((r) => {
    if (r && typeof r === 'object') {
      Object.keys(r).forEach((k) => columnsSet.add(k))
    }
  })
  const columns = Array.from(columnsSet)

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col} style={{ border: '1px solid #ddd', padding: '6px', background: '#f0f0f0', textAlign: 'left' }}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => {
              const val = row ? row[col] : undefined
              let display = ''
              if (val === undefined) display = ''
              else if (typeof val === 'object') display = JSON.stringify(val)
              else display = String(val)
              return (
                <td key={col} style={{ border: '1px solid #eee', padding: '6px', verticalAlign: 'top' }}>{display}</td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
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
