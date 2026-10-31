import { ZodError } from 'zod';
export const ah = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const validate = (schema, where = 'body') => (req, res, next) => {
  const r = schema.safeParse(req[where]);
  if (!r.success) return res.status(400).json({ error: 'Invalid input', details: r.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) });
  req[where] = r.data; next();
};
export const errorHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) return res.status(400).json({ error: 'Invalid input' });
  if (err.code === 11000) return res.status(409).json({ error: 'Already exists.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
};
