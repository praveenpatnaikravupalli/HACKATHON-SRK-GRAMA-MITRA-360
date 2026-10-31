import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/common.js';
import { geminiEnabled } from './services/gemini.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: env.clientOrigin.split(','), credentials: false }));
app.use(express.json({ limit: '50kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true }), routes);
app.use((_q, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

connectDB().then(() => app.listen(env.port, () => {
  console.log(`API on http://localhost:${env.port}/api`);
  console.log(geminiEnabled() ? `Gemini: enabled (${env.geminiModel})` : 'Gemini: DISABLED (no GEMINI_API_KEY) - keyword fallback + record-only answers');
})).catch(e => { console.error('Startup failed:', e.message); process.exit(1); });
export default app;
