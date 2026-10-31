import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Mic, Contrast, ALargeSmall, Wifi, WifiOff, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { t, LANG_NAMES } from '../utils/i18n.js';
import Logo from './Logo.jsx';
export default function Layout() {
  const { lang, setLang, contrast, setContrast, large, setLarge, online, pending, synced, clearSynced } = useApp();
  const { pathname } = useLocation();
  const link = ({ isActive }) => `whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold ${isActive ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`;
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link to="/app" aria-label="Home"><Logo /></Link>
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="Language" value={lang} onChange={e => setLang(e.target.value)} className="input !w-auto !py-2">
              {Object.entries(LANG_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button className="btn-ghost !min-h-0 !px-3 !py-2" aria-pressed={large} onClick={() => setLarge(!large)} title="Large text"><ALargeSmall /></button>
            <button className="btn-ghost !min-h-0 !px-3 !py-2" aria-pressed={contrast} onClick={() => setContrast(!contrast)} title="High contrast"><Contrast /></button>
            <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${online ? 'bg-brand-100 text-brand-900' : 'bg-amber-100 text-amber-900'}`}>
              {online ? <Wifi size={16} /> : <WifiOff size={16} />}{t(lang, online ? 'online' : 'offline')}{pending > 0 && ` · ${pending} pending`}
            </span>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
          <NavLink to="/app" className={link}>Home</NavLink><NavLink to="/offline" className={link}>{t(lang, 'offlineHelp')}</NavLink>
          <NavLink to="/safety" className={link}>{t(lang, 'scamSafety')}</NavLink><NavLink to="/trust" className={link}>{t(lang, 'verifiedInfo')}</NavLink>
          <NavLink to="/staff" className={link}>Staff</NavLink><NavLink to="/admin" className={link}>Admin</NavLink>
        </nav>
      </header>
      {synced.length > 0 && <div className="mx-auto mt-4 flex max-w-5xl items-start justify-between gap-3 rounded-2xl bg-brand-50 p-4 text-brand-900" role="status">
        <p>Your saved requests were sent. Ticket IDs: <b>{synced.map(s => s.ticketId).join(', ')}</b></p><button onClick={clearSynced} aria-label="Close"><X /></button></div>}
      <main className="mx-auto max-w-5xl px-4 py-6"><Outlet /></main>
      {pathname !== '/voice' && (
        <Link to="/voice" className="btn-primary fixed bottom-5 right-5 !rounded-full shadow-lg" aria-label={t(lang, 'voice')}><Mic /> <span className="hidden sm:inline">{t(lang, 'voice')}</span></Link>
      )}
    </div>
  );
}
