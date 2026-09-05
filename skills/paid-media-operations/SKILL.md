---
name: paid-media-operations
description: Operate paid social and search campaigns through APIs and automations safely — creation order, paused-by-default discipline, budget guardrails, and the read/write split that prevents an agent from spending money by accident. Use when an agent or automation touches a live ad account.
license: MIT
---

# Paid Media Operations

An agent with write access to an ad account can spend real money in seconds and cannot undo it. Every rule here exists because of that.

## Paused by default

**Every object an automation creates starts paused.** Campaign, ad set, and ad. Activation is a separate, explicit, human-approved action against a named object identifier.

This is not a preference. An automation that can create an active campaign is an automation that can create an active campaign with the wrong budget, the wrong audience, and the wrong creative, at 2am.

## Creation order

Ad platforms enforce a strict hierarchy. Build it in order and stop at the first failure — a half-built campaign left active is worse than none.

```
campaign → ad set (budget, schedule, audience) → creative asset upload → ad creative → ad
```

Capture and persist the identifier returned at each step before starting the next. Retrying a partially-built structure without those identifiers produces duplicates that spend in parallel.

## Read/write split

Separate the capabilities so a read task can never write:

- **Read** — listing campaigns, ad sets, ads; pulling insights and metrics.
- **Write** — creating and updating objects, uploading assets, changing budgets or status.

Route read work through read-only credentials. Reserve write credentials for operations that have passed approval. Where the platform offers no read-only scope, enforce the split in the automation layer and log every write.

## Budget guardrails

Set these before the first write, as hard limits in the automation, not as intentions:

- Maximum daily budget per ad set the automation may set.
- Maximum lifetime budget per campaign.
- A ceiling on the number of objects created per run.
- A required confirmation step for any change that increases spend.

An automation that hits a guardrail stops and reports. It never lowers the guardrail to proceed.

## Naming and reconciliation

Use one machine-parseable naming convention across every object, and prefix objects created by automation so they are distinguishable from hand-built ones. You will need to answer "what did the automation create last Tuesday" and the account UI will not tell you.

Keep a local record of every created object identifier mapped to the run that created it. Without that mapping, cleanup is manual and error-prone.

## Measurement

- Attribution windows differ by platform and change the numbers materially. State the window with every reported figure.
- Platform-reported conversions and your own analytics will disagree. Report both, name the gap, and do not silently pick the flattering one.
- Never report a result from a period shorter than the attribution window as final.

## Rules

- Never store account identifiers, pixel identifiers, system-user identifiers, or tokens in the repository. They belong in the deployment environment.
- Creative claims route through the compliance pass before upload — regulated categories and testimonial rules apply to the ad, not just the landing page.
- When a run fails midway, report exactly which objects exist and in what state. "Something went wrong" is not an acceptable outcome for a system with spend authority.
