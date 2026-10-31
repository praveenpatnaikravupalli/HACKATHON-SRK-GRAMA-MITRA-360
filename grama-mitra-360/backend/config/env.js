import 'dotenv/config';
export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grama_mitra_360',
  jwtSecret: process.env.JWT_SECRET || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  geminiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@gramamitra.local',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  staleDays: Number(process.env.VERIFICATION_STALE_DAYS || 180),
};
if (env.jwtSecret.length < 16) throw new Error('Set JWT_SECRET (16+ chars) in backend/.env');
