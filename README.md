# env

Personal API-key vault. Sign in, create projects, store keys once, access them anywhere after OTP confirmation.

> Status: early WIP, open-source. No stable release yet. Docs describe intended behavior, not all implemented.

## What it does

- Sign in with Google or Email (betterAuth)
- Create a project (e.g. `my-saas`, `client-x`)
- Add keys under a configure name, three ways:
  1. Manual entry: `name` + `value`
  2. File import: `.env`, `.txt`, `.md`
  3. Paste as markdown/text with `=` separation
- Keys are hashed before storage in Postgres
- Bring your own DB: connect your Postgres URL per workspace
- OTP re-confirmation to registered email every 5 min to view/use keys

Paste format:

```text
STRIPE_KEY=sk_live_xxx
OPENAI_KEY=sk-xxx
# lines starting with # are ignored
# empty lines are ignored
```

## Stack — Fact

- Backend: Node.js
- Frontend: React
- Styling: Tailwind, black and white only
- Auth: betterAuth (Google + Email sign-in)
- DB: Postgres
- Hosting / mail provider: [TBD](https://sendlib.samueltuoyo.com/)

No framework beyond this is confirmed. No API routes, tables, or components are finalized — anything not in this repo is planned, not fact.

## How it works (intended)

1. Sign in (Google / Email)
2. Create project
3. Add keys via form, file import, or paste
4. Keys are hashed + stored against project + user
5. To reveal/copy a key: request OTP -> confirm from registered email -> 5 min access window expires -> re-confirm

## Dashboard

- `/login` — sign in
- `/dashboard` — project list
- `/dashboard/:projectId` — keys list, add/import, OTP gate for reveal

Routes above are planned. Do not rely on them until implemented.

## Security model

- Recommended Architecture for an Environment Vault

1. Database Storage
   Store the ciphertext, initialization vector (IV), and authentication tag in your database. Never store plain text keys.

2. Access Control & Authorization (RBAC)
   To restrict key access strictly to passed security checks or specific company roles:

Implement Role-Based Access Control (RBAC) on your backend endpoints (e.g., only users with view_secrets permission can trigger decryption).

Log every view/copy action in an Audit Log (tracking user_id, key_id, timestamp, and ip_address).

- OTP: emailed code, short expiry, rate-limited, required every 5 min for sensitive actions.
- Never commit, log, or echo real keys, tokens, or connection strings.

## Getting started

Planned:

```bash
npm install
cp .env.example .env
# set DATABASE_URL, BETTER_AUTH_SECRET, EMAIL_PROVIDER_KEY
npm run dev
```

This block is a placeholder. It will be verified once code lands.

## Project structure (planned)

```text
/
├── client/          # React + Tailwind dashboard
├── server/          # Node.js + betterAuth + Postgres
├── README.md
└── rules.md
```

No files above exist yet except docs. Structure is a proposal, not fact.

## Roadmap

- [ ] Auth (betterAuth Google + Email)
- [ ] Project CRUD
- [ ] Key add: manual / file / paste with `=` parser
- [ ] Hash vs encryption decision + implementation
- [ ] OTP every 5 min flow
- [ ] Bring-your-own Postgres URL per workspace
- [ ] Black/white UI pass, loading/empty/error states, keyboard nav

## Contributing

Issues and PRs welcome. Keep changes minimal, follow existing architecture once it lands, no refactors outside task scope. Never push directly — open a PR.

## License

TBD. If you need one now, MIT is recommended. Add `LICENSE` file when decided.

## Links

- `readmi.md` (legacy, 7-line spec) -> superseded by this file
- `rules.md` — internal dev rules, not part of public API
