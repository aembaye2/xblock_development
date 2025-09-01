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
import { BoundRuntime, type JQueryWrappedDiv, type XBlockRuntime } from './xblock-utils';

/**
 * Student-side React component that reproduces the original 'sortable4' UI.
 * It reads initial values from the server-rendered DOM (so `sortable4.py` can remain unchanged),
 * then mounts the React UI into the same element and wires submit handler to the XBlock runtime.
 */
interface StudentProps {
  runtime: BoundRuntime;
  element: HTMLDivElement;
}

const StudentView: React.FC<StudentProps> = ({ runtime, element }) => {
  const header = element.querySelector('.problem-header')?.textContent ?? '';
  const question = element.querySelector('.problem-statement')?.textContent ?? '';
  const attemptsText = element.querySelector('.action .submission-feedback .attempts')?.textContent ?? '0';
  const attempts = Number(attemptsText) || 0;
  const maxAttemptsNode = element.querySelector('.action .submission-feedback');

  const initialItems: string[] = Array.from(element.querySelectorAll('.items-list .item')).map((li) => li.textContent?.trim() ?? '');
  const [items, setItems] = React.useState<string[]>(initialItems);
  const [attemptsState, setAttemptsState] = React.useState<number>(attempts);
  const [disabled, setDisabled] = React.useState<boolean>(() => {
    const btn = element.querySelector('#submit-answer') as HTMLButtonElement | null;
    return !!(btn && btn.hasAttribute('disabled'));
  });
  const [notification, setNotification] = React.useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Drag and drop reordering (HTML5)
  const dragIndex = React.useRef<number | null>(null);

  const onDragStart = (e: React.DragEvent, idx: number) => {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from == null) return;
    if (from === idx) return;
    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(idx, 0, moved);
    setItems(next);
    dragIndex.current = null;
  };

  const submit = async () => {
    if (disabled) return;
    const resp = await runtime.postHandler('submit_answer', items);
    setAttemptsState(resp.attempts ?? attemptsState + 1);
    setNotification({ type: resp.correct ? 'success' : 'error', message: resp.message ?? '' });
    if (resp.correct) {
      setDisabled(true);
    }
    if (resp.remaining_attempts === 0) setDisabled(true);
    // reflect server state in original DOM (keeps progressive enhancement tidy)
    const attemptsNode = element.querySelector('.action .submission-feedback .attempts');
    if (attemptsNode) attemptsNode.textContent = String(resp.attempts ?? attemptsState);
  };

  return (
    <div className="sortable4-react">
      <h3 className="problem-header">{header}</h3>
      <div className="problem-progress">
        <span className="grade">{attemptsState}</span>
      </div>
      <div className="problem">
        <p className="problem-statement">{question}</p>
        <ul className="items-list" role="list">
          {items.map((it, idx) => (
            <li
              className="item"
              key={idx}
              draggable={!disabled}
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, idx)}
              style={{ background: undefined }}
            >
              {it}
            </li>
          ))}
        </ul>
        <div className={`indicator-container error ${notification?.type === 'error' ? '' : 'is-hidden'}`}>
          <span className="icon fa fa-close" aria-hidden="true"></span>
        </div>
        <div className={`indicator-container success ${notification?.type === 'success' ? '' : 'is-hidden'}`}>
          <span className="icon fa fa-check" aria-hidden="true"></span>
        </div>
      </div>
      <br />
      <div className="action">
        <button id="submit-answer" className="submit btn-brand" onClick={submit} disabled={disabled}>{'Submit'}</button>
        <div className="submission-feedback">
          <div className="message">{notification?.message}</div>
          You have used <span className="attempts">{attemptsState}</span> of unknown attempts
        </div>
      </div>
      {notification && (
        <div className={`notification notification-submit ${notification.type}`} tabIndex={-1}>
          <span className="icon fa" aria-hidden="true"></span>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}
    </div>
  );
};

// Export a global function that the current Python XBlock expects: sortable4XBlock(runtime, element)
function Sortable4XBlock(runtime: any, element: HTMLElement | JQueryWrappedDiv) {
  if ((element as any).jquery) element = (element as any)[0];
  const root = ReactDOM.createRoot(element as HTMLDivElement);
  const bound = new BoundRuntime(runtime, element as HTMLDivElement);
  root.render(React.createElement(StudentView, { runtime: bound, element: element as HTMLDivElement }));
}

(globalThis as any).Sortable4XBlock = Sortable4XBlock;
