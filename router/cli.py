"""
Command-line interface for bundle-useful-skills router.
"""

import argparse
import json
import sys
from pathlib import Path

from .models import TaskRequest
from .engine import SkillsRouter


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    parser = argparse.ArgumentParser(
        description="bundle-useful-skills: Minimum Sufficient Agent Skills Router"
    )
    parser.add_argument(
        "query",
        type=str,
        nargs="?",
        help="Task description or request string to route",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output route result as machine-readable JSON",
    )
    parser.add_argument(
        "--project-type",
        choices=["web", "mobile", "desktop", "search-research", "mixed"],
        help="Explicit project type override",
    )
    parser.add_argument(
        "--task-type",
        help="Explicit task type override (e.g. frontend, backend, security, audit)",
    )
    parser.add_argument(
        "--framework",
        help="Explicit framework override (e.g. react, winui, swiftui-ios, flutter, expo)",
    )
    parser.add_argument(
        "--platform",
        help="Explicit platform override (e.g. web, windows, macos, ios, android)",
    )
    parser.add_argument(
        "--risk",
        choices=["LOW", "MEDIUM", "HIGH", "RELEASE"],
        help="Explicit risk level override",
    )
    parser.add_argument(
        "--check-conflicts",
        nargs="+",
        metavar="SKILL_ID",
        help="Check whether a specific list of skill IDs contains mutual exclusions",
    )
    parser.add_argument(
        "--list-bundles",
        action="store_true",
        help="List all 21 specialized plugin bundles from the roadmap",
    )
    parser.add_argument(
        "--bundle",
        type=str,
        help="Inspect a specific specialized plugin bundle (e.g. aas-accessibility-inclusive-ux)",
    )

    args = parser.parse_args()

    router = SkillsRouter()

    if args.check_conflicts:
        conflicts, warnings = router.check_conflicts(args.check_conflicts)
        if args.json:
            print(json.dumps({"conflicts": conflicts, "warnings": warnings}, indent=2))
        else:
            if not conflicts and not warnings:
                print("[PASS] No conflicts or warnings detected for skills:", ", ".join(args.check_conflicts))
            else:
                for c in conflicts:
                    print(f"[CONFLICT] {c}")
                for w in warnings:
                    print(f"[WARNING] {w}")
        return 1 if conflicts else 0
 
    if args.list_bundles:
        if args.json:
            out = [
                {
                    "id": p.id,
                    "name": p.name,
                    "plugin_name": p.plugin_name,
                    "why": p.why,
                    "skill_count": p.skill_count,
                    "skills": p.skills,
                }
                for p in router.plugins.values()
            ]
            print(json.dumps(out, indent=2))
        else:
            print("==================================================")
            print("  Specialized Plugin Bundles (Roadmap 2026)")
            print("==================================================")
            for p in router.plugins.values():
                print(f"- {p.name} (`{p.id}` / `{p.plugin_name}`): {p.skill_count} skills")
                print(f"  Why: {p.why}")
                print(f"  Skills: {', '.join(p.skills)}\n")
        return 0

    if args.bundle:
        b_id = args.bundle.replace("agentic-bundle-", "")
        if b_id not in router.plugins:
            print(f"[ERROR] Specialized bundle '{args.bundle}' not found. Use --list-bundles to see available bundles.")
            return 1
        bundle = router.plugins[b_id]
        if args.json:
            print(json.dumps({
                "id": bundle.id,
                "name": bundle.name,
                "plugin_name": bundle.plugin_name,
                "priority": bundle.priority,
                "audience": bundle.audience,
                "why": bundle.why,
                "skills": bundle.skills,
            }, indent=2))
        else:
            print(f"# Bundle: {bundle.name} ({bundle.plugin_name})")
            print(f"**Audience**: {bundle.audience}")
            print(f"**Objective**: {bundle.why}")
            print(f"**Skill Count**: {bundle.skill_count}")
            print("\n## Included Skills:")
            for s in bundle.skills:
                skill_obj = router.skills.get(s)
                authority = skill_obj.authority_level if skill_obj else "unknown"
                print(f"- `{s}` ({authority})")
        return 0

    if not args.query:
        if not sys.stdin.isatty():
            query_str = sys.stdin.read().strip()
        else:
            parser.print_help()
            return 1
    else:
        query_str = args.query
    req = TaskRequest(
        query=query_str,
        project_type=args.project_type,
        task_type=args.task_type,
        framework=args.framework,
        platform=args.platform,
        risk_level=args.risk,
    )

    result = router.route(req)

    if args.json:
        print(json.dumps(result.to_dict(), indent=2))
    else:
        print(result.to_markdown())

    return 0


if __name__ == "__main__":
    sys.exit(main())
