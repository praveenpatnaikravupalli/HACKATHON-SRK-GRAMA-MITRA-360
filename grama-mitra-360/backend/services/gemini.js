import { env } from '../config/env.js';
export class GeminiUnavailable extends Error {}
export const geminiEnabled = () => Boolean(env.geminiKey);
// Real call to Google Gemini REST API (needs internet + GEMINI_API_KEY). Key stays on the server.
export async function generate({ system, prompt, json = false }) {
  if (!env.geminiKey) throw new GeminiUnavailable('GEMINI_API_KEY not set');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.geminiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 700, ...(json ? { responseMimeType: 'application/json' } : {}) },
    }),
    signal: AbortSignal.timeout(20000),
  }).catch(e => { throw new GeminiUnavailable(e.message); });
  if (!res.ok) throw new GeminiUnavailable(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim();
  if (!text) throw new GeminiUnavailable('Empty Gemini response');
  return json ? JSON.parse(text.replace(/```json|```/g, '')) : text;
}
