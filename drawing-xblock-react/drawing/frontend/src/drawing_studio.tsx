////////////////////////////////////////////////////////////////////////////////
// Remember: changes in this file will only take effect when you run          //
// npm run build       or      npm run watch_studio                           //
////////////////////////////////////////////////////////////////////////////////
import React from 'react';
import ReactDOM from 'react-dom/client';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { BoundRuntime, type JQueryWrappedDiv, type XBlockRuntime } from './xblock-utils';
import faMessages from '../lang/compiled/fa.json';
import frMessages from '../lang/compiled/fr.json';

const messages = {
  fa: faMessages,
  fr: frMessages,
};

interface InitData {
  question: string;
  max_attempts?: number;
  weight?: number;
  has_score?: boolean;
  index?: number;
  AssessName?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  scaleFactors?: number[];
  bgnumber?: number;
  visibleModes?: string[];
  axisLabels?: [string, string];
  hideLabels?: boolean;
  initialDrawing?: any;
}

interface Props {
  runtime: BoundRuntime;
  question: string;
  max_attempts?: number;
  weight?: number;
  has_score?: boolean;
  index?: number;
  AssessName?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  scaleFactors?: number[];
  bgnumber?: number;
  visibleModes?: string[];
  axisLabels?: [string, string];
  hideLabels?: boolean;
  initialDrawing?: any;
}

const StudioView: React.FC<Props> = (props) => {
  const { runtime } = props;
  const [q, setQ] = React.useState(props.question);
  const [maxAttempts, setMaxAttempts] = React.useState<number>(propsToNumber(props.max_attempts, 1));
  const [weight, setWeight] = React.useState<number>(propsToNumber(props.weight, 1));
  const [hasScore, setHasScore] = React.useState<boolean>(props.has_score ?? true);
  // Drawing fields
  const [index, setIndex] = React.useState<number>(propsToNumber(props.index, 0));
  const [AssessName, setAssessName] = React.useState<string>(props.AssessName ?? 'quiz1');
  const [canvasWidth, setCanvasWidth] = React.useState<number>(propsToNumber(props.canvasWidth, 500));
  const [canvasHeight, setCanvasHeight] = React.useState<number>(propsToNumber(props.canvasHeight, 400));
  const [scaleFactors, setScaleFactors] = React.useState<number[]>(props.scaleFactors ?? [10, 20, 75, 84, 25, 35]);
  const [bgnumber, setBgnumber] = React.useState<number>(propsToNumber(props.bgnumber, 0));
  const [visibleModes, setVisibleModes] = React.useState<string[]>(props.visibleModes ?? ["line", "point", "curve4pts", "text", "color", "download"]);
  const [axisLabels, setAxisLabels] = React.useState<[string, string]>(props.axisLabels ?? ["Quantity, Q", "Price, P"]);
  const [hideLabels, setHideLabels] = React.useState<boolean>(props.hideLabels ?? false);
  const [initialDrawing, setInitialDrawing] = React.useState<any>(props.initialDrawing ?? {});

  function propsToNumber(val: any, fallback: number) {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  }
  const [isSaving, setIsSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!q || q.trim().length === 0) errs.push('Question is required.');
    return errs;
  };

  const save = async () => {
    const validation = validate();
    setErrors(validation);
    if (validation.length > 0) return;

    setIsSaving(true);
    try {
      await runtime.studioSaveAndClose(runtime.postHandler('save_quiz', {
        question: q,
        max_attempts: maxAttempts,
        weight: weight,
        has_score: hasScore,
        index,
        AssessName,
        canvasWidth,
        canvasHeight,
        scaleFactors,
        bgnumber,
        visibleModes,
        axisLabels,
        hideLabels,
        initialDrawing,
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="myxblock-studio">
      <h2>Edit Drawing Block</h2>
      <div>
        <label>Question:</label>
        <input type="text" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div>
        <label>Max attempts:</label>
        <input type="number" value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} />
      </div>
      <div>
        <label>Weight (points):</label>
        <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} />
      </div>
      <div>
        <label>Graded:</label>
        <input type="checkbox" checked={hasScore} onChange={e => setHasScore(e.target.checked)} />
      </div>
      <hr />
      <h3>Drawing Settings</h3>
      <div>
        <label>Drawing Index:</label>
        <input type="number" value={index} onChange={e => setIndex(Number(e.target.value))} />
      </div>
      <div>
        <label>Assessment Name:</label>
        <input type="text" value={AssessName} onChange={e => setAssessName(e.target.value)} />
      </div>
      <div>
        <label>Canvas Width:</label>
        <input type="number" value={canvasWidth} onChange={e => setCanvasWidth(Number(e.target.value))} />
      </div>
      <div>
        <label>Canvas Height:</label>
        <input type="number" value={canvasHeight} onChange={e => setCanvasHeight(Number(e.target.value))} />
      </div>
      <div>
        <label>Scale Factors (comma separated):</label>
        <input
          type="text"
          value={scaleFactors.join(",")}
          onChange={e => setScaleFactors(e.target.value.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n)))}
        />
      </div>
      <div>
        <label>Background Number:</label>
        <input type="number" value={bgnumber} onChange={e => setBgnumber(Number(e.target.value))} />
      </div>
      <div>
        <label>Visible Modes (comma separated):</label>
        <input
          type="text"
          value={visibleModes.join(",")}
          onChange={e => setVisibleModes(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
        />
      </div>
      <div>
        <label>Axis Labels (comma separated):</label>
        <input
          type="text"
          value={axisLabels.join(",")}
          onChange={e => {
            const arr = e.target.value.split(",").map(s => s.trim());
            setAxisLabels([arr[0] || "", arr[1] || ""] as [string, string]);
          }}
        />
      </div>
      <div>
        <label>Hide Axis Labels:</label>
        <input type="checkbox" checked={hideLabels} onChange={e => setHideLabels(e.target.checked)} />
      </div>
      <div>
        <label>Initial Drawing (JSON):</label>
        <textarea
          value={JSON.stringify(initialDrawing, null, 2)}
          onChange={e => {
            try {
              setInitialDrawing(JSON.parse(e.target.value));
            } catch {
              // ignore parse errors for now
            }
          }}
          rows={6}
          style={{ width: '100%' }}
        />
      </div>
      {errors.length > 0 && (
        <div className="studio-errors">
          {errors.map((err, i) => <div key={i} className="text-danger">{err}</div>)}
        </div>
      )}
      <button className="btn btn-primary" onClick={save} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
    </div>
  );
};

function initStudioView(runtime: XBlockRuntime, container: HTMLDivElement | JQueryWrappedDiv, initData: InitData) {
  if ('jquery' in container) container = container[0];
  const languageCode = document.body.parentElement!.lang;
  const root = ReactDOM.createRoot(container!);
  root.render(
    <IntlProvider messages={(messages as any)[languageCode]} locale={languageCode} defaultLocale="en">
      <StudioView
        runtime={new BoundRuntime(runtime, container)}
        {...initData}
      />
    </IntlProvider>
  );
}

(globalThis as any).initDrawingXBlockStudioView = initStudioView;
