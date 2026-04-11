# Telemetry & Health API Documentation

Date: 2026-04-10
Status: Prototype telemetry contract with hardening notes

## Overview

Mission Control currently exposes telemetry and health endpoints for local or tailnet-reachable agent reporting.

This document should describe the current implementation honestly:
- the endpoints are structured and validated
- they are useful for local monitoring and prototyping
- they are not yet independently secured at the application layer
- today they rely primarily on deployment context and network reachability rather than strong per-request authentication

Because of that, this document uses `telemetry contract` language rather than `secure telemetry service` language.

---

## 1. Current Endpoints

### `POST /api/health/ping`

Purpose:
- lightweight latency tracking
- quick connectivity confirmation from an agent or trusted caller

Current behavior:
- validates request shape with Zod
- records timing information in the local telemetry store
- does not currently enforce app-level caller authentication in the route itself

### `GET /api/health/ready`

Purpose:
- local readiness summary for operators and monitoring
- aggregate view of recent telemetry state

Current behavior:
- derives readiness from the in-memory telemetry store
- triggers alerting side effects based on current observations
- is useful operationally, but should not be treated as a hardened production readiness endpoint yet

### `POST /api/agents/heartbeat`

Purpose:
- receive richer agent heartbeat payloads
- track status, tunnel state, resources, and job pressure

Current behavior:
- validates structured heartbeat payloads
- records data into the in-memory telemetry store
- may emit alerts for CPU, memory, tunnel, and job-failure conditions
- does not currently verify caller identity in the route itself

---

## 2. Current Security Posture

### What Is True Today

- the telemetry routes are suitable for local, LAN, or Tailscale-based operation
- payload validation exists
- alerting logic exists
- the routes are useful for operational visibility during active development

### What Is Not Yet True

The following should not be implied without qualification:
- that the endpoints are fully secured at the application layer
- that every telemetry caller is cryptographically authenticated
- that the telemetry store is durable across restart or redeploy
- that alerting and readiness state form a production-grade monitoring system on their own

### Recommended Language

Use:
- `telemetry endpoints intended for trusted-network use`
- `validated local monitoring contract`
- `prototype health and alerting surface`

Avoid for now:
- `secure telemetry service` as an unqualified claim
- `production monitoring system` as an unqualified claim

---

## 3. Data Validation

The endpoints use schemas in `lib/validations/health.ts` for payload validation.

That is good and worth preserving, but payload validation should be understood as only one layer of defense. It does not replace:
- caller authentication
- authorization
- durable storage
- anti-replay or request-signing controls

---

## 4. Telemetry Store

Current store:
- `lib/store/telemetry-store.ts`

Current characteristics:
- in-memory only
- useful for active local sessions
- supports aggregate status and alert calculations
- not durable enough for production history, long-term trend analysis, or post-incident evidence

Recommended wording:
- `The telemetry store is currently an in-memory operational cache and should later be replaced or supplemented with durable storage.`

---

## 5. Alerting

The alerting layer is useful and already captures meaningful operational conditions such as:
- offline agents
- tunnel disconnects
- critical CPU or memory pressure
- elevated failure rates

That said, the alerting flow should still be described as a prototype incident-detection layer because:
- it depends on ephemeral telemetry state
- its durability and operator acknowledgment story are still evolving
- its thresholds will likely need tuning under real workload

---

## 6. Production Hardening Requirements

Before this telemetry system should be described as production-ready, the following should be added or clearly documented:
- caller authentication for telemetry endpoints
- request signing or equivalent trust mechanism
- durable telemetry persistence
- durable alert history
- explicit source-of-truth rules for readiness and incident status
- replay/rate-limit strategy for untrusted network exposure

Tailscale remains a good network boundary, but it should complement rather than replace application-level trust controls.

---

## 7. Bottom Line

The telemetry APIs are well-shaped and useful.

What needed revision was the framing:
- keep the endpoint contracts
- keep the validation story
- keep the alerting behavior
- describe the current system as a trusted-network prototype telemetry layer, not a fully secured production monitoring service
