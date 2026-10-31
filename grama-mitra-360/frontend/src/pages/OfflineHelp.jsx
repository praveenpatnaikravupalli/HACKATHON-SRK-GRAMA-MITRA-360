import { useEffect, useState } from 'react';
import { Download, Search, Volume2, Loader2, CloudOff } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useSpeech } from '../hooks/useSpeech.js';
import { loadBundle } from '../utils/offlineDb.js';
import { downloadBundle, syncQueue } from '../services/sync.js';
import { t } from '../utils/i18n.js';
import TrustBadge from '../components/TrustBadge.jsx';

// Works with NO internet: reads the verified bundle saved in IndexedDB. Typed search only
// (browser speech recognition needs internet); reading aloud uses on-device voices if available.
export default function OfflineHelp() {
  const { lang, slow, online, pending, refreshPending } = useApp();
  const sp = useSpeech(lang);
  const [bundle, setBundle] = useState(undefined);
  const [sel, setSel] = useState(null);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => { loadBundle().then(b => setBundle(b || null)).catch(() => setBundle(null)); return () => sp.silence(); }, []); // eslint-disable-line
  const refresh = async () => { setBusy(true); setMsg(''); try { setBundle(await downloadBundle()); } catch { setMsg(t(lang, 'needInternet')); } setBusy(false); };
  const sendQueue = async () => { setBusy(true); try { const s = await syncQueue(); setMsg(s.length ? `Sent: ${s.map(x => x.ticketId).join(', ')}` : ''); } catch { setMsg(t(lang, 'needInternet')); } refreshPending(); setBusy(false); };
  const search = () => {
    const s = q.toLowerCase().trim(); if (!s) return;
    const hit = bundle.services.map(v => ({ v, n: [...(v.keywords || []), v.name.en, v.name[lang]].filter(Boolean).filter(k => s.includes(k.toLowerCase()) || k.toLowerCase().includes(s)).length })).sort((a, b) => b.n - a.n)[0];
    if (hit?.n) { setSel(hit.v); setMsg(''); } else { setSel(null); setMsg('I could not verify this information. Would you like to speak with a human support representative? (Use the Human support button when you are online.)'); }
  };
  if (bundle === undefined) return <Loader2 className="mx-auto animate-spin" />;
  const read = (s) => sp.speak(`${s.name[lang] || s.name.en}. ${s.documents.map((d, i) => `${i + 1}. ${d.name?.[lang] || d.name?.en}`).join('. ')}`, slow);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="flex items-center gap-2 text-3xl font-bold"><CloudOff /> {t(lang, 'offlineHelp')}</h1>
      <div className="card space-y-2">
        {bundle ? <p>Saved on this device: {new Date(bundle.generatedAt).toLocaleString()} · {bundle.services.length} services. Saved information may be out of date; check the verified date on each record.</p>
          : <p className="text-amber-800">Nothing is saved yet. Connect to the internet once and press Download.</p>}
        <div className="flex flex-wrap gap-3"><button className="btn-primary" disabled={!online || busy} onClick={refresh}><Download /> Download / update</button>
          {pending > 0 && <button className="btn-warn" disabled={!online || busy} onClick={sendQueue}>Send {pending} saved request(s)</button>}</div>
        {!online && <p className="text-amber-700">{t(lang, 'offline')} – {t(lang, 'needInternet')}</p>}{msg && <p role="status">{msg}</p>}
      </div>
      {bundle && <>
        <form className="flex gap-2" onSubmit={e => { e.preventDefault(); search(); }}><input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="pension, ration, scholarship…" />
          <button className="btn-primary" aria-label="Search"><Search /></button></form>
        <div className="flex flex-wrap gap-2">{bundle.services.filter(s => s.category !== 'safety').map(s => <button key={s.slug} className="btn-ghost !min-h-0 !py-2" onClick={() => { setSel(s); setMsg(''); }}>{s.name[lang] || s.name.en}</button>)}</div>
        {sel && <div className="card space-y-3"><h2 className="text-2xl font-bold">{sel.name[lang] || sel.name.en}</h2><p>{sel.description}</p>
          {sel.eligibilityText.length > 0 && <ul className="list-disc pl-6">{sel.eligibilityText.map(x => <li key={x}>{x}</li>)}</ul>}
          <h3 className="text-xl font-semibold">{t(lang, 'documents')}</h3>
          <ul className="space-y-1">{sel.documents.map(d => <li key={d.key}><b>{d.name?.[lang] || d.name?.en}</b> – {d.explain}</li>)}</ul>
          {sel.procedure.length > 0 && <ol className="list-decimal pl-6">{sel.procedure.map(x => <li key={x}>{x}</li>)}</ol>}
          <button className="btn-ghost" onClick={() => read(sel)}><Volume2 /> {t(lang, 'readAloud')}</button><TrustBadge trust={sel.trust} /></div>}
      </>}
    </div>);
}
