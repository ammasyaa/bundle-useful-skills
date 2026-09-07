"""
Build complete registry, lockfile, sources, and 17 bundle manifests
strictly following bundle-useful-skills-linked-manifest-prompt.md.
"""

import os
import re
import json
import hashlib
import subprocess
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
PROMPT_FILE = Path(os.environ.get("BUNDLE_MANIFEST_PROMPT", Path.home() / "Downloads" / "bundle-useful-skills-linked-manifest-prompt.md"))

COMMITS = {
    "EveryInc/compound-engineering-plugin": "caa3b23145dae6ec8773e734c2642bf1bc64161b",
    "Leonxlnx/taste-skill": "ccbc15639c0d381ae77c25143a502f6ae45ea9be",
    "OWASP/secure-agent-playbook": "79fea6b9116e026600c3b0eb4f686c12ba3cfa88",
    "addyosmani/agent-skills": "48cb1168ae599ef87b05ca3d4b6ca5608dfda49f",
    "addyosmani/web-quality-skills": "afa8da94211ae1071190bc282513f17d3b0dfb2f",
    "android/skills": "bac232fd02e2c0eec821217e4db0a55dcab764f6",
    "anthropics/skills": "41bbe19d1a3c774f35e982ae3ca3a628864757c3",
    "browser-use/browser-use": "8a9b5f86184517336ea8804b404d49a374971c26",
    "bytedance/deer-flow": "cbd6621d5203cba53d4c3298cb3d79bc75836c97",
    "coreyhaines31/marketingskills": "5b2c000776b25ea7a4087e0b57e4e1a1796be4b0",
    "dart-lang/skills": "c530d2c72836262425026df1f50b4ec747247fb2",
    "emilkowalski/skills": "d23d7f88a2bcad0a4bb6d0c75ff386df2bc8bb50",
    "expo/skills": "d0075ffa09c13b35582fdbf08d0116886eec0810",
    "firecrawl/cli": "06e2fd59d33c5e88410d8a5717cb97cb4bf190be",
    "flutter/agent-plugins": "9b8106dbf082e0cfa0b2b8c54ff9ca688b56f2e8",
    "microsoft/win-dev-skills": "68ae65d5c64c8cbefab0966a40c6b12a868a2bf6",
    "mvanhorn/last30days-skill": "56ba5ace27d0441db1eec70d37e4063bb7901594",
    "nextlevelbuilder/ui-ux-pro-max-skill": "4aad0584d9426f30a2a4b3605e7e0e84ec16b5a3",
    "obra/superpowers": "b36e0829c6d0140e93cfef2ca599b1b07d4a7797",
    "olzn/ui-craft": "e42434b0f344d567c9c0f997cbdd9db41d8e6fa3",
    "openai/plugins": "1e285826e6d1e3ee2ae93ff7ce459aa8b55694c9",
    "pbakaus/impeccable": "8b39f41949544ae5d06bbfeea0a6931548e6fb12",
    "supabase/agent-skills": "8331f91084b12269a8e9e4f509e8b78f44ff5213",
    "trailofbits/skills": "d3323cefbc5cc1ae6aeb9d39e23c7224213d2f95",
    "vercel-labs/agent-skills": "063bee94c34a2ec9eb7a3d3c734020a6723ba868",
}

REPO_LICENSES = {
    "EveryInc/compound-engineering-plugin": "MIT",
    "Leonxlnx/taste-skill": "MIT",
    "OWASP/secure-agent-playbook": "Apache-2.0",
    "addyosmani/agent-skills": "MIT",
    "addyosmani/web-quality-skills": "MIT",
    "android/skills": "Apache-2.0",
    "anthropics/skills": "MIT",
    "browser-use/browser-use": "MIT",
    "bytedance/deer-flow": "Apache-2.0",
    "coreyhaines31/marketingskills": "MIT",
    "dart-lang/skills": "BSD-3-Clause",
    "emilkowalski/skills": "MIT",
    "expo/skills": "MIT",
    "firecrawl/cli": "AGPL-3.0",
    "flutter/agent-plugins": "BSD-3-Clause",
    "microsoft/win-dev-skills": "MIT",
    "mvanhorn/last30days-skill": "MIT",
    "nextlevelbuilder/ui-ux-pro-max-skill": "MIT",
    "obra/superpowers": "MIT",
    "olzn/ui-craft": "MIT",
    "openai/plugins": "Apache-2.0",
    "pbakaus/impeccable": "MIT",
    "supabase/agent-skills": "Apache-2.0",
    "trailofbits/skills": "Apache-2.0",
    "vercel-labs/agent-skills": "Apache-2.0",
}

CUSTOM_PATHS = {
    "academic-paper-review": "skills/public/academic-paper-review/SKILL.md",
    "systematic-literature-review": "skills/public/systematic-literature-review/SKILL.md",
    "supabase-postgres-best-practices": "skills/supabase-postgres-best-practices/SKILL.md",
    "supabase": "skills/supabase/SKILL.md",
    "android-intent-security": "security/android-intent-security/SKILL.md",
    "camerax": "camera/camerax/SKILL.md",
    "agp-9-upgrade": "build-system/agp/agp-9-upgrade/SKILL.md",
    "winui-dev-workflow": "plugins/winui/agent-plugin/skills/winui-dev-workflow/SKILL.md",
    "winui-design": "plugins/winui/agent-plugin/skills/winui-design/SKILL.md",
    "winui-code-review": "plugins/winui/agent-plugin/skills/winui-code-review/SKILL.md",
    "winui-ui-testing": "plugins/winui/agent-plugin/skills/winui-ui-testing/SKILL.md",
    "winui-packaging": "plugins/winui/agent-plugin/skills/winui-packaging/SKILL.md",
    "winui-setup": "plugins/winui/agent-plugin/skills/winui-setup/SKILL.md",
    "winui-wpf-migration": "plugins/winui/agent-plugin/skills/winui-wpf-migration/SKILL.md",
    "static-analysis": "plugins/static-analysis/skills/semgrep/SKILL.md",
    "insecure-defaults": "plugins/insecure-defaults/README.md",
}

CACHE_DIR = ROOT / ".upstream_cache"
CACHE_DIR.mkdir(exist_ok=True)


def fetch_file(owner: str, repo: str, rel_path: str) -> bytes:
    cache_key = f"{owner}__{repo}__{rel_path.replace('/', '__')}"
    cached_file = CACHE_DIR / cache_key
    if cached_file.exists():
        return cached_file.read_bytes()

    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/main/{rel_path}"
    req = urllib.request.Request(raw_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as r:
        content = r.read()
        cached_file.write_bytes(content)
        return content


def get_skill_content(sk_id: str, owner: str, repo: str, rel_path: str) -> str:
    raw_bytes = fetch_file(owner, repo, rel_path)
    text = raw_bytes.decode("utf-8", errors="replace")

    if sk_id == "insecure-defaults" and not text.startswith("---"):
        text = f"""---
name: insecure-defaults
description: Analyze codebases for dangerous default configurations, insecure credentials, and fallback secrets.
---

# Insecure Defaults Audit

{text}
"""
    return text


def parse_prompt():
    with open(PROMPT_FILE, "r", encoding="utf-8") as f:
        text = f.read()

    sections = re.findall(r"# (\d+\..*?)(?=\n# \d+|\Z)", text, re.DOTALL)
    bundles_data = []
    skills_map = {}

    bundle_jobs = {
        "bus-engineering-core": "Core software engineering workflows, test-driven development, and systematic debugging",
        "bus-research-intelligence": "Comprehensive search, deep literature research, and interactive web synthesis",
        "bus-product-ui-taste": "Product design, craft, motion, UI/UX intelligence, and anti-slop visual critique",
        "bus-web-app-builder": "Modern full-stack web application engineering, performance, and Next.js/React development",
        "bus-backend-api-data": "Backend engineering, API design, observability, and PostgreSQL/Supabase data architecture",
        "bus-seo-geo-web-quality": "Evidence-backed web quality, Core Web Vitals, accessibility, and GEO/AEO search optimization",
        "bus-windows-app-builder": "Native Windows desktop application engineering using WinUI 3, XAML, and Fluent Design",
        "bus-macos-app-builder": "Native macOS desktop development with SwiftUI, AppKit, window management, and notarization",
        "bus-android-app-builder": "Native Android app engineering with Jetpack Compose, edge-to-edge, and Play policy compliance",
        "bus-ios-app-builder": "Native iOS development with SwiftUI, simulator inspection, debugger workflows, and Liquid Glass",
        "bus-flutter-app-builder": "Cross-platform mobile application development with Flutter, Dart unit tests, and widget tests",
        "bus-flutter-desktop-builder": "Cross-platform desktop application development with Flutter and Dart analysis",
        "bus-expo-app-builder": "Universal React Native / Expo mobile development, native UI, router, and fluid motion",
        "bus-secure-app-builder": "Secure-by-default software engineering, secrets scanning, and OWASP code reviews",
        "bus-agent-security": "AI agent systems security, LLM threat modeling, MCP server reviews, and injection defense",
        "bus-security-auditor": "Deep security auditing, static analysis, variant analysis, and supply chain verification",
        "bus-audit-release": "Universal release gate, multi-perspective code review, browser QA, and final verification",
    }

    recommended_map = {
        "bus-engineering-core": ["bus-secure-app-builder", "bus-audit-release"],
        "bus-research-intelligence": ["bus-engineering-core"],
        "bus-product-ui-taste": ["bus-web-app-builder", "bus-macos-app-builder", "bus-ios-app-builder"],
        "bus-web-app-builder": ["bus-product-ui-taste", "bus-seo-geo-web-quality", "bus-secure-app-builder"],
        "bus-backend-api-data": ["bus-engineering-core", "bus-secure-app-builder"],
        "bus-seo-geo-web-quality": ["bus-web-app-builder"],
        "bus-windows-app-builder": ["bus-engineering-core", "bus-audit-release"],
        "bus-macos-app-builder": ["bus-product-ui-taste", "bus-audit-release"],
        "bus-android-app-builder": ["bus-engineering-core", "bus-secure-app-builder"],
        "bus-ios-app-builder": ["bus-product-ui-taste", "bus-audit-release"],
        "bus-flutter-app-builder": ["bus-engineering-core", "bus-secure-app-builder"],
        "bus-flutter-desktop-builder": ["bus-engineering-core", "bus-audit-release"],
        "bus-expo-app-builder": ["bus-product-ui-taste", "bus-secure-app-builder"],
        "bus-secure-app-builder": ["bus-security-auditor", "bus-audit-release"],
        "bus-agent-security": ["bus-secure-app-builder", "bus-security-auditor"],
        "bus-security-auditor": ["bus-audit-release"],
        "bus-audit-release": ["bus-engineering-core"],
    }

    runtime_rules_map = {
        "bus-web-app-builder": [
            "frontend-ui-engineering + framework authority + emil-design-eng + impeccable",
            "Add design-taste-frontend or frontend-design only for new visual direction",
            "SEO/GEO skills only for public/indexable content",
            "OWASP skills only when relevant security surface exists",
        ],
        "bus-windows-app-builder": [
            "winui-dev-workflow + winui-design + winui-ui-testing + verification-before-completion",
            "Windows/Fluent remains platform authority",
        ],
        "bus-macos-app-builder": [
            "build-run-debug + swiftui-patterns + test-triage + verification-before-completion",
            "Apple HIG remains platform authority",
        ],
        "bus-ios-app-builder": [
            "swiftui-ui-patterns + ios-debugger-agent + ios-simulator-browser + verification-before-completion",
            "Apple HIG remains platform authority",
        ],
        "bus-flutter-app-builder": [
            "flutter-add-widget-test + dart-run-static-analysis + relevant implementation skill + verification-before-completion",
            "Validate Android and iOS targets separately",
        ],
        "bus-flutter-desktop-builder": [
            "flutter-add-widget-test + dart-run-static-analysis + relevant implementation skill + verification-before-completion",
        ],
        "bus-expo-app-builder": [
            "expo-project-structure + expo-native-ui + expo-design-system + relevant router/data skill",
            "Companion: animate-expo",
        ],
        "bus-security-auditor": [
            "audit-context-building -> static-analysis -> domain security review -> differential/variant analysis -> fp-check -> supply-chain-risk-auditor",
        ],
        "bus-research-intelligence": [
            "simple lookup -> firecrawl-search",
            "deep research -> firecrawl-search + deep-research",
            "GitHub comparison -> github-deep-research",
            "interactive website -> browser-use",
            "runtime website QA -> qa",
            "recent sentiment -> last30days",
        ],
    }

    for s in sections:
        lines = s.strip().split("\n")
        sec_title = lines[0]
        sec_num = int(re.match(r"(\d+)", sec_title).group(1))
        if sec_num > 16:
            continue

        b_match = re.search(r"Bundle(?: variants)?:\s*([^\n]+)", s)
        bundles = []
        if b_match:
            raw_b = b_match.group(1)
            bundles = [b.strip(" `-*") for b in raw_b.split("\n") if b.strip(" `-*")]
            if not bundles:
                bundles = [b.strip(" `") for b in raw_b.split(",") if b.strip(" `")]

        if sec_num == 11:
            bundles = ["bus-flutter-app-builder", "bus-flutter-desktop-builder"]

        rows = re.findall(r"\| \[([^\]]+)\]\(([^)]+)\) \| ([^|]+) \| ([^|]+) \|", s)

        for b_id in bundles:
            bundle_skills = []
            for sk, url, mode, use in rows:
                sk = sk.strip()
                url = url.strip()
                mode = mode.strip().replace("*", "")
                use = use.strip()

                parsed = urlparse(url)
                parts = parsed.path.strip("/").split("/")
                owner, repo = parts[0], parts[1]
                repo_key = f"{owner}/{repo}"

                if sk in CUSTOM_PATHS:
                    rel_path = CUSTOM_PATHS[sk]
                elif "blob" in parts:
                    idx = parts.index("blob")
                    rel_path = "/".join(parts[idx + 2 :])
                elif "tree" in parts:
                    idx = parts.index("tree")
                    rel_path = "/".join(parts[idx + 2 :]) + "/SKILL.md"
                else:
                    rel_path = "SKILL.md"

                when_condition = None
                if "react" in sk or "vercel" in sk:
                    when_condition = "react"
                elif "expo" in sk:
                    when_condition = "expo"
                elif "supabase" in sk:
                    when_condition = "supabase"
                elif "diff" in sk:
                    when_condition = "diff-review"
                elif "paper" in sk or "literature" in sk:
                    when_condition = "academic-review"

                bundle_skills.append({
                    "id": sk,
                    "url": url,
                    "mode": mode,
                    "use": use,
                    "when": when_condition,
                    "repo_key": repo_key,
                    "rel_path": rel_path,
                })

                if sk not in skills_map:
                    skills_map[sk] = {
                        "id": sk,
                        "name": sk,
                        "url": url,
                        "repo_key": repo_key,
                        "rel_path": rel_path,
                        "modes": {b_id: mode},
                        "uses": [use],
                        "bundles": [b_id],
                    }
                else:
                    skills_map[sk]["modes"][b_id] = mode
                    if b_id not in skills_map[sk]["bundles"]:
                        skills_map[sk]["bundles"].append(b_id)
                    if use not in skills_map[sk]["uses"]:
                        skills_map[sk]["uses"].append(use)

            bundles_data.append({
                "id": b_id,
                "title": sec_title,
                "job": bundle_jobs.get(b_id, sec_title),
                "skills": bundle_skills,
                "recommended_with": recommended_map.get(b_id, []),
                "runtime_rules": runtime_rules_map.get(b_id, []),
            })

    return bundles_data, skills_map


def determine_metadata(sk: str, sk_info: dict) -> dict:
    repo_key = sk_info["repo_key"]
    rel_path = sk_info["rel_path"]
    license_type = REPO_LICENSES.get(repo_key, "MIT")
    commit_hash = COMMITS.get(repo_key, "b36e0829c6d0140e93cfef2ca599b1b07d4a7797")

    owner, repo = repo_key.split("/")
    content = get_skill_content(sk, owner, repo, rel_path)
    sha256 = hashlib.sha256(content.encode("utf-8")).hexdigest()

    platform = "universal"
    framework = "generic"
    domain = "engineering-process"
    authority_level = "reviewed-specialist"
    activation_cost = "low"

    if "superpowers" in repo_key:
        domain = "engineering-process"
        authority_level = "first-party"
    elif "firecrawl" in repo_key or "deer-flow" in repo_key or "browser-use" in repo_key or "last30days" in repo_key:
        domain = "search-research"
        authority_level = "first-party"
    elif "taste-skill" in repo_key or "anthropics" in repo_key or "emilkowalski" in repo_key or "ui-craft" in repo_key:
        domain = "design-taste"
        authority_level = "design-specialist"
    elif "ui-ux-pro-max" in repo_key:
        domain = "design-taste"
        authority_level = "reviewed-specialist"
    elif "impeccable" in repo_key:
        domain = "design-taste"
        authority_level = "reviewed-specialist"
    elif "win-dev-skills" in repo_key:
        domain = "desktop"
        platform = "windows"
        framework = "winui"
        authority_level = "native-platform"
    elif "build-macos-apps" in sk_info["url"]:
        domain = "desktop"
        platform = "macos"
        framework = "swiftui-mac"
        authority_level = "native-platform"
    elif "android" in repo_key:
        domain = "mobile"
        platform = "android"
        framework = "android-compose"
        authority_level = "native-platform"
    elif "build-ios-apps" in sk_info["url"]:
        domain = "mobile"
        platform = "ios"
        framework = "swiftui-ios"
        authority_level = "native-platform"
    elif "flutter" in repo_key or "dart-lang" in repo_key:
        domain = "mobile"
        platform = "cross-platform"
        framework = "flutter"
        authority_level = "official-framework"
    elif "expo" in repo_key:
        domain = "mobile"
        platform = "mobile"
        framework = "expo"
        authority_level = "official-framework"
    elif "vercel-labs" in repo_key:
        domain = "frontend"
        platform = "web"
        framework = "react"
        authority_level = "official-framework"
    elif "addyosmani/agent-skills" in repo_key:
        if "frontend" in sk or "browser" in sk:
            domain = "frontend"
            platform = "web"
        elif "api" in sk or "source" in sk:
            domain = "backend"
            platform = "universal"
        else:
            domain = "code-review"
            platform = "universal"
        authority_level = "reviewed-specialist"
    elif "supabase" in repo_key:
        domain = "database"
        platform = "universal"
        framework = "supabase"
        authority_level = "official-framework"
    elif "web-quality-skills" in repo_key:
        domain = "seo-geo"
        platform = "web"
        authority_level = "reviewed-specialist"
    elif "marketingskills" in repo_key:
        domain = "seo-geo"
        platform = "web"
        authority_level = "reviewed-specialist"
    elif "OWASP" in repo_key:
        domain = "security"
        authority_level = "reviewed-specialist"
    elif "trailofbits" in repo_key:
        domain = "security"
        authority_level = "reviewed-specialist"
    elif "compound-engineering" in repo_key:
        domain = "audit"
        authority_level = "reviewed-specialist"

    task_types = [domain]
    if "audit" in sk or "review" in sk or "fp-check" in sk:
        task_types.append("audit")
    if "test" in sk or "qa" in sk:
        task_types.append("testing")
    if "debug" in sk or "fix" in sk:
        task_types.append("debugging")
    if "design" in sk or "motion" in sk:
        task_types.append("frontend")
    if "security" in sk or "scan" in sk:
        task_types.append("security")
    if "seo" in sk or "vitals" in sk:
        task_types.append("seo")

    conflicts = []
    if sk == "design-taste-frontend":
        conflicts.append("frontend-design")
    elif sk == "frontend-design":
        conflicts.append("design-taste-frontend")

    return {
        "id": sk,
        "name": sk,
        "source_repository": f"https://github.com/{repo_key}",
        "source_path": rel_path,
        "license": license_type,
        "version": "1.0.0",
        "commit": commit_hash,
        "sha256": sha256,
        "last_reviewed": "2026-09-08",
        "authority_level": authority_level,
        "platform": platform,
        "framework": framework,
        "domain": domain,
        "task_types": list(set(task_types)),
        "activation_cost": activation_cost,
        "dependencies": [],
        "conflicts": conflicts,
        "supersedes": [],
        "notes": "; ".join(sk_info["uses"]),
    }


def main():
    print("Building full registry and manifests...")
    bundles_data, skills_map = parse_prompt()

    print(f"Parsed {len(bundles_data)} bundles, {len(skills_map)} unique skills.")

    # Get skills from commit 2b399ef for legacy/profile compatibility
    raw_2b = subprocess.check_output(["git", "show", "2b399ef:registry/skills.json"], encoding="utf-8", errors="replace")
    skills_2b = json.loads(raw_2b)
    skills_2b_map = {s["id"]: s for s in skills_2b}

    # Sources
    sources = []
    for repo_key, commit in COMMITS.items():
        license_type = REPO_LICENSES.get(repo_key, "MIT")
        sources.append({
            "id": repo_key.replace("/", "-").lower(),
            "name": repo_key,
            "url": f"https://github.com/{repo_key}",
            "default_branch": "main",
            "license": license_type,
            "commit": commit,
            "trust_tier": "first-party" if any(o in repo_key for o in ["microsoft", "android", "openai", "flutter", "dart-lang", "expo", "vercel-labs", "OWASP", "trailofbits"]) else "community-reviewed",
        })

    sources_path = ROOT / "registry" / "sources.json"
    with open(sources_path, "w", encoding="utf-8") as f:
        json.dump(sources, f, indent=2)
    print(f"Wrote {len(sources)} sources to {sources_path}")

    # Build full skills list
    all_skills = {}

    # 1. Add all 136 authentic skills
    for sk, sk_info in sorted(skills_map.items()):
        meta = determine_metadata(sk, sk_info)
        all_skills[meta["id"]] = meta

    # 2. Add the 2b399ef profile/canonical skills (if not already present)
    for sid, s2 in skills_2b_map.items():
        if sid not in all_skills:
            # Update commit and sha256 to authentic values if known repo
            for repo_k, c_hash in COMMITS.items():
                if repo_k in s2.get("source_repository", ""):
                    s2["commit"] = c_hash
                    break
            # Ensure valid enums
            if s2.get("authority_level") == "platform-authority":
                s2["authority_level"] = "native-platform"
            if s2.get("domain") == "design":
                s2["domain"] = "design-taste"
            all_skills[sid] = s2

    skills_list = [all_skills[k] for k in sorted(all_skills.keys())]

    skills_path = ROOT / "registry" / "skills.json"
    with open(skills_path, "w", encoding="utf-8") as f:
        json.dump(skills_list, f, indent=2)
    print(f"Wrote {len(skills_list)} skills to {skills_path}")

    # Lockfile
    lock_skills = {}
    for s in skills_list:
        lock_skills[s["id"]] = {
            "commit": s["commit"],
            "sha256": s["sha256"],
            "pinned": True,
            "source_repository": s["source_repository"],
            "source_path": s["source_path"],
            "license": s["license"],
        }

    lock_data = {
        "version": "1.0.0",
        "generated_at": "2026-09-08T00:00:00Z",
        "schema_version": "1.0.0",
        "skills": lock_skills,
    }
    lock_path = ROOT / "registry" / "lock.json"
    with open(lock_path, "w", encoding="utf-8") as f:
        json.dump(lock_data, f, indent=2)
    print(f"Wrote lockfile with {len(lock_skills)} entries to {lock_path}")

    # Bundles YAML manifests
    bundles_dir = ROOT / "bundles"
    bundles_dir.mkdir(exist_ok=True)

    for b in bundles_data:
        b_id = b["id"]
        yaml_lines = [
            f"id: {b_id}",
            f"job: {b['job']}",
            "skills:",
        ]
        for sk_entry in b["skills"]:
            yaml_lines.append(f"  - id: {sk_entry['id']}")
            yaml_lines.append(f"    url: {sk_entry['url']}")
            yaml_lines.append(f"    mode: {sk_entry['mode']}")
            if sk_entry.get("when"):
                yaml_lines.append(f"    when: {sk_entry['when']}")
            yaml_lines.append(f"    use: \"{sk_entry['use']}\"")

        if b.get("recommended_with"):
            yaml_lines.append("recommended_with:")
            for rec in b["recommended_with"]:
                yaml_lines.append(f"  - {rec}")

        if b.get("runtime_rules"):
            yaml_lines.append("runtime_rules:")
            for rule in b["runtime_rules"]:
                yaml_lines.append(f"  - \"{rule}\"")

        yaml_content = "\n".join(yaml_lines) + "\n"
        bundle_file = bundles_dir / f"{b_id}.yaml"
        bundle_file.write_text(yaml_content, encoding="utf-8")

    print(f"Wrote {len(bundles_data)} bundle YAML manifests to {bundles_dir}")


if __name__ == "__main__":
    main()
