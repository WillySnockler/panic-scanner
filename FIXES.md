# Production fixes

- Atomic daily deep-search usage is implemented in Supabase via `consume_deep_search`.
- Production deployment must be verified after every backend change.
- Do not treat feature wiring as end-to-end verification.
- Use the WHATWG `URL` API for newly written URL construction.
