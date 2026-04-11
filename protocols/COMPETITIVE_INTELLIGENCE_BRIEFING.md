# Competitive Intelligence Briefing Protocol

**Owner:** Intel Agent (Department Layer - Intelligence)
**Frequency:** Weekly (Monday delivery)
**Stakeholder:** David (Founder/CEO)

## Mission

Monitor AppFolio, Buildium, and key competitors for feature changes, pricing shifts, and strategic positioning to inform PropertyOps AI product strategy and go-to-market decisions.

## Monitoring Sources

### Primary Competitors
1. **AppFolio** - Enterprise-focused (200+ units)
   - Pricing page: appfoliopricing.com
   - Product updates: AppFolio blog, press releases
   - Feature tracking: Core → Plus → Max tiers

2. **Buildium** - Mid-market (50-500 units)
   - Pricing: buildium.com/pricing
   - Essential ($58-62/mo), Growth ($183-192/mo), Premium ($375-400/mo)
   - Strong accounting focus

3. **DoorLoop** - SMB competitor
4. **TenantCloud** - Free tier + paid upgrades
5. **Avail** - Landlord-direct (Zillow-owned)
6. **RealPage** - Enterprise screening/ analytics
7. **Propertyware** - Custom enterprise solutions

### Intelligence Channels
- Competitor websites (pricing pages, feature lists, changelogs)
- Product Hunt launches
- Tech blogs (TechCrunch, PropTech Today)
- Press releases (PR Newswire, Business Wire)
- Social media (Twitter/X, LinkedIn company pages)
- Customer reviews (G2, Capterra, Reddit r/landlord)
- Job postings (reveals product roadmap direction)
- Conference announcements (NMHC, Multi-Housing News)

## Tracking Categories

### 1. Pricing Changes
- Per-unit price adjustments
- Tier restructuring
- Minimum monthly fee changes
- Onboarding fee modifications
- Transaction fee updates (ACH, credit card)
- Add-on pricing (screening, eLeasing, maintenance)

### 2. Feature Releases
- **AI/Automation**: Screening algorithms, maintenance triage, document processing
- **Integrations**: New API partnerships, banking connections
- **Compliance**: Fair Housing tools, PAM features, audit trails
- **User Experience**: Mobile app updates, dashboard improvements
- **Analytics**: Reporting enhancements, predictive insights

### 3. Strategic Positioning
- Target market shifts (unit count focus)
- Messaging changes (automation vs. control)
- Partnership announcements
- Funding/M&A activity
- Executive hires (product, engineering)

### 4. Customer Sentiment
- Review trend analysis (G2, Capterra ratings)
- Common complaints (support, pricing, bugs)
- Feature requests gaining traction
- Churn indicators

## Output Format

### Weekly Briefing Structure (Monday Delivery)

```markdown
# Competitive Intelligence Briefing - [Date]

## Executive Summary (3-5 bullets)
- Most significant change this week
- Emerging threat/opportunity
- Recommended attention area

## Pricing Watch
| Competitor | Change | Old | New | Impact |
|------------|--------|-----|-----|--------|
| [Name] | [Description] | [$X] | [$Y] | [High/Med/Low] |

## Feature Changes
### [Competitor Name]
- **Feature**: [What changed]
- **Category**: [AI/Integration/Compliance/UX/Analytics]
- **Implication**: [What this means for PropertyOps AI]

## Strategic Moves
- [Partnership/Funding/Hiring/Positioning shift]

## Customer Sentiment Shifts
- [Review trends, emerging complaints, feature requests]

## Threat Assessment
🔴 **Critical**: [Immediate action required]
🟡 **Watch**: [Monitor closely, may affect roadmap]
🟢 **Info**: [Contextual awareness only]

## Recommended Actions
1. [Specific action for David/team]
2. [Product consideration]
3. [Go-to-market adjustment]

---
**Next Briefing**: [Date]
**Alert Status**: [Normal/Elevated/Critical]
```

## Alert Protocol

### Immediate Escalation (Don't Wait for Weekly)
Trigger conditions:
- Competitor launches AI tenant screening with scoring (Fair Housing risk)
- Pricing undercut targeting our 5-150 unit sweet spot
- Major partnership with landlord association/NMHA
- Regulatory compliance feature that could become table stakes
- Negative sentiment spike about incumbent pain points we solve

Escalation channel: Telegram (@estebandq) + SMS for critical threats

## Data Storage

### Files
- `/memory/competitive-briefings/YYYY-MM-DD-briefing.md` - Weekly reports
- `/memory/competitive-tracking/pricing-matrix.md` - Living pricing comparison
- `/memory/competitive-tracking/feature-matrix.md` - Feature comparison grid
- `/memory/competitive-tracking/threat-register.md` - Active threats log

### Paperclip Integration
- Create issues for significant competitive threats
- Link briefings to relevant product roadmap items
- Track competitive responses in goal/issue system

## Governance

### Evidence Standards
- All claims must be sourced (URL, screenshot, citation)
- No speculation without supporting data
- Distinguish between announced vs. shipped features
- Note when information is from indirect sources (reviews, jobs)

### Compliance Boundaries
- Do not access competitor systems under false pretenses
- Use only publicly available information
- Respect terms of service when scraping/tracking
- No customer poaching intelligence (ethical boundaries)

## Success Metrics

### Leading Indicators
- Time from competitor announcement to internal awareness (<48 hours)
- Briefing actionability (% of weeks with specific recommendations)
- Early warning accuracy (predicted moves that materialized)

### Lagging Indicators
- Product roadmap adjustments informed by CI
- Go-to-market wins attributed to competitive insights
- Avoided threats (competitor moves we anticipated and countered)

## Review Cadence

- **Weekly**: Briefing generation and delivery
- **Monthly**: Feature matrix update, pricing tracker refresh
- **Quarterly**: Strategic assessment (market positioning shifts)
- **Annually**: Full competitive landscape review

---

## Initial Baseline (April 2026)

### AppFolio
- **Target**: 200+ units (not our core market)
- **Pricing**: $1.40/unit (Core, $280 min), $3/unit (Plus, $900 min), $5/unit (Max, $1,500 min)
- **AI Features**: Smart bill entry (Plus+), maintenance triage, Realm-X routing
- **Weakness**: Expensive for <200 units, minimum fees create barrier

### Buildium
- **Target**: 50-500 units (overlaps with our Growth/Pro tiers)
- **Pricing**: $58-62 (Essential), $183-192 (Growth), $375-400 (Premium)
- **Strengths**: Best-in-class accounting, flat-rate predictability
- **Weakness**: Upsell pressure, HOA focus can dilute landlord experience

### Market Trend
- AI screening becoming table stakes (RealPage leading with 30M lease record ML model)
- Maintenance automation shifting from ticket tracking to predictive/preventive
- Document processing (OCR, lease abstraction) commoditizing rapidly
- Integration depth > point features (unified OS positioning)

### PropertyOps AI Differentiation Opportunity
- **Forensic analysis** (Laura) vs. screening scores = Fair Housing compliance wedge
- **Agent-layer pricing** vs. per-unit SaaS = 10x cost advantage for 5-150 units
- **Human-in-the-loop** (Tony requires approval) vs. full automation = trust building
- **Phase discipline** (prove before scaling) vs. feature bloat = focused value

---

**Protocol Created**: April 5, 2026
**First Briefing Due**: Monday, April 13, 2026
**Status**: Active monitoring initiated
