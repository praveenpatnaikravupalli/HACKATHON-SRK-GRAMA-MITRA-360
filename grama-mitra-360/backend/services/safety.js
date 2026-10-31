// Keyword pre-check (Telugu / Hindi / English / romanised). Only routes to safety guidance; never accuses anyone.
const WORDS = ['otp', 'ఓటీపీ', 'ओटीपी', 'password', 'పాస్‌వర్డ్', 'पासवर्ड', 'scam', 'fraud', 'fake call', 'cheat',
  'మోస', 'ధోఖా', 'धोखा', 'ठगी', 'फ्रॉड', 'asked for money', 'ask for money', 'పైసలు అడిగ', 'డబ్బులు అడిగ', 'पैसे मांग', 'पैसे माँग',
  'bribe', 'లంచం', 'रिश्वत', 'link click', 'lottery', 'kyc update', 'blocked'];
export const looksLikeScam = (t = '') => { const s = t.toLowerCase(); return WORDS.some(w => s.includes(w.toLowerCase())); };
