---
name: client-site-fleet-ops
description: Design and operate a multi-tenant fleet of client websites — shared platform, per-client isolation, deployment topology, and the blast-radius rules that keep one client's change from reaching another. Use when managing more than a handful of sites on shared infrastructure.
license: MIT
---

# Client Site Fleet Operations

The failure mode of a site fleet is not downtime. It is one tenant seeing another tenant's data, or one deploy taking twenty sites offline. Design against those two first.

## Topology

Pick one and write it down. Mixed topologies are how leaks happen.

- **Hub and spoke** — one control-plane database holds tenants, entitlements, and configuration; each site reads only its own row set. Simplest to operate, hardest to get isolation right.
- **Database per tenant** — strongest isolation, highest operational cost, painful schema migration across the fleet.
- **Hybrid** — shared control plane, isolated content store per tenant. Usually the right answer above roughly twenty sites.

## Isolation rules

- Every tenant-scoped table carries a tenant key, and row-level security is enforced **in the database**, not in application code. Application-level filtering is a bug waiting for one missing `where` clause.
- Write a negative test per tenant-scoped table: authenticate as tenant A, query tenant B, assert empty. Run it in CI. This is the single highest-value test in a fleet.
- Service-role or admin credentials never reach a browser bundle. If a build step needs one, it runs server-side.
- Per-tenant secrets live in the deployment platform's environment scope, never in the shared repository.

## Deployment topology

Separate what changes per client from what changes for everyone:

- **Platform** — shared code, deployed once, rolled out progressively. Never deploy platform changes to the whole fleet at once; ring it (canary tenant → 10% → rest).
- **Tenant** — content, configuration, and domain. Changing these must never require a platform deploy.

Give each client a preview target and a production target. Content editors work against preview; promotion to production is an explicit action with an audit record.

## Content editing

Editors are not engineers. Give them a structured editing surface with typed fields and validation, not raw markup. Every field an editor can fill is a field an agent can also fill — design the schema so automated content generation and human editing use the same path.

## Runbook essentials

Keep these written and current, because they are needed at the worst moment:

- Adding a tenant: the exact ordered steps, and who approves.
- Removing a tenant: data export, DNS unwind, retention window, and destruction record.
- Rolling back a platform release without touching tenant content.
- Restoring one tenant's content without restoring the fleet.
- Who is called when a client's domain stops resolving.

## Rules

- Tenant count is a capacity number. Track deploy time, build minutes, and database connections per tenant, and know the number at which the topology stops working.
- Never let a client's custom request become a platform-wide conditional. Two tenants with special cases is a configuration field; five is a product decision.
- Record which tenant is on which platform version. A fleet where you cannot answer that question is unsupportable.
