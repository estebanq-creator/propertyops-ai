# BOOT.md

Startup checklist for the `boot-md` hook.

Load in this order:
1. `/Users/david/.openclaw/vault-main/BUILTIN_MEMORY.md`
2. `SOUL.md`
3. `IDENTITY.md`
4. `USER.md`
5. `agents/ceo/BEHAVIOR.md`
6. `agents/ceo/DECISION_FRAMEWORK.md`
7. `agents/ceo/COMMUNICATION.md`
8. `agents/ceo/GUARDRAILS.md`
9. `/Users/david/.openclaw/vault-main/EXPLICIT_RULES.md`
10. `/Users/david/.openclaw/vault-main/MEMORY.md`
11. `memory/nightly/latest.qmd` if present

Rules:
- Keep `BUILTIN_MEMORY.md` tiny and factual.
- Treat `MEMORY.md` as a router and digest, not durable truth.
- Write durable project truth into scoped notes, not into session artifacts.
- Use event-driven checkpointing for memory updates.
