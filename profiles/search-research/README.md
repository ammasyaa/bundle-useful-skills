# Search & Research Profile

The **Search & Research** profile delivers high-authority, low-hallucination research by separating raw retrieval from analytical synthesis.

---

## 1. Stack Composition

- **Retrieval Authority**: [`firecrawl-cli`](../../registry/skills.json) — Clean markdown scraping, domain crawls, developer docs lookup.
- **Synthesis Engine**: [`deer-flow-deep-research`](../../registry/skills.json) — Reconciles disparate viewpoints, constructs structured findings, and synthesizes technical reports.
- **Conditional Freshness**: [`last30days-skill`](../../registry/skills.json) — Signals from X, Reddit, and Hacker News on breaking developments.
- **Conditional Interactive Browser**: [`browser-use`](../../registry/skills.json) — Live browser runtime verification when static scraping fails.

---

## 2. Progressive Flow

```text
USER QUERY
  ↓
Firecrawl (Fetch official docs / RFCs / source code)
  ↓
DeerFlow (Deep synthesis & structured reasoning)
  ↓
[Freshness check? → Last 30 Days]
  ↓
[Auth / JS app required? → Browser Use]
  ↓
Evidence-Backed Report
```

---

## 3. Rules & Boundaries

- **Never rely purely on social signals**: Treat Reddit/X/HN discussions as anecdotal until corroborated by official documentation or reproducible benchmarks.
- **Prefer Firecrawl over Browser Use**: Browser Use has high resource and token overhead; use it only when interaction, authentication, or dynamic execution is unavoidable.
