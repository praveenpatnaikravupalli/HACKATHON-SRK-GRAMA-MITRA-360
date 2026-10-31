import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Mic, Check, X, CircleHelp, ShieldAlert, Loader2, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useSpeech } from '../hooks/useSpeech.js';
import { api } from '../services/api.js';
import { t, parseYesNo, parseNumber } from '../utils/i18n.js';
import TrustBadge from '../components/TrustBadge.jsx';
import HandoffDialog from '../components/HandoffDialog.jsx';

export default function Eligibility() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { lang, slow, online, addRecent } = useApp();
  const sp = useSpeech(lang);
  const [services, setServices] = useState([]);
  const [q, setQ] = useState(null);       // questions payload
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [heard, setHeard] = useState(null); // voice answer awaiting confirmation: {value, text}
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [save, setSave] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [help, setHelp] = useState(false);
  const fail = (e) => setErr(e.offline ? t(lang, 'needInternet') : e.message);

  useEffect(() => { if (!slug) api.services().then(s => setServices(s.filter(x => x.category !== 'safety'))).catch(fail); }, [slug]); // eslint-disable-line
  useEffect(() => {
    if (!slug) return;
    setQ(null); setIdx(0); setAnswers({}); setResult(null); setErr('');
    api.questions(slug, lang).then(d => { setQ(d); }).catch(e => { setQ({ unavailable: true }); if (e.status !== 404) fail(e); });
  }, [slug, lang]); // eslint-disable-line
  const cur = q?.questions?.[idx];
  useEffect(() => { if (cur) sp.speak(cur.text, slow); }, [cur?.key, lang]); // eslint-disable-line
  useEffect(() => () => sp.silence(), []); // eslint-disable-line

  const submit = async (value) => {
    const next = { ...answers, [cur.key]: value }; setAnswers(next); setHeard(null); setText('');
    if (idx + 1 < q.questions.length) { setIdx(idx + 1); return; }
    setBusy(true);
    try { setResult(await api.checkEligibility(slug, next, save)); } catch (e) { fail(e); }
    setBusy(false);
  };
  const byVoice = () => sp.listen({
    onResult: (txt) => {
      const v = cur.type === 'boolean' ? parseYesNo(txt) : cur.type === 'number' ? parseNumber(txt) : txt.trim();
      v === null || v === '' ? setErr(t(lang, 'didntCatch')) : (setErr(''), setHeard({ value: v, text: txt }));
    },
    onError: (c) => setErr(c === 'unsupported' ? t(lang, 'notSupported') : c),
  });
  const show = (v) => v === true ? t(lang, 'yes') : v === false ? t(lang, 'no') : String(v);
  const ICON = { met: <Check className="text-emerald-600" />, not_met: <X className="text-red-600" />, unknown: <CircleHelp className="text-slate-500" />, needs_verification: <ShieldAlert className="text-amber-600" /> };

  if (!slug) return (
    <div><h1 className="mb-4 text-3xl font-bold">{t(lang, 'chooseScheme')}</h1>
      {err && <p className="text-amber-700">{err}</p>}
      <div className="grid gap-3 sm:grid-cols-2">{services.map(s => <Link key={s.slug} to={`/eligibility/${s.slug}`} className="card text-xl font-semibold hover:shadow-md">{s.name[lang] || s.name.en}</Link>)}</div></div>);
  if (!q) return <Loader2 className="mx-auto animate-spin text-brand-600" size={40} />;
  if (q.unavailable) return (<div className="card space-y-3"><p className="text-xl">{err || 'No verified eligibility rules are available for this scheme yet.'}</p>
    <button className="btn-warn" onClick={() => setHelp(true)}>{t(lang, 'human')}</button><Link className="btn-ghost" to="/eligibility">{t(lang, 'back')}</Link>
    <HandoffDialog open={help} onClose={() => setHelp(false)} question={`Eligibility rules for ${slug}`} category="other" reason="No eligibility rules available" /></div>);

  if (result) return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className={`card border-2 ${result.result === 'preliminary_match' ? 'border-emerald-500' : result.result === 'may_not_be_eligible' ? 'border-red-400' : 'border-amber-400'}`}>
        <h1 className="text-2xl font-bold">{t(lang, result.result)}</h1>
        <button className="btn-ghost mt-3" onClick={() => sp.speak(`${t(lang, result.result)}. ${t(lang, 'disclaimer')}`, slow)}><Volume2 /> {t(lang, 'repeat')}</button>
        <ul className="mt-4 space-y-2">{result.checks.map(c => <li key={c.key} className="flex items-center gap-3 text-lg">{ICON[c.status]}<span>{c.label}</span>
          <span className="ml-auto text-sm text-slate-500">{c.status.replace('_', ' ')}</span></li>)}</ul>
        <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-amber-900">{t(lang, 'disclaimer')}</p>
        <TrustBadge trust={result.trust} />
      </div>
      <div className="flex flex-wrap gap-3"><Link className="btn-primary" to={`/documents/${slug}`}>{t(lang, 'documents')}</Link>
        <button className="btn-warn" onClick={() => setHelp(true)}>{t(lang, 'human')}</button><Link className="btn-ghost" to="/eligibility">{t(lang, 'back')}</Link></div>
      <HandoffDialog open={help} onClose={() => setHelp(false)} question={`Eligibility check for ${slug}`} category="other" reason="Citizen wants help after eligibility check" summary={`Result: ${result.result}. Answers: ${JSON.stringify(answers)}`} />
    </div>);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-brand-600 transition-all" style={{ width: `${(idx / q.questions.length) * 100}%` }} /></div>
      <div className="card space-y-5 text-center">
        <p className="text-sm text-slate-500">{idx + 1} / {q.questions.length}</p>
        <h1 className="text-3xl font-bold">{cur.text}</h1>
        <button className="btn-ghost mx-auto" onClick={() => sp.speak(cur.text, slow)}><Volume2 /> {t(lang, 'repeat')}</button>
        {heard ? (<div className="rounded-2xl border-2 border-saffron-500 p-4"><p>{t(lang, 'youSaid')}: <b className="text-2xl">{show(heard.value)}</b></p><p>{t(lang, 'isCorrect')}</p>
          <div className="mt-3 flex justify-center gap-3"><button className="btn-primary" onClick={() => submit(heard.value)}><Check /> {t(lang, 'yes')}</button><button className="btn-ghost" onClick={() => setHeard(null)}><X /> {t(lang, 'no')}</button></div></div>
        ) : cur.type === 'boolean' ? (
          <div className="flex justify-center gap-4"><button className="btn-primary !px-12 !text-2xl" onClick={() => submit(true)}>{t(lang, 'yes')}</button><button className="btn-ghost !px-12 !text-2xl" onClick={() => submit(false)}>{t(lang, 'no')}</button></div>
        ) : (
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); const v = cur.type === 'number' ? Number(text) : text.trim(); if (text.trim() && !Number.isNaN(v)) submit(v); }}>
            <input className="input" type={cur.type === 'number' ? 'number' : 'text'} inputMode={cur.type === 'number' ? 'numeric' : 'text'} min="0" max="130" value={text} onChange={e => setText(e.target.value)} />
            <button className="btn-primary" disabled={!text.trim()}>{t(lang, 'send')}</button></form>)}
        {!heard && <button className="btn-ghost mx-auto" onClick={byVoice} disabled={!sp.supported}><Mic /> {sp.listening ? t(lang, 'listening') : t(lang, 'tapToSpeak')}</button>}
        {idx === q.questions.length - 1 && <label className="flex items-start gap-3 text-left"><input type="checkbox" className="mt-1 h-6 w-6" checked={save} onChange={e => setSave(e.target.checked)} />{t(lang, 'saveAnon')}</label>}
        {busy && <Loader2 className="mx-auto animate-spin" />}{err && <p className="text-amber-700" role="alert">{err}</p>}
        {!online && <p className="text-amber-700">{t(lang, 'needInternet')}</p>}
      </div>
      <button className="btn-ghost" onClick={() => idx > 0 ? setIdx(idx - 1) : nav('/eligibility')}>{t(lang, 'back')}</button>
    </div>);
}
