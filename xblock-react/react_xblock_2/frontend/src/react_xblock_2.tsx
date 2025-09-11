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
  // List all your supported languages here, after running 'npm run i18n:extract',
  // editing the messages in the 'lang' folder, and running 'npm run i18n:compile'
  fa: faMessages, // RTL language
  fr: frMessages,
}

/** Data passed from our student_view render method when it calls frag.initialize_js() */
interface InitData {
  count: number;
}

interface Props {
  runtime: BoundRuntime;
  initialCount: number;
}

const StudentView: React.FC<Props> = ({ runtime, ...props }) => {
  const [count, setCount] = React.useState(props.initialCount);

  // Handlers:
  const increment = React.useCallback(async () => {
    interface IncrementResponse { count: number; }
    const newData = await runtime.postHandler<IncrementResponse>('increment_count'); 
    //Note that 'increment_count' is the function in the .py file decorated with @XBlock.json_handler; 
    //here the function is run each time runtime.postHandler is called. In this particular case, the frontend
    //doesn't send any data but the request that the increment_count function be run and its result is sent back to it
    //If you are sending data to the backend, you can pass it as the second parameter of postHandler: ('increment_count', blabla).
    //Also note that the return value of increment_count is automatically JSON-ified and sent back to the frontend.
    //If you need to send an error message, raise a ValueError in the Python code, and it will be sent back to the frontend
    //as a rejected Promise.
    setCount(newData.count); //update the state with the new count returned by the backend function; and re-rendered in the JSX
  }, [runtime]);

  // Note: for more sophisticated fetch/cache/mutate behavior, use @tanstack/react-query to manage your data.

  return <div className="react_xblock_2_block">
      <h1>ReactXBlock8</h1>
      {/* Below is the correct internationalized way to render the following simple paragraph:
        *   <p>The button has been clicked <span className="count">{count}</span> times.</p>
        */}
      <p>
        <FormattedMessage
          description="Sentence describing how many times the button has been clicked!"
          defaultMessage="{count, plural,
            one {The button has been clicked <bold>1</bold> time.}
            other {The button has been clicked <bold>{count, number}</bold> times.}
          }"
          values={{ count, bold: text => <span className="count">{text}</span> }}
        />
      </p>
      <button className="btn btn-primary" onClick={increment}>+ <FormattedMessage defaultMessage="Increment2" /></button>
    </div>
}

function initStudentView(runtime: XBlockRuntime, container: HTMLDivElement | JQueryWrappedDiv, initData: InitData) {
  if ('jquery' in container) {
    // Fix inconsistent parameter typing:
    container = container[0];
  }
  /** Get the language selected by the user, e.g. 'en' or 'fr' */
  const languageCode = document.body.parentElement!.lang;
  const root = ReactDOM.createRoot(container!);
  root.render(
    <IntlProvider messages={(messages as any)[languageCode]} locale={languageCode} defaultLocale="en">
      <StudentView runtime={new BoundRuntime(runtime, container)} initialCount={initData.count} />
    </IntlProvider>
  );
}

// We need to add our init function to the global (window) namespace, without conflicts:
// initReactXBlock8StudentView is the name chosen in the Python code when calling frag.initialize_js() 
(globalThis as any).initReactXBlock8StudentView = initStudentView;
