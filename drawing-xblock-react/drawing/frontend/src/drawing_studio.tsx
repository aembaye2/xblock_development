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

const StudioView: React.FC<Props> = ({ 
  runtime, 
  question, 
  max_attempts, 
  weight, 
  has_score, 
  index, 
  AssessName, 
  canvasWidth, 
  canvasHeight, 
  scaleFactors, 
  bgnumber, 
  visibleModes, 
  axisLabels, 
  hideLabels, 
  initialDrawing 
}) => {
  // Helper to coerce possibly-undefined props to numbers
  function propsToNumber(val: any, fallback: number) {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  }

  const [q, setQ] = React.useState<string>(question || '');
  const [idx, setIdx] = React.useState<number>(index ?? 0);
  const [assessName, setAssessName] = React.useState<string>(AssessName ?? '');
  const [cw, setCw] = React.useState<number>(propsToNumber(canvasWidth, 500));
  const [ch, setCh] = React.useState<number>(propsToNumber(canvasHeight, 400));
  const [scale, setScale] = React.useState<number[]>(scaleFactors ?? [10,20,75,84,25,35]);
  const [bgNumber, setBgNumber] = React.useState<number>(propsToNumber(bgnumber, 0));
  const [modes, setModes] = React.useState<string[]>(visibleModes ?? []);
  const [axes, setAxes] = React.useState<string[]>(axisLabels ?? []);
  const [hideLbls, setHideLbls] = React.useState<boolean>(hideLabels ?? false);
  const [initialDrawStr, setInitialDrawStr] = React.useState<string>(
    JSON.stringify(initialDrawing ?? {}, null, 2)
  );
  const [initialDraw, setInitialDraw] = React.useState<any>(initialDrawing ?? {});
  const [maxAttempts, setMaxAttempts] = React.useState<number>(propsToNumber(max_attempts, 3));
  const [w, setW] = React.useState<number>(propsToNumber(weight, 1));
  const [hasScore, setHasScore] = React.useState<boolean>(has_score ?? true);

  const [isSaving, setIsSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

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

  const handleInitialDrawChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInitialDrawStr(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      setInitialDraw(parsed);
      // Clear JSON error if it exists
      setErrors(prev => prev.filter(err => !err.includes('Initial Drawing')));
    } catch (err) {
      // Add JSON parse error
      setErrors(prev => {
        const filtered = prev.filter(err => !err.includes('Initial Drawing'));
        return [...filtered, 'Initial Drawing must be valid JSON'];
      });
    }
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!q || q.trim().length === 0) errs.push('Question is required.');
    if (!Number.isFinite(cw) || cw <= 0) errs.push('Canvas width must be a positive number.');
    if (!Number.isFinite(ch) || ch <= 0) errs.push('Canvas height must be a positive number.');
    
    // Final validation of JSON
    try {
      JSON.parse(initialDrawStr);
    } catch {
      if (!errs.some(e => e.includes('Initial Drawing'))) {
        errs.push('Initial Drawing must be valid JSON');
      }
    }
    
    return errs;
  };

  const save = async () => {
  console.log('Save button clicked');
  const validation = validate();
  setErrors(validation);
  if (validation.length > 0) {
    console.log('Validation errors:', validation);
    return;
  }

  setIsSaving(true);
  
  try {
    const payload = {
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
    };
    console.log('Saving payload:', payload);
    
    // ✅ CORRECT: Pass the Promise itself, not the awaited result
    await runtime.studioSaveAndClose(
      runtime.postHandler('save_quiz', payload)
    );
    
    console.log('Save successful');
  } catch (error) {
    console.error('Save failed:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    setErrors([`Failed to save: ${errorMsg}`]);
  } finally {
    setIsSaving(false);
  }
};

  const cancel = () => {
    runtime.notify('cancel', {});
  };

  return (
    <div className="myxblock-studio" style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        paddingTop: '6px',
        paddingBottom: '6px',
        zIndex: 2
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Edit Drawing XBlock</h2>

        {/* Top toolbar: Save / Cancel visible without scrolling (near modal close button) */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={save}
            disabled={isSaving}
            style={{
              padding: '8px 16px',
              backgroundColor: isSaving ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>

          <button
            onClick={cancel}
            disabled={isSaving}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Question:
        </label>
        <input 
          type="text" 
          value={q} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Assessment Name:
        </label>
        <input 
          type="text" 
          value={assessName} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssessName(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Index:
        </label>
        <input 
          type="number" 
          value={idx} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdx(Number(e.target.value))}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Canvas Width (px):
          </label>
          <input 
            type="number" 
            value={cw} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCw(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Canvas Height (px):
          </label>
          <input 
            type="number" 
            value={ch} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCh(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Scale Factors (comma-separated numbers):
        </label>
        <input 
          type="text" 
          value={scale.join(', ')} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScaleFromString(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <small style={{ color: '#666', fontSize: '12px' }}>
          Format: xlim, ylim, bottom_margin, left_margin, top_margin, right_margin
        </small>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Background Number:
        </label>
        <input 
          type="number" 
          value={bgNumber} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBgNumber(Number(e.target.value))}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Visible Modes (comma-separated):
        </label>
        <input 
          type="text" 
          value={modes.join(', ')} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModesFromString(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <small style={{ color: '#666', fontSize: '12px' }}>
          Available: point, line, singlearrowhead, doublearrowhead, polygon, rect, circle, freedraw, coordinate, curve, curve4pts, text, transform, color, strokeWidth, download
        </small>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Axis Labels (comma-separated):
        </label>
        <input 
          type="text" 
          value={axes.join(', ')} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAxesFromString(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <small style={{ color: '#666', fontSize: '12px' }}>
          Format: X-axis label, Y-axis label
        </small>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={hideLbls} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHideLbls(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          <span style={{ fontWeight: 'bold' }}>Hide Axis Labels</span>
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Initial Drawing (JSON):
        </label>
        <textarea 
          value={initialDrawStr} 
          onChange={handleInitialDrawChange}
          rows={8}
          style={{ 
            width: '100%', 
            padding: '8px', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '13px'
          }}
        />
        <small style={{ color: '#666', fontSize: '12px' }}>
          Enter valid JSON for initial canvas objects (Fabric.js format)
        </small>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Max Attempts:
          </label>
          <input 
            type="number" 
            value={maxAttempts} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxAttempts(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Weight (points):
          </label>
          <input 
            type="number" 
            value={w} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setW(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', height: '100%', paddingTop: '30px' }}>
            <input 
              type="checkbox" 
              checked={hasScore} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHasScore(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontWeight: 'bold' }}>Graded</span>
          </label>
        </div>
      </div>

      {errors.length > 0 && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '12px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '4px' 
        }}>
          {errors.map((err, i) => (
            <div key={i} style={{ color: '#721c24', marginBottom: errors.length > 1 && i < errors.length - 1 ? '8px' : '0' }}>
              • {err}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
        <button 
          onClick={save} 
          disabled={isSaving}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: isSaving ? '#6c757d' : '#007bff', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button 
          onClick={cancel}
          disabled={isSaving}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          Cancel
        </button>
      </div>
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