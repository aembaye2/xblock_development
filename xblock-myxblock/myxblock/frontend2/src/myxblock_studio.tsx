////////////////////////////////////////////////////////////////////////////////
// Remember: changes in this file will only take effect when you run          //
// npm run build       or      npm run watch_studio                           //
////////////////////////////////////////////////////////////////////////////////
import React from 'react';

const StudioView: React.FC = () => {
  const [displayName, setDisplayName] = React.useState<string>('');
  const displayNameId = React.useId();

  const saveChanges = () => {
    alert(`Saved display name: ${displayName}`);
  };

  return <div className="react_xblock_2_block">
    <h1>Studio View</h1>
    <label htmlFor={displayNameId}>Display Name:</label>
    <input
      id={displayNameId}
      type="text"
      value={displayName}
      onChange={e => setDisplayName(e.target.value)}
    />
    <button className="btn btn-primary" onClick={saveChanges}>Save Changes</button>
  </div>;
}

export default StudioView;
