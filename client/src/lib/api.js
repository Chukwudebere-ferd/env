// API client for env backend. Session cookies are primary; x-user-email is
// kept as a transitional fallback until the server drops the legacy header.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function headers(email, extra = {}) {
  return {
    'Content-Type': 'application/json',
    ...(email ? { 'x-user-email': email } : {}),
    ...extra,
  };
}

function opts(method, email, body) {
  return {
    method,
    headers: headers(email),
    credentials: 'include',
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  listProjects: (email) => fetch(`${BASE}/api/projects`, { headers: headers(email), credentials: 'include' }).then(handle),
  createProject: (email, name) =>
    fetch(`${BASE}/api/projects`, opts('POST', email, { name })).then(handle),
  listKeys: (email, projectId) =>
    fetch(`${BASE}/api/keys?projectId=${encodeURIComponent(projectId)}`, { headers: headers(email), credentials: 'include' }).then(handle),
  addKeys: (email, payload) =>
    fetch(`${BASE}/api/keys`, opts('POST', email, payload)).then(handle),
  requestOtp: (email, projectId) =>
    fetch(`${BASE}/api/otp/request`, opts('POST', email, { projectId })).then(handle),
  verifyOtp: (email, projectId, code) =>
    fetch(`${BASE}/api/otp/verify`, opts('POST', email, { projectId, code })).then(handle),
  revealKeys: (email, projectId, keyId) =>
    fetch(`${BASE}/api/keys/reveal`, opts('POST', email, { projectId, keyId })).then(handle),
  deleteProject: (email, projectId) =>
    fetch(`${BASE}/api/projects/${encodeURIComponent(projectId)}`, { ...opts('DELETE', email) }).then(handle),
  deleteKey: (email, keyId) =>
    fetch(`${BASE}/api/keys/${encodeURIComponent(keyId)}`, { ...opts('DELETE', email) }).then(handle),
};
