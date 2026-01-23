# ROTA

**ROTA** is a disciplined, plan-first workout app that helps people follow training programs, complete sessions smoothly, and track progress over time.

ROTA is inspired by the concept of *rotation* and structured routines—built with a subtle military “precision and consistency” mindset, while remaining a general-purpose fitness product.

---

## What’s in this repo?
This repository is the home of the **ROTA** product.

- **Mobile app (iOS/Android)**: built with **Expo / React Native**
- **Landing page (Web)**: built with **Next.js**
- **Shared packages**: shared UI, types, and utilities (monorepo)

> Roadmap: A full **web app + admin panel** will be added in a later version.

---

## Key Features (MVP)
- Onboarding to tailor training (goal, experience, training days/week, equipment)
- Ready-made programs (templates)
- Workout session view (sets, reps, rest guidance)
- Simple logging and workout history
- Free vs Premium access model (subscription)
- Beta testing support (TestFlight / Google Play testing / EAS preview)
- Internationalization-ready (English first; Nordic languages planned)

---

## Tech Stack
- **Monorepo**: Turborepo
- **Mobile**: Expo + React Native (TypeScript)
- **Web**: Next.js (TypeScript)
- **Backend**: (planned) Supabase (PostgreSQL) or equivalent
- **Payments**: Apple IAP + Google Play Billing (Stripe planned for web)
- **i18n**: i18next / react-i18next
- **Quality**: Crash reporting + analytics (planned)

> Note: Some components are phased in across versions. See **Roadmap**.

---

## Repository Structure (suggested)
```text
.
├─ apps/
│  ├─ mobile/        # Expo app
│  └─ web/           # Next.js landing (later: web app)
├─ packages/
│  ├─ ui/            # shared UI components
│  ├─ utils/         # shared utilities
│  └─ types/         # shared TypeScript types
├─ docs/             # product + architecture docs
└─ README.md
```

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- pnpm (recommended for monorepos)
- Expo CLI (optional; EAS recommended)

### Install
```bash
pnpm install
```

### Run Mobile (Expo)
```bash
pnpm --filter mobile start
```

### Run Web (Next.js)
```bash
pnpm --filter web dev
```

> If your folder names differ from the suggested structure, adjust the commands accordingly.

---

## Environments & Secrets
Create environment files as needed:

- `apps/mobile/.env`
- `apps/web/.env.local`

Recommended variables (examples):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `STRIPE_PUBLIC_KEY` (web, later)

Never commit secrets. Use `.env.example` templates.

---

## Testing & Beta Distribution

### iOS (TestFlight)
Use Apple TestFlight for distributing beta builds to invited testers.

### Android (Google Play testing)
Use Internal / Closed testing tracks in Google Play Console.

### Expo Preview
During early development you can distribute preview builds via **EAS** or QR codes (depending on your workflow).

### Feedback pipeline (free)
A lightweight, zero-cost approach:
- Google Forms → Google Sheets (structured feedback)
- Trello (triage + backlog)

---

## Internationalization (i18n)
ROTA is built to support multiple languages from day one.

- **MVP**: English
- **V2**: Norwegian, Swedish, Danish

Suggested structure:
```text
locales/
  en/
    common.json
    onboarding.json
  no/
    common.json
  sv/
    common.json
  da/
    common.json
```

---

## Roadmap (high level)
- **MVP**: Mobile app + landing page + subscriptions
- **V1**: Program customization + progression rules + basic analytics
- **V2**: Web app + admin panel (coupons, lifetime access, manual entitlements) + Nordic languages
- **V3**: Integrations (Apple Health, Garmin, etc.) + advanced features

---

## Contributing
Contributions are welcome once the project opens up.

- Create an issue for bugs/ideas
- Use feature branches
- Keep commits small and descriptive

---

## License
TBD.

---

## Contact
If you want to collaborate, partner, or join the beta: open an issue or reach out via the project contact channels.
