# Test plan
## Automated
```bash
cd backend && npm test          # eligibility engine, TrustScore levels, scam keywords (9 tests)
npm run seed && npm run seed:demo && npm run dev      # then in another terminal:
npm run evaluate                # 16 utterances from documentation/test-cases.json -> accuracy, coverage, response time
```
`evaluate` needs the backend running with the data seeded. Without a Gemini key it measures the keyword fallback, so run it with a key for a real figure.

## Manual cases
| # | Area | Steps | Pass when |
|---|---|---|---|
| 1 | Standard Telugu voice | /voice, Telugu, say T01 | Text confirmed, correct service, Telugu reply |
| 2 | Colloquial Telugu | T02 | Pension service understood |
| 3 | Hindi | T03, T06 | Correct service/documents |
| 4 | English | T04, T05 | Correct service/documents |
| 5 | Mixed language | T08, T09 | Correct service |
| 6 | Background noise | Play noise while speaking | Wrong text is caught by the "Is this correct? No" step; or assistant asks to repeat |
| 7 | Incorrect recognition | Say something and press No | Nothing is sent; mic restarts |
| 8 | Unverified information | T15 | LOW trust, fixed unverified sentence, human offer, no invented answer |
| 9 | Missing eligibility details | API call with only `age` | `needs_more_info`, never "eligible" |
| 10 | Human handoff | DEMO.md feature 6 | Ticket ID, statuses change in order, agent reply visible to citizen, "human connected" only after Accept |
| 11 | Internet disconnection | Stop backend or go offline | Friendly "needs internet" messages, no crash |
| 12 | Offline cached info | DEMO.md feature 4 | Shell opens, /offline shows records with source and date, queued ticket syncs on reconnect |
| 13 | Security | Call `/api/agent/tickets` and `/api/admin/services` without login, and as agent | 401 and 403 |
| 14 | Consent | Create ticket without ticking consent via curl | 400 |

## Metrics and how to compute
| Metric | How |
|---|---|
| Speech recognition success rate | Per language speak 10 sentences in a quiet room and 10 with noise; success = confirmed text matches what you said. Rate = successes / 10. Record in a table. |
| Correct intent detection | `npm run evaluate`: intent accuracy |
| Verified source coverage | `evaluate`: share of service answers with trust HIGH/MEDIUM; also Admin > Analytics trust counts (target: all records HIGH after human verification) |
| Response time | `evaluate`: average and max ms; the UI also shows ms per answer |
| Human escalation success | Run 5 LOW/handoff cases; success = ticket created with ID and visible to agent (check Admin > Analytics) |
| Offline FAQ availability | Offline mode: open every record in /offline; availability = records that open / total |
