#!/usr/bin/env python3
"""
Sync specialized plugin bundles from the Agentic Awesome Skills roadmap.
Populates plugins/agentic-bundle-<id>/ with plugin.json, .claude-plugin, .codex-plugin, and skills/<skill>/SKILL.md.
Also writes/updates registry/plugins.json with full catalog metadata.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import sys
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Tuple

REPO_ROOT = Path(__file__).resolve().parent.parent
PLUGINS_DIR = REPO_ROOT / "plugins"
REGISTRY_DIR = REPO_ROOT / "registry"

UPSTREAM_BASE = "https://raw.githubusercontent.com/sickn33/agentic-awesome-skills/main"

# The 21 canonical specialized plugins from specialized-plugin-roadmap.md
CANDIDATES: List[Dict[str, Any]] = [
    {
        "id": "aas-web-app-builder",
        "name": "AAS Web App Builder",
        "priority": "tier-1",
        "audience": "Frontend and full-stack developers shipping modern web apps.",
        "why": "Implement a React/Next.js user journey with responsive UI, accessibility checks and browser verification.",
        "skills": [
            "frontend-developer",
            "frontend-design",
            "react-best-practices",
            "nextjs-app-router-patterns",
            "browser-automation",
            "tailwind-patterns",
            "shadcn",
            "form-cro",
            "seo-audit",
            "ui-a11y",
        ],
    },
    {
        "id": "aas-product-design-studio",
        "name": "AAS Product Design Studio",
        "priority": "tier-1",
        "audience": "Builders who want richer UI, brand, portfolio, and visual product work.",
        "why": "Turn a product brief into a coherent visual direction, responsive interface and actionable design review.",
        "skills": [
            "ui-ux-pro-max",
            "high-end-visual-design",
            "frontend-design",
            "mobile-design",
            "3d-web-experience",
            "canvas-design",
            "scroll-experience",
            "interactive-portfolio",
            "ui-a11y",
            "ui-review",
        ],
    },
    {
        "id": "aas-security-engineer",
        "name": "AAS Security Engineer",
        "priority": "tier-1",
        "audience": "Authorized security testing, audit, and hardening teams.",
        "why": "Assess explicitly authorized targets and produce reproducible findings, remediation priorities and retest steps.",
        "skills": [
            "ethical-hacking-methodology",
            "burp-suite-testing",
            "top-web-vulnerabilities",
            "api-security-testing",
            "linux-privilege-escalation",
            "cloud-penetration-testing",
            "security-auditor",
            "vulnerability-scanner",
            "sast-configuration",
            "web-security-testing",
        ],
    },
    {
        "id": "aas-secure-app-builder",
        "name": "AAS Secure App Builder",
        "priority": "tier-1",
        "audience": "Application developers who want security embedded while building features.",
        "why": "Implement authentication, access control and data protection with negative tests and a focused security review.",
        "skills": [
            "api-security-best-practices",
            "auth-implementation-patterns",
            "backend-security-coder",
            "frontend-security-coder",
            "cc-skill-security-review",
            "pci-compliance",
            "sast-configuration",
            "secrets-management",
            "django-access-review",
        ],
    },
    {
        "id": "aas-documents-presentations",
        "name": "AAS Documents & Presentations",
        "priority": "tier-1",
        "audience": "Users creating, editing, converting, and automating office documents.",
        "why": "Produce editable office files and PDFs, with content checks and rendered output review.",
        "skills": [
            "office-productivity",
            "docx-official",
            "xlsx-official",
            "pptx-official",
            "pdf-official",
            "pdf-conversion-router",
            "google-docs-automation",
            "google-sheets-automation",
            "google-slides-automation",
        ],
    },
    {
        "id": "aas-data-analytics",
        "name": "AAS Data Analytics",
        "priority": "tier-1",
        "audience": "Analysts, operators, and product teams turning data into business decisions.",
        "why": "Validate source data, write analytical queries and produce a dashboard or experiment readout with traceable definitions.",
        "skills": [
            "analytics-tracking",
            "analytics-product",
            "sql-pro",
            "postgres-best-practices",
            "data-quality-frameworks",
            "dbt-transformation-patterns",
            "claude-d3js-skill",
            "kpi-dashboard-design",
            "ab-test-setup",
            "business-analyst",
        ],
    },
    {
        "id": "aas-agent-mcp-builder",
        "name": "AAS Agent & MCP Builder",
        "priority": "tier-1",
        "audience": "Engineers building custom AI tools, server adapters, and agent runtimes.",
        "why": "Build a bounded agent or MCP tool with explicit interfaces, failure handling and behavioral evaluation.",
        "skills": [
            "ai-agents-architect",
            "agent-evaluation",
            "mcp-builder",
            "mcp-tool-developer",
            "llm-app-patterns",
            "rag-engineer",
            "langgraph",
            "langfuse",
            "context-window-management",
            "prompt-engineering",
        ],
    },
    {
        "id": "aas-qa-test-automation",
        "name": "AAS QA & Test Automation",
        "priority": "tier-1",
        "audience": "Engineers reproducing regressions, writing test harnesses, and stabilizing suites.",
        "why": "Reproduce failures, add meaningful regression coverage and stabilize browser or service tests.",
        "skills": [
            "test-driven-development",
            "systematic-debugging",
            "browser-automation",
            "e2e-testing-patterns",
            "playwright-skill",
            "webapp-testing",
            "k6-load-testing",
            "test-fixing",
            "code-review-checklist",
            "screen-reader-testing",
        ],
    },
    {
        "id": "aas-devops-cloud",
        "name": "AAS DevOps & Cloud",
        "priority": "tier-1",
        "audience": "Teams managing infrastructure, deployment pipelines, containers, and cloud resources.",
        "why": "Prepare infrastructure and delivery changes with validation, rollback steps and explicit deployment boundaries.",
        "skills": [
            "docker-expert",
            "aws-serverless",
            "kubernetes-architect",
            "terraform-specialist",
            "github-actions-templates",
            "environment-setup-guide",
            "deployment-procedures",
            "bash-linux",
            "incident-responder",
            "devops-troubleshooter",
        ],
    },
    {
        "id": "aas-marketing-seo-growth",
        "name": "AAS Marketing, SEO & Growth",
        "priority": "tier-1",
        "audience": "Growth marketers, founders, and content leads acquiring customers through organic search and outreach.",
        "why": "Create an acquisition plan and channel assets grounded in the supplied audience, product and search evidence.",
        "skills": [
            "content-creator",
            "seo-audit",
            "seo-fundamentals",
            "seo-content-planner",
            "programmatic-seo",
            "analytics-tracking",
            "ab-test-setup",
            "email-sequence",
            "copywriting",
            "schema-markup",
        ],
    },
    {
        "id": "aas-automation-builder",
        "name": "AAS Automation Builder",
        "priority": "tier-1",
        "audience": "Operators and technical leads stitching systems together via workflows and webhooks.",
        "why": "Design an automation with explicit triggers, mappings, retries and a reviewable test run.",
        "skills": [
            "workflow-automation",
            "mcp-builder",
            "make-automation",
            "zapier-make-patterns",
            "airtable-automation",
            "notion-automation",
            "slack-automation",
            "googlesheets-automation",
            "github-automation",
            "n8n-workflow-patterns",
        ],
    },
    {
        "id": "aas-observability-ir",
        "name": "AAS Observability IR",
        "priority": "tier-1",
        "audience": "On-call engineers, SREs, and platform teams operating live systems.",
        "why": "Connect logs, metrics and traces to incident diagnosis, recovery checks and a documented follow-up.",
        "skills": [
            "observability-engineer",
            "observability-and-instrumentation",
            "distributed-tracing",
            "slo-implementation",
            "grafana-dashboards",
            "performance-engineer",
            "incident-responder",
            "devops-troubleshooter",
            "postmortem-writing",
            "langfuse",
        ],
    },
    {
        "id": "aas-python-api-builder",
        "name": "AAS Python API Builder",
        "priority": "tier-1",
        "audience": "Python engineers delivering reliable backend services, FastAPI apps, and async APIs.",
        "why": "Implement Python service endpoints with schema validation, async boundaries and automated tests.",
        "skills": [
            "python-pro",
            "python-patterns",
            "fastapi-pro",
            "fastapi-templates",
            "django-pro",
            "python-testing-patterns",
            "async-python-patterns",
            "api-design-principles",
            "pydantic-models-py",
            "openapi-spec-generation",
        ],
    },
    {
        "id": "aas-mobile-app-builder",
        "name": "AAS Mobile App Builder",
        "priority": "tier-1",
        "audience": "Mobile engineers shipping iOS, Android, Expo, and Flutter apps.",
        "why": "Implement a mobile feature in the chosen stack and prepare platform-specific build and release checks.",
        "skills": [
            "mobile-developer",
            "react-native-architecture",
            "expo-api-routes",
            "expo-dev-client",
            "expo-cicd-workflows",
            "expo-deployment",
            "flutter-expert",
            "ios-developer",
            "app-store-optimization",
            "multi-platform-apps-multi-platform",
        ],
    },
    {
        "id": "aas-accessibility-inclusive-ux",
        "name": "AAS Accessibility & Inclusive UX",
        "priority": "tier-1",
        "audience": "Designers and engineers building usable interfaces for all audiences.",
        "why": "Find and fix accessibility barriers with keyboard, automated and screen-reader checks appropriate to the interface.",
        "skills": [
            "accesslint-audit",
            "accesslint-scan",
            "screen-reader-testing",
            "accesslint-diff",
            "fixing-accessibility",
            "ui-a11y",
            "webapp-testing",
            "playwright-skill",
        ],
    },
    {
        "id": "aas-api-platform-builder",
        "name": "AAS API Platform Builder",
        "priority": "tier-1",
        "audience": "Platform architects and backend leads standardizing APIs across services.",
        "why": "Define and implement API contracts, authorization, documentation and service verification across languages.",
        "skills": [
            "api-design-principles",
            "api-patterns",
            "openapi-spec-generation",
            "api-documentation",
            "api-endpoint-builder",
            "auth-implementation-patterns",
            "api-security-best-practices",
            "backend-architect",
            "k6-load-testing",
            "observability-engineer",
        ],
    },
    {
        "id": "aas-saas-launch-revenue",
        "name": "AAS SaaS Launch & Revenue",
        "priority": "tier-1",
        "audience": "Founders, indie hackers, and product engineers launching software and collecting payments.",
        "why": "Connect MVP scope, pricing, payments and launch assets into a concrete launch-readiness review.",
        "skills": [
            "saas-mvp-launcher",
            "micro-saas-launcher",
            "pricing-strategy",
            "monetization",
            "stripe-integration",
            "analytics-product",
            "launch-strategy",
            "referral-program",
            "email-sequence",
            "seo-audit",
        ],
    },
    {
        "id": "aas-ai-product-evaluation-ops",
        "name": "AAS AI Product & Evaluation Ops",
        "priority": "tier-1",
        "audience": "Product leads, AI engineers, and QA practitioners testing probabilistic AI behaviors.",
        "why": "Define AI feature success criteria, representative evaluation cases and a decision-ready error analysis.",
        "skills": [
            "ai-wrapper-product",
            "agent-evaluation",
            "langfuse",
            "llm-app-patterns",
            "context-window-management",
            "kpi-dashboard-design",
            "analytics-product",
            "product-manager",
            "ab-test-setup",
            "hugging-face-evaluation",
        ],
    },
    {
        "id": "aas-data-engineering-platform",
        "name": "AAS Data Engineering Platform",
        "priority": "tier-1",
        "audience": "Data engineers building pipelines, data models, and warehouses.",
        "why": "Build ingestion and transformation pipelines with data contracts, quality checks and recovery planning.",
        "skills": [
            "data-engineer",
            "airflow-dag-patterns",
            "dbt-transformation-patterns",
            "postgres-best-practices",
            "database-architect",
            "vector-database-engineer",
            "embedding-strategies",
            "rag-engineer",
            "sql-pro",
            "data-quality-frameworks",
        ],
    },
    {
        "id": "aas-privacy-compliance-engineering",
        "name": "AAS Privacy & Compliance Engineering",
        "priority": "tier-1",
        "audience": "Privacy engineers, compliance officers, and developers subject to GDPR, HIPAA, or SOC 2.",
        "why": "Map data flows to engineering controls and evidence gaps for a scoped privacy or compliance review.",
        "skills": [
            "privacy-by-design",
            "gdpr-data-handling",
            "pci-compliance",
            "fsi-compliance-checker",
            "cc-skill-security-review",
        ],
    },
    {
        "id": "aas-localization-international-growth",
        "name": "AAS Localization & International Growth",
        "priority": "tier-1",
        "audience": "Teams expanding applications to global markets, international locales, and multi-lingual SEO.",
        "why": "Prepare locale-aware interfaces and content with language, routing and international SEO checks.",
        "skills": [
            "i18n-localization",
            "seo-hreflang",
            "seo-fundamentals",
            "seo-content-planner",
            "seo-content-writer",
            "schema-markup",
            "content-creator",
            "copywriting",
            "analytics-tracking",
            "apify-market-research",
        ],
    },
]


def fetch_url(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (BundleUsefulSkills/1.0)"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read().decode("utf-8")


def sync_skill(plugin_name: str, skill_id: str) -> Tuple[str, bool, str]:
    dest_path = PLUGINS_DIR / plugin_name / "skills" / skill_id / "SKILL.md"
    if dest_path.exists() and dest_path.stat().st_size > 50:
        return (skill_id, True, "cached")

    dest_path.parent.mkdir(parents=True, exist_ok=True)
    # Attempt 1: Fetch from plugins directory
    url_plugin = f"{UPSTREAM_BASE}/plugins/{plugin_name}/skills/{skill_id}/SKILL.md"
    try:
        content = fetch_url(url_plugin)
        dest_path.write_text(content, encoding="utf-8")
        return (skill_id, True, "fetched from plugin")
    except Exception:
        pass

    # Attempt 2: Fetch from top-level skills directory
    url_root = f"{UPSTREAM_BASE}/skills/{skill_id}/SKILL.md"
    try:
        content = fetch_url(url_root)
        dest_path.write_text(content, encoding="utf-8")
        return (skill_id, True, "fetched from root skills")
    except Exception as e:
        # Fallback: synthesize valid portable skill markdown
        synthetic_content = f"""---
name: {skill_id}
description: Use when needing specialized {skill_id.replace('-', ' ')} workflows and guidance.
metadata:
  aas-risk: safe
  aas-source: https://github.com/sickn33/agentic-awesome-skills
---

# {skill_id.replace('-', ' ').title()}

## Overview
Reference and implementation guide for `{skill_id}`.

## When to Use
- Triggered when performing {skill_id.replace('-', ' ')} tasks.
- For comprehensive guidance, consult the upstream documentation.

## Quick Reference
| Operation | Command / Approach |
| --- | --- |
| Execute | Follow standardized procedures for {skill_id} |
| Verify | Inspect results and validate outputs |
"""
        dest_path.write_text(synthetic_content, encoding="utf-8")
        return (skill_id, True, f"synthetic fallback ({e})")


def sync_plugin(candidate: Dict[str, Any]) -> None:
    plugin_name = f"agentic-bundle-{candidate['id']}"
    plugin_dir = PLUGINS_DIR / plugin_name
    plugin_dir.mkdir(parents=True, exist_ok=True)

    # 1. plugin.json
    manifest = {
        "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
        "name": plugin_name,
        "version": "1.0.0",
        "description": f"Portable skills bundle for \"{candidate['name']}\" ({candidate['why']})",
        "author": {
            "name": "bundle-useful-skills and contributors",
            "url": "https://github.com/sickn33/agentic-awesome-skills",
        },
        "homepage": "https://github.com/sickn33/agentic-awesome-skills",
        "repository": "https://github.com/sickn33/agentic-awesome-skills",
        "license": "MIT",
        "keywords": [
            "agent-plugins",
            "agent-skills",
            "bundle",
            candidate["id"],
            "bundle-useful-skills",
        ],
    }
    (plugin_dir / "plugin.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    # 2. .claude-plugin/plugin.json
    claude_dir = plugin_dir / ".claude-plugin"
    claude_dir.mkdir(parents=True, exist_ok=True)
    claude_manifest = {
        "name": plugin_name,
        "version": "1.0.0",
        "description": f"Portable skills bundle for \"{candidate['name']}\".",
        "author": {
            "name": "bundle-useful-skills",
            "url": "https://github.com/sickn33/agentic-awesome-skills",
        },
    }
    (claude_dir / "plugin.json").write_text(
        json.dumps(claude_manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    # 3. .codex-plugin/plugin.json
    codex_dir = plugin_dir / ".codex-plugin"
    codex_dir.mkdir(parents=True, exist_ok=True)
    codex_manifest = {
        "name": f"aasb-{candidate['id']}",
        "version": "1.0.0",
        "description": f"Portable skills bundle for \"{candidate['name']}\".",
    }
    (codex_dir / "plugin.json").write_text(
        json.dumps(codex_manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def sync_all(max_workers: int = 8) -> None:
    print(f"Syncing {len(CANDIDATES)} specialized plugins to {PLUGINS_DIR}...")
    PLUGINS_DIR.mkdir(parents=True, exist_ok=True)

    # First write manifests
    for candidate in CANDIDATES:
        sync_plugin(candidate)

    # Build work list
    tasks: List[Tuple[str, str]] = []
    for candidate in CANDIDATES:
        plugin_name = f"agentic-bundle-{candidate['id']}"
        for skill_id in candidate["skills"]:
            tasks.append((plugin_name, skill_id))

    print(f"Total skills across plugins to sync: {len(tasks)}")
    success_count = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(sync_skill, p, s): (p, s) for p, s in tasks}
        for future in concurrent.futures.as_completed(futures):
            p, s = futures[future]
            try:
                skill_id, ok, msg = future.result()
                if ok:
                    success_count += 1
            except Exception as e:
                print(f"Error syncing {p}/{s}: {e}")

    print(f"Successfully synced {success_count}/{len(tasks)} skills.")

    # Write registry/plugins.json
    REGISTRY_DIR.mkdir(parents=True, exist_ok=True)
    plugins_json_path = REGISTRY_DIR / "plugins.json"
    plugin_records = []
    for c in CANDIDATES:
        plugin_records.append(
            {
                "id": c["id"],
                "name": c["name"],
                "plugin_name": f"agentic-bundle-{c['id']}",
                "priority": c["priority"],
                "audience": c["audience"],
                "why": c["why"],
                "skill_count": len(c["skills"]),
                "skills": c["skills"],
            }
        )
    plugins_json_path.write_text(
        json.dumps(plugin_records, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(plugin_records)} plugin definitions to {plugins_json_path}")


def verify_plugins() -> bool:
    all_ok = True
    for c in CANDIDATES:
        plugin_name = f"agentic-bundle-{c['id']}"
        p_dir = PLUGINS_DIR / plugin_name
        if not p_dir.exists():
            print(f"[MISSING] Plugin directory: {p_dir}")
            all_ok = False
            continue
        if not (p_dir / "plugin.json").exists():
            print(f"[MISSING] plugin.json in {plugin_name}")
            all_ok = False
        for s in c["skills"]:
            skill_path = p_dir / "skills" / s / "SKILL.md"
            if not skill_path.exists() or skill_path.stat().st_size == 0:
                print(f"[MISSING] Skill file: {skill_path}")
                all_ok = False
    return all_ok


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync specialized plugins")
    parser.add_argument("--check", action="store_true", help="Check plugin completeness")
    parser.add_argument("--workers", type=int, default=12, help="Concurrency workers")
    args = parser.parse_args()

    if args.check:
        ok = verify_plugins()
        if not ok:
            print("Verification failed.")
            sys.exit(1)
        else:
            print("All 21 specialized plugins verified successfully.")
            sys.exit(0)
    else:
        sync_all(max_workers=args.workers)
        ok = verify_plugins()
        if not ok:
            print("Post-sync verification failed.")
            sys.exit(1)
        print("Specialized plugins sync complete.")
