import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Volume2, Loader2, CheckSquare, Square, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useSpeech } from '../hooks/useSpeech.js';
import { api } from '../services/api.js';
import { t } from '../utils/i18n.js';
import TrustBadge from '../components/TrustBadge.jsx';
import HandoffDialog from '../components/HandoffDialog.jsx';

export default function Documents() {
  const { slug } = useParams();
  const { lang, slow, addRecent } = useApp();
  const sp = useSpeech(lang);
  const [services, setServices] = useState([]);
  const [data, setData] = useState(null);
  const [have, setHave] = useState(new Set());
  const [gap, setGap] = useState(null);
  const [explain, setExplain] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [help, setHelp] = useState(false);
  const fail = (e) => setErr(e.offline ? t(lang, 'needInternet') : e.message);
  useEffect(() => { api.services().then(s => setServices(s.filter(x => x.documents?.length))).catch(fail); }, []); // eslint-disable-line
  useEffect(() => {
    setData(null); setGap(null); setHave(new Set()); setExplain(''); setErr('');
    if (slug) api.documents(slug).then(d => { setData(d); addRecent({ slug, name: d.name }); }).catch(e => { setData({ notFound: true }); if (e.status !== 404) fail(e); });
  }, [slug]); // eslint-disable-line
  useEffect(() => () => sp.silence(), []); // eslint-disable-line
  const name = (d) => d.name?.[lang] || d.name?.en || d.key;
  const toggle = (k) => { const n = new Set(have); n.has(k) ? n.delete(k) : n.add(k); setHave(n); setGap(null); };
  const readList = () => sp.speak(data.documents.map((d, i) => `${i + 1}. ${name(d)}`).join('. '), slow);
  const findMissing = async () => { setBusy(true); try { setGap(await api.checkDocs(slug, [...have])); } catch (e) { fail(e); } setBusy(false); };
  // Asks the assistant (Gemini, grounded on the verified record) to explain in the user's language.
  const explainMine = async () => {
    setBusy(true); setErr('');
    try { const a = await api.message({ text: `What documents are required for ${data.name.en}?`, language: lang }); setExplain(a.reply); sp.speak(a.reply, slow); }
    catch (e) { fail(e); } setBusy(false);
  };

  if (!slug) return (<div><h1 className="mb-4 text-3xl font-bold">{t(lang, 'documents')}</h1>{err && <p className="text-amber-700">{err}</p>}
    <div className="grid gap-3 sm:grid-cols-2">{services.map(s => <Link key={s.slug} to={`/documents/${s.slug}`} className="card text-xl font-semibold hover:shadow-md">{s.name[lang] || s.name.en}</Link>)}</div></div>);
  if (!data) return <Loader2 className="mx-auto animate-spin text-brand-600" size={40} />;
  if (data.notFound) return (<div className="card space-y-3"><p className="text-xl">{err || 'I could not verify this information. Would you like to speak with a human support representative?'}</p>
    <button className="btn-warn" onClick={() => setHelp(true)}>{t(lang, 'human')}</button><HandoffDialog open={help} onClose={() => setHelp(false)} question={`Documents for ${slug}`} reason="No document checklist available" /></div>);
  const doc = (d) => { const mis = gap?.missing.find(m => m.key === d.key); return (
    <li key={d.key} className={`card flex items-start gap-4 ${mis ? 'ring-2 ring-red-400' : have.has(d.key) ? 'ring-2 ring-emerald-400' : ''}`}>
      <button onClick={() => toggle(d.key)} aria-pressed={have.has(d.key)} aria-label={`${t(lang, 'haveDoc')}: ${name(d)}`} className="mt-1 text-brand-700">{have.has(d.key) ? <CheckSquare size={34} /> : <Square size={34} />}</button>
      <div className="flex-1"><p className="text-xl font-bold">{name(d)}</p><p className="text-slate-600">{d.explain}</p>
        {mis?.howToObtain && <p className="mt-2 rounded-xl bg-red-50 p-2 text-red-900">{t(lang, 'missing')}: {mis.howToObtain}</p>}</div>
      <button className="btn-ghost !min-h-0 !px-3 !py-2" onClick={() => sp.speak(name(d), slow)} aria-label={t(lang, 'readAloud')}><Volume2 /></button></li>); };
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">{data.name[lang] || data.name.en}</h1>
      <TrustBadge trust={data.trust} />
      {data.trust.level === 'LOW' && <p className="card bg-red-50 text-red-900">I could not verify this information. Would you like to speak with a human support representative?</p>}
      <div className="flex flex-wrap gap-3"><button className="btn-primary" onClick={readList}><Volume2 /> {t(lang, 'readAloud')}</button>
        <button className="btn-ghost" onClick={explainMine} disabled={busy}><Sparkles /> {t(lang, 'explainMine')}</button>
        <button className="btn-ghost" onClick={findMissing} disabled={busy || data.documents.length === 0}>{t(lang, 'checkMissing')}</button></div>
      {explain && <div className="card whitespace-pre-line text-lg">{explain}</div>}
      {err && <p className="text-amber-700" role="alert">{err}</p>}
      <p className="text-sm text-slate-500">Descriptions are shown in English; document names follow your language. Tap the box when you have it. Do not upload or share Aadhaar, OTP or bank details here.</p>
      <ul className="space-y-3">{data.documents.map(doc)}</ul>
      {gap && <div className="card bg-slate-50"><p className="text-lg"><b>{t(lang, 'available')}:</b> {gap.available.length} · <b>{t(lang, 'missing')}:</b> {gap.missing.length}</p></div>}
      <div className="flex flex-wrap gap-3"><Link className="btn-ghost" to={`/eligibility/${slug}`}>{t(lang, 'eligibility')}</Link><button className="btn-warn" onClick={() => setHelp(true)}>{t(lang, 'human')}</button></div>
      <HandoffDialog open={help} onClose={() => setHelp(false)} question={`Help with documents for ${data.name.en}`} category="other" reason="Citizen wants help with documents" />
    </div>);
}
