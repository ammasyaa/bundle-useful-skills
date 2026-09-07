"""
Tests for registry schema compliance, lockfile parity, and reference integrity.
"""

import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class TestRegistryIntegrity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.skills_path = ROOT / "registry" / "skills.json"
        cls.lock_path = ROOT / "registry" / "lock.json"
        cls.conflicts_path = ROOT / "registry" / "conflicts.json"
        cls.profiles_dir = ROOT / "profiles"

        with open(cls.skills_path, "r", encoding="utf-8") as f:
            cls.skills = json.load(f)

        with open(cls.lock_path, "r", encoding="utf-8") as f:
            cls.lock = json.load(f)

        with open(cls.conflicts_path, "r", encoding="utf-8") as f:
            cls.conflicts = json.load(f)

    def test_skills_count_and_uniqueness(self):
        self.assertGreaterEqual(len(self.skills), 40)
        ids = [s["id"] for s in self.skills]
        self.assertEqual(len(ids), len(set(ids)), "Skill IDs must be unique!")

    def test_skills_lockfile_parity(self):
        locked_skills = self.lock.get("skills", {})
        self.assertEqual(len(self.skills), len(locked_skills), "skills.json and lock.json must have exact parity!")

        for s in self.skills:
            sid = s["id"]
            self.assertIn(sid, locked_skills)
            entry = locked_skills[sid]
            self.assertEqual(s["commit"], entry["commit"])
            self.assertEqual(s["sha256"], entry["sha256"])
            self.assertTrue(entry["pinned"])

    def test_sha256_format(self):
        sha256_re = re.compile(r"^[0-9a-f]{64}$")
        for s in self.skills:
            self.assertTrue(
                sha256_re.match(s["sha256"]),
                f"Skill '{s['id']}' has invalid SHA-256 checksum: {s['sha256']}",
            )

    def test_commit_format(self):
        commit_re = re.compile(r"^[0-9a-f]{7,40}$")
        for s in self.skills:
            self.assertTrue(
                commit_re.match(s["commit"]),
                f"Skill '{s['id']}' has invalid git commit hash: {s['commit']}",
            )

    def test_profiles_reference_valid_skills(self):
        known_skill_ids = {s["id"] for s in self.skills}
        profile_files = list(self.profiles_dir.glob("*/profile.json"))
        self.assertGreaterEqual(len(profile_files), 6)

        for pfile in profile_files:
            with open(pfile, "r", encoding="utf-8") as f:
                pdata = json.load(f)
            for sid in pdata.get("core_skills", []):
                self.assertIn(
                    sid,
                    known_skill_ids,
                    f"Profile '{pdata['id']}' references unknown core skill '{sid}'",
                )
            for spec in pdata.get("optional_specialists", []):
                sid = spec.get("skill_id")
                self.assertIn(
                    sid,
                    known_skill_ids,
                    f"Profile '{pdata['id']}' references unknown specialist skill '{sid}'",
                )


if __name__ == "__main__":
    unittest.main()
