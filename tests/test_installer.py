"""
Unit tests for bundle-useful-skills universal installer.
"""

import tempfile
import unittest
from pathlib import Path

from router.installer import (
    get_agent_targets,
    detect_installed_agents,
    install_router_to_dir,
    install_bundle_to_dir,
    run_installation,
)


class TestInstaller(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.home = Path(self.temp_dir.name)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_get_agent_targets(self):
        targets = get_agent_targets(home_dir=self.home)
        self.assertIn("antigravity", targets)
        self.assertIn("codex", targets)
        self.assertIn("claude", targets)
        self.assertIn("cursor", targets)

        # Check antigravity paths
        antigravity_paths = [str(p) for p in targets["antigravity"]]
        self.assertTrue(any(".gemini" in p for p in antigravity_paths))

    def test_detect_installed_agents(self):
        status = detect_installed_agents(home_dir=self.home)
        self.assertIsInstance(status, dict)
        self.assertIn("antigravity", status)
        self.assertIn("detected", status["antigravity"])

    def test_install_router_to_dir(self):
        dest = self.home / "skills"
        ok, msg = install_router_to_dir(dest, dry_run=False)
        self.assertTrue(ok)
        self.assertTrue((dest / "bundle-useful-skills" / "SKILL.md").exists())

    def test_install_router_dry_run(self):
        dest = self.home / "dry_skills"
        ok, msg = install_router_to_dir(dest, dry_run=True)
        self.assertTrue(ok)
        self.assertIn("DRY-RUN", msg)
        self.assertFalse((dest / "bundle-useful-skills").exists())

    def test_install_bundle_to_dir(self):
        dest = self.home / "bundle_skills"
        dest.mkdir(parents=True, exist_ok=True)
        ok, msg = install_bundle_to_dir("bus-engineering-core", dest, dry_run=False)
        self.assertTrue(ok)
        self.assertIn("Installed", msg)
        # Verify at least one skill was copied
        self.assertTrue((dest / "systematic-debugging" / "SKILL.md").exists())

    def test_run_installation_dry_run(self):
        res = run_installation(target="all", home_dir=self.home, dry_run=True)
        self.assertTrue(res["success"])
        self.assertGreater(len(res["details"]), 0)

    def test_run_installation_specific_bundle(self):
        res = run_installation(
            target="antigravity",
            bundle="bus-engineering-core",
            home_dir=self.home,
            dry_run=False,
        )
        self.assertTrue(res["success"])
        target_path = self.home / ".gemini" / "antigravity" / "skills"
        self.assertTrue((target_path / "systematic-debugging" / "SKILL.md").exists())


if __name__ == "__main__":
    unittest.main()
