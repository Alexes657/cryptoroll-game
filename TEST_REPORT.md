# CRYPTOROLL 2.8.0 test report

- `node --check app.js`: passed.
- Netlify Function module syntax check: passed.
- Verified the Telegram Web App signature algorithm implementation uses the `WebAppData` HMAC key derivation, constant-time hash comparison, and auth-date freshness validation.
- Verified profile writes are keyed by the server-verified Telegram user ID, not a client-supplied ID.
- Verified Supabase service-role credentials are read only from server environment variables and are not exposed to browser code.
- Verified the Supabase schema enables RLS and defines no anon/authenticated policies.
- Verified cloud sync is optional and falls back to the existing local save if backend configuration is absent or unavailable.
- ZIP integrity checked.
- Not tested against a live Supabase project, live Netlify deployment, or Telegram WebView. User must configure environment variables and execute the SQL schema before cloud sync can become active.
- Important limitation: this version syncs client-generated game-state snapshots. It does not yet make mining, purchases, sales, rewards, or market operations server-authoritative.
