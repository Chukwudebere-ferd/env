import CopyButton from './CopyButton.jsx';

export default function KeyRow({ entry, revealed, onRevealOne }) {
  const name = entry.configName || entry.config_name;
  const added = entry.created_at || entry.createdAt;
  return (
    <tr>
      <td className="mono" style={{ wordBreak: 'break-all' }}>{name}</td>
      <td className="mono" style={{ wordBreak: 'break-all', color: revealed ? 'var(--color-accent)' : 'var(--color-mute)' }}>
        {revealed || '••••••••••'}
      </td>
      <td className="mono muted" style={{ whiteSpace: 'nowrap' }}>
        {added ? new Date(added).toLocaleDateString() : '—'}
      </td>
      <td className="num">
        <div className="row-actions">
          <CopyButton text={name} label="Copy name" />
          {revealed ? (
            <CopyButton text={revealed} label="Copy value" />
          ) : (
            <button type="button" className="btn btn-secondary" style={{ height: 34, fontSize: 13 }} onClick={onRevealOne}>
              Reveal
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
