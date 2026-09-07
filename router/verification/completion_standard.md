# Completion Standard & Evidence Protocol

Do not mark work complete merely because code was written. Before asserting that a task is finished, evaluate the 14 standard verification questions:

---

## The 14 Standard Verification Questions

1. **Did we solve the requested problem?**
   - Verify every requirement in the original prompt was satisfied without omissions.
2. **Is the implementation correct?**
   - Confirm logic handles primary scenarios and boundary conditions accurately.
3. **Does it respect the framework/platform?**
   - Native idioms, file structures, and platform conventions must be honored.
4. **Is the UI intentionally designed?**
   - Visual hierarchy, typography scales, contrast, and spacing follow conscious design principles.
5. **Is interaction/motion purposeful?**
   - Animations feel physical, restrained, and provide immediate tactile feedback.
6. **Is accessibility adequate?**
   - Screen reader announcements, keyboard navigation, and contrast pass WCAG 2.1 AA / platform standards.
7. **Is the backend/data behavior correct?**
   - Database transactions, idempotency, retries, and schema integrity are enforced.
8. **Is security appropriate to the risk?**
   - High-risk operations (auth, payments, PII, crypto) pass OWASP and Trail of Bits audits.
9. **Is performance measured where material?**
   - Benchmarks, traces, or runtime timing prove performance claims; never guess from code.
10. **Is SEO/GEO correct for public web content?**
    - Public routes provide semantic HTML, canonical tags, and structured JSON-LD schemas.
11. **Are dependencies trustworthy?**
    - All upstream skills, packages, and tools are pinned and checked against known vulnerabilities.
12. **Does it work at runtime?**
    - Code compiles, services boot, endpoints respond, and UI renders without console errors.
13. **Did an independent review challenge the implementation?**
    - Separation of build and audit authorities was maintained.
14. **Is there evidence for the final verification claim?**
    - Automated tests passed, exit codes were zero, and terminal outputs verify the result.

---

## The Golden Principle

> **Best skill + correct authority + minimum context + strong taste + native quality + backend correctness + security + discoverability + independent audit + evidence-backed verification.**
