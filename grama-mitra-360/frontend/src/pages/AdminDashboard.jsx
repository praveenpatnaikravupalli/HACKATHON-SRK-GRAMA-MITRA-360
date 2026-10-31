import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import StaffGate from '../components/StaffGate.jsx';
import TrustBadge from '../components/TrustBadge.jsx';
const TABS = ['Services', 'Sources', 'Agents', 'Analytics'];
const TEMPLATE = { slug: 'new-service', name: { en: 'New service', hi: '', te: '' }, category: 'other', description: 'Describe the service in plain words (copied from the official page).',
  eligibilityText: [], eligibilityRules: [], documents: [{ key: 'id-proof', name: { en: 'Identity proof' }, explain: 'A paper that proves who you are.', howToObtain: '' }], procedure: [], keywords: ['keyword'], sourceUrl: 'https://', faq: true };
const editable = (s) => JSON.parse(JSON.stringify({ slug: s.slug, name: s.name, category: s.category, description: s.description, eligibilityText: s.eligibilityText, eligibilityRules: s.eligibilityRules,
  documents: s.documents, procedure: s.procedure, keywords: s.keywords, source: s.source?._id, sourceUrl: s.sourceUrl, faq: s.faq }));

function Services({ sources }) {
  const [list, setList] = useState([]); const [json, setJson] = useState(''); const [editing, setEditing] = useState(null); const [msg, setMsg] = useState('');
  const load = useCallback(() => api.adminServices().then(setList).catch(e => setMsg(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const run = async (fn, ok) => { setMsg(''); try { await fn(); setMsg(ok); await load(); } catch (e) { setMsg(e.message + (e.data?.details ? ': ' + e.data.details.join('; ') : '')); } };
  return (<div className="space-y-4">{msg && <p className="card bg-amber-50" role="status">{msg}</p>}
    <button className="btn-primary" onClick={() => { setEditing(null); setJson(JSON.stringify(TEMPLATE, null, 2)); }}>+ New service record</button>
    <ul className="space-y-3">{list.map(s => <li key={s.slug} className="card"><div className="flex flex-wrap items-center justify-between gap-2"><div><b className="text-lg">{s.name.en}</b> <span className="text-slate-500">({s.slug})</span></div>
      <div className="flex flex-wrap gap-2"><button className="btn-primary !min-h-0 !py-2" onClick={() => run(() => api.verify(s.slug), `Verified ${s.slug} today`)}>Verify now</button>
        <button className="btn-ghost !min-h-0 !py-2" onClick={() => run(() => api.outdated(s.slug), `${s.slug} marked outdated`)}>Mark outdated</button>
        <button className="btn-ghost !min-h-0 !py-2" onClick={() => { setEditing(s.slug); setJson(JSON.stringify(editable(s), null, 2)); }}>Edit</button></div></div>
      <TrustBadge trust={s.trust} /></li>)}</ul>
    {json && <div className="card space-y-2"><p className="font-semibold">{editing ? `Editing ${editing} (saving resets verification: re-verify after checking the official page)` : 'New record (starts as "needs verification")'}</p>
      <p className="text-sm text-slate-500">Set "source" to a KnowledgeSource id from the Sources tab: {sources.map(s => `${s.name}: ${s._id}`).join(' | ')}</p>
      <textarea className="input font-mono !text-sm" rows={18} value={json} onChange={e => setJson(e.target.value)} spellCheck="false" />
      <div className="flex gap-2"><button className="btn-primary" onClick={() => { let b; try { b = JSON.parse(json); } catch { setMsg('That is not valid JSON.'); return; } run(() => editing ? api.updateService(editing, b) : api.createService(b), 'Saved'); }}>Save</button>
        <button className="btn-ghost" onClick={() => setJson('')}>Cancel</button></div></div>}</div>);
}
function Sources({ sources, reload }) {
  const [f, setF] = useState({ name: '', authority: '', url: 'https://' }); const [msg, setMsg] = useState('');
  const add = async (e) => { e.preventDefault(); setMsg(''); try { await api.createSource(f); setF({ name: '', authority: '', url: 'https://' }); reload(); } catch (x) { setMsg(x.message); } };
  return (<div className="space-y-4"><ul className="space-y-2">{sources.map(s => <li key={s._id} className="card flex flex-wrap items-center justify-between gap-2">
    <div><b>{s.name}</b><p className="text-sm text-slate-500">{s.authority} · <a className="underline" href={s.url} target="_blank" rel="noreferrer">{s.url}</a></p></div>
    <button className={s.approved ? 'btn-primary !min-h-0 !py-2' : 'btn-ghost !min-h-0 !py-2'} onClick={() => api.approveSource(s._id, !s.approved).then(reload)}>{s.approved ? 'Approved ✓ (click to revoke)' : 'Not approved (click to approve)'}</button></li>)}</ul>
    <form onSubmit={add} className="card space-y-2"><h3 className="font-bold">Add source (starts unapproved)</h3>
      <input className="input" placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
      <input className="input" placeholder="Authority" value={f.authority} onChange={e => setF({ ...f, authority: e.target.value })} required />
      <input className="input" placeholder="https://…" value={f.url} onChange={e => setF({ ...f, url: e.target.value })} required /><button className="btn-primary">Add</button>{msg && <p className="text-red-700">{msg}</p>}</form></div>);
}
function Agents() {
  const [list, setList] = useState([]); const [f, setF] = useState({ name: '', email: '', password: '' }); const [msg, setMsg] = useState('');
  const load = useCallback(() => api.agents().then(setList).catch(e => setMsg(e.message)), []); useEffect(() => { load(); }, [load]);
  const add = async (e) => { e.preventDefault(); setMsg(''); try { await api.createAgent(f); setF({ name: '', email: '', password: '' }); load(); } catch (x) { setMsg(x.message + (x.data?.details ? ': ' + x.data.details.join('; ') : '')); } };
  return (<div className="space-y-4"><ul className="space-y-2">{list.map(a => <li key={a._id} className="card flex items-center justify-between"><span><b>{a.name}</b> · {a.email}</span>
    <button className="btn-ghost !min-h-0 !py-2" onClick={() => api.setAgentActive(a._id, !a.active).then(load)}>{a.active ? 'Active (click to disable)' : 'Disabled (click to enable)'}</button></li>)}</ul>
    <form onSubmit={add} className="card space-y-2"><h3 className="font-bold">Add support agent</h3>
      <input className="input" placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required /><input className="input" type="email" placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required />
      <input className="input" type="password" placeholder="Password (10+ characters)" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} minLength={10} required /><button className="btn-primary">Create agent</button>{msg && <p className="text-red-700">{msg}</p>}</form></div>);
}
function Analytics() {
  const [a, setA] = useState(null); useEffect(() => { api.analytics().then(setA); }, []);
  if (!a) return null; const g = (arr, k) => arr.find(x => x._id === k)?.n || 0;
  const Card = ({ l, v }) => <div className="card"><p className="text-3xl font-extrabold">{v}</p><p>{l}</p></div>;
  return (<div className="grid gap-3 sm:grid-cols-3"><Card l="Service records" v={a.services} /><Card l="Trust HIGH" v={a.trust.HIGH} /><Card l="Trust MEDIUM" v={a.trust.MEDIUM} /><Card l="Trust LOW" v={a.trust.LOW} />
    {['Pending', 'Assigned', 'In Progress', 'Resolved'].map(s => <Card key={s} l={`Tickets ${s}`} v={g(a.ticketsByStatus, s)} />)}
    {['en', 'hi', 'te'].map(l => <Card key={l} l={`Tickets in ${l}`} v={g(a.ticketsByLanguage, l)} />)}<Card l="Saved eligibility checks (consented)" v={a.assessments} />
    <Card l="Average feedback" v={a.feedback.avg ? a.feedback.avg.toFixed(1) : '—'} /></div>);
}
function Panel({ user, logout }) {
  const [tab, setTab] = useState('Services'); const [sources, setSources] = useState([]);
  const loadSources = useCallback(() => api.sources().then(setSources).catch(() => {}), []); useEffect(() => { loadSources(); }, [loadSources]);
  return (<div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-3xl font-bold">Admin dashboard</h1><div className="flex items-center gap-2"><span>{user.name}</span><button className="btn-ghost !min-h-0 !py-2" onClick={logout}>Logout</button></div></div>
    <div className="flex gap-2">{TABS.map(x => <button key={x} onClick={() => setTab(x)} aria-pressed={tab === x} className={`rounded-full px-4 py-1 font-semibold ${tab === x ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-slate-300'}`}>{x}</button>)}</div>
    {tab === 'Services' && <Services sources={sources} />}{tab === 'Sources' && <Sources sources={sources} reload={loadSources} />}{tab === 'Agents' && <Agents />}{tab === 'Analytics' && <Analytics />}</div>);
}
export default function AdminDashboard() { return <StaffGate roles={['admin']}>{(p) => <Panel {...p} />}</StaffGate>; }
