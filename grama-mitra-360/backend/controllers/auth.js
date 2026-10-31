import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
export async function login(req, res) {
  const u = await User.findOne({ email: req.body.email });
  const ok = u && u.active && await bcrypt.compare(req.body.password, u.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Wrong email or password.' });
  const token = jwt.sign({ sub: u.id, role: u.role }, env.jwtSecret, { expiresIn: '8h' });
  res.json({ token, user: { id: u.id, name: u.name, role: u.role } });
}
export const me = (req, res) => res.json({ id: req.user.id, name: req.user.name, role: req.user.role });
