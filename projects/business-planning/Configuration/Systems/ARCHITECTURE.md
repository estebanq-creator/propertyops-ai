# ARCHITECTURE.md

Date: 2026-04-10
Purpose: observed system architecture documentation
Scope: OpenClaw, Hermes, Paperclip, Codex, and adjacent control surfaces as observed on the live workstation

## Reading Guide

This document is primarily an observed current state map. It is not a claim that every component is finalized, unified, or production hardened.

Use it for:
- understanding system layers and boundaries
- locating runtime responsibilities
- identifying where control surfaces live today
- spotting ambiguities that still need operational resolution

Do not use it as the sole authority for:
- security guarantees
- production readiness claims
- compliance posture
- unresolved behavioral conflicts

---

## Architectural Layers

```
┌──────────────────────────────────────────────────────┐
│                 HUMAN INTERFACE LAYER                │
│   Telegram (3 bots) · Discord · Webchat              │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│                  CONTROL PLANE                       │
│             OpenClaw Runtime                         │
│  ┌─────────────────────────────────────────────┐    │
│  │  Gateway (ws://127.0.0.1:18789)             │    │
│  │  Router (channel + account bindings)        │    │
│  │  Cron Scheduler (jobs.json)                 │    │
│  │  Hook System (boot-md, command-logger,      │    │
│  │               session-memory)               │    │
│  │  Session Manager                            │    │
│  │  Delivery Queue                             │    │
│  │  Plugin Host (opik-openclaw, acpx)          │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│                  AGENT LAYER                         │
│                                                      │
│  workspace-main              workspace-hermes        │
│  ┌──────────────┐           ┌──────────────────┐    │
│  │ Cal          │           │ hermes (CEO)      │    │
│  │ (operator)   │           │ laura (forensic)  │    │
│  └──────────────┘           │ tony (ops)        │    │
│                             │ prodeng, qa       │    │
│  workspace-vicky            │ revenue, ops      │    │
│  ┌──────────────┐           │ intel, codegen    │    │
│  │ Vicky        │           │ outbound-sales    │    │
│  │ (personal    │           └──────────────────┘    │
│  │  support)    │                                    │
│  └──────────────┘                                    │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│                EXECUTION LAYER                       │
│  Model Providers                                     │
│  ┌──────────────┬──────────────┬──────────────┐     │
│  │ Ollama.com   │ OpenRouter   │ Groq         │     │
│  │ (primary)    │ (fallback)   │ (audio/STT)  │     │
│  └──────────────┴──────────────┴──────────────┘     │
│                                                      │
│  Codex (heavy coding execution)                      │
│  Terminal (local, Docker-capable)                    │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│                  MEMORY LAYER                        │
│  vault-main/ (canonical durable memory)              │
│  workspace-*/memory/ (runtime + daily notes)         │
│  SQLite vector store (nomic-embed-text via Ollama)   │
│  state.db (Hermes), logs_1.sqlite (Codex)            │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│             EXTERNAL INTEGRATIONS                    │
│  Paperclip API (http://127.0.0.1:3100/api)           │
│  NYC 311 portal (web fetch cron)                     │
│  Strava (health data)                                │
│  Vercel (control-panel deployment)                   │
│  Tailscale (secure tunnel / network boundary)        │
└──────────────────────────────────────────────────────┘
```

---

## Key Interpretive Notes

1. This architecture reflects live operational reality, including interim tools and fallback surfaces.
2. Some control surfaces are split across multiple apps.
3. Some behaviors are convention driven rather than strongly enforced by one central system.
4. A few ambiguities remain explicitly unresolved and are listed later in this document.

---

## OpenClaw Control Plane Detail

### Gateway
- Protocol: WebSocket and HTTP
- Bind: loopback only at 127.0.0.1:18789
- Auth: token from file at `~/.openclaw/credentials/gateway-token.txt`
- Control UI allowed origins: localhost and 127.0.0.1
- Node identity: new-node-123

This remains the primary runtime ingress for tool and routing behavior.

### Router and Bindings
Agent routing is defined in `openclaw.json` under `bindings`.

Observed routing:

| Channel | Account or Condition | Agent |
|---------|----------------------|-------|
| telegram | default hermes bot | hermes |
| telegram | vicky | vicky |
| telegram | cal | Cal |
| discord | any | Cal |
| webchat | any | Cal |

### ACP
Observed settings:
- enabled: true
- default agent: hermes
- allowed agents include hermes, Cal, codex, laura, tony, codegen, qa, and outbound-sales

### Agent to Agent Messaging
Observed config indicates agent to agent messaging is enabled for several agents.

Important ambiguity:
- Hermes workspace memory also contains guidance implying that agent to agent messaging is operationally disabled in favor of manual reassignment via Paperclip.

Interpretation:
- configuration and operator guidance are not perfectly aligned here
- operators should treat this as unresolved until one source of truth is chosen and documented

### Cron System
Observed characteristics:
- authoritative runtime source of truth: `~/.openclaw/cron/jobs.json`
- max concurrent runs: 1
- jobs include schedule, agent, payload, delivery, and session mode metadata
- cron sessions are isolated by default

Important note:
- local Mission Control includes a prototype cron management surface, but OpenClaw cron configuration remains the authoritative runtime scheduler unless explicitly bridged otherwise

---

## Agent Layer Detail

### Agent Defaults
Observed defaults include:
- primary model: `ollama/glm-5:cloud`
- fallback: `openrouter/google/gemini-2.5-flash-lite`
- default workspace: `/Users/david/.openclaw/workspace-main`
- local embedding backed memory search
- concurrency and compaction settings

### Per Agent Overrides

| Agent | Model | Workspace | Heartbeat | Notes |
|-------|-------|-----------|-----------|-------|
| hermes | qwen3.5:397b-cloud | workspace-hermes | none | CEO persona |
| Cal | qwen3.5:cloud | workspace-main | 30m | coding and operator profile |
| vicky | gpt-oss:20b-cloud | workspace-vicky | 15m | web search denied |
| laura | qwen3-vl:32b-cloud | workspace-hermes | none | forensic vision work |
| tony | gpt-oss:20b-cloud | workspace-hermes | none | operations drafting |
| codegen | devstral-2:123b-cloud | workspace-hermes | none | code generation |
| prodeng, qa, revenue, ops, intel, outbound-sales | qwen3.5:397b-cloud | workspace-hermes | none | business function agents |

### Workspace Model
Workspaces provide identity, memory, and operating guidance through files such as:
- `SOUL.md`
- `IDENTITY.md`
- `AGENTS.md`
- `HEARTBEAT.md`
- `MEMORY.md`
- `memory/YYYY-MM-DD.md`
- `agents/<role>/...`

Paperclip instruction bundles increasingly expose these workspace files directly, but operators should still distinguish between:
- files that shape agent behavior
- files that are merely visible in a UI surface

---

## Hermes Business Agent Architecture

Hermes remains the executive and business coordination layer across the `workspace-hermes` organization.

Key production sensitive constraints still matter:
- Laura is forensic only
- Tony remains human review gated for consequential actions
- phase progression should remain evidence driven

Important operational note:
- the human review workflow is currently spread across evolving surfaces, including the original control-panel concept and the more reliable local Mission Control fallback review queue

---

## Control Surfaces

### Paperclip
Paperclip functions as a local operator and agent surface with instruction bundles, issues, and workflow context.

### Control Panel
The original owner facing control-panel concept lives in `workspace-hermes/control-panel`.

### Mission Control
Mission Control in `workspace-main/projects/mission-control` currently provides several practical local fallback surfaces, especially for review work.

Interpretation:
- the system has more than one control surface today
- this is operationally useful, but it means documentation must distinguish current practical surface from intended long term surface

---

## Data Flows

### Inbound Message

```
Telegram, Discord, or webchat input
  → OpenClaw gateway
  → router applies bindings
  → agent session starts or resumes
  → workspace files bootstrap behavior and context
  → tools and memory used as needed
  → response generated
  → delivery queue returns output to the originating channel
```

### Cron Job

```
OpenClaw cron scheduler reads jobs.json
  → scheduled time reached
  → isolated agent session created
  → payload message delivered to agent
  → agent executes
  → output routed via job delivery configuration
  → run state updated in cron metadata
```

### Human Review

```
Agent produces draft or flagged output
  → human review surface presents item
  → reviewer approves, rejects, or escalates
  → decision recorded in the currently active review system
  → downstream delivery or follow-up proceeds from that decision
```

Important note:
- the exact review surface varies today depending on which system is most reliable for the workflow

---

## Open Questions and Ambiguities

- Whether `~/.hermes/` and OpenClaw Hermes are one runtime or two adjacent runtimes is still not fully resolved here.
- The exact functional role of some plugins such as `acpx` remains under documented.
- The boundary between canonical vault memory and runtime memory is partly conventional.
- Some control surface ownership is still in transition between apps.
- Agent to agent messaging policy is still ambiguous between config and operator guidance.

---

## Bottom Line

This architecture document is still valuable.

Its main job is to help operators understand how the live system is actually composed today.

The right reading posture is:
- trust it as a high level observed map
- do not over-read it as proof that every security, governance, or control-plane question is already settled
