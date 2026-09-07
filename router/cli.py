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
        help="List all 17 focused bundle manifests",
    )
    parser.add_argument(
        "--bundle",
        type=str,
        help="Inspect a specific focused bundle manifest by ID (e.g. bus-web-app-builder)",
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
        bundles = router.list_bundles()
        if args.json:
            out = [
                {
                    "id": b.id,
                    "job": b.job,
                    "skill_count": len(b.skills),
                    "recommended_with": b.recommended_with,
                }
                for b in bundles
            ]
            print(json.dumps(out, indent=2))
        else:
            print("==================================================")
            print("  Bundle Useful Skills: Focused Bundles (bus-*)")
            print("==================================================")
            for b in bundles:
                print(f"- {b.id}: {b.job} ({len(b.skills)} skills)")
                if b.recommended_with:
                    print(f"    Recommended with: {', '.join(b.recommended_with)}")
        return 0

    if args.bundle:
        b = router.get_bundle(args.bundle)
        if not b:
            print(f"Error: Bundle '{args.bundle}' not found.", file=sys.stderr)
            return 1
        if args.json:
            out = {
                "id": b.id,
                "job": b.job,
                "skills": [
                    {
                        "id": s.id,
                        "url": s.url,
                        "mode": s.mode,
                        "when": s.when,
                        "use": s.use,
                    }
                    for s in b.skills
                ],
                "recommended_with": b.recommended_with,
                "runtime_rules": b.runtime_rules,
            }
            print(json.dumps(out, indent=2))
        else:
            print(f"# Bundle: {b.id}")
            print(f"**Job:** {b.job}\n")
            print("## Constituent Skills:")
            for s in b.skills:
                cond = f" (when: {s.when})" if s.when else ""
                print(f"- `{s.id}` [{s.mode}]{cond}: {s.use}")
                print(f"  Source: {s.url}")
            if b.recommended_with:
                print("\n## Recommended With:")
                for r in b.recommended_with:
                    print(f"- {r}")
            if b.runtime_rules:
                print("\n## Runtime Rules:")
                for rule in b.runtime_rules:
                    print(f"- {rule}")
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
