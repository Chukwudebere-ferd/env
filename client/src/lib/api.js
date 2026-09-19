// API client for env backend. Auth stub: x-user-email header until better-auth lands.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function headers(email, extra = {}) {
  return {
    'Content-Type': 'application/json',
    'x-user-email': email || '',
    ...extra,
  };
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  listProjects: (email) => fetch(`${BASE}/api/projects`, { headers: headers(email) }).then(handle),
  createProject: (email, name) =>
    fetch(`${BASE}/api/projects`, {
      method: 'POST',
      headers: headers(email),
      body: JSON.stringify({ name }),
    }).then(handle),
  listKeys: (email, projectId) =>
    fetch(`${BASE}/api/keys?projectId=${encodeURIComponent(projectId)}`, { headers: headers(email) }).then(handle),
  addKeys: (email, payload) =>
    fetch(`${BASE}/api/keys`, { method: 'POST', headers: headers(email), body: JSON.stringify(payload) }).then(handle),
  requestOtp: (email, projectId) =>
    fetch(`${BASE}/api/otp/request`, {
      method: 'POST',
      headers: headers(email),
      body: JSON.stringify({ projectId }),
    }).then(handle),
  verifyOtp: (email, projectId, code) =>
    fetch(`${BASE}/api/otp/verify`, {
      method: 'POST',
      headers: headers(email),
      body: JSON.stringify({ projectId, code }),
    }).then(handle),
  revealKeys: (email, projectId, keyId) =>
    fetch(`${BASE}/api/keys/reveal`, {
      method: 'POST',
      headers: headers(email),
      body: JSON.stringify({ projectId, keyId }),
    }).then(handle),
};
