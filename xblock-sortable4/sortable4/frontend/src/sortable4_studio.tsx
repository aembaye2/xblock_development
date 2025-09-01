////////////////////////////////////////////////////////////////////////////////
// Remember: changes in this file will only take effect when you run          //
// npm run build       or      npm run watch_studio                           //
////////////////////////////////////////////////////////////////////////////////
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BoundRuntime, type JQueryWrappedDiv, type XBlockRuntime } from './xblock-utils';

interface StudioProps {
  runtime: BoundRuntime;
  element: HTMLDivElement;
}

const StudioView: React.FC<StudioProps> = ({ runtime, element }) => {
  const displayName = (element.querySelector('.display-name') as HTMLInputElement | null)?.value ?? '';
  const questionText = (element.querySelector('.question-text') as HTMLTextAreaElement | null)?.value ?? '';
  const items = Array.from(element.querySelectorAll('.items-list-edit .item .item-text')).map(n => n.textContent?.trim() ?? '');

  const [q, setQ] = React.useState<string>(questionText);
  const [opts, setOpts] = React.useState<string[]>(items);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const addItem = () => setOpts(prev => [...prev, 'New item']);
  const removeItem = (idx: number) => setOpts(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, value: string) => setOpts(prev => { const copy = [...prev]; copy[idx] = value; return copy; });

  const validate = () => {
    const errs: string[] = [];
    if (!q.trim()) errs.push('Question text required');
    if (opts.length < 2) errs.push('At least two items required');
    return errs;
  };

  const save = async () => {
    const v = validate();
    setErrors(v);
    if (v.length) return;
    setIsSaving(true);
    try {
      const data = {
        display_name: displayName,
        max_attempts: (element.querySelector('.max-attempts') as HTMLInputElement | null)?.value ?? '1',
        has_score: +((element.querySelector('.has-score') as HTMLSelectElement | null)?.value ?? '1'),
        weight: (element.querySelector('.weight') as HTMLInputElement | null)?.value ?? '1',
        question_text: q,
        item_background_color: (element.querySelector('.item-background-color') as HTMLInputElement | null)?.value ?? '#fff',
        item_text_color: (element.querySelector('.item-text-color') as HTMLInputElement | null)?.value ?? '#000',
        data: opts,
      };
      await runtime.studioSaveAndClose(runtime.postHandler('studio_submit', data));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="sortable4-studio-react">
      <h3>Editing sortable4</h3>
      <div>
        <label>Question:</label>
        <textarea value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div>
        <label>Items:</label>
        {opts.map((it, idx) => (
          <div key={idx}>
            <input value={it} onChange={e => updateItem(idx, e.target.value)} />
            <button onClick={() => removeItem(idx)} disabled={opts.length <= 2}>Remove</button>
          </div>
        ))}
        <button onClick={addItem}>Add Item</button>
      </div>
      {errors.length > 0 && (
        <div className="studio-errors">{errors.map((e, i) => <div key={i}>{e}</div>)}</div>
      )}
      <div>
        <button onClick={save} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
        <button onClick={() => runtime.runtime.notify('cancel', {})}>Cancel</button>
      </div>
    </div>
  );
};

function sortable4XBlockEdit(runtime: XBlockRuntime, container: HTMLDivElement | JQueryWrappedDiv, initData: any) {
  if ('jquery' in container) container = container[0];
  const root = ReactDOM.createRoot(container as HTMLDivElement);
  const bound = new BoundRuntime(runtime, container as HTMLDivElement);
  root.render(React.createElement(StudioView, { runtime: bound, element: container as HTMLDivElement }));
}

(globalThis as any).sortable4XBlockEdit = sortable4XBlockEdit;
