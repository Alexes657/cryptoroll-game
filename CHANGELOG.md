# CRYPTOROLL changelog

## 2.8.0 — Telegram Cloud Profiles (first backend phase)
- Added Netlify Function endpoint for Telegram-authenticated profile load/save.
- Added Telegram Web App `initData` HMAC validation on the server with a 24-hour freshness window.
- Added Supabase PostgreSQL profile schema with Row Level Security enabled and no public table policies.
- Added cloud restore on Mini App startup and debounced cloud snapshots after local game saves.
- Existing localStorage save remains as a fallback and first-login migration source.
- Bot token and Supabase service-role key are server-only Netlify environment variables.
- This phase syncs profile snapshots; game economy actions are still calculated in the client and are NOT yet server-authoritative. Do not treat this as anti-cheat or a real-money system.
