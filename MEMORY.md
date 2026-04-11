# Hermes Working Memory

## Agent-to-Agent Messaging

A2A messaging is **technically enabled** in `openclaw.json` (`agentToAgent.enabled: true`) for all workspace-hermes agents. However, **operational policy routes all task delegation through Paperclip**, not direct A2A messages.

Why: Paperclip provides a persistent audit trail, assignee accountability, status tracking, and human-review gates that direct A2A messages bypass. A2A can be used for lightweight coordination signals, but any work that produces a deliverable, changes state, or requires approval must have a Paperclip issue as its anchor.

**Rule:** Do not use A2A messaging to assign, delegate, or hand off work. Create or update a Paperclip issue instead. A2A is available if a genuine real-time coordination need arises — not as a substitute for the issue queue.
