# Verifyit — Standalone Lead Verification Tool

A public, no-login lead verification tool built with Next.js (App Router), TypeScript, Tailwind, and shadcn/ui-style components.

## Zero-data storage
- No database persistence for lead data.
- Analyses are kept only in an in-memory, TTL-based store to enable export/email.
- Users can delete an analysis immediately from the results page.
- Default TTL is 24 hours.

> Note: In-memory storage is best-effort (suitable for demos). For production/serverless, replace with Redis (e.g. Upstash) using the same `lib/session-store.ts` interface.

## Environment variables
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required:
- `SENDGRID_API_KEY`
- `NEXT_PUBLIC_TAGGLE_URL`

Optional:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Development
```bash
npm install
npm run dev
```

## Scraping note
Scraping is implemented as best-effort, real-time HTTP scraping with graceful degradation. Some platforms may block automated access; when that happens, the tool returns low-confidence empty signals rather than failing.
