import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserRound, X, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../utils/i18n.js';
import { queueTicket } from '../utils/offlineDb.js';
// Creates a REAL ticket. It never claims a human is connected until an agent accepts it (status != Pending).
export default function HandoffDialog({ open, onClose, question = '', category = 'other', reason = 'Citizen asked for human support', summary = '' }) {
  const { lang, online, refreshPending } = useApp();
  const [consent, setConsent] = useState(false);
  const [contact, setContact] = useState('');
  const [q, setQ] = useState(question);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ticket, setTicket] = useState(null);
  const [track, setTrack] = useState(null);
  const [lookup, setLookup] = useState('');
  if (!open) return null;
  const submit = async () => {
    setBusy(true); setErr('');
    const body = { question: q || 'Need help', language: lang, category, reason, summary: summary || q, consent: true, contact: contact || undefined };
    try {
      if (!online) { await queueTicket({ localId: crypto.randomUUID(), ...body }); refreshPending(); setTicket({ queued: true, message: t(lang, 'savedOffline') }); }
      else setTicket(await api.createTicket(body));
    } catch (e) { setErr(e.offline ? t(lang, 'savedOffline') : e.message); }
    setBusy(false);
  };
  const check = async (id) => { setErr(''); try { setTrack(await api.track(id)); } catch (e) { setErr(e.offline ? t(lang, 'needInternet') : e.message); } };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card max-h-[90vh] w-full max-w-lg overflow-auto">
        <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-2xl font-bold"><UserRound /> {t(lang, 'human')}</h2>
          <button onClick={onClose} aria-label={t(lang, 'close')} className="btn-ghost !min-h-0 !px-3 !py-2"><X /></button></div>
        {!ticket ? (<div className="mt-4 space-y-4">
          <textarea className="input" rows={3} value={q} onChange={e => setQ(e.target.value)} maxLength={1000} placeholder="…" />
          <input className="input" inputMode="tel" maxLength={20} value={contact} onChange={e => setContact(e.target.value)} placeholder={t(lang, 'contactOpt')} />
          <label className="flex items-start gap-3 text-lg"><input type="checkbox" className="mt-1 h-6 w-6" checked={consent} onChange={e => setConsent(e.target.checked)} />{t(lang, 'consentTicket')}</label>
          <button className="btn-primary w-full" disabled={!consent || busy} onClick={submit}>{busy && <Loader2 className="animate-spin" />}{t(lang, 'submitReq')}</button>
          {!online && <p className="text-amber-700">{t(lang, 'savedOffline')}</p>}
        </div>) : (<div className="mt-4 space-y-3">
          {ticket.ticketId && <><p className="text-lg">{t(lang, 'ticketId')}:</p>
          <p className="rounded-2xl bg-brand-50 p-4 text-center text-3xl font-bold tracking-widest text-brand-900">{ticket.ticketId}</p></>}
          <p>{ticket.message}</p>
        </div>)}
        <div className="mt-5 border-t pt-4">
          <div className="flex gap-2"><input className="input" value={lookup} onChange={e => setLookup(e.target.value)} placeholder="GM-XXXXXXXX" />
            <button className="btn-ghost" disabled={!(lookup || ticket)} onClick={() => check(lookup || ticket.ticketId)}>{t(lang, 'trackStatus')}</button></div>
          {track && <div className="mt-3 rounded-2xl bg-slate-100 p-3"><p className="font-semibold">{track.ticketId}: {track.status}</p>
            <p className="text-sm">{track.humanConnected ? 'A support person has accepted this request.' : 'Waiting. No support person has accepted it yet.'}</p>
            {track.responses.map((r, i) => <p key={i} className="mt-2 rounded-xl bg-white p-2">{r.text}</p>)}</div>}
          {err && <p className="mt-2 text-red-700">{err}</p>}
        </div>
      </motion.div>
    </div>
  );
}
