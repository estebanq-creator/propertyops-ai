# PAPERCLIP_RETIRE_OPENCLAW_LOCAL.md

**Purpose:** Safe retirement plan for `~/.paperclip/instances/openclaw-local/`
**Status:** Phase 1 complete; observation window pending
**Date:** April 11, 2026
**Scope:** Paperclip runtime decoupling, secret-path migration, soft retirement, rollback

---

## Current State

The active Paperclip runtime is the `default` instance:

- runtime config: `/Users/david/.paperclip/instances/default/config.json`
- active listener: `127.0.0.1:3100`
- observed process shape:
  - `node ... paperclipai run --instance default`

`openclaw-local` is not the active board runtime, but it is still coupled to the active runtime through the encryption key path:

- active key reference:
  - `/Users/david/.paperclip/instances/default/config.json`
  - `secrets.localEncrypted.keyFilePath = /Users/david/.paperclip/instances/openclaw-local/secrets/master.key`

That historical coupling was the original retirement blocker. It has now been removed: the active `default` instance uses its own secret path at `/Users/david/.paperclip/instances/default/secrets/master.key`.

---

## Retirement Goal

Retire `~/.paperclip/instances/openclaw-local/` as an operational Paperclip instance without breaking:

- active board startup
- encrypted secret access
- Hermes/OpenClaw automations
- operator login/auth flows

The safest strategy is:

1. decouple secrets
2. soft-retire `openclaw-local`
3. observe
4. hard-retire later

---

## Phase 1: Secret Decoupling

### Objective

Move the active `default` instance from the shared key path:

- `/Users/david/.paperclip/instances/openclaw-local/secrets/master.key`

to a default-owned path:

- `/Users/david/.paperclip/instances/default/secrets/master.key`

### Exact Change

Current config fragment in `/Users/david/.paperclip/instances/default/config.json`:

```json
"secrets": {
  "provider": "local_encrypted",
  "strictMode": false,
  "localEncrypted": {
    "keyFilePath": "/Users/david/.paperclip/instances/openclaw-local/secrets/master.key"
  }
}
```

Target fragment:

```json
"secrets": {
  "provider": "local_encrypted",
  "strictMode": false,
  "localEncrypted": {
    "keyFilePath": "/Users/david/.paperclip/instances/default/secrets/master.key"
  }
}
```

### Safe Execution Steps

1. Back up the active config and shared key.
2. Create `default/secrets/`.
3. Copy the current `master.key` into the new `default` secrets directory.
4. Verify the copied key matches the original by checksum.
5. Update `default/config.json` to point to the new key path.
6. Restart the active `default` Paperclip process.
7. Run health and auth verification before touching `openclaw-local`.

### Exact Command Sequence

```bash
mkdir -p /Users/david/.paperclip/backups/2026-04-11-openclaw-local-retirement

cp -p /Users/david/.paperclip/instances/default/config.json \
  /Users/david/.paperclip/backups/2026-04-11-openclaw-local-retirement/default.config.json

cp -p /Users/david/.paperclip/instances/openclaw-local/secrets/master.key \
  /Users/david/.paperclip/backups/2026-04-11-openclaw-local-retirement/openclaw-local.master.key

mkdir -p /Users/david/.paperclip/instances/default/secrets

cp -p /Users/david/.paperclip/instances/openclaw-local/secrets/master.key \
  /Users/david/.paperclip/instances/default/secrets/master.key

shasum -a 256 /Users/david/.paperclip/instances/openclaw-local/secrets/master.key
shasum -a 256 /Users/david/.paperclip/instances/default/secrets/master.key
```

### Config Patch

Change only this path in:

- `/Users/david/.paperclip/instances/default/config.json`

from:

- `/Users/david/.paperclip/instances/openclaw-local/secrets/master.key`

to:

- `/Users/david/.paperclip/instances/default/secrets/master.key`

---

## Restart And Verification

### Active Runtime Shape

At audit time, the active runtime process was:

```bash
node /Users/david/.npm/_npx/.../node_modules/.bin/paperclipai run --instance default
```

### Restart Requirement

After the config change, the active `default` Paperclip process should be restarted so it re-reads:

- `/Users/david/.paperclip/instances/default/config.json`

### Verification Checklist

After restart, verify:

1. Health endpoint is good:

```bash
curl -s http://127.0.0.1:3100/api/health
```

Expected:

- `status: ok`
- `authReady: true`

2. Exact issue lookup still works:

```bash
curl -s -H "Authorization: Bearer <token>" \
  http://127.0.0.1:3100/api/issues/PRO-11
```

3. Company-scoped automation endpoints still work:

```bash
curl -s -H "Authorization: Bearer <token>" \
  http://127.0.0.1:3100/api/companies/edea9103-a49f-487f-901f-05b2753b965d/issues

curl -s -H "Authorization: Bearer <token>" \
  http://127.0.0.1:3100/api/companies/edea9103-a49f-487f-901f-05b2753b965d/agents
```

4. Existing login/session UI still loads.
5. New `default` server logs show clean startup with no decryption or auth failures.

---

## Phase 2: Soft Retirement

Phase 1 is complete. The next active step is soft retirement.

Only after successful decoupling and verification:

1. Mark `openclaw-local` as retired in authority docs.
2. Keep the directory in place for rollback.
3. Stop treating it as a candidate runtime in incident handling.

Suggested archive rename after the observation window starts:

- `/Users/david/.paperclip/instances/_archived-openclaw-local`

Do not rename immediately if any operator habit or script still references the old path.

---

## Phase 3: Observation Window

Observe for 7 days after decoupling.

Suggested observation window start:

- April 11, 2026

Watch for:

- Paperclip startup errors
- auth callback errors
- missing secret / decrypt failures
- operator confusion about active instance
- new references to `openclaw-local` in logs

If the system stays clean, `openclaw-local` can be hard-retired later.

---

## Rollback Plan

If anything breaks after the key-path migration:

1. Stop the `default` Paperclip process.
2. Restore the backed-up config:

```bash
cp -p /Users/david/.paperclip/backups/2026-04-11-openclaw-local-retirement/default.config.json \
  /Users/david/.paperclip/instances/default/config.json
```

3. Restart the `default` Paperclip process.
4. Re-check:

```bash
curl -s http://127.0.0.1:3100/api/health
```

Because the original `openclaw-local` key file remains untouched, rollback is low-risk as long as that directory is not deleted prematurely.

---

## Retirement Decision Gate

`openclaw-local` is safe to retire only when all of the following are true:

- `default/config.json` no longer points into `openclaw-local/`
- the active `default` runtime starts cleanly with its own key path
- Hermes/OpenClaw automation still passes company-scoped API checks
- the observation window passes without decryption/auth regressions

Until hard retirement is complete, `openclaw-local` should be treated as **deprecated, non-authoritative, and retained only for rollback/observation coverage**.
