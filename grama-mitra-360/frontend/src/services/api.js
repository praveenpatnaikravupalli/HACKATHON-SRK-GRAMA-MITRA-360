const BASE = import.meta.env.VITE_API_URL || '/api';
export const auth = {
  get token() { return sessionStorage.getItem('gm_token'); },
  set(t) { sessionStorage.setItem('gm_token', t); },
  clear() { sessionStorage.removeItem('gm_token'); },
};
async function req(path, opts = {}) {
  let res;
  const headers = { 'Content-Type': 'application/json' };
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
  try { res = await fetch(BASE + path, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined }); }
  catch { const e = new Error('offline'); e.offline = true; throw e; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'Request failed'); e.status = res.status; e.data = data; throw e; }
  return data;
}
const post = (p, body) => req(p, { method: 'POST', body });
export const api = {
  session: () => post('/assistant/session'),
  message: (b) => post('/assistant/message', b),
  services: () => req('/services'),
  documents: (slug) => req(`/documents/${slug}`),
  checkDocs: (slug, have) => post(`/documents/${slug}/check`, { have }),
  questions: (slug, lang) => req(`/eligibility/${slug}/questions?lang=${lang}`),
  checkEligibility: (slug, answers, consentToSave) => post(`/eligibility/${slug}/check`, { answers, consentToSave }),
  createTicket: (b) => post('/support/tickets', b),
  track: (id) => req(`/support/track/${encodeURIComponent(id)}`),
  bundle: () => req('/sync/bundle'),
  syncTickets: (tickets) => post('/support/sync', { tickets }),
  feedback: (b) => post('/feedback', b),
  // staff
  login: (email, password) => post('/auth/login', { email, password }),
  me: () => req('/auth/me'),
  agentTickets: (status) => req(`/agent/tickets${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  accept: (id) => post(`/agent/tickets/${id}/accept`),
  setStatus: (id, status) => req(`/agent/tickets/${id}/status`, { method: 'PATCH', body: { status } }),
  respond: (id, text) => post(`/agent/tickets/${id}/respond`, { text }),
  // admin
  adminServices: () => req('/admin/services'),
  createService: (b) => post('/admin/services', b),
  updateService: (slug, b) => req(`/admin/services/${slug}`, { method: 'PUT', body: b }),
  verify: (slug) => post(`/admin/services/${slug}/verify`),
  outdated: (slug) => post(`/admin/services/${slug}/outdated`),
  sources: () => req('/admin/sources'),
  createSource: (b) => post('/admin/sources', b),
  approveSource: (id, approved) => req(`/admin/sources/${id}/approve`, { method: 'PATCH', body: { approved } }),
  agents: () => req('/admin/agents'),
  createAgent: (b) => post('/admin/agents', b),
  setAgentActive: (id, active) => req(`/admin/agents/${id}`, { method: 'PATCH', body: { active } }),
  analytics: () => req('/admin/analytics'),
};
