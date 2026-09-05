---
name: brand-bible
description: Build a brand bible that downstream agents and humans can actually execute against — positioning, verbal identity, visual identity, and the machine-readable token set that keeps every later deliverable consistent. Use at the start of a brand engagement, or when existing brand assets disagree with each other.
license: MIT
---

# Brand Bible

A brand bible is only useful if a later agent can act on it without asking questions. Write for that reader.

## Sequence

Do not skip forward. Each section constrains the next.

1. **Evidence** — who the audience is, how they describe the problem in their own words, what the competitive set already claims. No invented personas. If you have no research, run the research lane first and say so.
2. **Positioning** — category, audience, the one differentiated claim, and the reasons to believe it. One sentence per item. If the claim would also be true of two named competitors, it is not positioning.
3. **Verbal identity** — voice attributes with a do/don't pair each, tone shifts by context (sales page vs. error message vs. legal notice), naming conventions, and a banned-phrase list.
4. **Visual identity** — colour roles (not just hex values), type scale, spacing rhythm, imagery direction, logo clear-space and misuse rules.
5. **Tokens** — the machine-readable layer. Emit a JSON block so later production skills bind to values rather than re-deriving them.
6. **Application** — three worked examples showing the system applied to real surfaces, plus what a violation looks like.

## Token block

Always emit tokens as data, and always name colours by role. A later agent must never have to guess which blue is the "primary" one.

```json
{
  "color": {
    "brand/primary": "#0B4F6C",
    "brand/secondary": "#01BAEF",
    "surface/default": "#FBFBFF",
    "text/default": "#20222E",
    "text/muted": "#5B6072",
    "status/positive": "#1B998B",
    "status/critical": "#C1292E"
  },
  "type": {
    "family/display": "…",
    "family/body": "…",
    "scale": [12, 14, 16, 20, 25, 31, 39, 49]
  },
  "space": {"base": 4, "scale": [4, 8, 12, 16, 24, 32, 48, 64]},
  "radius": {"sm": 4, "md": 8, "lg": 16},
  "voice": {"attributes": ["…"], "banned": ["…"]}
}
```

## Multi-market brands

When the brand ships in more than one language, decide and record three things explicitly, because translators and later agents will otherwise decide differently each time:

- Which elements are **fixed** across markets (logo, colour roles, the core claim) and which are **local** (idioms, proof points, imagery, honorifics).
- The **register** per language — formality is not portable. A voice that reads as warm in one language can read as presumptuous in another.
- Whether the type scale survives the script. Latin, CJK, and Arabic-script settings rarely share an optical size, and line-height set for one will look broken in another.

Do not translate the banned-phrase list. Rebuild it per language.

## Rules

- Cite the evidence behind every positioning claim, or mark it as an assumption to be tested.
- Never present a competitor's asset, character, or wordmark as reference material to be matched.
- A brand bible that contradicts an approved client design document loses. Record the conflict; do not silently resolve it.
- Ship the token block even when the visual identity is provisional. A provisional token that is written down beats a settled one that is not.

## Output

`BRAND.md` with the six sections above, plus `brand.tokens.json`. Both are inputs to every later production route; keep them in the project, not in chat.
