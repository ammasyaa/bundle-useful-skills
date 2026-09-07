#!/usr/bin/env python3
"""
Supply-chain admission pipeline CLI for candidate Agent Skills.
Usage:
    python scripts/admit_skill.py \
      --id "org-skillname" \
      --name "Display Name" \
      --repo "https://github.com/org/repo" \
      --path "skills/name/SKILL.md" \
      --commit "4f8a3b1c9e2d7f6a5b4c3d2e1f0a9b8c7d6e5f4a" \
      --sha256 "9b1d8f7e6a5c4b3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d" \
      --license "MIT" \
      --authority "official-framework" \
      --platform "web" \
      --framework "react" \
      --domain "frontend" \
      --cost "low"
"""

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def admit_skill(args: argparse.Namespace) -> int:
    skills_path = ROOT / "registry" / "skills.json"
    lock_path = ROOT / "registry" / "lock.json"

    print("==================================================")
    print("  Bundle Useful Skills: Skill Admission Pipeline")
    print("==================================================")

    # 1. Validate ID
    if not re.match(r"^[a-z0-9-_]+$", args.id):
        print(f"[ERROR] Invalid skill ID format: {args.id}")
        return 1

    # 2. Check commit hash
    if not re.match(r"^[0-9a-f]{7,40}$", args.commit):
        print(f"[ERROR] Invalid commit hash: {args.commit}")
        return 1

    # 3. Compute or validate SHA-256
    sha256 = args.sha256
    if not sha256:
        # If candidate file exists locally, compute hash
        local_path = Path(args.path)
        if local_path.exists():
            content = local_path.read_bytes()
            sha256 = hashlib.sha256(content).hexdigest()
            print(f"[INFO] Computed SHA-256: {sha256}")
        else:
            print("[ERROR] SHA-256 must be provided or file must exist locally.")
            return 1
    elif not re.match(r"^[0-9a-f]{64}$", sha256):
        print(f"[ERROR] Invalid SHA-256 hash format: {sha256}")
        return 1

    # Load existing skills
    with open(skills_path, "r", encoding="utf-8") as f:
        skills = json.load(f)

    with open(lock_path, "r", encoding="utf-8") as f:
        lock = json.load(f)

    # Check duplicates
    if any(s["id"] == args.id for s in skills):
        print(f"[ERROR] Skill '{args.id}' already exists in registry!")
        return 1

    new_skill = {
        "id": args.id,
        "name": args.name,
        "source_repository": args.repo,
        "source_path": args.path,
        "license": args.license,
        "version": args.version or "1.0.0",
        "commit": args.commit,
        "sha256": sha256,
        "last_reviewed": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "authority_level": args.authority,
        "platform": args.platform,
        "framework": args.framework or "generic",
        "domain": args.domain,
        "task_types": args.task_types or [args.domain],
        "activation_cost": args.cost,
        "dependencies": args.dependencies or [],
        "conflicts": args.conflicts or [],
        "supersedes": [],
        "notes": args.notes or "Admitted via admission pipeline.",
    }

    # Append to skills
    skills.append(new_skill)
    # Append to lockfile
    lock["skills"][args.id] = {
        "source_repository": args.repo,
        "source_path": args.path,
        "commit": args.commit,
        "sha256": sha256,
        "pinned": True,
    }

    with open(skills_path, "w", encoding="utf-8") as f:
        json.dump(skills, f, indent=2)

    with open(lock_path, "w", encoding="utf-8") as f:
        json.dump(lock, f, indent=2)

    print(f"[SUCCESS] Successfully admitted and pinned '{args.id}' to registry and lockfile.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Admit a candidate Agent Skill into the registry")
    parser.add_argument("--id", required=True, help="Unique skill identifier")
    parser.add_argument("--name", required=True, help="Human display name")
    parser.add_argument("--repo", required=True, help="Upstream git repository URL")
    parser.add_argument("--path", required=True, help="Path to SKILL.md in repo")
    parser.add_argument("--commit", required=True, help="Exact git commit hash")
    parser.add_argument("--sha256", help="SHA-256 hash of SKILL.md")
    parser.add_argument("--license", required=True, help="License identifier (e.g. MIT, Apache-2.0)")
    parser.add_argument(
        "--authority",
        required=True,
        choices=[
            "native-platform",
            "official-framework",
            "first-party",
            "reviewed-specialist",
            "design-specialist",
            "community-audited",
        ],
    )
    parser.add_argument(
        "--platform",
        required=True,
        choices=[
            "universal",
            "web",
            "windows",
            "macos",
            "linux",
            "android",
            "ios",
            "mobile",
            "desktop",
            "cross-platform",
        ],
    )
    parser.add_argument("--framework", default="generic")
    parser.add_argument(
        "--domain",
        required=True,
        choices=[
            "engineering-process",
            "design-taste",
            "search-research",
            "frontend",
            "backend",
            "database",
            "seo-geo",
            "desktop",
            "mobile",
            "security",
            "code-review",
            "audit",
            "release",
        ],
    )
    parser.add_argument("--cost", choices=["low", "medium", "high"], default="medium")
    parser.add_argument("--version", default="1.0.0")
    parser.add_argument("--task-types", nargs="*")
    parser.add_argument("--dependencies", nargs="*")
    parser.add_argument("--conflicts", nargs="*")
    parser.add_argument("--notes", default="")

    args = parser.parse_args()
    return admit_skill(args)


if __name__ == "__main__":
    sys.exit(main())
