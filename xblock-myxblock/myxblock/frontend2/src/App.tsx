import StudentView from './myxblock';
import StudioView from './myxblock_studio';
import { IntlProvider } from 'react-intl';

// Example: Use English messages (or import your actual messages)
const messages = {}; // Replace with your actual messages object

function App() {
  return (
    <IntlProvider locale="en" messages={messages}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '32px', padding: '16px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, background: '#f9f9f9', borderRadius: '8px', padding: '16px', minWidth: '350px' }}>
          <h2>Student View</h2>
          <StudentView initialCount={0} />
        </div>
        <div style={{ flex: 1, background: '#f4f4f4', borderRadius: '8px', padding: '16px', minWidth: '350px' }}>
          <h2>Studio (Instructor View)</h2>
          <StudioView />
        </div>
      </div>
    </IntlProvider>
  );
}

export default App;
