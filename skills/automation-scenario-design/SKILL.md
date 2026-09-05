---
name: automation-scenario-design
description: Design workflow automations that survive contact with real data — trigger choice, filter logic, error handling, idempotency, and the state that has to outlive a single run. Use when building or debugging a scenario in a visual automation platform or a scheduled job.
license: MIT
---

# Automation Scenario Design

Visual automation platforms make the happy path trivial and everything else invisible. Design the unhappy paths first.

## Trigger choice

| Trigger | Use when | Watch for |
|---|---|---|
| Webhook | The source can push, latency matters | Retries and duplicate deliveries; you must deduplicate |
| Polling | No push available | Cursor management; overlapping runs |
| Schedule | Batch or reconciliation work | Runs that outlast their interval |

Never poll when a webhook exists, and never let a scheduled run start while the previous one is still going. Take a lock or skip.

## Filter logic

Boolean structure in visual builders is the most common source of silent wrong behaviour, because a mis-nested filter does not error — it just matches the wrong rows.

The near-universal convention: the outer array is **OR**, the inner array is **AND**.

```
AND:  [ [ conditionA, conditionB ] ]
OR:   [ [ conditionA ], [ conditionB ] ]
```

Putting two conditions in one inner array when you meant OR produces a filter that matches almost nothing, quietly. Always test a filter against a row that should pass and a row that should fail. Passing rows alone prove nothing.

## Idempotency

Assume every run may execute twice.

- Key every write by a stable identifier from the source system, and upsert rather than insert.
- Record processed identifiers, with a retention window long enough to cover the platform's retry policy.
- Make destructive steps require an identifier that could only come from a successful earlier step.

## Error handling

- Give every fallible module an explicit error route. The default — stop the whole scenario — is rarely what you want in a batch.
- Distinguish **retryable** (timeout, rate limit, 5xx) from **terminal** (validation failure, permission denied). Retrying a terminal error burns quota and hides the real fault.
- Back off exponentially on rate limits and respect any retry-after the API returns.
- Route terminal failures to a place a human will actually see, with enough context to act: the record identifier, the step, and the raw error.

## State

Anything needed between runs lives in a durable store — a data store, a database table, a sheet — never in the scenario's own run context. Persist:

- Cursors and last-processed timestamps.
- Mappings between source and destination identifiers.
- Deduplication keys.

## Units and types

Data crossing system boundaries loses its units. Check explicitly:

- Durations: milliseconds, seconds, and minutes all appear in common APIs. Convert once, at the boundary, and name the field with its unit.
- Timestamps: store UTC, render local, and never compare a naive timestamp to an aware one.
- Money: integer minor units, with the currency code alongside. Never floats.
- Empty vs. absent vs. null are three different states; decide what each means before mapping.

## Rules

- Build with real data volume from the start. A scenario that works on three rows and dies on three thousand was never designed.
- Name scenarios and modules by what they do, with a consistent prefix per owning team, so ownership is readable from a list.
- Version the scenario definition into source control alongside the code it serves. A workflow that exists only in a vendor UI is undocumented infrastructure.
- Never put credentials in a scenario body. Use the platform's connection or secret store.
