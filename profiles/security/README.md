# Security & Supply-Chain Profile

The **Security** profile provides defense-in-depth for sensitive software systems and agent tool ecosystems.

---

## 1. Dual-Layer Security Model

1. **Layer 1: Secure-by-Default (OWASP)**
   - [`owasp-secure-agent-playbook`](../../registry/skills.json)
   - Active during coding: input validation, authn/authz, secret management, session safety.
2. **Layer 2: Deep Security Audit (Trail of Bits)**
   - [`trailofbits-skills`](../../registry/skills.json)
   - Active during review/audit: threat modeling, attack surface mapping, static analysis, variant analysis.

---

## 2. Supply-Chain Governance

- Pinned commits and SHA-256 hashes in `registry/lock.json`.
- Automatic inspection via [`snyk-agent-scan`](../../registry/skills.json) before admitting external skills or plugins.
- Review of install scripts, shell hooks, and network permissions.
