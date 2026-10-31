import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, RotateCcw, Check, X, Send, Loader2, Snail, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useSpeech } from '../hooks/useSpeech.js';
import { api } from '../services/api.js';
import { t, EXAMPLES } from '../utils/i18n.js';
import MicButton from '../components/MicButton.jsx';
import Waveform from '../components/Waveform.jsx';
import TrustBadge from '../components/TrustBadge.jsx';
import HandoffDialog from '../components/HandoffDialog.jsx';

export default function VoiceAssistant() {
  const { lang, slow, setSlow, online, addRecent } = useApp();
  const nav = useNavigate();
  const sp = useSpeech(lang);
  const [pending, setPending] = useState(null);   // recognised text awaiting user confirmation
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [turn, setTurn] = useState(null);         // { question, answer }
  const [error, setError] = useState('');
  const [help, setHelp] = useState(false);
  const sessionRef = useRef(null);
  useEffect(() => { api.session().then(r => { sessionRef.current = r.sessionId; }).catch(() => {}); return () => sp.silence(); }, []); // eslint-disable-line

  const ask = async (text, recognitionConfidence) => {
    if (!online) { setError(t(lang, 'needInternet')); return; }
    setBusy(true); setError(''); setPending(null);
    try {
      const a = await api.message({ text, language: lang, sessionId: sessionRef.current || undefined, consentToSave: false, recognitionConfidence });
      setTurn({ question: text, answer: a });
      if (a.service) addRecent({ slug: a.service.slug, name: a.service.name });
      sp.speak(a.reply, slow);
    } catch (e) { setError(e.offline ? t(lang, 'needInternet') : e.message); }
    setBusy(false);
  };
  const onMic = () => {
    if (sp.listening) { sp.stop(); return; }
    sp.silence(); setError('');
    sp.listen({
      onResult: (text, conf) => setPending({ text, conf }),   // never act on speech without confirmation
      onError: (code) => setError(code === 'unsupported' ? t(lang, 'notSupported') : code === 'no-speech' ? t(lang, 'tapToSpeak') : code === 'network' ? t(lang, 'needInternet') : code),
    });
  };
  const a = turn?.answer;
  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <div className="card space-y-4">
        <MicButton listening={sp.listening} onClick={onMic} label={t(lang, 'tapToSpeak')} />
        <Waveform active={sp.listening || sp.speaking} />
        <p className="text-xl font-semibold" aria-live="polite">{sp.listening ? t(lang, 'listening') : busy ? t(lang, 'thinking') : t(lang, 'tapToSpeak')}</p>
        {!sp.supported && <p className="text-amber-700">{t(lang, 'notSupported')}</p>}
        {!sp.voiceAvailable && <p className="text-amber-700">{t(lang, 'noVoice')}</p>}
        <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (typed.trim()) { ask(typed.trim()); setTyped(''); } }}>
          <input className="input" value={typed} maxLength={500} onChange={e => setTyped(e.target.value)} placeholder={t(lang, 'typeHere')} />
          <button className="btn-primary" disabled={busy || !typed.trim()} aria-label={t(lang, 'send')}><Send /></button>
        </form>
        <div><p className="mb-2 text-sm text-slate-500">{t(lang, 'examples')}</p><div className="flex flex-wrap justify-center gap-2">
          {(EXAMPLES[lang] || []).map(x => <button key={x} className="btn-ghost !min-h-0 !py-2 !text-base" disabled={busy} onClick={() => ask(x)}>{x}</button>)}</div></div>
      </div>

      {pending && (
        <div className="card border-2 border-saffron-500">
          <p className="text-slate-600">{t(lang, 'youSaid')}:</p>
          <p className="my-2 text-2xl font-bold">“{pending.text}”</p>
          <p className="text-lg">{t(lang, 'isCorrect')}</p>
          <div className="mt-3 flex justify-center gap-3">
            <button className="btn-primary" onClick={() => ask(pending.text, pending.conf)}><Check /> {t(lang, 'yes')}</button>
            <button className="btn-ghost" onClick={() => { setPending(null); onMic(); }}><X /> {t(lang, 'no')}</button>
          </div>
        </div>)}

      {busy && <Loader2 className="mx-auto animate-spin text-brand-600" size={36} />}
      {error && <div className="card bg-amber-50 text-amber-900" role="alert">{error}</div>}

      {a && (
        <div className="card text-left">
          <p className="text-sm text-slate-500">“{turn.question}”</p>
          <p className="mt-2 whitespace-pre-line text-xl leading-relaxed">{a.reply}</p>
          <TrustBadge trust={a.trust} />
          <p className="mt-2 text-xs text-slate-500">Mode: {a.aiMode} · {a.ms} ms</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="btn-ghost" onClick={() => sp.speak(a.reply, slow)}><Volume2 /> {t(lang, 'repeat')}</button>
            <button className="btn-ghost" aria-pressed={slow} onClick={() => setSlow(!slow)}><Snail /> {t(lang, 'slow')}{slow ? ' ✓' : ''}</button>
            {a.action === 'start_eligibility' && a.service && <button className="btn-primary" onClick={() => nav(`/eligibility/${a.service.slug}`)}>{t(lang, 'eligibility')}</button>}
            {a.action === 'show_documents' && a.service && <button className="btn-primary" onClick={() => nav(`/documents/${a.service.slug}`)}>{t(lang, 'documents')}</button>}
            {a.action === 'offer_handoff' && <button className="btn-warn" onClick={() => setHelp(true)}><UserRound /> {t(lang, 'human')}</button>}
            {a.action === 'repeat' && <button className="btn-primary" onClick={onMic}><RotateCcw /> {t(lang, 'tapToSpeak')}</button>}
          </div>
        </div>)}
      <HandoffDialog open={help} onClose={() => setHelp(false)} question={turn?.question || ''} category={a?.service?.category || 'other'} reason="Assistant could not verify the answer" summary={turn ? `Q: ${turn.question}\nA: ${a.reply}` : ''} />
    </div>
  );
}
