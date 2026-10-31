import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
export const requireAuth = (roles = []) => async (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in.' });
  try {
    const p = jwt.verify(token, env.jwtSecret);
    const u = await User.findById(p.sub);
    if (!u || !u.active) return res.status(401).json({ error: 'Account not active.' });
    if (roles.length && !roles.includes(u.role)) return res.status(403).json({ error: 'Not allowed.' });
    req.user = u; next();
  } catch { res.status(401).json({ error: 'Session expired. Please log in again.' }); }
};
