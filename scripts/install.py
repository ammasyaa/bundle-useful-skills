#!/usr/bin/env python3
"""
bundle-useful-skills universal installer CLI.
Installs the router and focused bundles into AI agent environments:
- Google Antigravity (~/.gemini/antigravity/skills or ~/.gemini/config/skills)
- Anthropic Claude Code (~/.claude/plugins or ~/.claude/skills)
- OpenAI Codex (~/.codex/skills)
- Cursor / Windsurf (.cursor/skills or ~/.cursor/skills)
"""

import argparse
import json
import sys
from pathlib import Path

# Add repo root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from router.installer import (
    detect_installed_agents,
    run_installation,
)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="bundle-useful-skills: Fast & Universal AI Agent Skills Installer"
    )
    parser.add_argument(
        "--target",
        choices=["all", "antigravity", "codex", "claude", "cursor"],
        default="all",
        help="Target AI agent environment (default: all detected agents)",
    )
    parser.add_argument(
        "--bundle",
        type=str,
        help="Install specific focused bundle (e.g. bus-web-app-builder) or 'all'",
    )
    parser.add_argument(
        "--list-targets",
        action="store_true",
        help="Detect and list available AI agent environments",
    )
    parser.add_argument(
        "--list-bundles",
        action="store_true",
        help="List all installable focused bundles",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate installation without making changes",
    )
    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="Uninstall bundle-useful-skills from specified target",
    )
    parser.add_argument(
        "--home",
        type=str,
        help="Custom user home directory override (for testing or isolation)",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output result as JSON",
    )

    args = parser.parse_args()
    custom_home = Path(args.home).resolve() if args.home else None

    if args.list_targets:
        status = detect_installed_agents(home_dir=custom_home)
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

    if args.list_bundles:
        bundles = sorted([d.name.replace(".yaml", "") for d in (PROJECT_ROOT / "bundles").glob("*.yaml")])
        if args.json:
            print(json.dumps(bundles, indent=2))
        else:
            print("==================================================")
            print("  Installable Focused Bundles (bus-*)")
            print("==================================================")
            for b in bundles:
                print(f"- {b}")
        return 0

    res = run_installation(
        target=args.target,
        bundle=args.bundle,
        home_dir=custom_home,
        dry_run=args.dry_run,
        uninstall=args.uninstall,
    )

    if args.json:
        print(json.dumps(res, indent=2))
    else:
        title = "Uninstallation" if args.uninstall else "Installation"
        print("==================================================")
        print(f"  Bundle Useful Skills: {title} Summary")
        print("==================================================")
        for line in res["details"]:
            print(f"- {line}")
        print("--------------------------------------------------")
        if res["success"]:
            print(f"[SUCCESS] {title} completed cleanly!")
        else:
            print(f"[FAILED] Errors occurred during {title.lower()}.")
            if "error" in res:
                print(f"Error: {res['error']}")

    return 0 if res["success"] else 1


if __name__ == "__main__":
    sys.exit(main())
