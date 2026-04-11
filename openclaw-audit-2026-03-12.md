# OpenClaw Audit Report - cal-home
**Date:** Friday, March 13, 2026
**Overall Health:** ⚠️  Fair (Stability risk from context bloat and local model timeouts)

## Executive Summary
1.  **Context Explosion (Critical):** `AGENTS.md` in `Cal-Life-Repo` is duplicated 25 times, resulting in a 235K payload. This is injected on **every** turn for the `cal` agent and cron jobs using that workspace.
2.  **Model Reliability (High):** Primary model `ollama/mistral-nemo:latest` is timing out. Fallbacks are currently handling the load, which increases cost and latency.
3.  **Config Drift (Medium):** `bootstrapMaxChars` is set to 250,000 (12.5x the default), which allowed the context bloat to go unnoticed.
4.  **Session Hygiene (Medium):** One `vicky` cron session has reached 1.2M tokens, exceeding the context window and causing performance degradation.

## Findings & Root Cause Analysis
| Finding | Severity | Root Cause |
|---|---|---|
| 235K `AGENTS.md` | Critical | Likely a recursive tool use (self-append/write) by an agent. |
| Ollama Timeouts | High | Likely macOS LaunchAgent sandbox restriction or localhost discovery issue. |
| 1.2M Token Session | High | Lack of context pruning and excessive bootstrap file size. |
| Unknown Tool Entries | Low | Stale tools profile (coding) containing decommissioned tools (`apply_patch`, `cron`, `image`). |

## Priority 1: Context Discipline (Immediate Savings: 90%+)
### 1.1 Deduplicate `AGENTS.md`
The file `/Users/david/Documents/Cal-Life-Repo/AGENTS.md` must be cleaned down to a single instance.
**Estimated Savings:** ~220,000 tokens per turn (~94% reduction).

### 1.2 Tighten Bootstrap Limits
Reset `bootstrapMaxChars` and `bootstrapTotalMaxChars` to reasonable levels to prevent future recursion.
```bash
openclaw config set agents.defaults.bootstrapMaxChars 30000
openclaw config set agents.defaults.bootstrapTotalMaxChars 100000
```

### 1.3 Enable Light Context for Cron
All cron jobs currently load the full (bloated) bootstrap. Switching to `--light-context` will bypass `AGENTS.md`, `SOUL.md`, etc., for automated runs.
**Estimated Savings:** 5-10K tokens per cron run.

## Priority 2: Model Reliability & Cost
### 2.1 Shift to Stable T1/T2 Primary
While Ollama is failing, use `google/gemini-3-flash-preview` as the primary for `vicky` and defaults. It is cheaper and more stable than the current OpenRouter fallback.
```bash
openclaw models set google/gemini-3-flash-preview
```

### 2.2 Fix Ollama Connectivity
Test if setting `baseUrl: "http://127.0.0.1:11434"` and ensuring the `OLLAMA_HOST` env var is in the LaunchAgent plist fixes the probe timeouts.

## Priority 3: Session & Security Hygiene
### 3.1 Prune Bloated Sessions
Clear the 1.2M token session and any other sessions over 200K tokens.
```bash
openclaw sessions cleanup --enforce
```

### 3.2 Fix Telegram AllowList
Correct the `allowFrom` entry for group IDs in `openclaw.json` (ensure negative IDs for groups are in the correct place).

## Recommended Plan - Next Steps
1.  **Deduplicate AGENTS.md** (I can do this now if you approve).
2.  **Update OpenClaw config** with new bootstrap limits and primary model.
3.  **Apply `lightContext`** to all cron jobs.
4.  **Re-probe** providers to verify stability.
