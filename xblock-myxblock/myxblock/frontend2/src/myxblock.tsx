////////////////////////////////////////////////////////////////////////////////
// Remember: changes in this file will only take effect when you run          //
// npm run build       or      npm run watch                                  //
////////////////////////////////////////////////////////////////////////////////
import React from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
  initialCount?: number;
}

const StudentView: React.FC<Props> = ({ initialCount = 0 }) => {
  const [count, setCount] = React.useState(initialCount);
  const [message, setMessage] = React.useState<string | null>(null);

  const increment = () => {
    if (count >= 10) {
      setMessage('Maximum count reached (5).');
      return;
    }
    setCount(count + 1);
    setMessage(null);
  };

  const decrement = () => {
    if (count <= 0) {
      setMessage('Minimum count reached (0).');
      return;
    }
    setCount(count - 1);
    setMessage(null);
  };

  return <div className="myxblock" style={{ padding: '16px' }}>
    <h1>MyXBlock</h1>
    <p>
      <FormattedMessage
        id="studentView.countMessage"
        description="Sentence describing how many times the button has been clicked!"
        defaultMessage="{count, plural,
          one {The button has been clicked <bold>1</bold> time.}
          other {The button has been clicked <bold>{count, number}</bold> times.}
        }"
        values={{ count, bold: text => <span className="count">{text}</span> }}
      />
    </p>
    <button className="btn btn-primary" onClick={increment}>+ <FormattedMessage id="studentView.increment" defaultMessage="Increment" /></button>
    <button className="btn btn-secondary" onClick={decrement} style={{marginLeft: '8px'}}>- <FormattedMessage id="studentView.decrement" defaultMessage="Decrement" /></button>
    {message && <div style={{color: 'red', marginTop: '10px'}}>{message}</div>}
  </div>;
}

export default StudentView;
