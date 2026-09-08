# Production fixes

- Atomic daily deep-search usage is implemented in Supabase via `consume_deep_search`.
- Production deployment must be verified after every backend change.
- Do not treat feature wiring as end-to-end verification.
- Use the WHATWG `URL` API for newly written URL construction.
- Signup now uses the server-side Supabase Admin API when available, so normal account creation does not consume the built-in confirmation-email quota.
- Auth overlay buttons are delegated through the real auth bridge so Create account, Sign in, and Demo cannot be broken by legacy inline handlers.
- Production auth flow is pinned to the latest real-session implementation before declaring signup, login, and demo fixed.
