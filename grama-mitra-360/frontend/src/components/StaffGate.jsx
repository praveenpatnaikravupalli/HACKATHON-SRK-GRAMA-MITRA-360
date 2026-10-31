import { useEffect, useState } from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { api, auth } from '../services/api.js';
// Login wrapper for staff pages. Role is enforced by the backend as well; this is only for the UI.
export default function StaffGate({ roles, children }) {
  const [user, setUser] = useState(undefined);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { if (!auth.token) { setUser(null); return; } api.me().then(setUser).catch(() => { auth.clear(); setUser(null); }); }, []);
  const login = async (e) => {
    e.preventDefault(); setErr('');
    try { const r = await api.login(email, password); auth.set(r.token); setUser(r.user); } catch (x) { setErr(x.offline ? 'No internet.' : x.message); }
  };
  const logout = () => { auth.clear(); setUser(null); };
  if (user === undefined) return <Loader2 className="mx-auto animate-spin" />;
  if (!user) return (
    <form onSubmit={login} className="card mx-auto max-w-sm space-y-4"><h1 className="text-2xl font-bold">Staff login</h1>
      <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required />
      <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
      <button className="btn-primary w-full"><LogIn /> Login</button>{err && <p className="text-red-700" role="alert">{err}</p>}</form>);
  if (roles && !roles.includes(user.role)) return <div className="card"><p className="text-lg">Your account ({user.role}) cannot open this page.</p><button className="btn-ghost mt-3" onClick={logout}>Logout</button></div>;
  return children({ user, logout });
}
