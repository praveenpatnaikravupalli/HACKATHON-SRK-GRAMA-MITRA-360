import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import { loadBundle } from '../utils/offlineDb.js';
import { t } from '../utils/i18n.js';
import TrustBadge from '../components/TrustBadge.jsx';
export default function TrustDashboard() {
  const { lang } = useApp();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [note, setNote] = useState('');
  useEffect(() => {
    api.services().then(setItems).catch(async () => { const b = await loadBundle(); if (b) { setItems(b.services); setNote('Showing the copy saved on this device.'); } else setNote(t(lang, 'needInternet')); });
  }, [lang]);
  const count = (l) => items.filter(i => i.trust.level === l).length;
  const shown = items.filter(i => filter === 'ALL' || i.trust.level === filter);
  return (
    <div className="space-y-4">
      <h1 className="flex items-center gap-2 text-3xl font-bold"><ShieldCheck /> TrustScore</h1>
      <p className="text-slate-600">TrustScore shows whether a record is backed by an approved official source and when a person last checked it. It is <b>not</b> an AI confidence score.</p>
      <div className="grid gap-3 sm:grid-cols-3">{[['HIGH', 'Approved source, verified recently', 'bg-emerald-100'], ['MEDIUM', 'Approved source, needs extra check', 'bg-amber-100'], ['LOW', 'No reliable source: assistant will not answer', 'bg-red-100']].map(([l, d, c]) =>
        <button key={l} onClick={() => setFilter(filter === l ? 'ALL' : l)} aria-pressed={filter === l} className={`card text-left ${c} ${filter === l ? 'ring-4 ring-brand-600' : ''}`}><p className="text-3xl font-extrabold">{count(l)}</p><p className="font-bold">{l}</p><p className="text-sm">{d}</p></button>)}</div>
      {note && <p className="text-amber-700">{note}</p>}
      <div className="grid gap-3 sm:grid-cols-2">{shown.map(s => <div key={s.slug} className="card"><h2 className="text-xl font-bold">{s.name[lang] || s.name.en}</h2><p className="text-sm text-slate-500">{s.category}</p><TrustBadge trust={s.trust} /></div>)}</div>
    </div>);
}
