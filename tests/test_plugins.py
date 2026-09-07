"""
Tests for specialized plugin bundles from the Agentic Awesome Skills roadmap.
Verifies bundle manifests, skill directories, frontmatter compliance,
and the reference accessibility plugin (agentic-bundle-aas-accessibility-inclusive-ux).
"""

import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class TestSpecializedPlugins(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.plugins_dir = ROOT / "plugins"
        cls.registry_dir = ROOT / "registry"
        cls.plugins_json_path = cls.registry_dir / "plugins.json"

        with open(cls.plugins_json_path, "r", encoding="utf-8") as f:
            cls.plugins = json.load(f)

    def test_21_plugins_registered(self):
        """Verify all 21 specialized plugins from the roadmap are present in registry."""
        self.assertEqual(len(self.plugins), 21)
        plugin_ids = [p["id"] for p in self.plugins]
        self.assertIn("aas-accessibility-inclusive-ux", plugin_ids)
        self.assertIn("aas-web-app-builder", plugin_ids)
        self.assertIn("aas-security-engineer", plugin_ids)
        self.assertIn("aas-secure-app-builder", plugin_ids)
        self.assertIn("aas-product-design-studio", plugin_ids)
        self.assertIn("aas-qa-test-automation", plugin_ids)

    def test_reference_accessibility_bundle_skills(self):
        """
        Verify the exact reference plugin from user prompt & attached image:
        agentic-bundle-aas-accessibility-inclusive-ux contains all 8 skills.
        """
        a11y_plugin = next(
            (p for p in self.plugins if p["id"] == "aas-accessibility-inclusive-ux"),
            None,
        )
        self.assertIsNotNone(a11y_plugin)
        expected_skills = [
            "accesslint-audit",
            "accesslint-diff",
            "accesslint-scan",
            "fixing-accessibility",
            "playwright-skill",
            "screen-reader-testing",
            "ui-a11y",
            "webapp-testing",
        ]
        self.assertEqual(sorted(a11y_plugin["skills"]), sorted(expected_skills))

        # Check physical presence on disk
        bundle_dir = self.plugins_dir / "agentic-bundle-aas-accessibility-inclusive-ux"
        self.assertTrue(bundle_dir.exists())
        self.assertTrue((bundle_dir / "plugin.json").exists())
        self.assertTrue((bundle_dir / ".claude-plugin" / "plugin.json").exists())
        self.assertTrue((bundle_dir / ".codex-plugin" / "plugin.json").exists())

        for s in expected_skills:
            skill_dir = bundle_dir / "skills" / s
            self.assertTrue(skill_dir.exists(), f"Skill dir {skill_dir} must exist")
            skill_file = skill_dir / "SKILL.md"
            self.assertTrue(skill_file.exists(), f"SKILL.md in {skill_dir} must exist")
            self.assertGreater(skill_file.stat().st_size, 50)

    def test_all_plugins_have_manifests_and_skills(self):
        """Verify all 21 plugins have valid manifests and SKILL.md files."""
        fm_re = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)
        for p in self.plugins:
            p_name = p["plugin_name"]
            p_dir = self.plugins_dir / p_name
            self.assertTrue(p_dir.exists(), f"Plugin directory {p_dir} must exist")
            self.assertTrue((p_dir / "plugin.json").exists(), f"plugin.json missing in {p_dir}")

            with open(p_dir / "plugin.json", "r", encoding="utf-8") as f:
                manifest = json.load(f)
            self.assertEqual(manifest["name"], p_name)

            for s in p["skills"]:
                skill_path = p_dir / "skills" / s / "SKILL.md"
                self.assertTrue(skill_path.exists(), f"SKILL.md missing: {skill_path}")
                content = skill_path.read_text(encoding="utf-8")
                self.assertRegex(content, fm_re, f"SKILL.md in {skill_path} must have YAML frontmatter")


if __name__ == "__main__":
    unittest.main()
