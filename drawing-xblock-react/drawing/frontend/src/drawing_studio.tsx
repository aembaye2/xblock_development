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
  // Common fields
  question: string;
  max_attempts?: number;
  weight?: number;
  has_score?: boolean;

  // Drawing-specific fields
  index?: number;
  AssessName?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  scaleFactors?: number[];
  bgnumber?: number;
  visibleModes?: string[];
  axisLabels?: string[];
  hideLabels?: boolean;
  initialDrawing?: any;
}

type Props = InitData & { runtime: BoundRuntime };

const StudioView: React.FC<Props> = ({ runtime, question, max_attempts, weight, has_score, index, AssessName, canvasWidth, canvasHeight, scaleFactors, bgnumber, visibleModes, axisLabels, hideLabels, initialDrawing }) => {
  const [q, setQ] = React.useState<string>(question);
  const [idx, setIdx] = React.useState<number>(index ?? 0);
  const [assessName, setAssessName] = React.useState<string>(AssessName ?? '');
  const [cw, setCw] = React.useState<number>(propsToNumber((runtime as any).initData?.canvasWidth ?? canvasWidth, 500));
  const [ch, setCh] = React.useState<number>(propsToNumber((runtime as any).initData?.canvasHeight ?? canvasHeight, 400));
  const [scale, setScale] = React.useState<number[]>((runtime as any).initData?.scaleFactors ?? scaleFactors ?? [10,20,75,84,25,35]);
  const [bgNumber, setBgNumber] = React.useState<number>(propsToNumber((runtime as any).initData?.bgnumber ?? bgnumber, 0));
  const [modes, setModes] = React.useState<string[]>((runtime as any).initData?.visibleModes ?? visibleModes ?? []);
  const [axes, setAxes] = React.useState<string[]>((runtime as any).initData?.axisLabels ?? axisLabels ?? []);
  const [hideLbls, setHideLbls] = React.useState<boolean>((runtime as any).initData?.hideLabels ?? hideLabels ?? false);
  const [initialDraw, setInitialDraw] = React.useState<any>((runtime as any).initData?.initialDrawing ?? initialDrawing ?? {});
  const [maxAttempts, setMaxAttempts] = React.useState<number>(propsToNumber((runtime as any).initData?.max_attempts ?? max_attempts, 3));
  const [w, setW] = React.useState<number>(propsToNumber((runtime as any).initData?.weight ?? weight, 1));
  const [hasScore, setHasScore] = React.useState<boolean>((runtime as any).initData?.has_score ?? has_score ?? true);

  // small helper to coerce possibly-undefined props to numbers
  function propsToNumber(val: any, fallback: number) {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  }
  const [isSaving, setIsSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const handleOptionChange = (idx: number, value: string) => {
    // placeholder removed: this studio view no longer supports MCQ options
  };

  // Helpers for editing drawing-specific arrays (scaleFactors, visibleModes, axisLabels)
  const setScaleFromString = (val: string) => {
    const parts = val.split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n));
    if (parts.length > 0) setScale(parts);
  };
  const setModesFromString = (val: string) => {
    const parts = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
    setModes(parts);
  };
  const setAxesFromString = (val: string) => {
    const parts = val.split(',').map(s => s.trim());
    setAxes(parts);
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!q || q.trim().length === 0) errs.push('Question is required.');
    if (!Number.isFinite(cw) || cw <= 0) errs.push('Canvas width must be a positive number.');
    if (!Number.isFinite(ch) || ch <= 0) errs.push('Canvas height must be a positive number.');
    return errs;
  };

  const save = async () => {
    const validation = validate();
    setErrors(validation);
    if (validation.length > 0) return;

    setIsSaving(true);
    try {
      // Use the BoundRuntime helper to show Studio saving UI and close modal on success
      await runtime.studioSaveAndClose(runtime.postHandler('save_quiz', {
        question: q,
        max_attempts: maxAttempts,
        weight: w,
        has_score: hasScore,
        index: idx,
        AssessName: assessName,
        canvasWidth: cw,
        canvasHeight: ch,
        scaleFactors: scale,
        bgnumber: bgNumber,
        visibleModes: modes,
        axisLabels: axes,
        hideLabels: hideLbls,
        initialDrawing: initialDraw,
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="myxblock-studio">
      <h2>Edit Drawing</h2>
      <div>
        <label>Question:</label>
        <input type="text" value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} />
      </div>
      <div>
        <label>Assessment Name:</label>
        <input type="text" value={assessName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssessName(e.target.value)} />
      </div>
      <div>
        <label>Index:</label>
        <input type="number" value={idx} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdx(Number(e.target.value))} />
      </div>
      <div>
        <label>Canvas Width (px):</label>
        <input type="number" value={cw} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCw(Number(e.target.value))} />
      </div>
      <div>
        <label>Canvas Height (px):</label>
        <input type="number" value={ch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCh(Number(e.target.value))} />
      </div>
      <div>
        <label>Scale Factors (comma-separated numbers):</label>
        <input type="text" value={scale.join(', ')} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScaleFromString(e.target.value)} />
      </div>
      <div>
        <label>Background Number:</label>
        <input type="number" value={bgNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBgNumber(Number(e.target.value))} />
      </div>
      <div>
        <label>Visible Modes (comma-separated):</label>
        <input type="text" value={modes.join(', ')} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModesFromString(e.target.value)} />
      </div>
      <div>
        <label>Axis Labels (comma-separated):</label>
        <input type="text" value={axes.join(', ')} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAxesFromString(e.target.value)} />
      </div>
      <div>
        <label>Hide Axis Labels:</label>
        <input type="checkbox" checked={hideLbls} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHideLbls(e.target.checked)} />
      </div>
      <div>
        <label>Initial Drawing (JSON):</label>
        <textarea value={JSON.stringify(initialDraw)} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { try { setInitialDraw(JSON.parse(e.target.value)); } catch { /* ignore parse errors until save */ } }} rows={6} />
      </div>
      <div>
        <label>Max attempts:</label>
        <input type="number" value={maxAttempts} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxAttempts(Number(e.target.value))} />
      </div>
      <div>
        <label>Weight (points):</label>
        <input type="number" value={w} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setW(Number(e.target.value))} />
      </div>
      <div>
        <label>Graded:</label>
        <input type="checkbox" checked={hasScore} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHasScore(e.target.checked)} />
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
        {...(initData as any)}
      />
    </IntlProvider>
  );
}

(globalThis as any).initDrawingXBlockStudioView = initStudioView;

