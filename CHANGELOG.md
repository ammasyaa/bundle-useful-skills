# Changelog

All notable changes to `bundle-useful-skills` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-08

### Major Architecture Overhaul: Linked Bundle Manifest System & Router

This release elevates `bundle-useful-skills` into a production-grade, zero-dependency Agent Skills router and portable bundle system compliant with the **Linked Bundle Manifest Specification**.

#### Added
- **17 Focused Bundles (`bus-*`)**:
  - `bus-engineering-core`: Core process, TDD, systematic debugging, and verification before completion.
  - `bus-research-intelligence`: Search, deep research, multi-source literature review, and browser QA.
  - `bus-product-ui-taste`: UI craft, micro-interactions, motion, Apple/Fluent design, and visual direction.
  - `bus-web-app-builder`: Next.js App Router, React best practices, frontend UI engineering, DevTools.
  - `bus-backend-api-data`: PostgreSQL, Supabase, API contract design, transaction safety.
  - `bus-seo-geo-web-quality`: Core Web Vitals, accessibility (WCAG 2.1 AA), AI-SEO, schema markup.
  - `bus-windows-app-builder`: WinUI 3, Windows App SDK, Fluent design, automated UI testing.
  - `bus-macos-app-builder`: macOS native SwiftUI, AppKit interop, window management, test triage.
  - `bus-android-app-builder`: Jetpack Compose, edge-to-edge layout, CameraX, Android intent security.
  - `bus-ios-app-builder`: iOS native SwiftUI, simulator automation, debugger agents, liquid glass.
  - `bus-flutter-app-builder`: Flutter mobile, widget testing, Dart static analysis, integration tests.
  - `bus-flutter-desktop-builder`: Flutter desktop platform integration, testing, coverage analysis.
  - `bus-expo-app-builder`: Universal React Native, Expo Router, native primitives, animation.
  - `bus-secure-app-builder`: OWASP secure-by-default development, code review, secrets scanning.
  - `bus-agent-security`: AI agent risk assessment, prompt injection testing, MCP server auditing.
  - `bus-security-auditor`: Trail of Bits high-assurance static analysis, SARIF triage, variant analysis.
  - `bus-audit-release`: 14-point universal release gate and independent auditing.
- **Deterministic Cryptographic Registry**:
  - Pinned all 175 skills across 31 upstream authorities with commit SHAs and SHA-256 digests in `registry/lock.json`.
  - Machine-readable compatibility matrix (`registry/compatibility.json`) and conflict rules (`registry/conflicts.json`).
- **11-Step Routing Engine**:
  - Zero-dependency routing CLI (`python scripts/route.py`) supporting human-readable explanations, `--json` tool output, `--list-bundles`, and `--check-conflicts`.
  - Context budgeting enforcement: 2–5 skills for standard tasks, 5–7 for complex multi-surface tasks.
- **Snyk Supply-Chain Scanner (Section 17 Admission Pipeline)**:
  - Integrated `scripts/scan_supply_chain.py` verifying license legitimacy, commit immutability, SHA-256 integrity, and command safety.
- **Multi-Perspective Workspace Auditor**:
  - `scripts/audit_everything.py` evaluating the 14 standard completion criteria.
- **Cross-Platform Portable Plugins**:
  - Dual format `.claude-plugin/` and `.codex-plugin/` generated for all 17 bundles under `plugins/`.
- **Automated Verification Suite**:
  - 38 unit and integration tests under `tests/` covering routing algorithms, conflict detection, CLI flags, and lockfile parity.
- **Continuous Integration Matrix**:
  - Multi-OS GitHub Actions workflow running on Ubuntu, Windows, and macOS with Python 3.10, 3.11, and 3.12.
