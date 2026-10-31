const cmp = { gte: (a, b) => a >= b, lte: (a, b) => a <= b, eq: (a, b) => a === b, neq: (a, b) => a !== b };
// Preliminary check against stored rules. NEVER a guarantee of approval.
export function evaluate(rules, answers) {
  const checks = rules.map(r => {
    const v = answers[r.key];
    const missing = v === undefined || v === null || v === '';
    if (r.op === 'info') return { key: r.key, label: r.label, status: missing ? 'unknown' : 'needs_verification' };
    if (missing) return { key: r.key, label: r.label, status: 'unknown' };
    const val = r.type === 'number' ? Number(v) : v;
    return { key: r.key, label: r.label, status: cmp[r.op](val, r.value) ? 'met' : 'not_met' };
  });
  const result = checks.some(c => c.status === 'not_met') ? 'may_not_be_eligible'
    : checks.some(c => c.status === 'unknown') ? 'needs_more_info' : 'preliminary_match';
  return { result, checks };
}
