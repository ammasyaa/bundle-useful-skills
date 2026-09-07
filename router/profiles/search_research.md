# Search & Research Router Profile

## Overview
Routes questions requiring technical documentation retrieval, competitive benchmarking, arXiv paper review, and ecosystem analysis.

## Core Stack
- **`firecrawl-cli`**: Primary retrieval authority (markdown scraping, domain crawl, GitHub docs).
- **`deer-flow-deep-research`**: Synthesis authority (cross-source reconciliation, literature review).

## Conditional Additions
- **`last30days-skill`**: Activated when query requests recent trends, developer opinions, or breaking news within 30 days.
- **`browser-use`**: Activated only when dynamic JavaScript execution, form submission, or session-authenticated inspection is required.

## Progressive Workflow
1. Scrape or search via Firecrawl.
2. Synthesize and reconcile via DeerFlow.
3. If recent discussions matter, corroborate via Last 30 Days.
4. If interaction is strictly necessary, execute targeted browser automation via Browser Use.
5. Produce evidence-backed summary with authoritative citations.
