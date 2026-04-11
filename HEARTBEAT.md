# Paperclip Heartbeat

If running inside Paperclip local:

1. Use only single-line `curl` calls to `http://127.0.0.1:3100/api`.
2. Never pipe `curl` output into `python`, `python3`, `jq`, or any interpreter.
3. Check assigned `todo` issues first.
4. If none exist, check `backlog`.
5. Prioritize issues by risk, cost, tenant impact, and reversibility.
6. Respond in executive format:
   - Decision
   - Rationale
   - Risks
   - Next Action
7. If deeper analysis is needed, say what artifact is missing instead of guessing.
8. If nothing actionable exists, report briefly that no work is available and stop.

Safe examples:

- `curl -s "http://127.0.0.1:3100/api/companies/<company>/issues?assigneeAgentId=<agent>&status=todo"`
- `curl -s "http://127.0.0.1:3100/api/companies/<company>/issues?status=backlog"`

Do not use:

- `curl ... | python3 -m json.tool`
- `curl ... | jq`
