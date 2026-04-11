# Intelligence Report Delivery Configuration

**Status:** ✅ Active  
**Activated:** April 8, 2026  
**Owner:** Intel Agent (PRO-13)

---

## Discord Delivery

**Channel:** #intelligence-reports  
**Server:** propertyops (ID: 1491495933903638671)  
**Webhook ID:** 1491501512437006366  
**Webhook URL:** Stored in `.discord-webhook.json`

**Delivery Schedule:**
- **Weekly Briefings:** Tuesday 2:00 AM EDT
- **Format:** Embedded Discord message with summary + link to full report

**Script:** `intelligence/send-discord-briefing.sh`

---

## File Storage

**Primary Location:** `memory/competitive-briefings/`

| File Pattern | Contents |
|--------------|----------|
| `YYYY-MM-DD-weekly-briefing.md` | Full weekly competitive analysis |
| `YYYY-MM-DD-briefing.md` | Condensed briefing |
| `YYYY-MM-DD-heartbeat.md` | Intel Agent heartbeat status |

**Secondary Locations:**
- `competitive-intelligence/` — Mirror copies
- `intelligence/` — Working directory + README index

---

## Report Index

**Location:** `intelligence/README.md`

Contains:
- Complete report inventory
- Delivery configuration
- Coverage list (15+ competitors)
- Access instructions

---

## Automation

**Cron Job:** PRO-13 Intel Agent heartbeat  
**Frequency:** Weekly (Tuesday 2:00 AM EDT)  
**Trigger:** Automated via OpenClaw cron scheduler

**Manual Trigger:**
```bash
cd /Users/david/.openclaw/workspace-hermes
./intelligence/send-discord-briefing.sh memory/competitive-briefings/2026-04-08-weekly-briefing.md
```

---

## Change Log

| Date | Change |
|------|--------|
| 2026-04-08 | Discord webhook configured, consolidated delivery activated |
| 2026-04-07 | Weekly briefings established |
| 2026-04-05 | Baseline competitive intelligence report created |

---

**Next Review:** April 14, 2026 (Week 3 briefing)
