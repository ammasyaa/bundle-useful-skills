# Web Release Gate Checklist

Before deploying or releasing a web application, verify each item:

- [ ] **Functional Requirements**: Core user stories and edge cases execute without regressions.
- [ ] **Automated Tests**: Unit and integration test suites pass cleanly (`npm test` / `pytest`).
- [ ] **Code Review & Standards**: Addy Osmani code quality guidelines followed; clean component boundaries.
- [ ] **UI/UX Polish**: Inspected with Impeccable critic for spacing, typography scale, and responsive behavior.
- [ ] **Core Web Vitals**:
  - Largest Contentful Paint (LCP) < 2.5s
  - Interaction to Next Paint (INP) < 200ms
  - Cumulative Layout Shift (CLS) < 0.1
- [ ] **Accessibility (WCAG 2.1 AA)**: Contrast ratios >= 4.5:1, keyboard navigable, aria attributes accurate.
- [ ] **Security**:
  - Inputs sanitized; no XSS or SQL injection vectors
  - Authentication state verified; session tokens HTTP-only and Secure
  - Headers configured (CSP, HSTS, X-Content-Type-Options)
- [ ] **SEO / Discoverability**:
  - Semantic HTML landmarks (`<main>`, `<header>`, `<nav>`)
  - Unique `<title>` and `<meta name="description">` tags per route
  - Structured JSON-LD schema validated
  - Robots.txt and sitemap.xml generated
- [ ] **Runtime QA**: Tested in target browsers (Chromium, WebKit/Safari, Firefox).
