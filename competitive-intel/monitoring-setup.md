# Competitive Intelligence Monitoring Setup

**Issue:** PRO-13 - Activate Intelligence Agent: Weekly Competitive Briefing
**Started:** 2026-04-07
**Assignee:** Intel Agent (898f3842-0c07-4baf-9434-cae95cea3a59)

## Monitoring Pipeline Architecture

### Primary Targets (Phase 1)
1. **AppFolio** - Enterprise property management platform
2. **Buildium** - Mid-market property management software
3. **RentRedi** - Landlord-focused mobile-first platform
4. **TenantCloud** - Small landlord/SMB focus
5. **Avail.co** - Independent landlord focus (Zillow Group)

### Monitoring Sources

#### 1. Website Monitoring (Weekly Checks)
- Pricing pages
- Feature comparison pages
- Changelog/release notes
- Blog/announcements

#### 2. External Signals
- Product Hunt launches
- G2/Capterra reviews (new features mentioned)
- Reddit r/PropertyManagement, r/Landlord
- Twitter/LinkedIn product announcements
- TechCrunch, PropTech news sites

#### 3. Job Postings (Strategic Intelligence)
- Engineering roles (reveals tech stack/direction)
- Product roles (reveals feature priorities)
- "Building X" language in descriptions

### Data Collection Method

**Approach:** Manual + semi-automated hybrid for Phase 1
- Week 1-2: Manual baseline establishment
- Week 3+: Introduce automated scrapers where feasible

**Storage:** `/competitive-intel/briefings/YYYY-MM-DD-briefing.md`

## Weekly Briefing Schedule

**Delivery:** Every Monday 9:00 AM EDT
**Format:**
1. Executive Summary (3-5 bullets)
2. Feature Changes (what changed, who, impact assessment)
3. Pricing Shifts (old vs new, positioning change)
4. Strategic Implications for PropertyOps AI
5. Recommended Actions (if any)

**Critical Alert Protocol:**
- Major pricing changes (>20% shift): Immediate Slack/Telegram
- New competitor entering our segment: Immediate brief
- Feature launch directly competing with Laura/Tony: Same-day analysis

---

## Initial Baseline Status (2026-04-07)

Competitor baselines to be established this week.
