// Usage: (backend running + seeded)  npm run evaluate
// Measures intent accuracy, service retrieval accuracy, verified-source coverage, escalation behaviour, response time.
import fs from 'fs';
const API = process.env.API || 'http://localhost:5000/api';
const cases = JSON.parse(fs.readFileSync(new URL('../../documentation/test-cases.json', import.meta.url)));
let intentOk = 0, intentN = 0, slugOk = 0, slugN = 0, actOk = 0, actN = 0, cover = 0, coverN = 0, ms = [], rows = [];
for (const c of cases) {
  const t0 = Date.now();
  const r = await fetch(`${API}/assistant/message`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: c.text, language: c.lang }) });
  const a = await r.json(); ms.push(Date.now() - t0);
  const res = [];
  if (c.expectIntent) { intentN++; const ok = c.expectIntent.includes(a.intent); intentOk += ok; res.push(`intent:${ok ? 'OK' : 'FAIL(' + a.intent + ')'}`); }
  if (c.expectSlug) { slugN++; const ok = a.service?.slug === c.expectSlug; slugOk += ok; res.push(`service:${ok ? 'OK' : 'FAIL(' + (a.service?.slug || 'none') + ')'}`); }
  if (c.expectAction) { actN++; const ok = a.action === c.expectAction; actOk += ok; res.push(`action:${ok ? 'OK' : 'FAIL(' + a.action + ')'}`); }
  if (c.expectSlug) { coverN++; if (a.trust && a.trust.level !== 'LOW') cover++; }
  rows.push(`${c.id} ${c.group.padEnd(22)} ${String(Date.now() - t0).padStart(5)}ms ${a.aiMode || ''} ${a.trust?.level || '-'}  ${res.join(' ')}`);
  await new Promise(r => setTimeout(r, 400));
}
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(0) + '%' : 'n/a');
console.log(rows.join('\n'));
console.log(`\nIntent accuracy:        ${pct(intentOk, intentN)} (${intentOk}/${intentN})`);
console.log(`Service retrieval:      ${pct(slugOk, slugN)} (${slugOk}/${slugN})`);
console.log(`Escalation/repeat ok:   ${pct(actOk, actN)} (${actOk}/${actN})`);
console.log(`Verified-source coverage (answers with trust HIGH/MEDIUM): ${pct(cover, coverN)} (${cover}/${coverN})`);
console.log(`Avg response time: ${Math.round(ms.reduce((x, y) => x + y, 0) / ms.length)} ms, max ${Math.max(...ms)} ms`);
