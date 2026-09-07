#!/usr/bin/env python3
"""
Populates authoritative runtime_rules and recommended_with into all 17 bundle manifests
and keeps registry/plugins.json in 100% synchronization.
"""

import json
import yaml
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

BUNDLE_RULES = {
    "bus-engineering-core": {
        "recommended_with": ["bus-audit-release", "bus-secure-app-builder"],
        "runtime_rules": [
            "Do not activate the entire Superpowers set for every task",
            "Ambiguous or new feature design -> brainstorming",
            "Multi-step implementation plan -> writing-plans",
            "Feature or bug work suited to TDD -> test-driven-development",
            "Bugs, failures, unknown root causes -> systematic-debugging",
            "Pre-merge review -> requesting-code-review",
            "Evidence before completion claims -> verification-before-completion",
            "Large parallelizable implementation -> subagent-driven-development",
        ],
    },
    "bus-research-intelligence": {
        "recommended_with": ["bus-engineering-core"],
        "runtime_rules": [
            "simple lookup -> firecrawl-search",
            "deep research -> firecrawl-search + deep-research",
            "GitHub comparison -> github-deep-research",
            "individual academic paper review -> academic-paper-review",
            "literature synthesis -> systematic-literature-review",
            "interactive website -> browser-use",
            "runtime website QA -> qa",
            "recent sentiment -> last30days",
        ],
    },
    "bus-product-ui-taste": {
        "recommended_with": ["bus-web-app-builder", "bus-macos-app-builder", "bus-ios-app-builder"],
        "runtime_rules": [
            "Never activate both creative directors (design-taste-frontend and frontend-design) together",
            "Apple taste != copy Apple UI: Apply craft, restraint, hierarchy, feedback and motion quality through the target platform's native conventions",
            "Interface craft and design engineering baseline -> emil-design-eng + impeccable",
            "Deep design-system architecture -> ui-craft + surface-* + system-*",
            "Motion review and codebase improvement -> review-animations + improve-animations",
        ],
    },
    "bus-web-app-builder": {
        "recommended_with": ["bus-product-ui-taste", "bus-seo-geo-web-quality", "bus-secure-app-builder"],
        "runtime_rules": [
            "frontend-ui-engineering + framework authority + emil-design-eng + impeccable",
            "Add design-taste-frontend or frontend-design only when new visual direction is actually needed",
            "SEO/GEO skills only for public/indexable content",
            "OWASP skills only when relevant security surface exists",
            "Never apply React/web guidelines as Flutter, SwiftUI, or WinUI authority",
        ],
    },
    "bus-backend-api-data": {
        "recommended_with": ["bus-engineering-core", "bus-secure-app-builder"],
        "runtime_rules": [
            "source-driven-development + api-and-interface-design + code-review-and-quality",
            "Activate supabase-postgres-best-practices for PostgreSQL schema, query, index, or RLS work, not every backend",
            "Activate supabase only for actual Supabase projects",
            "Conditional provider sources (Cloudflare, Neon, Prisma, Laravel): resolve only when project uses the provider",
        ],
    },
    "bus-seo-geo-web-quality": {
        "recommended_with": ["bus-web-app-builder"],
        "runtime_rules": [
            "Evidence preference: field/RUM -> DevTools/Lighthouse -> runtime inspection -> static source",
            "public/indexable route -> SEO + GEO/AEO + CWV",
            "private/auth route -> normally exclude from search optimization",
            "ai-seo + schema + site-architecture for GEO, AEO, and LLM citation readiness",
        ],
    },
    "bus-windows-app-builder": {
        "recommended_with": ["bus-engineering-core", "bus-audit-release"],
        "runtime_rules": [
            "winui-dev-workflow + winui-design + winui-ui-testing + verification-before-completion",
            "Windows/Fluent remains platform authority. Taste skills may improve craft but must not make WinUI imitate macOS",
            "Activate winui-packaging, winui-setup, or winui-wpf-migration only when specifically required",
        ],
    },
    "bus-macos-app-builder": {
        "recommended_with": ["bus-product-ui-taste", "bus-audit-release"],
        "runtime_rules": [
            "build-run-debug + swiftui-patterns + test-triage + verification-before-completion",
            "Platform authority: current Apple HIG + native macOS conventions",
            "Design companion when needed: emil-design-eng + apple-design + impeccable",
            "Activate signing-entitlements, packaging-notarization, or telemetry conditionally",
        ],
    },
    "bus-android-app-builder": {
        "recommended_with": ["bus-engineering-core", "bus-secure-app-builder"],
        "runtime_rules": [
            "android-cli + edge-to-edge + verification-before-completion",
            "Use android-cli/official catalog to discover newer Android skills before adding custom ones",
            "Android/Material remains implementation authority",
            "Validate Play policy, camera, and AGP upgrade skills conditionally",
        ],
    },
    "bus-ios-app-builder": {
        "recommended_with": ["bus-product-ui-taste", "bus-audit-release"],
        "runtime_rules": [
            "swiftui-ui-patterns + ios-debugger-agent + ios-simulator-browser + verification-before-completion",
            "Apple HIG remains platform authority",
            "Activate profiling (ettrace, memgraph) and view refactoring conditionally",
        ],
    },
    "bus-flutter-app-builder": {
        "recommended_with": ["bus-engineering-core", "bus-secure-app-builder"],
        "runtime_rules": [
            "flutter-add-widget-test + dart-run-static-analysis + relevant implementation skill + verification-before-completion",
            "For mobile targets, validate Android and iOS separately",
            "Activate coverage, mocks, and package conflict resolution conditionally",
        ],
    },
    "bus-flutter-desktop-builder": {
        "recommended_with": ["bus-engineering-core", "bus-audit-release"],
        "runtime_rules": [
            "flutter-add-widget-test + dart-run-static-analysis + relevant implementation skill + verification-before-completion",
            "Adhere to desktop platform idioms (keyboard, mouse, window resizing) rather than mobile conventions",
            "Activate coverage, mocks, and package conflict resolution conditionally",
        ],
    },
    "bus-expo-app-builder": {
        "recommended_with": ["bus-product-ui-taste", "bus-secure-app-builder"],
        "runtime_rules": [
            "expo-project-structure + expo-native-ui + expo-design-system + relevant router/data skill",
            "Motion companion: animate-expo",
            "Activate dev-client, native module, and upgrade skills conditionally",
        ],
    },
    "bus-secure-app-builder": {
        "recommended_with": ["bus-security-auditor", "bus-audit-release"],
        "runtime_rules": [
            "Activate security automatically when work touches auth, permissions, PII, payments, persistence, file I/O, networking, cryptography, IPC, WebViews, secrets or untrusted input",
            "security-guidance + code-review-security + secrets-scan as core baseline",
            "Activate domain security reviews (web, API, mobile, IaC, SCA) conditionally based on surface",
        ],
    },
    "bus-agent-security": {
        "recommended_with": ["bus-secure-app-builder", "bus-security-auditor"],
        "runtime_rules": [
            "agent-security-audit for agent-system security review",
            "mcp-server-review for MCP server review and validation",
            "prompt-injection-test for authorized prompt-injection testing only",
            "llm-risk-assess and agentic-ai-risk-assess for AI application risk and multi-agent threat modeling",
        ],
    },
    "bus-security-auditor": {
        "recommended_with": ["bus-audit-release"],
        "runtime_rules": [
            "Audit order: audit-context-building -> static-analysis -> domain security review -> differential/variant analysis as relevant -> fp-check -> supply-chain-risk-auditor",
            "Validate suspected findings with fp-check before reporting",
            "Analyze footguns and dangerous defaults with sharp-edges and insecure-defaults conditionally",
        ],
    },
    "bus-audit-release": {
        "recommended_with": ["bus-engineering-core"],
        "runtime_rules": [
            "code-review-and-quality + verification-before-completion",
            "Do not make Compound Engineering compete with Superpowers as the normal implementation process; use primarily as independent audit/release capabilities",
            "Invoke independent specialist auditors (impeccable for UI, web-quality-audit, audit-context-building, supply-chain-risk-auditor) for high-risk changes",
        ],
    },
}


def sync():
    bundles_dir = ROOT / "bundles"
    plugins_file = ROOT / "registry" / "plugins.json"

    with open(plugins_file, "r", encoding="utf-8") as f:
        plugins_data = json.load(f)
    plugins_by_id = {p["id"]: p for p in plugins_data}

    for bid, meta in BUNDLE_RULES.items():
        yfile = bundles_dir / f"{bid}.yaml"
        if not yfile.exists():
            print(f"Warning: {yfile} not found!")
            continue

        with open(yfile, "r", encoding="utf-8") as yf:
            bdata = yaml.safe_load(yf)

        bdata["recommended_with"] = meta["recommended_with"]
        bdata["runtime_rules"] = meta["runtime_rules"]

        # Write clean YAML
        with open(yfile, "w", encoding="utf-8") as yf:
            yaml.dump(bdata, yf, sort_keys=False, default_flow_style=False, allow_unicode=True)

        if bid in plugins_by_id:
            plugins_by_id[bid]["recommended_with"] = meta["recommended_with"]
            plugins_by_id[bid]["runtime_rules"] = meta["runtime_rules"]

    with open(plugins_file, "w", encoding="utf-8") as f:
        json.dump(list(plugins_by_id.values()), f, indent=2)

    print(f"Successfully synced runtime rules and recommendations across {len(BUNDLE_RULES)} bundles and plugins!")


if __name__ == "__main__":
    sync()
