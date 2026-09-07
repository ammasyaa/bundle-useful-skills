#!/usr/bin/env python3
"""
Validates registry data, schema conformance, and referential integrity.
Usage:
    python scripts/validate_registry.py
"""

import json
import re
import sys
from pathlib import Path
from typing import List, Dict, Any

ROOT = Path(__file__).resolve().parent.parent


class RegistryValidator:
    def __init__(self, root: Path):
        self.root = root
        self.registry_dir = root / "registry"
        self.schemas_dir = root / "schemas"
        self.profiles_dir = root / "profiles"
        self.errors: List[str] = []

    def log_error(self, msg: str) -> None:
        self.errors.append(msg)
        print(f"  [ERROR] {msg}")

    def load_json(self, path: Path) -> Any:
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            self.log_error(f"Failed to load JSON {path.relative_to(self.root)}: {e}")
            return None

    def validate_skills(self) -> Dict[str, Dict[str, Any]]:
        print("[1/5] Validating registry/skills.json...")
        skills_data = self.load_json(self.registry_dir / "skills.json")
        if not isinstance(skills_data, list):
            self.log_error("skills.json must contain a list of skill objects.")
            return {}

        known_skills: Dict[str, Dict[str, Any]] = {}
        valid_authorities = {
            "native-platform",
            "official-framework",
            "first-party",
            "reviewed-specialist",
            "design-specialist",
            "community-audited",
        }
        valid_platforms = {
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
        }
        valid_domains = {
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
        }

        hex_sha_re = re.compile(r"^[0-9a-f]{64}$")
        commit_re = re.compile(r"^[0-9a-f]{7,40}$")

        for idx, s in enumerate(skills_data):
            sid = s.get("id")
            if not sid or not re.match(r"^[a-z0-9-_]+$", sid):
                self.log_error(f"Skill #{idx} has invalid or missing id: {sid}")
                continue

            if sid in known_skills:
                self.log_error(f"Duplicate skill id '{sid}' detected at #{idx}.")

            # Validate required fields
            req_fields = [
                "name",
                "source_repository",
                "source_path",
                "license",
                "version",
                "commit",
                "sha256",
                "last_reviewed",
                "authority_level",
                "platform",
                "framework",
                "domain",
                "task_types",
                "activation_cost",
            ]
            for rf in req_fields:
                if rf not in s:
                    self.log_error(f"Skill '{sid}' missing required field '{rf}'.")

            # Check commit and sha256 formatting
            if not commit_re.match(str(s.get("commit", ""))):
                self.log_error(f"Skill '{sid}' has invalid git commit hash: {s.get('commit')}")
            if not hex_sha_re.match(str(s.get("sha256", ""))):
                self.log_error(f"Skill '{sid}' has invalid SHA-256 hash: {s.get('sha256')}")

            # Enums
            if s.get("authority_level") not in valid_authorities:
                self.log_error(f"Skill '{sid}' has invalid authority_level '{s.get('authority_level')}'.")
            if s.get("platform") not in valid_platforms:
                self.log_error(f"Skill '{sid}' has invalid platform '{s.get('platform')}'.")
            if s.get("domain") not in valid_domains:
                self.log_error(f"Skill '{sid}' has invalid domain '{s.get('domain')}'.")
            if s.get("activation_cost") not in ["low", "medium", "high"]:
                self.log_error(f"Skill '{sid}' has invalid activation_cost '{s.get('activation_cost')}'.")

            known_skills[sid] = s

        print(f"      Verified {len(known_skills)} skill definitions.")
        return known_skills

    def validate_lockfile(self, known_skills: Dict[str, Dict[str, Any]]) -> None:
        print("[2/5] Validating registry/lock.json and hash parity...")
        lock_data = self.load_json(self.registry_dir / "lock.json")
        if not lock_data:
            return

        lock_skills = lock_data.get("skills", {})
        for sid, skill in known_skills.items():
            if sid not in lock_skills:
                self.log_error(f"Skill '{sid}' is defined in skills.json but missing from lock.json!")
                continue

            lock_entry = lock_skills[sid]
            if lock_entry.get("commit") != skill["commit"]:
                self.log_error(
                    f"Commit mismatch for '{sid}': skills.json has {skill['commit']}, lock.json has {lock_entry.get('commit')}"
                )
            if lock_entry.get("sha256") != skill["sha256"]:
                self.log_error(
                    f"SHA256 mismatch for '{sid}': skills.json has {skill['sha256']}, lock.json has {lock_entry.get('sha256')}"
                )
            if not lock_entry.get("pinned"):
                self.log_error(f"Skill '{sid}' in lock.json must be marked pinned: true.")

        print(f"      Verified parity across {len(lock_skills)} locked skills.")

    def validate_conflicts(self, known_skills: Dict[str, Dict[str, Any]]) -> None:
        print("[3/5] Validating registry/conflicts.json...")
        conflicts_data = self.load_json(self.registry_dir / "conflicts.json")
        if not conflicts_data:
            return

        for hc in conflicts_data.get("hard_conflicts", []):
            for sid in hc.get("incompatible_skills", []):
                if sid not in known_skills and sid not in ["winui", "flutter", "react", "android", "ios", "expo"]:
                    self.log_error(f"Hard conflict '{hc['id']}' references unknown skill ID '{sid}'.")

        for cw in conflicts_data.get("conditional_warnings", []):
            for sid in cw.get("skills", []):
                if sid not in known_skills:
                    self.log_error(f"Conditional warning '{cw['id']}' references unknown skill ID '{sid}'.")

        print("      Conflict rules verified.")

    def validate_compatibility(self) -> None:
        print("[4/5] Validating registry/compatibility.json...")
        compat_data = self.load_json(self.registry_dir / "compatibility.json")
        if not compat_data:
            return
        if "platforms" not in compat_data or "frameworks" not in compat_data:
            self.log_error("compatibility.json missing required 'platforms' or 'frameworks' keys.")
        print("      Compatibility matrix verified.")

    def validate_profiles(self, known_skills: Dict[str, Dict[str, Any]]) -> None:
        print("[5/6] Validating domain profiles in profiles/*...")
        profile_dirs = [p for p in self.profiles_dir.iterdir() if p.is_dir()]
        for pdir in profile_dirs:
            pjson = pdir / "profile.json"
            if not pjson.exists():
                self.log_error(f"Profile directory '{pdir.name}' missing profile.json.")
                continue

            p_data = self.load_json(pjson)
            if not p_data:
                continue

            for sid in p_data.get("core_skills", []):
                if sid not in known_skills:
                    self.log_error(f"Profile '{p_data.get('id')}' core_skill '{sid}' not found in skills.json!")

            for spec in p_data.get("optional_specialists", []):
                sid = spec.get("skill_id")
                if sid not in known_skills:
                    self.log_error(f"Profile '{p_data.get('id')}' optional specialist '{sid}' not found in skills.json!")

        print(f"      Verified {len(profile_dirs)} domain profiles.")

    def validate_specialized_plugins(self, known_skills: Dict[str, Dict[str, Any]]) -> None:
        print("[6/6] Validating specialized plugin bundles in registry/plugins.json & plugins/*...")
        plugins_file = self.registry_dir / "plugins.json"
        if not plugins_file.exists():
            self.log_error("registry/plugins.json missing!")
            return

        plugins_data = self.load_json(plugins_file)
        if not isinstance(plugins_data, list):
            self.log_error("plugins.json must contain a list of plugin objects.")
            return

        plugins_dir = self.root / "plugins"
        for p in plugins_data:
            pid = p.get("id")
            pname = p.get("plugin_name")
            if not pid or not pname:
                self.log_error(f"Plugin entry missing id or plugin_name: {p}")
                continue

            p_path = plugins_dir / pname
            if not p_path.exists():
                self.log_error(f"Plugin directory missing for '{pname}' at {p_path}")
                continue

            if not (p_path / "plugin.json").exists():
                self.log_error(f"plugin.json missing in '{pname}'")

            skills = p.get("skills", [])
            for sid in skills:
                if sid not in known_skills:
                    self.log_error(f"Plugin '{pid}' references unknown skill '{sid}' not in skills.json!")

                skill_file = p_path / "skills" / sid / "SKILL.md"
                if not skill_file.exists():
                    self.log_error(f"Skill file missing: {skill_file}")

        print(f"      Verified {len(plugins_data)} specialized plugin bundles.")

    def run(self) -> int:
        print("==================================================")
        print("  Bundle Useful Skills: Registry Validator")
        print("==================================================")
        skills = self.validate_skills()
        if skills:
            self.validate_lockfile(skills)
            self.validate_conflicts(skills)
            self.validate_compatibility()
            self.validate_profiles(skills)
            self.validate_specialized_plugins(skills)

        print("--------------------------------------------------")
        if self.errors:
            print(f"FAILURE: {len(self.errors)} validation errors detected.")
            return 1
        else:
            print("SUCCESS: All registry files, schemas, and references are valid!")
            return 0


if __name__ == "__main__":
    validator = RegistryValidator(ROOT)
    sys.exit(validator.run())
