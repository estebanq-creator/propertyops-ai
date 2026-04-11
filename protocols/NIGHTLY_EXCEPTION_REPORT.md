# Nightly Exception Report Protocol

**Owner:** Hermes (CEO)  
**Recipient:** David (Human Principal)  
**Schedule:** Daily at 11:00 PM EDT  
**Channel:** Telegram (@estebandq)  
**Format:** Structured exception summary with actionable items only

---

## **Purpose**

This report is the **primary oversight mechanism** for the agent fleet. It filters out routine execution and surfaces only exceptions requiring human judgment, legal review, or financial approval.

**Philosophy:** David's attention is reserved for high-leverage decisions. Routine tasks are handled autonomously. This report ensures nothing critical slips through while minimizing noise.

---

## **Filter Thresholds — What Gets Flagged**

### **1. Legal & Compliance (ALWAYS Flag)**
| Trigger | Action Required | Example |
|---------|-----------------|---------|
| **Legal signatures required** | David must review and sign | Lease amendments, settlement agreements, vendor contracts with indemnification clauses |
| **Habitability law triggers** | **IMMEDIATE** human review (no exception) | Compliance Watchdog flags: no heat, no water, mold, structural hazards, pest infestations |
| **Fair Housing boundary issues** | Legal review before any customer communication | Laura flags analysis that could be construed as discriminatory |
| **Regulatory filings due** | David approves submission | Local rental registration, state compliance reports |

### **2. Financial Approvals (>$500)**
| Trigger | Threshold | Action Required |
|---------|-----------|-----------------|
| **Vendor payments** | >$500 | David approves before payment released |
| **Refunds/credits** | >$500 | David approves before customer notification |
| **Emergency repairs** | >$500 | David approves (unless habitability law trigger → see above) |
| **Software/tool subscriptions** | >$50/month | David approves before purchase |
| **Legal/compliance expenses** | **ANY amount** | David approves (no threshold) |

**Note:** Expenses ≤$500 are auto-approved if within budget and pre-authorized by policy.

### **3. Customer Churn Risk (ALWAYS Flag)**
| Trigger | Severity | Action Required |
|---------|----------|-----------------|
| **Explicit churn threat** | Critical | David contacts customer within 24 hours |
| **Escalation to legal/complaint** | Critical | David + legal review within 12 hours |
| **Repeated unresolved tickets (3+)** | High | Ops agent flags for David review |
| **Negative NPS (<6) with comment** | Medium | Included in weekly trend, flag if pattern |

**Churn Threat Keywords** (auto-flag):
- "cancel", "termination", "leaving", "switching to [competitor]"
- "lawyer", "legal action", "complaint", "housing authority"
- "uninhabitable", "constructive eviction", "breach of lease"

### **4. Agent Escalations (Context-Dependent)**
| Agent | Trigger | Flag Condition |
|-------|---------|----------------|
| **Laura** | Fraud indicator detected | Always flag (Shadow Mode until Phase 1) |
| **QA** | Regression failure on customer-facing feature | Flag if impacts >1 customer |
| **OutboundSales** | High-value lead (50+ units) | Flag for David demo prep |
| **Atlas** | Agent drift detected (>10% deviation) | Include in Agent Health section |
| **Ops** | Vendor no-show on critical repair | Flag if habitability impact |

---

## **Liability Monitoring — Compliance Watchdog**

**CRITICAL:** Any maintenance request flagged by the Compliance Watchdog (Laura or future dedicated agent) that may trigger **habitability laws** requires **IMMEDIATE human review without exception**.

### **Habitability Law Triggers (Warranty of Habitability)**
These issues **cannot** be handled autonomously — David must review and approve response:

| Category | Specific Triggers | Legal Risk |
|----------|-------------------|------------|
| **Heat/Hot Water** | No heat (winter), no hot water (>24hrs) | Constructive eviction, code violations |
| **Water Intrusion** | Active leaks, flooding, sewage backup | Mold liability, health hazards |
| **Structural/Safety** | Broken locks, exposed wiring, gas leaks | Personal injury, criminal negligence |
| **Pest Infestation** | Rodents, bedbugs, cockroaches (multi-unit) | Health code violations, tenant remedies |
| **Mold** | Visible mold >10 sq ft, black mold | Respiratory illness, toxic exposure claims |
| **Power/Electrical** | Complete power loss, sparking outlets | Fire hazard, uninhabitable conditions |

**Protocol:**
1. Compliance Watchdog flags issue with `[HABITABILITY REVIEW REQUIRED]` tag
2. Hermes **immediately** pages David (Telegram + SMS if urgent)
3. **No autonomous response** — David must approve action plan
4. Document decision and timeline for legal audit trail

**Response Time SLA:**
- **Critical** (no heat, gas leak, sewage): <2 hours
- **High** (water leak, mold, pests): <24 hours
- **Medium** (minor leaks, cosmetic): Next business day

---

## **Agent Health — Drift Metrics (from QA Agent)**

**Purpose:** Ensure agent prompts and behaviors remain aligned with mission as we scale. QA agent monitors for "agent drift" — deviation from intended behavior.

### **Metrics Included (Nightly)**

| Metric | Definition | Threshold | Alert Condition |
|--------|------------|-----------|-----------------|
| **Prompt Deviation Score** | % of outputs diverging from prompt spec | <5% | >10% → Flag for review |
| **Tool Usage Anomaly** | Unusual API call patterns (frequency, endpoints) | Baseline ±20% | >50% deviation → Investigate |
| **Escalation Rate Change** | Week-over-week change in escalation frequency | <10% change | >25% increase → Review root cause |
| **Shadow Mode Accuracy** | Laura's analysis vs David's review (Phase 0) | >95% match | <90% → Extend Shadow Mode |
| **Response Time Degradation** | Agent heartbeat-to-completion time trend | <10% slowdown | >30% slowdown → Performance review |
| **Error Rate** | % of agent runs with errors/warnings | <2% | >5% → Immediate investigation |

### **QA Agent Nightly Checks**
1. **Sample 10% of agent outputs** from past 24 hours
2. **Compare against prompt spec** for mission alignment
3. **Flag anomalies** in tool usage, tone, or decision patterns
4. **Track Shadow Mode accuracy** (Laura vs David reviews)
5. **Report drift metrics** in Nightly Exception Report

### **Drift Response Protocol**
| Drift Level | Action |
|-------------|--------|
| **Green (<5% deviation)** | No action, continue monitoring |
| **Yellow (5-10% deviation)** | QA agent flags to Hermes, Hermes reviews next day |
| **Red (>10% deviation)** | **Immediate flag to David**, pause affected agent if customer-facing, Atlas investigates root cause |

---

## **Report Structure (Template)**

```
# Nightly Exception Report — [YYYY-MM-DD]
**Generated:** [HH:MM EDT]
**Coverage Period:** [Previous day, HH:MM - Today, HH:MM]

---

## 🚨 Critical Exceptions (Action Required)

### Legal/Compliance
- [ ] [Issue ID] — [Brief description] — [Deadline/urgency]
  - Context: [1-2 sentences]
  - Action Needed: [What David must do]
  - Link: [Paperclip issue URL]

### Financial Approvals (>$500)
- [ ] [Vendor/Customer] — $[Amount] — [Purpose]
  - Context: [Why this expense/refund]
  - Recommendation: [Approve/Deny/Negotiate]
  - Link: [Paperclip issue URL]

### Churn Risk
- [ ] [Customer Name] — [Churn threat summary]
  - Context: [What triggered churn risk]
  - Recommended Action: [David's outreach script/talking points]
  - Link: [Customer record/issue URL]

### Habitability Law Triggers (IMMEDIATE)
- [ ] [Property/Unit] — [Issue description]
  - **Severity:** [Critical/High/Medium]
  - **SLA:** [Response deadline]
  - **Status:** [Awaiting David review]
  - Link: [Maintenance request URL]

---

## ⚠️ Notable Exceptions (FYI + Optional Action)

- [Brief list of medium-priority items David can review at discretion]

---

## 📊 Agent Health Summary (Last 24hrs)

| Agent | Prompt Deviation | Escalation Rate | Error Rate | Status |
|-------|------------------|-----------------|------------|--------|
| Laura | [X]% | [N]/day | [X]% | 🟢/🟡/🔴 |
| CodeGen | [X]% | [N]/day | [X]% | 🟢/🟡/🔴 |
| QA | [X]% | [N]/day | [X]% | 🟢/🟡/🔴 |
| OutboundSales | [X]% | [N]/day | [X]% | 🟢/🟡/🔴 |
| [Others] | ... | ... | ... | ... |

**Drift Alerts:**
- [ ] [Agent name] — [Deviation type] — [Recommended action]

**Shadow Mode Accuracy (Laura):**
- Documents analyzed: [N]
- Match rate vs David: [X]%
- False negatives: [N] (target: 0)
- Status: [On track for Phase 1 exit / Needs extension]

---

## ✅ Routine Execution Summary (No Action Needed)

- **Issues Resolved:** [N]
- **Customers Onboarded:** [N]
- **Outbound Leads Generated:** [N] ([N] qualified → David)
- **API Calls Made:** [N] (all within rate limits)
- **Budget Spent:** $[X]/$[Y] monthly budget

---

## 📋 Pending David Actions (Summary)

| Priority | Action | Deadline |
|----------|--------|----------|
| Critical | [Item 1] | [Date/Time] |
| High | [Item 2] | [Date/Time] |
| Medium | [Item 3] | [Date/Time] |

---

**End of Report**
```

---

## **Delivery Protocol**

### **Schedule**
- **Time:** 11:00 PM EDT daily
- **Trigger:** Cron job → Hermes heartbeat
- **Fallback:** If Hermes unavailable, Atlas (CTO) generates report

### **Channel**
- **Primary:** Telegram (@estebandq)
- **Critical Exceptions:** Telegram + SMS (if habitability/churn/legal deadline <12hrs)
- **Archive:** Copy to Paperclip issue `[REPORT] Nightly Exception Report — [Date]`

### **Escalation During Day**
This report is for **nightly summary**. Critical exceptions (habitability, churn threats, legal deadlines) are **flagged immediately** via:
1. Telegram message with `[CRITICAL EXCEPTION]` tag
2. SMS if no Telegram response within 30 minutes (for habitability emergencies)
3. Paperclip issue created with priority=Critical

---

## **Version History**
- **v1.0** (2026-04-04): Initial protocol definition
  - Filter thresholds: Legal signatures, >$500 financial, churn threats
  - Habitability law triggers defined
  - Agent drift metrics from QA agent
  - Report structure templated

---

## **Review Cadence**
- **Weekly:** David reviews report usefulness, adjusts thresholds if needed
- **Monthly:** Hermes proposes optimizations based on exception patterns
- **Quarterly:** Full protocol audit with legal/compliance input
