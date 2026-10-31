# Demo guide: sample values for every feature
Setup: `npm run seed && npm run seed:demo` (backend), then open http://localhost:5173. Staff logins: agent `agent@gramamitra.local` / `DemoAgent@123456`; admin = values from your `.env`.
Demo data is clearly marked: records start unverified (MEDIUM). `seed:demo` marks only **scam-safety** as verified (HIGH). **Before presenting, open cybercrime.gov.in and confirm the 1930 helpline yourself**, and check the pension and ration records against their official pages if you want to show them as verified.

## Feature 1: Dialect Intelligence (page /voice, language Telugu)
| Say / type | Expected |
|---|---|
| అన్నా నాకు పింఛన్ ఎట్లా వస్తది? (Telangana colloquial) | Understood as pension info, Telugu answer, source shown, MEDIUM badge |
| నాకు వృద్ధాప్య పెన్షన్ ఎలా వస్తుంది? (standard) | Same service |
| Pension కి apply ఎలా చేయాలి? (Telugu-English) | Same service |
| (Hindi) मुझे वृद्धावस्था पेंशन कैसे मिलेगी? / Mujhe scholarship ka form kaise bharna hai | Pension / scholarship record in Hindi |
| hmm uh the the | "I did not understand clearly. Please say it again." plus a retry button |
Also show: Repeat button, Slow speech toggle, "Is this correct?" confirmation after every spoken input.

## Feature 2: Eligibility (/eligibility/old-age-pension)
| Answers | Result |
|---|---|
| Age 68, BPL: Yes, State: Telangana, Other pension: No | "Possible match - this is NOT an approval"; state shown as "needs verification" |
| Age 45, BPL: Yes, State: Telangana, Other pension: No | "You may not be eligible" (age rule not met) |
| Age 68, BPL: Yes, Other pension: Yes | "You may not be eligible" |
API demo for missing info: `curl -X POST localhost:5000/api/eligibility/old-age-pension/check -H "Content-Type: application/json" -d '{"answers":{"age":70}}'` gives `needs_more_info`.

## Feature 3: Document assistant (/documents/ration-card)
Tick "Identity proof" and "Passport size photos", press **Find missing documents**: Address proof and Income certificate are marked missing with how to obtain them. Press **Read aloud** and **Explain in my language**. Try /documents/scholarship and /documents/old-age-pension too.

## Feature 4: Offline (use `npm run build && npm run preview`)
1. Open /app online, wait ~5 s (verified bundle downloads; check /offline shows "Saved on this device").
2. DevTools > Network > **Offline**, reload: the app still opens, badge shows Offline.
3. /offline: search "ration" or tap a service: checklist, procedure, source and date show without internet; Read aloud works if the device has a voice.
4. Press **Human support**, tick consent, send: "Saved on this phone...". Header shows "1 pending".
5. Switch back **Online**: a banner shows the new ticket ID automatically.

## Feature 5: TrustScore (/trust)
| Question | Level shown |
|---|---|
| Scam safety record | HIGH (verified today by admin) |
| Old age pension / ration / scholarship / health | MEDIUM (approved source, needs extra check) |
| "How do I get the free scooter scheme?" | LOW: assistant refuses to answer: "I could not verify this information. Would you like to speak with a human support representative?" |
In Admin > Services press **Verify now** on pension: it flips to HIGH. Edit it and save: it drops back to MEDIUM (edits must be re-verified).

## Feature 6: Human handoff
1. Ask the free-scooter question, press **Human support**, tick consent, send. Note the ticket ID (shown), status Pending: "No support person has accepted it yet."
2. Open /staff, login as the demo agent. Seeded tickets: GM-DEMO0001 (Pending), 0002 (Assigned), 0003 (In Progress), 0004 (Resolved).
3. Accept your new ticket, mark In Progress, send a response, mark Resolved.
4. Back in the citizen dialog, enter the ticket ID and press **Check status**: the agent's reply appears and "A support person has accepted this request."

## Feature 7: Safety (/safety, or say it on /voice)
Type: "Someone called me and asked for money to approve my pension. Is this genuine?" Expected: warning signs, never share OTP, no unofficial payments, check official sites, helpline 1930 / cybercrime.gov.in, with no accusation against the caller. Telugu: ఎవరో ఫోన్ చేసి పింఛన్ కోసం డబ్బులు అడిగారు, ఇది నిజమేనా?

## Extras to show
High-contrast and large-text buttons, language switch, recently used services on the dashboard, admin analytics, `npm run evaluate`.

## Suggested 5-minute order
Landing -> Telugu voice question -> eligibility pass and fail -> documents missing list -> LOW trust refusal -> ticket -> agent reply -> offline toggle -> trust dashboard.
