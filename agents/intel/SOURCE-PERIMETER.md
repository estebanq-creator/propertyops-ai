# SOURCE-PERIMETER.md — Intelligence Source Configuration

**Last updated:** 2026-04-09
**Managed by:** Intelligence Agent
**Purpose:** Defines where Intelligence gathers signal, what type of signal each source provides, and how to query it.

---

## Source Tiers

### Tier 1 — Primary (High Emotional Signal, Raw Pain)
These sources provide unfiltered landlord experience: first-response panic, raw frustration, and real-time operational crises. Best for **messaging insights**, **Quote Bank content**, and **urgency scoring**.

| Source | URL | Signal Type | Notes |
|--------|-----|-------------|-------|
| r/Landlord | reddit.com/r/Landlord | Emotional intensity, crisis response, first-time landlord pain | Micro/Small cohort dominant |
| r/propertymanagement | reddit.com/r/propertymanagement | Operational workflows, day-to-day friction, vendor problems | Small/Mid cohort, more professional |
| r/realestateinvesting | reddit.com/r/realestateinvesting | Scaling decisions, financial risk, portfolio management | Mid cohort, math-heavy |
| r/Ask_Landlords | reddit.com/r/Ask_Landlords | Specific decision-point questions, compliance confusion | All cohorts |
| r/LeaseLords | reddit.com/r/LeaseLords | Lease disputes, tenant communication failures | Micro/Small cohort |

**Search pattern:** `site:reddit.com/r/[subreddit] [topic] [year]`

---

### Tier 2 — Secondary (Strategic Signal, Scaling Focus)
These sources provide more considered, math-driven discussion. Best for **Future Capability identification**, **competitive gap analysis**, and **Mid cohort product requirements**.

| Source | URL | Signal Type | Notes |
|--------|-----|-------------|-------|
| BiggerPockets — Multifamily Forum | biggerpockets.com/forums/47 | Scaling workflows, system design, ROI analysis | Mid cohort dominant |
| BiggerPockets — Property Management Forum | biggerpockets.com/forums/92 | Operational systems, PM software comparisons, vendor management | Small/Mid |
| NARPM Discussion Boards | narpm.org | Professional PM practices, industry standards | Mid cohort, professional managers |

**Search pattern:** `site:biggerpockets.com [topic]` or direct forum browse

---

### Tier 3 — Legal & Compliance (Fear Signal, Liability Focus)
These sources reveal what landlords are afraid of legally. Best for **Root Cause Identification** (information asymmetry, lack of process), **compliance risk mapping**, and **escalation triggers**.

| Source | URL | Signal Type | Notes |
|--------|-----|-------------|-------|
| Nolo Landlord-Tenant Law | nolo.com/legal-encyclopedia/landlord-tenant | Regulatory fear, eviction process anxiety, compliance gaps | All cohorts |
| AAOA (American Apartment Owners Association) | aaoa.com | Fraud alerts, lease enforcement, screening guidance | Small/Mid |
| State landlord association newsletters | varies by state | Early regulatory warning, state-specific compliance shifts | State-specific |

---

### Tier 4 — Competitive Intelligence (Product Gap Signal)
These sources reveal what landlords want that existing tools don't provide. Best for **Competitive Gap Analysis** (Step 6) and identifying whitespace opportunities.

| Source | URL | Signal Type | Notes |
|--------|-----|-------------|-------|
| Capterra — Property Management | capterra.com/property-management-software | Feature gap reviews, competitor complaints, switching triggers | All cohorts |
| G2 — Property Management | g2.com/categories/property-management | Negative reviews of AppFolio/Yardi/Buildium = our opportunity | Mid cohort |
| AppFolio Community Forum | community.appfolio.com | Feature requests from PM software users | Mid cohort |

**Search pattern:** `site:capterra.com OR site:g2.com [competitor name] review`

---

## Competitor Roster — Pricing & Positioning

Track these specific competitors for pricing changes, feature announcements, and market positioning shifts. Update quarterly or on major announcements.

| Competitor | Pricing Model | Entry Tier | Paid Tier | Key Positioning | Units Under Mgmt | Notes |
|------------|--------------|------------|-----------|-----------------|------------------|-------|
| Stessa | Freemium + feature unlocks | Free | $12–$28/month | Low-cost landlord suite | — | Maintenance requests at paid tiers |
| RentRedi | Flat-fee unlimited units | — | ~$12/month (annual equivalent) | Unlimited units, flat fee | — | Annual billing discount |
| Avail (by Realtor.com) | Per-unit freemium | Free tier | $9/unit/month | Shifts fees to tenants | — | Payment fees vary by plan |
| Buildium | Tiered base + add-ons | Monthly base (tiered) | Base + transaction fees | Traditional PMS | — | Add-ons and transaction fees layer on |
| AppFolio | Enterprise scale + AI-native | — | Custom/enterprise | Incumbent scale, AI features | 9.4M units (Q4 2025) | Can amortize AI features across huge base |
| Yardi Breeze | Per-unit mid-market | — | From $1/unit/month | Mid-market value option | — | Yardi's SMB offering |

**Competitive Monitoring Triggers:**
- Price changes (especially per-unit vs flat-fee shifts)
- AI feature announcements (screening, automation, insights)
- Tenant-fee model changes (who bears transaction costs)
- Unit count milestones (scale signals)
- Integration announcements (Mercury, Stripe, Plaid, etc.)

**Search patterns for competitor tracking:**
```
"Stessa" OR "RentRedi" OR "Avail" OR "Buildium" OR "AppFolio" OR "Yardi Breeze" site:reddit.com review OR complaint OR "switched to" OR "switched from"
"AppFolio" AI feature announcement 2026
"Buildium" pricing change 2026
"Avail" vs "RentRedi" comparison
```

---

## Proactive Search Query Templates

Use these with web search when conducting autonomous scans:

### Reddit Scan
```
site:reddit.com/r/Landlord OR site:reddit.com/r/propertymanagement [topic] after:YYYY-MM-DD
```

### Competitor Pain
```
"AppFolio" OR "Buildium" OR "Yardi" site:reddit.com complaint OR problem OR "doesn't work" OR "switched from"
```

### Fraud Pattern Detection
```
site:reddit.com/r/Landlord OR site:reddit.com/r/propertymanagement fraud OR scam OR "fake documents" OR "fake paystub" [current year]
```

### Regulatory Monitoring
```
"fair housing" OR "landlord tenant law" site:nolo.com OR site:aaoa.com [state] [year]
```

### Workaround Detection (Gap Signal)
```
site:reddit.com/r/Landlord "I use Excel" OR "I use Google Sheets" OR "I use Venmo" OR "I use Zelle" OR "I use Notion" landlord
```

---

## Source Freshness Rules

- Prefer posts from the **last 90 days** for urgency scoring
- Posts 90–365 days old: valid for frequency and severity, but flag as potentially stale for urgency
- Posts older than 1 year: use only for pattern validation, not urgency
- Always record approximate post date when logging pain points

---

## Promoting Sources from Watch List

When a source in `sources-watch-list.md` has been mentioned **3+ times** across separate discussions, elevate it:
1. Add it to the appropriate tier table above
2. Add a search query template if applicable
3. Update the "Last updated" date at the top of this file
4. Note the promotion in `sources-watch-list.md`
