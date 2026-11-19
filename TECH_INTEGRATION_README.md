# Vedantu Signup Wall: Tech Integration Notes

Standalone React + TypeScript (Vite) build. No backend. Runs independently; designed to drop into Vedantu's platform.

## Run
```bash
cd vedantu-signup
npm install
npm run dev        # http://localhost:5173
npm test           # validation unit tests
npm run build      # typecheck + production build
```

## What it does
Single-screen signup wall collecting: Full name, Mobile (OTP-verified), Email, Grade, Target exam, Board (conditional), State, City, Consent. Inline validation, typo-suggest for email, loading/success states. Styled after Vedantu's existing modal flow (Poppins, coral orange, navy ink, "100% SAFE & SECURE" line). The wordmark is a **text placeholder**: swap for the official logo asset.

## Structure (`src/signup/`)
| File | Role |
|---|---|
| `components/SignupWall.tsx` | Page composition, submit orchestration |
| `components/SignupHeader, TextInput, EmailInput, MobileInput, OTPVerification, SearchableDropdown, GradeDropdown, TargetExamDropdown, BoardDropdown, ConsentCheckbox, SubmitButton, SuccessState, Field, icons` | UI |
| `useSignupForm.ts` | Centralised form state (reducer), touched/errors, submit |
| `validation.ts` | Pure validation, email typo suggestion, payload builder (no UI) |
| `constants.ts` | Grades, exams, boards, board-visibility grades, country codes, policy URLs |
| `services/otpService.ts` | **OTP boundary** (mock + real stub) |
| `services/submitSignup.ts` | **Submit boundary** (replace body) |
| `styles.css` | All styling, CSS variables at top |

## Fields and validation
| Field | Rule |
|---|---|
| Full name (payload key `name`) | Required; whitespace-only rejected; no character restrictions |
| Mobile | +91 default. India: 10 digits, starts 6-9. Other codes: 6-14 digits. Must be OTP-verified. Editing the number or code revokes verification |
| Email | Required; structure only (`a@b.tld`). Typo suggestion (non-blocking) when the domain is 1 edit away from gmail/yahoo/outlook/hotmail/icloud/rediffmail/live/protonmail, e.g. gmial.com, gmal.com, yahho.com, outlok.com |
| Grade | Required; exactly 11 options in the specified order |
| Target exam | Required; 7 options (JEE, NEET, CUET, CAT, Other engg entrance exam, Other, Not decided yet); searchable, clearable |
| Board | Required only when visible; 35 options; searchable; CBSE, ICSE/ISC, IB, IGCSE pinned on top under "Popular boards" |
| State | Required; searchable dropdown of 36 states/UTs (`src/signup/locations.ts`) |
| City | Required; searchable; options depend on State (~4,200 cities from `src/signup/data/india-cities.json`, plus "Other"); cleared when State changes; disabled until State chosen |
| Consent | Required; unchecked by default; Privacy/Terms links |

Dropdowns: type-to-search (punctuation-insensitive, e.g. `jk`, `tn`), Arrow/Home/End/Enter/Esc, ARIA combobox, 44px rows, 16px inputs (no iOS zoom), empty-result state.

## Board visibility
- Shown + mandatory: `8th and below, 9th, 10th, 11th, 12th, Dropper`
- Hidden: `1st year, 2nd year, 3rd year, Final year, Recent grad`
- On switching to a hidden grade, `board` is cleared from state and **omitted** from the payload. Config: `BOARD_GRADES` in `constants.ts`.

## Submission payload
```json
{
  "name": "Student Name",
  "mobile": "+91XXXXXXXXXX",
  "mobile_verified": true,
  "email": "student@example.com",
  "grade": "12th",
  "target_exam": "JEE (Main/Advanced)",
  "board": "CBSE",
  "state": "Karnataka",
  "city": "Bengaluru",
  "consent": true
}
```
`board` key is absent for UG / Recent grad. Built by `buildPayload()`.

## OTP integration (REQUIRED before production)
`services/otpService.ts` exposes `{ sendOtp(fullMobile), verifyOtp(fullMobile, code) }` returning `{ok:true}` or `{ok:false,error}`.
- Default **mock mode**: sends nothing, accepts fixed code `123456`, 5 wrong attempts then lock. The UI shows a "Demo mode" banner. **This is not SMS verification.**
- Production: implement `createRealOtpService()` against Vedantu's existing auth system and set `VITE_OTP_MODE=real` (see `.env.example`). Expiry, rate limiting, attempt limits, and resend throttling must be enforced **server-side**.
- Client-side `mobile_verified: true` must not be trusted; the backend should derive it from its own OTP session/token when receiving the signup.
- OTP length (6) and resend countdown (30s): `OTP_LENGTH`, `OTP_RESEND_SECONDS`.

## Other integration points
1. `submitSignup()`: replace the mock with the real call. No endpoint or contract is assumed.
2. `PRIVACY_URL` / `TERMS_URL` in `constants.ts`: confirm final URLs.
3. Logo: replace text wordmark in `SignupHeader.tsx`.
4. Existing design tokens: map the CSS variables at the top of `styles.css`; font is Poppins via Google Fonts link in `index.html`.
5. Post-success navigation: `SuccessState` is a demo view; replace with the real next step.
6. Embedding as a modal: `SignupWall` renders its own page shell (`.page/.shell/.panel`); use `.card` content only if embedding.

## Assumptions / limitations
- State/City data comes from the open-source `country-state-city` dataset (ISC licence), plus a few common spellings. Names may differ from Vedantu's master (e.g. Gurgaon/Gurugram). Replace `data/india-cities.json` with Vedantu's canonical location data.
- Single-screen form (per brief) rather than the stepwise flow in the user-flow PDF.
- Country list is a short, hand-picked set; confirm with product.
- Email typo suggestions are heuristic and never block submission.
- Right-hand panel copy is placeholder marketing copy with no claims or statistics; Product to approve.
- No analytics, no captcha, no duplicate-lead/server-side validation.
- Accessibility: keyboard and ARIA covered, not audited with a screen reader.
- CTA is greyed until valid; clicking it still reveals errors and focuses the first invalid field.
