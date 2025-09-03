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
  user_answer?: number;
  attempts?: number;
  remaining_attempts?: number;
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

const StudentView: React.FC<Props> = ({ runtime, question, options, correct, user_answer, attempts: initAttempts, remaining_attempts: initRemaining }: Props) => {
  const [selected, setSelected] = React.useState<number | undefined>(user_answer);
  // Treat missing key as not-submitted. Compute isCorrect from any existing user_answer.
  const [isCorrect, setIsCorrect] = React.useState<boolean>(typeof user_answer === 'number' ? user_answer === correct : false);
  // Don't use a single submitted flag — allow multiple attempts until remainingAttempts reaches 0 or correct answer given
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [attempts, setAttempts] = React.useState<number>(initAttempts ?? 0);
  const [remainingAttempts, setRemainingAttempts] = React.useState<number | null>(initRemaining ?? null);

  // Ensure radio buttons update correctly
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = Number(e.target.value);
  setSelected(val);
  // eslint-disable-next-line no-console
  console.log('radio clicked, value=', val);
  };

  const submitAnswer = async () => {
    if (selected === undefined) return;
    const resp = await runtime.postHandler<{ correct: boolean; attempts?: number; remaining_attempts?: number; grade?: number; max_grade?: number }>('submit_answer', { answer: selected });
    setIsCorrect(Boolean(resp.correct));
    if (resp.attempts !== undefined) setAttempts(resp.attempts);
    if (resp.remaining_attempts !== undefined) setRemainingAttempts(resp.remaining_attempts);
    if (resp.correct) {
      setFeedback('Correct!');
    } else if (resp.remaining_attempts !== undefined && resp.remaining_attempts > 0) {
      setFeedback('Incorrect. Try again.');
    } else {
      setFeedback('Incorrect. No attempts remaining.');
    }
    // Small debug log so we can see clicks in the console
    // eslint-disable-next-line no-console
    console.log('Submitted answer', selected, 'server response', resp);
  };

  return (
    <div className="myxblock">
      <h1>Quiz based on React</h1>
      <p>{question}</p>
      <form>
        {options.map((opt, idx) => (
          <div key={idx}>
            <label>
              <input
                type="radio"
                name="option"
                value={idx}
                checked={selected === idx}
                disabled={
                  // disabled if out of attempts or already answered correctly
                  (remainingAttempts !== null && remainingAttempts <= 0) || isCorrect
                }
                onChange={handleChange}
              />
              {opt}
            </label>
          </div>
        ))}
      </form>
      {!(remainingAttempts !== null && remainingAttempts <= 0) && !isCorrect && (
        <button className="btn btn-primary" onClick={submitAnswer} disabled={selected === undefined}>
          <FormattedMessage defaultMessage="Submit" />
        </button>
      )}
      {feedback && <div className="feedback">{feedback}</div>}
      {remainingAttempts !== null && (
        <div className="attempts">Attempts: {attempts} — Remaining: {remainingAttempts}</div>
      )}
    </div>
  );
};

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
        question={initData.question}
        options={initData.options}
        correct={initData.correct}
    user_answer={initData.user_answer}
    attempts={initData.attempts}
    remaining_attempts={initData.remaining_attempts}
      />
    </IntlProvider>
  );
}

(globalThis as any).initMyXBlockStudentView = initStudentView;
