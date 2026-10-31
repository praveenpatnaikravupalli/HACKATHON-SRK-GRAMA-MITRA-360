import { useEffect, useRef, useState } from 'react';
import { Siren, Phone, ExternalLink, Mic, Send, Check, X, Volume2, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useSpeech } from '../hooks/useSpeech.js';
import { api } from '../services/api.js';
import { t } from '../utils/i18n.js';
import TrustBadge from '../components/TrustBadge.jsx';
const S = (en, hi, te) => ({ en, hi, te });
const SIGNS = [
  S('They ask for your OTP, PIN or password.', 'वे आपका ओटीपी, पिन या पासवर्ड मांगते हैं।', 'వారు మీ ఓటీపీ, పిన్ లేదా పాస్‌వర్డ్ అడుగుతారు.'),
  S('They ask for money to approve a pension or scheme.', 'वे पेंशन या योजना मंजूर करने के लिए पैसे मांगते हैं।', 'పెన్షన్ లేదా పథకం మంజూరు కోసం డబ్బు అడుగుతారు.'),
  S('They send unknown links or ask you to install an app.', 'वे अनजान लिंक भेजते हैं या ऐप इंस्टॉल करने को कहते हैं।', 'తెలియని లింకులు పంపుతారు లేదా యాప్ ఇన్‌స్టాల్ చేయమంటారు.'),
  S('They threaten that your benefit will stop unless you act now.', 'वे धमकी देते हैं कि अभी नहीं किया तो आपका लाभ बंद हो जाएगा।', 'వెంటనే చేయకపోతే మీ లబ్ధి ఆగిపోతుందని బెదిరిస్తారు.'),
  S('They say "keep this secret".', 'वे कहते हैं "यह किसी को मत बताओ"।', '"ఇది ఎవరికీ చెప్పకండి" అంటారు.'),
];
const BASE = S('Never share your OTP, password or PIN. Real offices do not take money by phone to approve a scheme. Check on official government websites. Report cyber fraud on helpline 1930.',
  'ओटीपी, पासवर्ड या पिन कभी न बताएं। असली कार्यालय योजना मंजूर करने के लिए फोन पर पैसे नहीं लेते। सरकारी वेबसाइट पर जांचें। साइबर ठगी की शिकायत हेल्पलाइन 1930 पर करें।',
  'ఓటీపీ, పాస్‌వర్డ్ లేదా పిన్ ఎప్పుడూ చెప్పకండి. అసలైన కార్యాలయాలు పథకం మంజూరు కోసం ఫోన్‌లో డబ్బు తీసుకోవు. అధికారిక ప్రభుత్వ వెబ్‌సైట్‌లో చూడండి. సైబర్ మోసాన్ని 1930 హెల్ప్‌లైన్‌లో నివేదించండి.');
export default function SafetyCenter() {
  const { lang, slow, online } = useApp();
  const sp = useSpeech(lang);
  const [typed, setTyped] = useState('');
  const [pending, setPending] = useState(null);
  const [a, setA] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => () => sp.silence(), []); // eslint-disable-line
  const ask = async (text) => {
    if (!online) { setErr(t(lang, 'needInternet')); return; }
    setBusy(true); setErr(''); setPending(null);
    try { const r = await api.message({ text, language: lang }); setA(r); sp.speak(r.reply, slow); } catch (e) { setErr(e.offline ? t(lang, 'needInternet') : e.message); }
    setBusy(false);
  };
  const mic = () => sp.listening ? sp.stop() : sp.listen({ onResult: (x) => setPending(x), onError: (c) => setErr(c === 'unsupported' ? t(lang, 'notSupported') : c) });
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="flex items-center gap-2 text-3xl font-bold text-red-700"><Siren /> {t(lang, 'scamSafety')}</h1>
      <div className="card border-2 border-red-300 bg-red-50 text-lg text-red-950"><p>{BASE[lang]}</p>
        <button className="btn-ghost mt-3" onClick={() => sp.speak(BASE[lang], slow)}><Volume2 /> {t(lang, 'readAloud')}</button></div>
      <div className="card"><h2 className="mb-2 text-xl font-bold">Warning signs</h2><ul className="list-disc space-y-2 pl-6 text-lg">{SIGNS.map((s, i) => <li key={i}>{s[lang]}</li>)}</ul>
        <p className="mt-3 text-sm text-slate-500">This explains common patterns only. It cannot tell you whether a specific person or phone number is a fraud.</p></div>
      <div className="card space-y-2"><h2 className="text-xl font-bold">Report fraud</h2>
        <p className="flex items-center gap-2 text-lg"><Phone /> National Cyber Crime Helpline: <b>1930</b></p>
        <a className="flex items-center gap-2 text-lg text-brand-700 underline" href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">cybercrime.gov.in <ExternalLink size={16} /></a>
        <p className="text-sm text-slate-500">Confirm these details on the official portal; they are managed in the verified records.</p></div>
      <div className="card space-y-3 text-center"><h2 className="text-xl font-bold">{t(lang, 'voice')}</h2>
        <button onClick={mic} aria-label={t(lang, 'tapToSpeak')} className={`mx-auto grid h-20 w-20 place-items-center rounded-full text-white ${sp.listening ? 'bg-red-600' : 'bg-brand-600'}`}><Mic size={34} /></button>
        <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (typed.trim()) { ask(typed.trim()); setTyped(''); } }}><input className="input" value={typed} onChange={e => setTyped(e.target.value)} placeholder={t(lang, 'typeHere')} maxLength={500} /><button className="btn-primary" aria-label={t(lang, 'send')}><Send /></button></form>
        {pending && <div className="rounded-2xl border-2 border-saffron-500 p-3"><p className="text-xl font-bold">“{pending}”</p><p>{t(lang, 'isCorrect')}</p>
          <div className="mt-2 flex justify-center gap-3"><button className="btn-primary" onClick={() => ask(pending)}><Check /> {t(lang, 'yes')}</button><button className="btn-ghost" onClick={() => setPending(null)}><X /> {t(lang, 'no')}</button></div></div>}
        {busy && <Loader2 className="mx-auto animate-spin" />}{err && <p className="text-amber-700" role="alert">{err}</p>}
        {a && <div className="text-left"><p className="whitespace-pre-line text-lg">{a.reply}</p><TrustBadge trust={a.trust} />
          <button className="btn-ghost mt-2" onClick={() => sp.speak(a.reply, slow)}><Volume2 /> {t(lang, 'repeat')}</button></div>}
      </div>
    </div>);
}
