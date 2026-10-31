import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { listQueue } from '../utils/offlineDb.js';
import { syncQueue, downloadBundle } from '../services/sync.js';
const Ctx = createContext(null);
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => load('gm_lang', 'te'));
  const [contrast, setContrast] = useState(() => load('gm_hc', false));
  const [large, setLarge] = useState(() => load('gm_large', false));
  const [slow, setSlow] = useState(() => load('gm_slow', false));
  const [recents, setRecents] = useState(() => load('gm_recents', []));
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);
  const [synced, setSynced] = useState([]);
  useEffect(() => { localStorage.setItem('gm_lang', JSON.stringify(lang)); document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { localStorage.setItem('gm_hc', JSON.stringify(contrast)); document.documentElement.classList.toggle('hc', contrast); }, [contrast]);
  useEffect(() => { localStorage.setItem('gm_large', JSON.stringify(large)); document.documentElement.classList.toggle('large', large); }, [large]);
  useEffect(() => { localStorage.setItem('gm_slow', JSON.stringify(slow)); }, [slow]);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  const refreshPending = useCallback(() => listQueue().then(q => setPending(q.length)).catch(() => {}), []);
  // When online: send queued requests, then refresh the offline bundle of verified information.
  useEffect(() => {
    refreshPending();
    if (!online) return;
    (async () => {
      try { const s = await syncQueue(); if (s.length) setSynced(s); } catch { /* retry next time */ }
      refreshPending();
      try { await downloadBundle(); } catch { /* backend unreachable */ }
    })();
  }, [online, refreshPending]);
  const addRecent = useCallback((item) => setRecents(r => {
    const n = [item, ...r.filter(x => x.slug !== item.slug)].slice(0, 5);
    localStorage.setItem('gm_recents', JSON.stringify(n)); return n;
  }), []);
  return <Ctx.Provider value={{ lang, setLang, contrast, setContrast, large, setLarge, slow, setSlow, recents, addRecent, online, pending, refreshPending, synced, clearSynced: () => setSynced([]) }}>{children}</Ctx.Provider>;
}
export const useApp = () => useContext(Ctx);
