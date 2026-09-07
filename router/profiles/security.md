# Security & Supply-Chain Router Profile

## Overview
Routes security-sensitive tasks, architecture audits, supply chain admission, and vulnerability assessments.

## Dual-Layer Authority
- **Layer 1 (Secure-by-Default)**: `owasp-secure-agent-playbook`
  Active during implementation: validates input sanitization, safe cryptographic primitives, authentication state, and authorization checks.
- **Layer 2 (Deep Security Audit)**: `trailofbits-skills`
  Active during review/audit: builds threat models, performs static and variant analysis, and checks supply-chain risks.

## High-Risk Triggers
Automatically activates this profile when any of these surfaces are modified:
- Authentication & Sessions
- Authorization & Roles
- Financial / Payments / Billing
- PII / Health data / Sensitive records
- Secrets & Credentials
- Database Migrations & Raw SQL
- IPC / WebViews / Native bindings
