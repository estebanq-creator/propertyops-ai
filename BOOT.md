# BOOT.md

Startup checklist for the `boot-md` hook.

Load in this order:
1. `/Users/david/.openclaw/vault-main/BUILTIN_MEMORY.md`
2. `SOUL.md`
3. `USER.md`
4. `/Users/david/.openclaw/vault-main/EXPLICIT_RULES.md`
5. `/Users/david/.openclaw/vault-main/MEMORY.md`
6. `/Users/david/.openclaw/vault-main/memory/Memory-Architecture.qmd`
7. `/Users/david/.openclaw/vault-main/memory/nightly/latest.qmd` if present

Rules:
- Keep `BUILTIN_MEMORY.md` tiny and factual.
- Treat `MEMORY.md` as a router and digest, not durable truth.
- Prefer scoped notes under `/Users/david/.openclaw/vault-main/memory/` for real memory writes.
- Use event-driven checkpointing, not raw tool-call count, for durable updates.
