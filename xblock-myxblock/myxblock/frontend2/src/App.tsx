import StudentView from './myxblock';
import StudioView from './myxblock_studio';
import { IntlProvider } from 'react-intl';

// Example: Use English messages (or import your actual messages)
const messages = {}; // Replace with your actual messages object

// function App() {
//   return (
//     <IntlProvider locale="en" messages={messages}>
//       <div>
//         <h2>MyXBlock (Student View)</h2>
//         <StudentView runtime={(window as any).runtime} initialCount={0} />
//         <hr />
//         <h2>MyXBlock Studio (Instructor View)</h2>
//         <StudioView runtime={(window as any).runtime} fields={(window as any).fields || {}} />
//       </div>
//     </IntlProvider>
//   );
//}



function App() {
  return (
    <IntlProvider locale="en" messages={messages}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 400, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: '12px', background: '#fff', marginBottom: '24px' }}>
          <h2 style={{ textAlign: 'center' }}>MyXBlock (Student View)</h2>
          <StudentView initialCount={0} />
        </div>
        <hr style={{ width: '60%', margin: '32px 0' }} />
        <div style={{ width: '100%', maxWidth: 400, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: '12px', background: '#fff' }}>
          <h2 style={{ textAlign: 'center' }}>MyXBlock Studio (Instructor View)</h2>
          <StudioView />
        </div>
      </div>
    </IntlProvider>
  );
}

export default App;
