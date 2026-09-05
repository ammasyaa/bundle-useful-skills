---
name: cms-publishing-pipeline
description: Build a reliable pipeline that takes generated or designed content through asset handling into a hosted CMS. Use when automating blog, article, or landing-page publishing across design tools, media libraries, and a CMS API.
license: MIT
---

# CMS Publishing Pipeline

Most publishing automations fail at the same three places: the asset, the rich-text schema, and the account boundary. Design for those explicitly.

## Pipeline shape

```
compose → render asset → import asset to the CMS media library → build body document → create draft → human review → publish
```

Never collapse the last two. Auto-publishing generated content is how a wrong claim reaches a client's audience with no one in the loop.

## Assets

- Hosted CMSs almost always require media to live in **their** media library. Passing an external URL into a body document usually appears to work and then breaks when the source expires or blocks hotlinking. Import first, then reference the returned internal identifier.
- Record the returned media identifier alongside the post. Re-uploading the same asset on every run silently fills the library and changes identifiers.
- Fix the export dimensions and format at the design step. Letting the CMS resize produces inconsistent crops across a series.

## Rich-text bodies

Modern CMS bodies are structured documents, not HTML strings. Two rules cover most breakage:

- **Respect the nesting contract.** Block containers hold block nodes; block nodes hold inline nodes. Putting an inline text node directly inside a list item or blockquote is the most common cause of a body that saves but renders empty.
- **Send the field sets the API expects.** Draft-creation endpoints commonly need an explicit author identifier and an explicit list of the field sets to return. Omitting them yields a created-but-invisible post.

Validate the assembled body against the CMS schema before the create call, not after the failure.

## Account boundaries

When the CMS account that owns the site differs from the account holding the automation credentials, cross-account authorization will block writes, and no amount of scope-widening on your own token fixes it. Decide early:

- Get delegated access on the owning account, or
- Deliver a reviewed, ready-to-paste artefact and let the owner publish.

Pick the fallback before building, and say which one is in force. Silent partial automation is worse than a documented manual last step.

## Reliability

- Make every step idempotent and keyed by a stable content identifier, so a retry updates rather than duplicates.
- Persist pipeline state between steps. A run that dies after asset import must resume, not restart.
- Where the orchestration runs inside an interactive or embedded surface, confirm that surface can actually make the outbound calls. Some embedded runtimes cannot, and the fix is to run the calls from the orchestrating agent or a server step instead of from the embed.
- Log the CMS response identifier for every created draft. Without it, reconciliation is guesswork.

## Rules

- Draft first, always. Human approval before publish is a product requirement, not a nicety.
- Never write client-owned site identifiers, tokens, or member identifiers into the repository. They belong in the deployment environment.
- Generated content still routes through the compliance pass before it reaches a public audience.
