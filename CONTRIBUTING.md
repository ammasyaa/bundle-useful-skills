# Contributing

Contributions should improve routing, compatibility, validation, adapters, or independently authored documentation. Do not copy an upstream skill into this repository.

A registry addition must include a stable ID, display name, original author or organization, canonical source, exact skill path, reviewed commit, license evidence, applicable platforms and phases, authority, conflicts, trust level, and install mode. Verify these values at the upstream source. A popular project can still be experimental or incompatible.

Add a routing test for every new boundary or conflict. Then run:

```bash
node scripts/generate-credits.mjs
npm run check
```

Keep pull requests focused and describe the trigger, resulting route, upstream evidence, and validation performed.
