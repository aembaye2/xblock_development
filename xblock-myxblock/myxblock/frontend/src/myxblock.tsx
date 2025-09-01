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
}

interface Props {
  runtime: BoundRuntime;
  question: string;
  options: string[];
  correct: number;
  user_answer?: number;
}

const StudentView: React.FC<Props> = ({ runtime, question, options, correct, user_answer }) => {
  const [selected, setSelected] = React.useState<number | undefined>(user_answer);
  // Treat missing key as not-submitted. Only if a real number is present do we mark submitted.
  const [submitted, setSubmitted] = React.useState<boolean>(typeof user_answer === 'number');
  const [feedback, setFeedback] = React.useState<string | null>(null);

  // Ensure radio buttons update correctly
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = Number(e.target.value);
  setSelected(val);
  // eslint-disable-next-line no-console
  console.log('radio clicked, value=', val);
  };

  const submitAnswer = async () => {
    if (selected === undefined) return;
    const resp = await runtime.postHandler<{ correct: boolean }>('submit_answer', { answer: selected });
    setSubmitted(true);
    setFeedback(resp.correct ? 'Correct!' : 'Incorrect. Try again next time.');
  // Small debug log so we can see clicks in the console
  // eslint-disable-next-line no-console
  console.log('Submitted answer', selected, 'server response', resp);
  };

  return (
    <div className="myxblock">
      <h1>Quiz</h1>
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
                disabled={submitted}
                onChange={handleChange}
              />
              {opt}
            </label>
          </div>
        ))}
      </form>
      {!submitted && (
        <button className="btn btn-primary" onClick={submitAnswer} disabled={selected === undefined}>
          <FormattedMessage defaultMessage="Submit" />
        </button>
      )}
      {feedback && <div className="feedback">{feedback}</div>}
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
      />
    </IntlProvider>
  );
}

(globalThis as any).initMyXBlockStudentView = initStudentView;
