# PropertyOpsAI Owner Control Panel - Project Roadmap

## Executive Summary

This roadmap defines the phased rollout plan for the Owner Control Panel from MVP to production. The project is structured into 5 phases over 9+ weeks, with each phase delivering incremental value while maintaining security and compliance posture.

**Important scope note:** This is the engineering roadmap for the control panel and supporting infrastructure. It is NOT the product go-to-market sequence.

**Product release sequencing is defined in:** `LAUNCH-DECISION.md`

**GTM Sequence (summary):**
- Phase 1 product release: Laura pilot (✅ Pilot-Ready)
- Phase 2 product release: Tony closed beta (🟡 Draft-Only)
- Phase 3: Billing/commercial automation (⏳ Deferred — manual invoicing for pilots)
- Phase 4: Controlled autonomy (⏳ Deferred — after trust + compliance gates)

**Engineering can build Phase 2-4 features while GTM releases only Phase 1.**

---

## Phase 0: Foundation (Week 1-2)

**Status:** In Progress

### Objectives
- Complete technical foundation and architecture decisions
- Initialize repository and deployment pipeline
- Establish secure tunneling strategy

### Deliverables
- [x] PRO-16: Technical specification completed
- [x] PRO-17: Repository initialization commands documented
- [x] PRO-18: Component architecture defined
- [ ] Vercel project created and linked
- [ ] Secure tunnel strategy selected and configured (Tailscale recommended)

### Success Metrics
- Technical spec approved by Hermes
- Repository accessible on GitHub
- Vercel preview deployments working
- Tunnel connectivity tested end-to-end

### Dependencies
- None (foundational phase)

### Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Tunneling complexity | High | Use Tailscale for simpler setup; Cloudflare as fallback |
| Vercel configuration delays | Medium | Start Vercel setup early in phase |
| Auth implementation complexity | Medium | Use next-auth with Edge Middleware pattern |

---

## Phase 1: MVP Dashboard (Week 3-4)

**Status:** ✅ Complete — Deployed April 7, 2026

**Production URL:** https://control-panel-bskqlsizi-estebanq-7865s-projects.vercel.app

### Objectives
- Deploy functional dashboard with read-only system monitoring
- Establish secure authentication and authorization
- Enable basic telemetry visualization

### Deliverables
- [ ] Authentication system (Vercel Edge Middleware IAM)
- [ ] System Monitor component (agent status, health indicators)
- [ ] Basic task queue view (read-only)
- [ ] Tunnel connectivity established (local → cloud telemetry)
- [ ] Deployed to production Vercel URL

### Success Metrics
- Owner can log in with valid credentials
- System status dashboard displays agent health
- Task queue shows pending/approved/rejected tasks
- Zero direct exposure of local systems to internet
- All access logged and auditable

### Dependencies
- Phase 0 completion
- Tailscale/Cloudflare tunnel configured
- Paperclip API endpoints available

### Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Auth bypass vulnerability | Critical | Security review before production deploy |
| Tunnel connection instability | High | Implement reconnection logic and health checks |
| PII exposure in telemetry | High | Filter PII at local agent before transmission |

---

## Phase 2: Interactive Controls (Week 5-6)

**Status:** Not Started

### Objectives
- Enable owner approval/rejection workflow for tasks
- Add cron job visibility
- Implement notification system

### Deliverables
- [ ] Task approval/rejection workflow (cloud → local commands)
- [ ] Cron job viewer (read-only status and history)
- [ ] Audit log viewer (filterable, exportable)
- [ ] Notification system (email/SMS/push for critical events)
- [ ] Mobile-responsive layout

### Success Metrics
- Owner can approve/reject queued tasks
- Task actions trigger local agent execution
- Cron job status visible with last-run timestamps
- Audit log captures all user actions
- Dashboard usable on mobile devices

### Dependencies
- Phase 1 completion
- Local agent command execution pipeline
- Notification service integration

### Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Unauthorized task approval | Critical | Require re-authentication for sensitive actions |
| Command injection via task payload | Critical | Validate and sanitize all cloud → local commands |
| Notification fatigue | Medium | Implement notification preferences and throttling |

---

## Phase 3: Full Operations (Week 7-8)

**Status:** Not Started

### Objectives
- Enable full cron job management
- Add advanced filtering and reporting
- Complete security audit

### Deliverables
- [ ] Cron job management (enable/disable/trigger on-demand)
- [ ] Advanced filtering and search (tasks, logs, cron jobs)
- [ ] Export/reporting features (CSV, PDF)
- [ ] Performance optimization (lazy loading, caching)
- [ ] Security audit and penetration testing

### Success Metrics
- Owner can manage cron schedules via dashboard
- Search returns results in <500ms
- Export generates files in <5s
- Security audit passes with no critical findings
- Page load time <2s on 3G connection

### Dependencies
- Phase 2 completion
- Security auditor availability
- Performance testing infrastructure

### Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Security vulnerabilities discovered | High | Budget 1 week for remediation post-audit |
| Performance regression | Medium | Implement performance budgets in CI/CD |
| Scope creep | Medium | Freeze features at week 7 start |

---

## Phase 4: Scale & Polish (Week 9+)

**Status:** Not Started

### Objectives
- Prepare for multi-owner deployments
- Add customization and integration capabilities
- Complete documentation and onboarding

### Deliverables
- [ ] Multi-owner support (if needed based on customer feedback)
- [ ] Custom dashboards/widgets (user-configurable)
- [ ] API for third-party integrations (webhooks, REST)
- [ ] Analytics and usage tracking (privacy-preserving)
- [ ] Documentation and onboarding flow (video + written)

### Success Metrics
- Support for 10+ concurrent owners per instance
- API documentation published
- Onboarding completion rate >80%
- Customer satisfaction score >4.5/5

### Dependencies
- Phase 3 completion
- Customer feedback from Phase 1-3 deployments
- Legal review for API terms

### Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Low adoption due to complexity | High | Invest in onboarding UX and documentation |
| Integration security gaps | High | Require OAuth 2.0 for all third-party integrations |
| Analytics privacy concerns | Medium | Anonymize all usage data; opt-in only |

---

## Timeline Summary

| Phase | Duration | Start Date | End Date | Status |
|-------|----------|------------|----------|--------|
| Phase 0: Foundation | 2 weeks | 2026-04-06 | 2026-04-20 | In Progress |
| Phase 1: MVP Dashboard | 2 weeks | 2026-04-21 | 2026-05-05 | Not Started |
| Phase 2: Interactive Controls | 2 weeks | 2026-05-06 | 2026-05-19 | Not Started |
| Phase 3: Full Operations | 2 weeks | 2026-05-20 | 2026-06-02 | Not Started |
| Phase 4: Scale & Polish | 2+ weeks | 2026-06-03 | TBD | Not Started |

---

## Critical Path

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4
    ↓         ↓         ↓         ↓         ↓
  Tech     Auth     Task     Cron     Multi-
  Spec    System   Workflow  Mgmt     Owner
```

**Blocking Dependencies:**
- Phase 1 cannot start until tunneling is tested (Phase 0)
- Phase 2 cannot start until task queue is visible (Phase 1)
- Phase 3 cannot start until approval workflow works (Phase 2)
- Phase 4 requires customer feedback from Phases 1-3

---

## Resource Requirements

| Role | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|------|---------|---------|---------|---------|---------|
| Frontend Engineer | 0.5 | 1.0 | 1.0 | 0.5 | 0.5 |
| Backend Engineer | 0.5 | 0.5 | 0.5 | 0.5 | 0.25 |
| Security Auditor | 0 | 0 | 0 | 1.0 | 0 |
| Product/Design | 0.25 | 0.5 | 0.5 | 0.25 | 0.5 |

---

## Go/No-Go Decision Points

### After Phase 0
**Go if:** Technical spec approved, repo initialized, tunnel tested
**No-Go if:** Security model has unresolved gaps, tunneling fails

### After Phase 1
**Go if:** MVP dashboard functional, auth secure, telemetry flowing
**No-Go if:** Auth vulnerabilities found, tunnel unstable

### After Phase 2
**Go if:** Approval workflow works, audit log complete
**No-Go if:** Task execution fails, audit gaps discovered

### After Phase 3
**Go if:** Security audit passes, performance targets met
**No-Go if:** Critical security findings, performance unacceptable

---

## Success Criteria (Overall)

1. **Security:** Zero critical vulnerabilities in security audit
2. **Compliance:** PAM/PII handling verified, Fair Housing compliant
3. **Performance:** <2s page load, <500ms search, 99.9% uptime
4. **Usability:** Mobile-responsive, intuitive navigation, <1 hour onboarding
5. **Reliability:** Tunnel auto-reconnects, command retry logic, audit trail complete

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-06 | ProdEng | Initial roadmap document |
