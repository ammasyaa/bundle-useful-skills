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
    parser.add_argument(
        "--doctor",
        action="store_true",
        help="Run health check and diagnostics across all AI agent platforms",
    )
    parser.add_argument(
        "--all-skills",
        action="store_true",
        help="Install all 136+ unique skills across all 17 bundles alongside the router",
    )
    parser.add_argument(
        "--install",
        nargs="?",
        const="all",
        choices=["all", "antigravity", "codex", "claude", "cursor", "windsurf"],
        metavar="TARGET",
        help="Install router into AI agent environment (all, antigravity, codex, claude, cursor, windsurf)",
    )
    parser.add_argument(
        "--install-bundle",
        type=str,
        metavar="BUNDLE_ID",
        help="Install specific focused bundle into AI agent environment (or 'all' for all 17 bundles)",
    )
    parser.add_argument(
        "--list-targets",
        action="store_true",
        help="Detect and list available AI agent environments",
    )

    args = parser.parse_args()

    if args.doctor or (args.query and args.query.lower().strip() == "doctor"):
        from .installer import get_doctor_report, format_doctor_report
        report = get_doctor_report()
        if args.json:
            print(json.dumps(report, indent=2))
        else:
            print(format_doctor_report(report))
        return 0

    if args.list_targets:
        from .installer import detect_installed_agents
        status = detect_installed_agents()
        if args.json:
            print(json.dumps(status, indent=2))
        else:
            print("==================================================")
            print("  Detected AI Agent Environments")
            print("==================================================")
            for agent, data in status.items():
                mark = "[ACTIVE]" if data["detected"] else "[NOT FOUND]"
                print(f"{mark:<12} {agent:<14} -> {data['active_path']}")
        return 0

    if args.install or args.install_bundle or args.all_skills:
        from .installer import run_installation
        target = args.install or "all"
        bundle = "all" if args.all_skills else args.install_bundle
        res = run_installation(target=target, bundle=bundle)
        if args.json:
            print(json.dumps(res, indent=2))
        else:
            print("==================================================")
            print("  Bundle Useful Skills: Installation Summary")
            print("==================================================")
            for line in res["details"]:
                print(f"- {line}")
            print("--------------------------------------------------")
            if res["success"]:
                print("[SUCCESS] Installation completed cleanly!")
                print("\nRun 'bus doctor' to verify live detection across all agent environments.")
            else:
                print("[FAILED] Installation encountered errors.")
        return 0 if res["success"] else 1

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
