# CRYPTOROLL 2.8.0 — Telegram Cloud Profiles

Static Telegram Mini App with a Netlify Function backend and Supabase profile storage.

## Deploy
1. Upload the contents of this folder to the root of the GitHub repository (replace the existing root app files; keep the `netlify/` and `supabase/` folders and `netlify.toml`).
2. In Netlify, connect the same GitHub repository and deploy from branch `main`.
3. Create a Supabase project and run `supabase/schema.sql` in the Supabase SQL Editor.
4. In Netlify → Site configuration → Environment variables, add:
   - `BOT_TOKEN` — token from BotFather (server-side only).
   - `SUPABASE_URL` — Project URL from Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY` — service-role key from Supabase (server-side only; never put it in HTML/JS or GitHub).
   - `ALLOWED_ORIGIN` — `https://steady-jalebi-dfe2d8.netlify.app` (replace if the Netlify site URL changes).
5. Trigger a new deploy after saving the variables.
6. Open the Mini App from the Telegram bot. The server validates Telegram `initData`, loads the player's profile, and stores a first-time local save in Supabase.

## Security and scope
- Never commit `.env` or real credentials.
- Never share the BotFather token or Supabase service-role key in chat.
- `initDataUnsafe` is used only to display the name; server authorization uses signed `initData`.
- RLS is enabled and the table has no public access policies; only the Netlify Function uses the service-role key.
- 2.8.0 provides per-Telegram-user cloud profile snapshot sync and local fallback. It does **not** yet make in-game purchases, sales, mining accrual, rewards, or exchange operations authoritative on the server. Those must be migrated before presenting the economy as cheat-resistant or operating a competitive public game.
