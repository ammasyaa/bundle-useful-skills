---
name: skill-library-ops
description: Run a shared agent-skill library for a team — authoring standards, review and approval flow, versioning, distribution, and retirement. Use when more than one person contributes skills, or when a skill collection has grown past the point where anyone knows what is in it.
license: MIT
---

# Skill Library Operations

A skill library fails in one of two ways: nobody contributes, or everybody does and nothing is trustworthy. The review flow is what prevents both.

## Contribution flow

```
draft → automated validation → domain review → approval → merge → distribute
```

Keep the draft step accessible to non-engineers. Most good skills come from the person who does the work, not the person who knows the tooling. Give them a form or a template, and let automation turn it into a pull request rather than asking them to open one.

Approval is a named human, recorded. An auto-merged skill library is an unowned one.

## Authoring standard

Every skill in the library must have:

- A `name` matching its directory, in lowercase kebab-case.
- A `description` written as **when to use this**, including the phrases a user would actually say. Descriptions are how the skill gets selected; a vague one means the skill is never invoked.
- A stated scope boundary — what this skill does *not* cover, and which skill covers it instead.
- Rules that are checkable. "Be thoughtful" is not a rule. "Draft first, never auto-publish" is.
- Worked examples where the behaviour is non-obvious.

Reject skills that restate general model capability. A skill earns its place by encoding something the model would otherwise get wrong.

## Validation before review

Automate what a human should not have to check: frontmatter present and well-formed, name matches directory, description length within limits, no secrets, no absolute local paths, no client-identifying data, links resolve. A reviewer's attention is scarce; spend it on judgement.

## Versioning

- Version each skill independently. A library-wide version tells you nothing about whether a specific skill changed.
- Record the reviewed upstream commit for any skill derived from an external source, and re-review on update rather than pulling silently.
- Breaking changes to a skill's contract get a new major version and a migration note, because other skills reference it by name.

## Distribution

Know your last mile before you build the pipeline. Some agent hosts read skills from a directory or a repository; others require an upload step that has no API. If the last mile is manual, automate up to it, make the artefact ready to drop in, and document the manual step honestly rather than pretending the pipeline is end-to-end.

Distribute the same content to every host. Divergent copies per host is how a fix lands in one place and not others.

## Retirement

Skills rot. Review the library on a schedule and retire aggressively:

- Superseded by a better skill → delete, and note the replacement.
- References an API that changed → fix or retire; a stale skill is worse than a missing one, because it is confidently wrong.
- Never invoked in six months → ask whether its description is wrong or the skill is unwanted, then fix or remove.

## Rules

- Client-specific and confidential material never enters a shared library. Generalize the technique, strip the specifics, and keep the originals private.
- A skill that cannot state what it does *not* do is not scoped and will collide with its neighbours.
- Measure invocation, not skill count. A library of two hundred skills nobody triggers is a liability.
