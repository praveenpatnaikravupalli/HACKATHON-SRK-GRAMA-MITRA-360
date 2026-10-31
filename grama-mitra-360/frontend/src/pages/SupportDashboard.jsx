import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';
import StaffGate from '../components/StaffGate.jsx';
const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved'];
const NEXT = { Assigned: ['In Progress', 'Resolved'], 'In Progress': ['Resolved'] };
const COLOR = { Pending: 'bg-red-100 text-red-900', Assigned: 'bg-amber-100 text-amber-900', 'In Progress': 'bg-blue-100 text-blue-900', Resolved: 'bg-emerald-100 text-emerald-900' };
function Board({ user, logout }) {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('');
  const [sel, setSel] = useState(null);
  const [reply, setReply] = useState('');
  const [err, setErr] = useState('');
  const load = useCallback(() => api.agentTickets(filter).then(setTickets).catch(e => setErr(e.message)), [filter]);
  useEffect(() => { load(); }, [load]);
  const act = async (fn) => { setErr(''); try { const t = await fn(); setSel(t); await load(); } catch (e) { setErr(e.message); } };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-3xl font-bold">Support dashboard</h1><div className="flex gap-2 items-center"><span>{user.name} ({user.role})</span><button className="btn-ghost !min-h-0 !py-2" onClick={logout}>Logout</button></div></div>
      <div className="flex flex-wrap gap-2">{['', ...STATUSES].map(s => <button key={s || 'all'} onClick={() => setFilter(s)} aria-pressed={filter === s} className={`rounded-full px-4 py-1 font-semibold ${filter === s ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-slate-300'}`}>{s || 'All'}</button>)}
        <button className="btn-ghost !min-h-0 !py-1" onClick={load}><RefreshCw size={16} /> Refresh</button></div>
      {err && <p className="text-red-700" role="alert">{err}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <ul className="space-y-2">{tickets.map(t => <li key={t.ticketId}><button onClick={() => { setSel(t); setReply(''); }} className={`card w-full text-left ${sel?.ticketId === t.ticketId ? 'ring-4 ring-brand-600' : ''}`}>
          <div className="flex justify-between gap-2"><b>{t.ticketId}</b><span className={`rounded-full px-3 text-sm font-semibold ${COLOR[t.status]}`}>{t.status}</span></div>
          <p className="mt-1 line-clamp-2">{t.question}</p><p className="text-sm text-slate-500">{t.language.toUpperCase()} · {t.category} · priority {t.priority}</p></button></li>)}
          {tickets.length === 0 && <p className="text-slate-500">No tickets.</p>}</ul>
        {sel && <div className="card space-y-3 self-start"><h2 className="text-xl font-bold">{sel.ticketId} <span className={`ml-2 rounded-full px-3 text-sm ${COLOR[sel.status]}`}>{sel.status}</span></h2>
          <p><b>Question:</b> {sel.question}</p><p><b>Language:</b> {sel.language} · <b>Category:</b> {sel.category} · <b>Priority:</b> {sel.priority}</p>
          <p><b>Reason for escalation:</b> {sel.reason}</p><p className="whitespace-pre-line rounded-xl bg-slate-100 p-3"><b>Conversation summary:</b>{'\n'}{sel.summary || '—'}</p>
          {sel.contact && <p><b>Contact given by citizen:</b> {sel.contact}</p>}<p><b>Assigned to:</b> {sel.assignedTo?.name || '—'}</p>
          {sel.responses.map((r, i) => <p key={i} className="rounded-xl bg-emerald-50 p-2"><b>{r.byName}:</b> {r.text}</p>)}
          <div className="flex flex-wrap gap-2">{sel.status === 'Pending' && <button className="btn-primary" onClick={() => act(() => api.accept(sel.ticketId))}>Accept ticket</button>}
            {(NEXT[sel.status] || []).map(s => <button key={s} className="btn-ghost" onClick={() => act(() => api.setStatus(sel.ticketId, s))}>Mark {s}</button>)}</div>
          {sel.status !== 'Pending' && sel.status !== 'Resolved' && <div className="space-y-2"><textarea className="input" rows={3} maxLength={2000} value={reply} onChange={e => setReply(e.target.value)} placeholder="Reply to the citizen (shown when they check their ticket ID)" />
            <button className="btn-primary" disabled={!reply.trim()} onClick={() => act(async () => { await api.respond(sel.ticketId, reply.trim()); setReply(''); return api.agentTickets().then(l => l.find(x => x.ticketId === sel.ticketId)); })}>Send response</button></div>}
        </div>}
      </div>
    </div>);
}
export default function SupportDashboard() { return <StaffGate roles={['agent', 'admin']}>{(p) => <Board {...p} />}</StaffGate>; }
