# Tony Habitability Classifier - Evaluation Rubric

## Purpose

This rubric defines pass/fail criteria for Tony's habitability classification system. The classifier's job is to **flag any tenant message that may constitute a legal habitability obligation** under implied warranty of habitability statutes.

## Evaluation Philosophy

> **False negatives are legal events, not UX bugs.**

A missed habitability flag exposes PropertyOps AI and our landlord customers to:
- Breach of implied warranty of habitability
- Constructive eviction claims
- Rent withholding defenses
- Regulatory penalties
- Tenant injury liability

False positives are acceptable (vendor dispatch cost). False negatives are not.

## Pass/Fail Criteria by Category

### 1. Clear Habitability Cases (Cases 1-10)

**Definition:** Explicit descriptions of conditions that violate habitability standards.

**Categories:**
- No heat / heating failure
- No water / plumbing failure
- Electrical hazards
- Gas leaks / gas odor
- Structural damage
- Pest infestation
- Mold / mildew
- Security breaches (locks, entry points)
- Health / safety hazards

**Pass Criteria:** 100% flag rate required. Any miss = **FAIL**.

**Tolerance:** 0 false negatives allowed.

---

### 2. Ambiguous Language (Cases 11-15)

**Definition:** Tenant uses vague or partial descriptions that may indicate habitability issues.

**Examples:**
- "It's cold" (could be no heat, could be personal preference)
- "Water is weird" (could be plumbing, could be taste)
- "Crack in wall" (could be structural, could be cosmetic)

**Pass Criteria:** 
- Must flag when ambiguity leans toward habitability risk
- May skip when description is clearly non-habitability

**Tolerance:** 
- False negatives on ambiguous-but-risky language: **Maximum 1 allowed**
- False positives on clearly non-habitability: **Maximum 2 allowed**

**Rationale:** When in doubt, flag. Vendor can assess on-site.

---

### 3. Spanish Language (Cases 16-20)

**Definition:** Habitability issues described in Spanish.

**Pass Criteria:** 100% flag rate required for Spanish equivalents of English habitability triggers.

**Tolerance:** 0 false negatives allowed.

**Note:** Current regex patterns are English-only. This category will likely fail until Spanish patterns are added. Failure here is **expected and acceptable for Phase 1** if documented as a known gap with mitigation plan.

**Mitigation Plan for Phase 1:**
- Flag any non-English message for human review
- Or: Add Spanish regex patterns before any Spanish-speaking tenant onboarding

---

### 4. Multi-Issue Messages (Cases 21-25)

**Definition:** Tenant combines habitability and non-habitability requests in one message.

**Examples:**
- "No heat and I need a shelf installed"
- "Gas smell plus can you fix my cabinet?"

**Pass Criteria:** Must flag if ANY component is habitability-related.

**Tolerance:** 0 false negatives allowed.

**Rationale:** The habitability component creates legal obligation regardless of other requests.

---

### 5. False Positive Tests (Cases 26-30)

**Definition:** Cosmetic, preference, or non-habitability requests that should NOT be flagged.

**Examples:**
- Repainting requests
- Cabinet handle replacement
- Preference-based upgrades
- Stain cleaning (no damage)
- Optional installations

**Pass Criteria:** Should NOT flag these as habitability.

**Tolerance:** 
- False positives allowed: **Maximum 2** (better to over-flag than under-flag)
- False negatives: N/A (these are non-issues by definition)

**Rationale:** Over-flagging costs vendor dispatch. Under-flagging costs lawsuits.

---

### 6. Edge Cases (Cases 31-35)

**Definition:** Indirect descriptions that imply habitability issues without using trigger keywords.

**Examples:**
- "Thermostat shows 55 but set to 72" → implies heating failure
- "Lights flicker when I plug in microwave" → implies electrical hazard
- "Brown water from tap" → implies plumbing contamination
- "Can't breathe, something smells off" → implies air quality hazard
- "Floor feels spongy" → implies structural damage

**Pass Criteria:** Must flag when implication is clear to reasonable person.

**Tolerance:** 
- False negatives: **Maximum 1 allowed**
- False positives: **Unlimited** (prefer over-flagging)

**Rationale:** Tenants don't speak in legal or technical terms. Classifier must infer.

---

### 7. Partial Descriptions (Cases 36-40)

**Definition:** Brief, incomplete descriptions that may indicate habitability issues.

**Examples:**
- "Sink is clogged" → plumbing failure
- "Bugs in bathroom" → pest infestation
- "Musty smell" → possible mold
- "Can't get deadbolt to turn" → security breach
- "Outlet feels hot" → electrical hazard

**Pass Criteria:** Must flag when description reasonably implies habitability issue.

**Tolerance:**
- False negatives: **Maximum 1 allowed**
- False positives: **Unlimited**

---

### 8. Urgent Language (Cases 41-45)

**Definition:** Messages using emergency/urgent language, with or without specific habitability details.

**Examples:**
- "EMERGENCY - need help immediately!"
- "This is dangerous, please come ASAP"
- "URGENT: No heat, kids are freezing"
- "Water everywhere, help!!"
- "SMELL GAS - CALLING 911"

**Pass Criteria:** Must flag ALL messages with urgent/emergency language.

**Tolerance:** 0 false negatives allowed.

**Rationale:** Urgent language itself indicates potential habitability emergency. Even if the underlying issue turns out to be non-habitability, the urgency warrants immediate human review.

---

### 9. Non-English (Non-Spanish) (Cases 46-47)

**Definition:** Habitability issues described in languages other than English or Spanish.

**Current Examples:** French, Chinese

**Pass Criteria:** N/A for Phase 1.

**Expected Behavior:** Will NOT flag (English-only regex patterns).

**Tolerance:** **Documented gap** — acceptable for Phase 1 if:
- No non-English-speaking tenants are onboarded yet, OR
- All non-English messages are routed to human review via separate mechanism

**Mitigation Required Before Phase 2:**
- Add pattern support for languages represented in tenant base, OR
- Implement automatic human review for all non-English messages

---

### 10. Typos and Noise (Cases 48-50)

**Definition:** Messages with significant typos, elongated words, or noise characters.

**Examples:**
- "nooooo heat pls help its so coldd"
- "gas smel???? help"
- "mice mouses ratsss everywhere"

**Pass Criteria:** Must flag when core habitability keyword is recognizable despite noise.

**Tolerance:**
- False negatives: **Maximum 1 allowed**
- False positives: **Unlimited**

**Rationale:** Tenants may type urgently or on mobile devices. Classifier must be noise-tolerant.

---

## Overall Pass/Fail Thresholds

### Phase 1 Deployment Readiness

| Metric | Threshold | Status |
|--------|-----------|--------|
| Clear habitability cases (1-10) | 100% flag rate | REQUIRED |
| Multi-issue messages (21-25) | 100% flag rate | REQUIRED |
| Urgent language (41-45) | 100% flag rate | REQUIRED |
| Spanish language (16-20) | Documented gap OK | If mitigated |
| Non-English non-Spanish (46-47) | Documented gap OK | If mitigated |
| Ambiguous language (11-15) | ≤1 false negative | REQUIRED |
| Edge cases (31-35) | ≤1 false negative | REQUIRED |
| Partial descriptions (36-40) | ≤1 false negative | REQUIRED |
| Typos/noise (48-50) | ≤1 false negative | REQUIRED |
| False positive rate (26-30) | ≤2 false positives | REQUIRED |

### Overall Deployment Decision

**DEPLOY** if:
- All REQUIRED thresholds met
- Any gaps are documented with mitigation plans
- Fair Housing counsel has reviewed forensic-only framing

**DO NOT DEPLOY** if:
- Any REQUIRED threshold is missed
- No mitigation plan for known gaps
- Legal review is incomplete

---

## Audit Trail Requirements

Every evaluation run must produce:
1. **Per-case results** (pass/fail with rationale)
2. **Aggregate metrics** by category
3. **False negative analysis** (what did we miss and why)
4. **False positive analysis** (what did we over-flag and why)
5. **Recommendation** (deploy, fix-then-deploy, or escalate)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-09 | Hermes | Initial rubric for Phase 1 evaluation |
