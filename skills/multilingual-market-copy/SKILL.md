---
name: multilingual-market-copy
description: Produce and review marketing copy that ships in more than one language without becoming four translations of an English original. Use when a deliverable targets multiple language markets, or when localized copy is converting worse than the source.
license: MIT
---

# Multilingual Market Copy

Translation preserves meaning. Marketing copy needs to preserve *effect*. These are different jobs and the second one fails silently — the words are correct, the page just stops converting.

## Decide the model first

State which of the three you are doing. Never drift between them mid-project.

| Model | What is shared | Use when |
|---|---|---|
| Translation | Structure, claims, order | Legal, technical, compliance text |
| Transcreation | Claim and intent; wording rebuilt per market | Headlines, ads, landing pages |
| Origination | Only positioning and tokens | Markets with different buying logic |

Ads and hero copy are almost never translation. Treat them as transcreation by default.

## Per-language checks

Run these before delivery. They catch most of what goes wrong.

- **Register.** Formality is a choice per language, not a global setting. Pick it deliberately per market and record it in the brand bible, including how to address the reader.
- **Length.** Expansion and contraction against the source break layouts. Set a character budget per slot and write to it; do not let a designer discover the overflow.
- **Word order and line breaks.** A headline that breaks well in one language will break mid-phrase in another. Specify break points rather than relying on the container.
- **Numbers, dates, currency.** Decimal marks, thousands separators, date order, and currency placement differ. Never hard-code a formatted string into copy.
- **Idiom and humour.** If a line depends on a pun or a cultural reference, it needs a new line, not a footnote.
- **Proof points.** Social proof does not travel. A logo, award, or statistic that is persuasive in one market can be unknown or irrelevant in another. Swap, don't translate.
- **Script rendering.** Confirm the chosen typeface actually covers the script, including diacritics and any required ligature behaviour, before copy is signed off.

## Review protocol

1. Review each language against the brief, not against the source text.
2. Have the check done by someone who reads the market, not only the language.
3. Read the CTA aloud in each language. Awkwardness shows up in the mouth before it shows up on the page.
4. Compare conversion per language once live. A single underperforming language usually means transcreation was skipped, not that the market is weak.

## Rules

- Never machine-translate a claim that carries legal or regulatory weight. Route it through the compliance pass.
- Never mix languages inside one sentence to sound local unless the brand bible explicitly allows it.
- Keep a per-language banned-phrase list. The source list does not transfer.
- Deliver copy as structured data keyed by slot and locale, not as prose documents per language — layout tools and later agents need the slot keys.
