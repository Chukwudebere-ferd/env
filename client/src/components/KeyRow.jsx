import CopyButton from './CopyButton.jsx';

export default function KeyRow({ entry, revealed, onRevealOne }) {
  return (
    <li className="card" style={{ padding: 12 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <code>{entry.configName || entry.config_name}</code>
        <div className="row">
          <CopyButton text={entry.configName || entry.config_name} label="Copy name" />
          {revealed ? (
            <CopyButton text={revealed} label="Copy key" />
          ) : (
            <button type="button" className="btn" style={{ height: 32, fontSize: 13 }} onClick={onRevealOne}>
              Reveal
            </button>
          )}
        </div>
      </div>
      {revealed && (
        <div style={{ marginTop: 8 }}>
          <code style={{ wordBreak: 'break-all' }}>{revealed}</code>
        </div>
      )}
    </li>
  );
}
