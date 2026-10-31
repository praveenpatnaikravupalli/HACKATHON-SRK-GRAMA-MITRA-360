import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, ListChecks, FileText, UserRound, Landmark, HeartPulse, GraduationCap, Wheat, Siren, WifiOff, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import { t } from '../utils/i18n.js';
import HandoffDialog from '../components/HandoffDialog.jsx';
const ICON = { pension: Landmark, ration: Wheat, scholarship: GraduationCap, health: HeartPulse, safety: Siren, other: Landmark };
export default function Dashboard() {
  const { lang, recents, addRecent } = useApp();
  const nav = useNavigate();
  const [services, setServices] = useState([]);
  const [err, setErr] = useState('');
  const [help, setHelp] = useState(false);
  useEffect(() => { api.services().then(setServices).catch(e => setErr(e.offline ? t(lang, 'needInternet') : e.message)); }, [lang]);
  const Big = ({ to, onClick, icon: I, label, tone = 'bg-white' }) => {
    const inner = <><I size={36} className="text-brand-600" /><span className="text-xl font-bold">{label}</span></>;
    const cls = `card flex min-h-[7rem] flex-col items-start justify-center gap-2 text-left transition hover:-translate-y-0.5 hover:shadow-md ${tone}`;
    return to ? <Link to={to} className={cls}>{inner}</Link> : <button onClick={onClick} className={cls}>{inner}</button>;
  };
  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card bg-gradient-to-br from-brand-600 to-brand-900 !text-white !ring-0 text-center">
        <h1 className="text-3xl font-extrabold">{t(lang, 'welcome')}</h1>
        <button onClick={() => nav('/voice')} className="mx-auto mt-5 grid h-28 w-28 place-items-center rounded-full bg-white text-brand-700 shadow-xl" aria-label={t(lang, 'tapToSpeak')}><Mic size={50} /></button>
        <p className="mt-3 text-lg">{t(lang, 'tapToSpeak')}</p>
      </motion.section>
      <section className="grid gap-4 sm:grid-cols-3">
        <Big to="/eligibility" icon={ListChecks} label={t(lang, 'eligibility')} />
        <Big to="/documents" icon={FileText} label={t(lang, 'documents')} />
        <Big onClick={() => setHelp(true)} icon={UserRound} label={t(lang, 'human')} />
        <Big to="/offline" icon={WifiOff} label={t(lang, 'offlineHelp')} />
        <Big to="/safety" icon={Siren} label={t(lang, 'scamSafety')} />
        <Big to="/trust" icon={ShieldCheck} label={t(lang, 'verifiedInfo')} />
      </section>
      <section>
        <h2 className="mb-3 text-2xl font-bold">{t(lang, 'popular')}</h2>
        {err && <p className="text-amber-700">{err}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {services.filter(s => s.category !== 'safety').map(s => { const I = ICON[s.category] || Landmark; return (
            <Link key={s.slug} to={`/documents/${s.slug}`} onClick={() => addRecent({ slug: s.slug, name: s.name })} className="card flex items-center gap-4 hover:shadow-md">
              <I className="text-saffron-600" size={32} /><span className="text-lg font-semibold">{s.name[lang] || s.name.en}</span></Link>); })}
        </div>
      </section>
      {recents.length > 0 && <section><h2 className="mb-3 text-2xl font-bold">{t(lang, 'recent')}</h2>
        <div className="flex flex-wrap gap-2">{recents.map(r => <Link key={r.slug} to={`/documents/${r.slug}`} className="btn-ghost !min-h-0 !py-2">{r.name[lang] || r.name.en}</Link>)}</div></section>}
      <HandoffDialog open={help} onClose={() => setHelp(false)} />
    </div>
  );
}
