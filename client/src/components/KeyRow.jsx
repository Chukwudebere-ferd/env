import CopyButton from './CopyButton.jsx';

export default function KeyRow({ entry, revealed, onRevealOne, onDelete, revealing = false }) {
  const name = entry.configName || entry.config_name;
  const added = entry.created_at || entry.createdAt;
  return (
    <tr>
      <td className="mono detail-key-name">{name}</td>
      <td className={revealed ? 'mono detail-key-value revealed' : 'mono detail-key-value masked'}>
        {revealed || '••••••••••'}
      </td>
      <td className="mono muted detail-key-date">
        {added ? new Date(added).toLocaleDateString() : '—'}
      </td>
      <td className="num">
        <div className="row-actions">
          <CopyButton text={name} label="Copy name" />
          {revealed ? (
            <CopyButton text={revealed} label="Copy value" />
          ) : (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onRevealOne} disabled={revealing} aria-busy={revealing}>
              {revealing ? 'Revealing…' : 'Reveal'}
            </button>
          )}
          {onDelete && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onDelete} aria-label={`Delete key ${name}`}>
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
