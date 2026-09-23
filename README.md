# Lumen

A small public wall. Members write notes, keep them private, or mark them public. Public notes appear on the wall. Every UTC hour a featured note is chosen from whatever is public.

## Stack
- Next.js
- Supabase Auth + Postgres (`profiles`, `notes`)

## Run
```bash
npm install
npm run dev
```

Create an account at `/login`, write in `/studio`, mark a note public, then watch `/`.
