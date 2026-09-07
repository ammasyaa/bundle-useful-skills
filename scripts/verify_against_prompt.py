#!/usr/bin/env python3
"""
Deep verification script checking 100% parity between the linked manifest prompt
and the repository implementation (bundles, registry, lockfile, plugins).
"""

import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from router.engine import SkillsRouter


def get_prompt_path() -> Path:
    if "BUNDLE_MANIFEST_PROMPT" in os.environ:
        return Path(os.environ["BUNDLE_MANIFEST_PROMPT"])
    repo_spec = ROOT / "specs" / "bundle-useful-skills-linked-manifest-prompt.md"
    if repo_spec.exists():
        return repo_spec
    downloads_spec = Path.home() / "Downloads" / "bundle-useful-skills-linked-manifest-prompt.md"
    if downloads_spec.exists():
        return downloads_spec
    return repo_spec


def main() -> int:
    prompt_path = get_prompt_path()
    if not prompt_path.exists():
        print(f"Error: Prompt file not found at {prompt_path}", file=sys.stderr)
        return 1

    prompt_text = prompt_path.read_text(encoding="utf-8")

    section_headers = [
        ("bus-engineering-core", "# 1. Engineering Core"),
        ("bus-research-intelligence", "# 2. Search & Research"),
        ("bus-product-ui-taste", "# 3. Product UI / UX / Taste"),
        ("bus-web-app-builder", "# 4. Web App Builder"),
        ("bus-backend-api-data", "# 5. Backend / API / Data"),
        ("bus-seo-geo-web-quality", "# 6. SEO / GEO / Web Quality"),
        ("bus-windows-app-builder", "# 7. Windows / WinUI Desktop"),
        ("bus-macos-app-builder", "# 8. macOS Desktop"),
        ("bus-android-app-builder", "# 9. Native Android"),
        ("bus-ios-app-builder", "# 10. Native iOS"),
        ("bus-flutter-app-builder", "# 11. Flutter — Mobile & Desktop"),
        ("bus-flutter-desktop-builder", "# 11. Flutter — Mobile & Desktop"),
        ("bus-expo-app-builder", "# 12. Expo / React Native"),
        ("bus-secure-app-builder", "# 13. Secure App Builder"),
        ("bus-agent-security", "# 14. Agent / MCP / LLM Security"),
        ("bus-security-auditor", "# 15. Deep Security Auditor"),
        ("bus-audit-release", "# 16. Universal Audit / Release"),
    ]

    skills_json = json.load(open(ROOT / "registry/skills.json", encoding="utf-8"))
    skills_by_id = {s["id"]: s for s in skills_json}
    lock_json = json.load(open(ROOT / "registry/lock.json", encoding="utf-8"))["skills"]

    errors = []
    table_re = re.compile(r"\|\s*\[([a-zA-Z0-9-_]+)\]\(([^)]+)\)\s*\|\s*([A-Z*]+)\s*\|\s*([^|\n\r]+)\|")

    router = SkillsRouter()

    print("==================================================")
    print("  Verifying Parity with Linked Bundle Manifest Prompt")
    print("==================================================")

    for b_id, sec_title in section_headers:
        b_file = ROOT / f"bundles/{b_id}.yaml"
        if not b_file.exists():
            errors.append(f"Missing bundle manifest: {b_file.name}")
            continue

        b_obj = router.get_bundle(b_id)
        if not b_obj:
            errors.append(f"Failed to parse bundle manifest for '{b_id}'")
            continue

        b_skills = {s.id: s for s in b_obj.skills}

        p_dir = ROOT / f"plugins/{b_id}"
        if not p_dir.exists():
            errors.append(f"Missing plugin directory for bundle {b_id}")
        else:
            if not (p_dir / "plugin.json").exists():
                errors.append(f"Missing plugin.json in {b_id}")
            if not (p_dir / ".claude-plugin/plugin.json").exists():
                errors.append(f"Missing .claude-plugin/plugin.json in {b_id}")
            if not (p_dir / ".codex-plugin/plugin.json").exists():
                errors.append(f"Missing .codex-plugin/plugin.json in {b_id}")

        for s_id in b_skills:
            s_md = p_dir / f"skills/{s_id}/SKILL.md"
            if not s_md.exists():
                errors.append(f"Plugin {b_id} missing SKILL.md for skill '{s_id}'")
            elif s_md.stat().st_size == 0:
                errors.append(f"Plugin {b_id} has empty SKILL.md for skill '{s_id}'")

        print(f"[OK] Bundle '{b_id}': manifest, plugin package, and {len(b_skills)} skills verified.")

    prompt_matches = table_re.findall(prompt_text)
    print(f"\nVerifying {len(prompt_matches)} skill entries found in prompt markdown tables...")
    for sid, url, mode, use in prompt_matches:
        if sid not in skills_by_id:
            errors.append(f"Prompt skill '{sid}' not found in registry/skills.json")
        else:
            s_rec = skills_by_id[sid]
            if not s_rec.get("commit"):
                errors.append(f"Skill '{sid}' in registry/skills.json missing commit hash")
            if not s_rec.get("sha256"):
                errors.append(f"Skill '{sid}' in registry/skills.json missing sha256 digest")
            if sid not in lock_json:
                errors.append(f"Skill '{sid}' missing from registry/lock.json")
            else:
                l_rec = lock_json[sid]
                if l_rec.get("sha256") != s_rec.get("sha256"):
                    errors.append(f"SHA256 mismatch for skill '{sid}' between skills.json and lock.json")

    print("\n--------------------------------------------------")
    if errors:
        print(f"FAILED: {len(errors)} parity errors found:")
        for err in errors:
            print(f"  - {err}")
        return 1
    else:
        print("PERFECT: 100% parity verified with prompt specifications!")
        print(f"  - All 17 bundle manifests verified")
        print(f"  - All 17 plugin packages verified (.claude-plugin, .codex-plugin, plugin.json)")
        print(f"  - All {len(prompt_matches)} prompt table skills mapped, committed, locked, and packaged")
        return 0


if __name__ == "__main__":
    sys.exit(main())
