export default function SharesList({ shares, revokingId, onRevoke }) {
  if (!shares.length) {
    return (
      <div className="empty">
        <h2>No shares yet</h2>
        <p>Invite a friend by email above. Links expire on time and run out of views.</p>
      </div>
    );
  }
  return (
    <table className="table">
      <thead>
        <tr><th scope="col">Friend</th><th scope="col">Views</th><th scope="col">Expires</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr>
      </thead>
      <tbody>
        {shares.map((s) => {
          const left = Number(s.max_uses) - Number(s.uses_count);
          const dead = s.revoked || s.expired || left <= 0;
          return (
            <tr key={s.id}>
              <td className="mono detail-key-name">{s.collaborator_email}</td>
              <td className="mono muted">{s.uses_count}/{s.max_uses}{dead ? ' · done' : ''}</td>
              <td className="mono muted detail-key-date">
                {s.expires_at ? new Date(s.expires_at).toLocaleString() : '—'}
              </td>
              <td className="num">
                {!dead && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onRevoke(s.id)}
                    disabled={revokingId === s.id}
                    aria-busy={revokingId === s.id}
                  >
                    {revokingId === s.id ? 'Revoking…' : 'Revoke'}
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
