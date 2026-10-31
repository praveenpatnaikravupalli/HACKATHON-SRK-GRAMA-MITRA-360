import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Languages, ListChecks, FileText, WifiOff, ShieldCheck, UserRound, Siren, ArrowRight, Mic } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { useApp } from '../context/AppContext.jsx';
import { t, LANG_NAMES } from '../utils/i18n.js';
const FEATURES = [
  [Languages, 'Dialect Intelligence', 'Understands Telugu, Hindi, English and mixed speech, and asks to confirm when unsure.'],
  [ListChecks, 'Smart Eligibility', 'One simple question at a time. Preliminary result only, never an approval promise.'],
  [FileText, 'Document Assistant', 'Official checklist read aloud, with missing documents and how to get them.'],
  [WifiOff, 'Offline Help', 'Saved checklists and FAQs keep working without internet (Phase 3).'],
  [ShieldCheck, 'TrustScore', 'Every answer shows its official source and last verified date, or says it cannot verify.'],
  [UserRound, 'Human Handoff', 'Uncertain questions become real support tickets, never fake promises.'],
  [Siren, 'Scam Alert', 'Warns about OTP, fake-call and payment fraud in your own language.'],
];
export default function Landing() {
  const { lang, setLang } = useApp();
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-slate-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4"><Logo />
        <div className="flex gap-2">{Object.entries(LANG_NAMES).map(([k, v]) =>
          <button key={k} onClick={() => setLang(k)} aria-pressed={lang === k} className={`rounded-full px-4 py-2 font-semibold ${lang === k ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-slate-300'}`}>{v}</button>)}</div></header>
      <section className="mx-auto max-w-5xl px-4 pb-14 pt-10 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xl"><Mic size={44} /></div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">GRAMA MITRA <span className="text-saffron-600">360</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-700">{t(lang, 'tagline')}</p>
          <Link to="/app" className="btn-primary mt-8 !px-10 !text-xl">{t(lang, 'getStarted')} <ArrowRight /></Link>
        </motion.div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(([Icon, title, text], i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="card">
            <Icon className="text-brand-600" size={30} /><h3 className="mt-3 text-xl font-bold">{title}</h3><p className="mt-1 text-slate-600">{text}</p></motion.div>))}
      </section>
      <section className="mx-auto my-14 max-w-5xl px-4">
        <div className="rounded-3xl bg-brand-900 p-8 text-white">
          <h2 className="text-3xl font-bold">Why it matters</h2>
          <p className="mt-3 text-lg text-brand-100">Many people cannot read long forms or use complex apps, and fraud callers target them. Other assistants simply answer questions. GRAMA MITRA 360 helps rural citizens understand, verify and navigate essential services safely, in their own language.</p>
          <ul className="mt-4 list-disc space-y-1 pl-6 text-brand-100"><li>Voice first, large buttons, high-contrast mode</li><li>No Aadhaar, OTP or password is ever requested</li><li>Nothing is saved without your consent</li></ul>
        </div>
      </section>
    </div>
  );
}
