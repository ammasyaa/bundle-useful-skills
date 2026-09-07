# Audit Everything Profile

The **Audit Everything** profile provides an independent, adversarial second pair of eyes across all engineering surfaces.

---

## 1. Principles of Independent Auditing

- **Separation of Concerns**: The skill that generated the code must not be the sole authority verifying it.
- **Risk-Calibrated Depth**:
  - `LOW` risk: Basic unit tests + code formatting check.
  - `MEDIUM` risk: Code review specialist + targeted unit/integration tests.
  - `HIGH` risk: Multi-domain audit (Security + Architecture + Database).
  - `RELEASE` risk: Full 14-point release gate check.

---

## 2. The 14 Standard Completion Questions

Before declaring completion, this profile runs through:

1. Did we solve the requested problem?
2. Is the implementation correct?
3. Does it respect the framework/platform?
4. Is the UI intentionally designed?
5. Is interaction/motion purposeful?
6. Is accessibility adequate?
7. Is the backend/data behavior correct?
8. Is security appropriate to the risk?
9. Is performance measured where material?
10. Is SEO/GEO correct for public web content?
11. Are dependencies trustworthy?
12. Does it work at runtime?
13. Did an independent review challenge the implementation?
14. Is there evidence for the final verification claim?
