#!/usr/bin/env python3
"""
Verifies deterministic lockfile integrity and checksums.
Usage:
    python scripts/verify_lock.py
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def verify_lockfile() -> int:
    lock_path = ROOT / "registry" / "lock.json"
    skills_path = ROOT / "registry" / "skills.json"

    print("==================================================")
    print("  Bundle Useful Skills: Lockfile Verification")
    print("==================================================")

    if not lock_path.exists():
        print(f"[FATAL] Lockfile not found at {lock_path}")
        return 1

    with open(lock_path, "r", encoding="utf-8") as f:
        lock_data = json.load(f)

    with open(skills_path, "r", encoding="utf-8") as f:
        skills_data = json.load(f)

    skills_map = {s["id"]: s for s in skills_data}
    locked_skills = lock_data.get("skills", {})

    sha256_re = re.compile(r"^[0-9a-f]{64}$")
    commit_re = re.compile(r"^[0-9a-f]{7,40}$")

    errors = []
    print(f"Lockfile Version: {lock_data.get('version')}")
    print(f"Generated At:     {lock_data.get('generated_at')}")
    print(f"Locked Entries:   {len(locked_skills)}\n")

    for sid, entry in locked_skills.items():
        # Check commit
        commit = entry.get("commit", "")
        if not commit_re.match(commit):
            errors.append(f"Skill '{sid}' has invalid pinned commit hash: '{commit}'")

        # Check sha256
        sha256 = entry.get("sha256", "")
        if not sha256_re.match(sha256):
            errors.append(f"Skill '{sid}' has invalid SHA-256 checksum: '{sha256}'")

        # Check pinned flag
        if not entry.get("pinned", False):
            errors.append(f"Skill '{sid}' is not marked as pinned!")

        # Parity with skills.json
        if sid not in skills_map:
            errors.append(f"Skill '{sid}' in lock.json does not exist in skills.json!")
        else:
            s_entry = skills_map[sid]
            if s_entry["commit"] != commit:
                errors.append(f"Commit mismatch for '{sid}': lock={commit}, skills={s_entry['commit']}")
            if s_entry["sha256"] != sha256:
                errors.append(f"SHA-256 mismatch for '{sid}': lock={sha256}, skills={s_entry['sha256']}")

    # Check for skills in skills.json missing from lock.json
    for sid in skills_map:
        if sid not in locked_skills:
            errors.append(f"Skill '{sid}' from skills.json is missing in lock.json!")

    if errors:
        print(f"[FAIL] Detected {len(errors)} lockfile errors:")
        for err in errors:
            print(f"  - {err}")
        return 1

    print("[PASS] All 44 skills deterministically pinned with valid SHA-256 hashes.")
    return 0


if __name__ == "__main__":
    sys.exit(verify_lockfile())
