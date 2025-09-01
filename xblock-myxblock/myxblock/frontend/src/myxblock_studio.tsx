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
  options: string[];
  correct: number;
}

interface Props {
  runtime: BoundRuntime;
  question: string;
  options: string[];
  correct: number;
}

const StudioView: React.FC<Props> = ({ runtime, question, options, correct }) => {
  const [q, setQ] = React.useState(question);
  const [opts, setOpts] = React.useState(options);
  const [corr, setCorr] = React.useState(correct);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const handleOptionChange = (idx: number, value: string) => {
    const newOpts = [...opts];
    newOpts[idx] = value;
    setOpts(newOpts);
  };

  const addOption = () => setOpts([...opts, ""]);
  const removeOption = (idx: number) => setOpts(opts.filter((_, i) => i !== idx));

  const removeOptionSafe = (idx: number) => {
    // Prevent removing options when there would be fewer than 2
    if (opts.length <= 2) return;
    const newOpts = opts.filter((_, i) => i !== idx);
    // Adjust correct index if needed
    let newCorr = corr;
    if (idx === corr) {
      newCorr = 0; // reset to first option
    } else if (idx < corr) {
      newCorr = corr - 1;
    }
    setOpts(newOpts);
    setCorr(newCorr);
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!q || q.trim().length === 0) errs.push('Question is required.');
    const trimmed = opts.map(o => (o ?? '').trim());
    if (trimmed.length < 2) errs.push('At least two options are required.');
    trimmed.forEach((o, i) => { if (!o) errs.push(`Option ${i + 1} must not be empty.`); });
    if (typeof corr !== 'number' || corr < 0 || corr >= opts.length) errs.push('A valid correct answer must be selected.');
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
        options: opts,
        correct: corr,
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="myxblock-studio">
      <h2>Edit Quiz</h2>
      <div>
        <label>Question:</label>
        <input type="text" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div>
        <label>Options:</label>
        {opts.map((opt, idx) => (
          <div key={idx}>
            <input
              type="text"
              value={opt}
              onChange={e => handleOptionChange(idx, e.target.value)}
            />
            <input
              type="radio"
              name="correct"
              checked={corr === idx}
              onChange={() => setCorr(idx)}
            /> Correct
            <button type="button" onClick={() => removeOptionSafe(idx)} disabled={opts.length <= 2}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addOption}>Add Option</button>
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
        question={initData.question}
        options={initData.options}
        correct={initData.correct}
      />
    </IntlProvider>
  );
}

(globalThis as any).initMyXBlockStudioView = initStudioView;
