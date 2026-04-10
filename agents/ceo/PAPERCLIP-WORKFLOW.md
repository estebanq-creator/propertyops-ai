# PAPERCLIP-WORKFLOW.md — Issue, Project & Goal Management

**Scope:** Hermes and all direct reports
**Authority:** This is a hard operational requirement. No work proceeds without a Paperclip issue. No issue closes without the review gate.

---

## Core Rule

**When David asks Hermes to do anything that involves work, changes, research, or new functionality — create a Paperclip issue first, before starting.**

This applies to:
- Any implementation task delegated to a sub-agent
- Any investigation or analysis with a deliverable
- Any configuration change to workspace files, cron jobs, or agent behavior
- Any new feature, integration, or product work
- Any task that will take more than one response to complete

It does NOT apply to:
- Simple one-turn answers or lookups with no deliverable
- Reading a file and summarizing it in the same turn
- Explaining a concept

**When in doubt, create the issue.**

---

## API Reference

### Credentials (read from `paperclip-api-key.json` at session start)
```
BASE_URL: http://127.0.0.1:3100
COMPANY_ID: edea9103-a49f-487f-901f-05b2753b965d
TOKEN: [read from paperclip-api-key.json → token field]
```

### Verified route pattern
- Create issues: `POST /api/companies/{companyId}/issues`
- Update existing issues: `PATCH /api/issues/{issueId}`
- Create goals: `POST /api/companies/{companyId}/goals`
- Create projects: `POST /api/companies/{companyId}/projects`

Do not assume company-scoped issue PATCH routes work. Use `/api/issues/{issueId}` for issue updates.

### Agent ID Reference
| Agent | Paperclip UUID |
|-------|---------------|
| Hermes (CEO) | `710adcee-a06a-4a01-b383-4a557525d4a4` |
| ProdEng | `15dde6c5-f5f0-4db0-8a65-59d5330e68bc` |
| CodeGen | `7e887c69-ca47-4728-8d7d-6ffb4a96b2f4` |
| QA | `c27acf14-4ed5-48fc-aca0-e4ca7f73e5f5` |
| Laura | `6b87a1c8-5cdc-451d-bbed-8a96225de6ed` |
| Ops | `d69dc845-5bc0-4dea-a355-b904b1d96098` |
| Revenue | `5c187a79-69dc-4f27-8ad6-45c681e75232` |
| Tony | `a216361b-e27c-4ccd-b974-bc6be2984d80` |
| OutboundSales | `f2f6b646-e4f6-49c4-98b7-cc832389a79b` |
| Intel | `898f3842-0c07-4baf-9434-cae95cea3a59` |

---

## Step 1: Assess Project & Goal Fit

Before creating an issue, determine where it belongs.

### Fetch existing issues, projects, and goals first:
```
curl -s -H "Authorization: Bearer TOKEN" "http://127.0.0.1:3100/api/companies/COMPANY_ID/issues"
curl -s -H "Authorization: Bearer TOKEN" "http://127.0.0.1:3100/api/companies/COMPANY_ID/projects"
curl -s -H "Authorization: Bearer TOKEN" "http://127.0.0.1:3100/api/companies/COMPANY_ID/goals"
```

### Decision logic:

**Link to existing project/goal if:**
- The work is clearly part of an active initiative (e.g., Tony Portal work → Tony Portal project)
- The work advances a stated phase goal (e.g., Phase 2D work → Phase 2D goal)

**Reuse an existing issue if:**
- David explicitly referenced a PRO/issue that already exists
- The requested work is the next step of an in-progress or todo issue rather than net-new work
- Creating a new issue would split one deliverable into duplicate trackers

**Create a new Goal if:**
- The work represents a new strategic objective or phase milestone not covered by any active goal
- David is initiating a new product capability or business initiative
- The work has a clear success state that can be measured

**Create a new Project if:**
- The work is a new technical initiative within a goal
- Multiple sub-issues will be needed to complete it
- The work has a clear deliverable set (files, APIs, deployments)

**Issue only (no project/goal) if:**
- The work is a small, self-contained task (single deliverable, one agent, no sub-issues expected)
- It's maintenance or a fix, not a new capability

### Delegation pattern for UI/UX and initiative work

For Mission Control, Laura Portal, Tony Portal, control-panel, and other initiative-shaped product work:

- Keep one parent tracker for the initiative when Hermes needs executive visibility across multiple deliverables
- Create delegated child issues for each executable stream (for example: ProdEng implementation, QA validation, Ops rollout)
- Assign the child issue to the real executor agent; do not leave executable work on a Hermes-owned parent issue alone
- Link the parent and child issues to the same active `projectId` and `goalId` whenever the work belongs to a broader initiative
- If the initiative already has an active project/goal, reuse them before creating anything new

### Required issue hygiene before execution

Before any delegated work starts, the active Paperclip issue must have:

- A title that matches the identifier and current scope
- `assigneeAgentId` for the real executing owner on any implementation or validation issue
- `projectId` and `goalId` for initiative-shaped work
- Status aligned with the real state of work

If a reused issue is missing these fields or has broken hygiene, patch it before execution starts.

---

## Step 2: Create Goal (if needed)

```
curl -s -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{
  "title": "Goal title — concise, outcome-focused",
  "description": "What success looks like. Include phase context, constraints, and exit criteria.",
  "level": "task",
  "status": "active"
}' "http://127.0.0.1:3100/api/companies/COMPANY_ID/goals"
```

Save the returned `id` as `GOAL_ID` for use in Step 3 and Step 4.

---

## Step 3: Create Project (if needed)

```
curl -s -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{
  "name": "Project name — implementation-focused",
  "description": "What is being built, for whom, and why. Reference the goal.",
  "status": "in_progress",
  "goalId": "GOAL_ID"
}' "http://127.0.0.1:3100/api/companies/COMPANY_ID/projects"
```

Save the returned `id` as `PROJECT_ID` for use in Step 4.

---

## Step 4: Create Issue

```
curl -s -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{
  "title": "PRO-style title: Agent + scope + action",
  "description": "OBJECTIVE:\n[What needs to be done]\n\nACCEPTANCE CRITERIA:\n[What done looks like — specific artifacts, behaviors, or states]\n\nASSIGNEE: [Agent name]\nCOLLABORATORS: [Other agents involved]\nPRIORITY: [Critical/High/Medium/Low]\n\nNEXT STEPS:\n1. [First action]\n2. [Second action]\n\nTRACKING:\n- Status updates will be logged here via PATCH\n- Review gate required before completion",
  "status": "todo",
  "priority": "high",
  "projectId": "PROJECT_ID",
  "goalId": "GOAL_ID",
  "assigneeAgentId": "AGENT_UUID"
}' "http://127.0.0.1:3100/api/companies/COMPANY_ID/issues"
```

**Priority values:** `critical` / `high` / `medium` / `low`
**Status values:** `todo` / `in_progress` / `done` / `cancelled`

Omit `projectId` or `goalId` if not applicable (do not send null — omit the field entirely).

---

## Step 5: Update Status During Execution

As work progresses, PATCH the issue to reflect current state. Do this at meaningful milestones — not every message, but at every meaningful state change.

### Move to in_progress when work begins:
```
curl -s -X PATCH -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{
  "status": "in_progress"
}' "http://127.0.0.1:3100/api/issues/ISSUE_ID"
```

### Log progress by patching the description:
When a milestone is reached (sub-task complete, blocker found, handoff made), append a progress note to the description:

```
curl -s -X PATCH -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{
  "description": "[full updated description with progress appended]\n\nPROGRESS LOG:\n- [YYYY-MM-DD HH:MM]: [What was completed or discovered]"
}' "http://127.0.0.1:3100/api/issues/ISSUE_ID"
```

### Log blockers:
```
curl -s -X PATCH -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{
  "description": "[existing description]\n\nBLOCKER [YYYY-MM-DD]: [What is blocking progress and what is needed to unblock]"
}' "http://127.0.0.1:3100/api/issues/ISSUE_ID"
```

### Delegation handoff hygiene

When Hermes hands work to a sub-agent:

- Update the child issue `assigneeAgentId` to the delegated owner
- Keep the parent tracker with Hermes if it remains an initiative-level tracker
- Record the handoff in the description or progress log
- Do not mark the parent issue complete while delegated child execution issues are still active

---

## Step 6: Mark Complete (only after Review Gate)

After the three-part review (Accuracy / Completeness / Quality) is passed and approval is logged:

```
curl -s -X PATCH -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{
  "status": "done",
  "description": "[full description]\n\nCOMPLETION [YYYY-MM-DD]:\n- Deliverables: [list with file paths, URLs, or artifacts]\n- Review gate: Passed\n- Approved by: [approver + date]"
}' "http://127.0.0.1:3100/api/issues/ISSUE_ID"
```

---

## Status Update Cadence

| Event | Action |
|-------|--------|
| Work requested by David | Reuse an existing issue when it clearly matches, otherwise create one immediately before starting |
| Work begins | PATCH status → `in_progress` |
| Sub-task or milestone complete | PATCH description with progress note |
| Blocker encountered | PATCH description with blocker note, escalate if needed |
| Delegated to sub-agent | Note handoff in description, update assignee if needed |
| Review gate passed | PATCH status → `done`, log completion artifacts |
| Work cancelled or superseded | PATCH status → `cancelled`, note reason |

---

## Project & Goal Maintenance

**Keep projects and goals current when the API supports it.**
- Always link new issues to the right active project/goal when they fit.
- If project/goal mutation endpoints are unavailable or uncertain, log the current state in the linked issue description and use the Paperclip UI for final cleanup rather than guessing at unsupported routes.

**Create goals for new phase milestones:**
- When a new phase is entered or a major initiative begins, create a goal before creating issues
- Goals should reflect outcomes, not tasks (e.g., "Laura achieves 95% accuracy in Shadow Mode" not "Run Laura tests")

**Fetch before creating:**
- Always `GET /projects` and `GET /goals` before creating new ones — avoid duplicates
- Link new issues to existing active projects/goals wherever they fit

---

## Session Protocol for Hermes

When David initiates a session request:

1. **Assess** — Is this a work item? (See Core Rule above)
2. **Fetch** — Pull current issues, projects, and goals to find the right home
3. **Create or link** — Reuse the existing issue when appropriate; otherwise create Goal → Project → Issue (create only what's needed)
   - For initiative work, create or reuse the parent tracker and the delegated child issue(s)
   - Repair broken linkage or missing assignee fields before execution
4. **Confirm** — Tell David: "I've created [PRO-XX: title] and assigned it to [agent]. Linked to [project/goal]."
5. **Execute** — Begin the work (or delegate to sub-agent)
6. **Update** — PATCH status and description at each milestone
7. **Close** — Mark done after review gate, confirm to David

Always tell David the issue identifier (PRO-XX) when created so he can track it.
