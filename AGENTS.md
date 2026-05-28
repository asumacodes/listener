<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Architecture

**Hooks orchestrate, lib executes.**

- `hooks/` — React state and lifecycle; decide *when*; call `lib/` functions.
- `lib/` — I/O and pure helpers (Supabase, fetch, audio MIME, errors); no React; functions not repositories.
- `screens/` + `components/` — presentation only; no business logic.

See `.cursor/rules/hooks-orchestrate-lib-executes.mdc` for full conventions.
