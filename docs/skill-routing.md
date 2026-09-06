# Skill routing

Routing begins with repository evidence, not a guess based only on the requested task. Run the project search first:

```bash
node scripts/cli.mjs search --root . --task implementation --description "add account sign-in"
```

The report names detected platform/framework/renderer/targets, confidence and evidence, any required clarification, the selected invocation names, rejected near-matches, reasons, references, and warnings. `--json` returns the same result as structured data.

If the project is already known, an explicit route remains available:

```bash
node scripts/cli.mjs report --platform desktop --framework tauri --renderer react --target windows --task implementation
```

## Selection rules

1. Classify website, desktop, or mobile before task type.
2. Preserve exactly one profile-owned framework authority.
3. Require a compatible target for Flutter and target-scoped capabilities.
4. Add only specialists that match the current phase, scope, database, renderer, or risk.
5. Add the security gate for structured sensitive features such as OAuth/OIDC/SSO, MFA/passkeys, sessions, credentials/API keys, RBAC, payments, or biometric sign-in.
6. Reject conflicts and incompatible manual enables.
7. Enforce the activation budget from `registry/compatibility.json`.
8. Re-route when the phase changes and route `verify` before completing code or configuration work.

The default output aims for two to five active capabilities. The configured mode controls the budget; it never activates the complete installed inventory. Mandatory framework, security, and verification authorities cannot be disabled. A target-scoped manual enable without a target is rejected.

Every first progress report starts with `Skill bundle: development-skill-router -> ...`. The names after the arrow are real host invocation names, which can differ from stable registry IDs. Agents report only capabilities whose complete instructions were available, read, and followed. If instructions are missing, the report names the gap instead of claiming use.

## Deliberate separation

- A database bug selects systematic debugging and the configured data specialist without loading UI design guidance.
- A mobile design pass selects product design and the chosen target's UX reviewer without replacing framework authority.
- A Tauri or Electron React application keeps its native shell as authority and scopes React guidance to renderer code.
- Sensitive behavior adds the security gate even in minimal mode.
- Design direction and final visual cleanup run as separate bounded passes.
- Non-website/desktop/mobile tasks emit `Skill bundle: development-skill-router (triage only; no development capability applies)` and do not load a development bundle.

## Ambiguity and overrides

Mixed native targets, multiple unresolved mobile/desktop targets, and insufficient project evidence produce `needsInput`. Inspect the relevant entry points or supply an explicit route; do not silently choose the first framework found. User requirements remain the highest authority, but incompatible enables, disabling the profile authority, and disabling mandatory gates are validation errors rather than preferences.

The CLI rejects unknown flags, stray positional values, missing option values, and duplicate scalar flags. Repeated list flags such as `--risks` are merged. This makes misspelled security, target, and framework arguments visible instead of silently changing the route.
