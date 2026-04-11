# MODEL_AND_ROUTING.md

**Purpose:** Models in use, provider setup, fallback logic, task routing logic, aliases and adapters.
**Scope:** OpenClaw model config, Hermes config.yaml, per-agent model assignments.
**Key Files Referenced:** `~/.openclaw/openclaw.json` (models section), `~/.hermes/config.yaml`

---

## Model Providers

### Provider 1: Ollama (via Ollama.com cloud)
- **Base URL:** `https://ollama.com` (OpenClaw) / `https://ollama.com/v1` (Hermes)
- **API style:** Ollama-compatible (OpenClaw); OpenAI Chat Completions (Hermes)
- **Auth:** API key via env `OLLAMA_API_KEY` (OpenClaw); Bearer token hardcoded in `openclaw.json` headers section
- **Role:** PRIMARY model provider for almost all agents

Available models (as registered in `openclaw.json`):

| Model ID | Name | Input | Notes |
|----------|------|-------|-------|
| `glm-5:cloud` | GLM-5 Cloud | text | System default fallback model |
| `qwen3.5:cloud` | Qwen3.5 Cloud | text | Cal primary |
| `qwen3.5:397b-cloud` | Qwen3.5 397B Cloud | text | Hermes primary, most capable |
| `qwen3.5:35b-cloud` | Qwen3.5 35B Cloud | text | |
| `qwen3.5:27b-cloud` | Qwen3.5 27B Cloud | text | |
| `qwen3.5:9b-cloud` | Qwen3.5 9B Cloud | text | |
| `qwen3-coder:480b-cloud` | Qwen3 Coder 480B Cloud | text | |
| `qwen3-vl:32b-cloud` | Qwen3-VL 32B Cloud | text, image | Laura primary (vision/document) |
| `qwen3-vl:8b-cloud` | Qwen3-VL 8B Cloud | text, image | |
| `gpt-oss:20b-cloud` | GPT-OSS 20B Cloud | text | Vicky/Tony primary; compaction model |
| `devstral-2:123b-cloud` | Devstral 2 123B Cloud | text | codegen primary |
| `kimi-k2.5:cloud` | Kimi K2.5 Cloud | text | |

### Provider 2: OpenRouter
- **Base URL:** `https://openrouter.ai/api/v1`
- **API style:** OpenAI completions
- **Auth:** `OPENROUTER_API_KEY` env var
- **Role:** Secondary fallback for most agents

Available models:

| Model ID | Name | Notes |
|----------|------|-------|
| `google/gemini-2.0-flash-exp:free` | Gemini 2.0 Flash Exp (Free) | Free tier |
| `google/gemini-2.0-flash-001` | Gemini 2.0 Flash | Standard fallback |

### Provider 3: Groq
- **Auth:** `GROQ_API_KEY` env var (via `groq:default` profile)
- **Role:** Audio/STT only
- **Active model:** `whisper-large-v3-turbo` (for audio transcription)

### Provider 4: OpenAI-Codex
- **Auth:** OAuth via `openai-codex:default` profile
- **Role:** Mentioned in comments as a fallback option; Leo agent reportedly used this provider
- **Status:** Listed in auth profiles but no model entries in `openclaw.json`. May be active via separate Codex app integration.

### Provider 5: Nomic (local Ollama for embeddings)
- **Base URL:** `http://127.0.0.1:11434` (local Ollama instance)
- **Model:** `nomic-embed-text`
- **Role:** Memory search / vector embeddings
- **Notes:** Used by OpenClaw's memory search system with SQLite vector store via `sqlite-vec-darwin-arm64/vec0.dylib`

---

## Model Routing — Per Agent

### OpenClaw Routing (from `openclaw.json`)

| Agent | Primary Model | Fallback 1 | Fallback 2 |
|-------|--------------|-----------|-----------|
| **hermes** | `ollama/qwen3.5:397b-cloud` | `ollama/gpt-oss:20b-cloud` | `openrouter/google/gemini-2.0-flash-001` |
| **Cal** | `ollama/qwen3.5:cloud` | `ollama/glm-5:cloud` | `openrouter/google/gemini-2.0-flash-001` |
| **vicky** | `ollama/gpt-oss:20b-cloud` | `ollama/glm-5:cloud` | `openrouter/google/gemini-2.0-flash-001` |
| **laura** | `ollama/qwen3-vl:32b-cloud` | `openrouter/google/gemini-2.0-flash-001` | `ollama/qwen3.5:397b-cloud` |
| **tony** | `ollama/gpt-oss:20b-cloud` | `ollama/qwen3.5:397b-cloud` | `openrouter/google/gemini-2.0-flash-001` |
| **codegen** | `ollama/devstral-2:123b-cloud` | `ollama/qwen3.5:397b-cloud` | `openrouter/google/gemini-2.0-flash-001` |
| **prodeng, qa, revenue, ops, intel, outbound-sales** | `ollama/qwen3.5:397b-cloud` | `ollama/gpt-oss:20b-cloud` | `openrouter/google/gemini-2.0-flash-001` |
| **[system default]** | `ollama/glm-5:cloud` | `openrouter/google/gemini-2.5-flash-lite` | — |

**Pattern:** All agents fall back to Gemini 2.0 Flash (OpenRouter) as last resort. Ollama.com is primary for everything.

### System Models (not per-agent tasks)

| Purpose | Model |
|---------|-------|
| Context compaction | `ollama/gpt-oss:20b-cloud` |
| Heartbeat (Cal) | `ollama/glm-5:cloud` (lightContext) |
| Heartbeat (Vicky) | `ollama/glm-5:cloud` (lightContext) |
| Memory search embeddings | `nomic-embed-text` (local Ollama:11434) |
| Audio transcription (STT) | `groq/whisper-large-v3-turbo` |

### Hermes App Routing (from `~/.hermes/config.yaml`)

| Setting | Value |
|---------|-------|
| Default model | `qwen3.5:cloud` |
| Provider | `custom` (Ollama.com) |
| Smart routing | `disabled` |
| Fallback providers | **none** |
| Vision auxiliary | `auto` (provider not configured) |
| Compression model | `auto` (provider not configured) |

The Hermes app has no fallback configured. This is a reliability gap.

---

## Fallback Trigger Conditions

From `~/.hermes/config.yaml` comments (describes the intent for fallback, even though not configured):
> Triggers on rate limits (429), overload (529), service errors (503), or connection failures.

In OpenClaw, fallbacks are used in the same error conditions. The fallback chain is tried in order until one succeeds.

---

## Routing Architecture

### Message-Level Routing
Channel and account → Agent binding (defined in `openclaw.json` `bindings` section). This is static configuration — no dynamic routing based on content.

### Cron-Level Routing
Each cron job directly names an `agentId`. No dynamic routing for cron.

### Agent-to-Agent Routing
Agents can message each other if both are in the `agentToAgent.allow` list. The mechanism is internal to OpenClaw. Currently this may be administratively disabled (see Hermes MEMORY.md note).

### Heavy Execution Routing (Convention)
Defined in `vault-main/AGENTS.md` (Cal operating model):
- Cal handles: planning, scoping, inspection, coordination, review
- Codex handles: build, implement, refactor, debug, patch, tests, inspect-and-edit

When Cal identifies a coding task, it prepares a "Codex-ready handoff" and routes execution to Codex. This is a human convention enforced by behavioral guidance, not a system-level API call.

---

## Model Selection Rationale (Inferred)

| Model | Why Used |
|-------|---------|
| `qwen3.5:397b-cloud` | Largest, most capable Qwen3.5 — used for CEO-level decisions |
| `qwen3.5:cloud` | General capability, Cal's primary |
| `qwen3-vl:32b-cloud` | Vision capability — needed for Laura's document forensics |
| `devstral-2:123b-cloud` | Code-specialized model — used for codegen |
| `gpt-oss:20b-cloud` | Efficient general model — used for operational agents (tony, vicky) |
| `glm-5:cloud` | Lightweight — used as system default and heartbeat model |
| `nomic-embed-text` | Embedding model — memory search |

---

## Smart Model Routing

**OpenClaw:** Registered model pool (`agents.defaults.models`) includes all Ollama models — any can be selected per-agent.

**Smart routing (Hermes config):** Disabled. The commented-out config shows it could route short messages (<160 chars / <28 words) to a "cheap model" and complex messages to primary. Not active.

---

## Open Questions / Ambiguities

- The hardcoded Bearer token in `openclaw.json` under `models.providers.ollama.headers` (`Authorization: Bearer 05d49b68...`) is a separate credential from `OLLAMA_API_KEY`. It's unclear if this is redundant or a different auth path.
- `Leo` agent reportedly uses `openai-codex/gpt-5.4` but this model/provider is not in `openclaw.json`'s model list. Leo may be configured separately or the model reference may be stale.
- The `openai-codex:default` OAuth profile in `openclaw.json` has no associated models registered. If Leo or Codex uses this, the config path is unclear.
- `groq:default` profile is listed but the Groq API key env var (`GROQ_API_KEY`) is not in the secrets allowlist — only `GROQ_API_KEY`-adjacent vars. Confirm if Groq is active.
- All model costs are set to `0` in the OpenClaw config — cost tracking appears disabled or using a free tier arrangement.
