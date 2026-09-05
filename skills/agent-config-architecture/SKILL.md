---
name: agent-config-architecture
description: Structure agent configuration across global and project scopes — what belongs in instruction files, what must be enforced by settings, and how to keep guidance from drifting into an unread wall of text. Use when setting up or auditing agent configuration for a team or a repository.
license: MIT
---

# Agent Config Architecture

Two layers, and the distinction between them is the whole point:

- **Instruction files** (`CLAUDE.md`, `AGENTS.md`, and equivalents) are *advisory*. They shape behaviour. They do not constrain it.
- **Settings and permissions** (deny rules, allowed tools, sandbox boundaries) are *enforced*. They constrain regardless of what the model decides.

**Never rely on an instruction file for anything that must not happen.** "Do not run destructive commands" in an instruction file is a suggestion. The same rule as a deny rule in settings is a control. Anything with security, cost, or data-loss consequences belongs in settings; the instruction file may explain it, but must not be the only place it lives.

## Scope layering

| Scope | Holds | Does not hold |
|---|---|---|
| Global | Personal conventions, preferred tools, house style, how you want to be told bad news | Anything project-specific; anything secret |
| Project | Architecture, commands that actually work here, domain vocabulary, non-obvious constraints | Personal preferences; restatements of general good practice |
| Directory | Rules for one subtree — a package, a service | Anything true of the whole repository |

More specific scope wins. Keep each layer non-overlapping; a rule repeated at two scopes will eventually disagree with itself.

## What earns a line

Instruction files are read on every turn. Length has a real cost, and a long file is skimmed rather than followed.

Include only:

- Commands that are correct for *this* project — the actual test, build, and lint invocations, not the generic ones.
- Constraints a competent newcomer would violate — the migration that must run first, the directory that is generated, the API whose obvious usage is wrong here.
- Domain vocabulary and the project's own names for things.
- Explicit non-goals.

Exclude: general programming advice, restatements of the model's default behaviour, aspirational process nobody follows, and anything that changes weekly.

If a rule is being ignored, the fix is usually that the file is too long, not that the rule needs stronger wording.

## Templates

Keep one skeleton and fill it per project rather than writing each from scratch. A shared skeleton makes the files scannable and makes drift visible. Sections that stay empty for a given project should be deleted from that copy, not left as headings.

## Maintenance

- Review after any architecture change, and delete rules whose reason has gone.
- Never write secrets, tokens, or absolute local paths into an instruction file — these files are committed, shared, and frequently pasted into issues.
- When guidance and code disagree, the code is the fact. Fix the file in the same change.
- Treat the file as reviewed content: it goes through the same pull request as the code it describes.
