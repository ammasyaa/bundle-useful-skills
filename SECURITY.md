# Security Policy & Skill Supply-Chain Governance

## Overview

In `bundle-useful-skills`, all Agent Skills, plugins, hooks, MCP servers, and installation scripts are treated as **untrusted third-party code** until rigorously vetted, evaluated, and pinned.

Agent Skills operate with direct access to developer tools, terminals, file systems, and network interfaces. A compromised or poorly designed skill can lead to code injection, credential exfiltration, prompt injection, or destructive file modifications.

---

## 1. Skill Supply-Chain Admission Pipeline

No skill may be added to `registry/skills.json` or activated by default without completing the full 12-stage admission pipeline:

```text
[Candidate Proposal]
       ↓
1. Source Verification        (Verify official maintainer / authentic repository)
       ↓
2. License Verification       (Confirm OSI-compliant or acceptable permissive license)
       ↓
3. Static Security Scan       (Run Snyk agent-scan / Bandit / Semgrep on skill code & scripts)
       ↓
4. Script & Binary Audit      (Inspect all bash, PowerShell, python, or binary hooks)
       ↓
5. MCP & Hook Review          (Audit tool declarations, schemas, side effects, and permissions)
       ↓
6. Network & Permission Audit (Verify least-privilege network access and file boundaries)
       ↓
7. Prompt Injection Testing   (Evaluate resilience against adversarial task inputs)
       ↓
8. Compatibility Matrix Test  (Test on targeted OS, platform, and framework)
       ↓
9. Behavioral Evaluation      (Benchmark token footprint, context usage, and adherence)
       ↓
10. Commit & Tag Pinning      (Pin exact Git commit hash; never track mutable branches)
       ↓
11. Cryptographic Hashing     (Compute and record SHA-256 integrity hash in lock.json)
       ↓
12. Trusted Registry Entry    (Record full metadata and sign admission record)
```

---

## 2. Hard Security Invariants

1. **Immutable Pinning**: Never execute mutable instructions directly from an unpinned upstream `main` or `master` branch. All active skills must resolve to an immutable commit hash and verifiable SHA-256 hash.
2. **Authority Isolation**: Untrusted community skills must never supersede platform or framework security defaults.
3. **No Automatic Script Execution**: Installation hooks, setup scripts, and environment configuration scripts must never run automatically without explicit developer consent.
4. **Least-Privilege Context**: Skills are loaded progressively. Skills with high activation cost or wide capabilities are unloaded as soon as their task stage concludes.
5. **Separation of Concerns**: Implementation authority and audit authority are kept separate. Code generators cannot audit their own output without an independent auditor perspective.

---

## 3. High-Risk Triggers & Audit Depth

Work involving any of the following triggers requires **HIGH** or **RELEASE** risk classification, automatically invoking the security audit stack (`OWASP/secure-agent-playbook` and `trailofbits/skills`):

- Authentication & session management (OAuth, JWT, cookies, MFA)
- Authorization & access control (RBAC, ABAC, multi-tenancy)
- Payments, billing, and transactional financial systems
- Personally Identifiable Information (PII) and GDPR/HIPAA-regulated data
- Cryptography, key storage, and secret handling
- Database schema changes and data migrations
- Native platform IPC, WebView boundaries, and Electron/Tauri bridge APIs
- External URL fetching, file upload parsing, and untrusted deserialization
- CI/CD pipelines, release signing, and auto-update mechanisms
- Agent tool exposure, MCP servers, and autonomous prompt execution

---

## 4. Reporting Security Issues

If you discover a security vulnerability within `bundle-useful-skills` or any pinned registry entry:

1. **Do not open a public GitHub issue.**
2. Send an email report to `security@bundle-useful-skills.org` (or contact the repository maintainers directly).
3. Include:
   - Description of the vulnerability or supply-chain risk
   - Affected skill ID, repository, and commit hash
   - Proof of concept or reproduction steps
   - Potential impact on developer environments or agent runtimes
4. We acknowledge receipt within 24 hours and aim to resolve vulnerabilities within 7 business days.
