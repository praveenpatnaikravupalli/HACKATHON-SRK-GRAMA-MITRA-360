import { ShieldCheck, ShieldAlert, ShieldQuestion, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../utils/i18n.js';
const STYLE = {
  HIGH: ['bg-emerald-100 text-emerald-900', ShieldCheck, 'Verified'],
  MEDIUM: ['bg-amber-100 text-amber-900', ShieldAlert, 'Needs extra checking'],
  LOW: ['bg-red-100 text-red-900', ShieldQuestion, 'Could not verify'],
};
// Shows the FACTUAL verification status of the record (not an AI confidence number).
export default function TrustBadge({ trust }) {
  const { lang } = useApp();
  if (!trust) return null;
  const [cls, Icon, label] = STYLE[trust.level] || STYLE.LOW;
  return (
    <div className="mt-3 rounded-2xl bg-slate-100 p-3 text-sm text-slate-800">
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${cls}`}><Icon size={16} /> {trust.level} · {label}</span>
      {trust.sourceName && <p className="mt-2"><b>{t(lang, 'official')}:</b> {trust.sourceName}</p>}
      {trust.sourceUrl && <a className="inline-flex items-center gap-1 text-brand-700 underline" href={trust.sourceUrl} target="_blank" rel="noreferrer">{trust.sourceUrl} <ExternalLink size={14} /></a>}
      <p className="mt-1"><b>{t(lang, 'verifiedOn')}:</b> {trust.lastVerified ? new Date(trust.lastVerified).toLocaleDateString() : t(lang, 'notVerifiedYet')}</p>
    </div>
  );
}
