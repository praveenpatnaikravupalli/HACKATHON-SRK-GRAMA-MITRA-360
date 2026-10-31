import { useCallback, useEffect, useRef, useState } from 'react';
const LOCALE = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };
const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
// Browser Web Speech API (development fallback). Chrome's recogniser needs internet.
// For production Indian-language accuracy, swap listen()/speak() for Bhashini ASR/TTS (needs approved credentials).
export function useSpeech(lang) {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  useEffect(() => {
    if (!('speechSynthesis' in window)) { setVoiceAvailable(false); return; }
    const check = () => { const v = speechSynthesis.getVoices(); setVoiceAvailable(v.length === 0 || v.some(x => x.lang.toLowerCase().startsWith(lang))); };
    check(); speechSynthesis.addEventListener('voiceschanged', check);
    return () => speechSynthesis.removeEventListener('voiceschanged', check);
  }, [lang]);
  const listen = useCallback(({ onResult, onError }) => {
    if (!SR) { onError?.('unsupported'); return; }
    const r = new SR(); r.lang = LOCALE[lang]; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = (e) => { const a = e.results[0][0]; onResult(a.transcript, a.confidence); };
    r.onerror = (e) => onError?.(e.error);
    r.onend = () => setListening(false);
    recRef.current = r; setListening(true);
    try { r.start(); } catch { setListening(false); }
  }, [lang]);
  const stop = useCallback(() => { recRef.current?.stop(); setListening(false); }, []);
  const speak = useCallback((text, slow = false) => {
    if (!('speechSynthesis' in window) || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LOCALE[lang]; u.rate = slow ? 0.65 : 0.95;
    const v = speechSynthesis.getVoices().find(x => x.lang.toLowerCase().startsWith(lang));
    if (v) u.voice = v;
    u.onstart = () => setSpeaking(true); u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
    speechSynthesis.speak(u);
  }, [lang]);
  const silence = useCallback(() => { speechSynthesis?.cancel(); setSpeaking(false); }, []);
  return { supported: !!SR, listening, speaking, voiceAvailable, listen, stop, speak, silence };
}
