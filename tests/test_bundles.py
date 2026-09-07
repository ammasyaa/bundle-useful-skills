"""
Tests for focused bundle manifests, portable plugins, and registry integration.
Strictly verifies requirements from bundle-useful-skills-linked-manifest-prompt.md.
"""

import json
import unittest
from pathlib import Path

from router.engine import SkillsRouter

ROOT = Path(__file__).resolve().parent.parent

EXPECTED_BUNDLES = [
    "bus-engineering-core",
    "bus-research-intelligence",
    "bus-product-ui-taste",
    "bus-web-app-builder",
    "bus-backend-api-data",
    "bus-seo-geo-web-quality",
    "bus-windows-app-builder",
    "bus-macos-app-builder",
    "bus-android-app-builder",
    "bus-ios-app-builder",
    "bus-flutter-app-builder",
    "bus-flutter-desktop-builder",
    "bus-expo-app-builder",
    "bus-secure-app-builder",
    "bus-agent-security",
    "bus-security-auditor",
    "bus-audit-release",
]


class TestBundleManifestsAndPlugins(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.router = SkillsRouter(base_dir=ROOT)
        cls.bundles_dir = ROOT / "bundles"
        cls.plugins_dir = ROOT / "plugins"
        cls.registry_dir = ROOT / "registry"

        with open(cls.registry_dir / "skills.json", "r", encoding="utf-8") as f:
            cls.skills = {s["id"]: s for s in json.load(f)}

        with open(cls.registry_dir / "plugins.json", "r", encoding="utf-8") as f:
            cls.plugins = {p["id"]: p for p in json.load(f)}

    def test_all_17_bundles_exist_in_bundles_dir(self):
        """Verify that all 17 focused bundle YAML manifests exist."""
        for b_id in EXPECTED_BUNDLES:
            b_path = self.bundles_dir / f"{b_id}.yaml"
            self.assertTrue(b_path.exists(), f"Missing bundle manifest: {b_path}")
            content = b_path.read_text(encoding="utf-8")
            self.assertIn(f"id: {b_id}", content)
            self.assertIn("job:", content)
            self.assertIn("skills:", content)

    def test_all_17_bundles_loaded_in_router(self):
        """Verify that SkillsRouter parses and loads all 17 bundles."""
        loaded_bundles = self.router.list_bundles()
        self.assertEqual(len(loaded_bundles), 17)
        for b_id in EXPECTED_BUNDLES:
            bundle = self.router.get_bundle(b_id)
            self.assertIsNotNone(bundle, f"Failed to retrieve bundle '{b_id}' from router")
            self.assertGreaterEqual(len(bundle.skills), 5, f"Bundle '{b_id}' has too few skills")

    def test_all_17_plugins_generated(self):
        """Verify that portable plugins exist under plugins/ for all 17 bundles."""
        for b_id in EXPECTED_BUNDLES:
            p_dir = self.plugins_dir / b_id
            self.assertTrue(p_dir.exists(), f"Missing plugin directory: {p_dir}")

            # Manifests
            self.assertTrue((p_dir / "plugin.json").exists())
            self.assertTrue((p_dir / ".claude-plugin" / "plugin.json").exists())
            self.assertTrue((p_dir / ".codex-plugin" / "plugin.json").exists())

            # Skills folder
            skills_folder = p_dir / "skills"
            self.assertTrue(skills_folder.exists())

            # Every skill has SKILL.md
            bundle = self.router.get_bundle(b_id)
            for sk in bundle.skills:
                sk_file = skills_folder / sk.id / "SKILL.md"
                self.assertTrue(
                    sk_file.exists(),
                    f"Bundle '{b_id}' is missing SKILL.md for skill '{sk.id}' at {sk_file}"
                )
                self.assertGreater(sk_file.stat().st_size, 20)

    def test_bundle_skills_exist_in_registry(self):
        """Verify that every skill in every bundle exists in registry/skills.json."""
        for b_id in EXPECTED_BUNDLES:
            bundle = self.router.get_bundle(b_id)
            for sk in bundle.skills:
                self.assertIn(
                    sk.id,
                    self.skills,
                    f"Bundle '{b_id}' references skill '{sk.id}' not in registry/skills.json"
                )

    def test_plugins_json_integrity(self):
        """Verify registry/plugins.json references all 17 bundles."""
        self.assertEqual(len(self.plugins), 17)
        for b_id in EXPECTED_BUNDLES:
            self.assertIn(b_id, self.plugins)
            entry = self.plugins[b_id]
            self.assertEqual(entry["id"], b_id)
            self.assertEqual(entry["skill_count"], len(entry["skills"]))
            self.assertGreaterEqual(entry["skill_count"], 5)

    def test_bundles_runtime_rules_and_recommendations(self):
        """Verify that all 17 bundles specify runtime_rules and recommended_with."""
        for b_id in EXPECTED_BUNDLES:
            bundle = self.router.get_bundle(b_id)
            self.assertIsNotNone(bundle)
            self.assertGreater(
                len(bundle.runtime_rules),
                0,
                f"Bundle '{b_id}' has empty runtime_rules!"
            )
            self.assertGreater(
                len(bundle.recommended_with),
                0,
                f"Bundle '{b_id}' has empty recommended_with!"
            )

    def test_route_generates_recommended_bundles(self):
        """Verify that routing plans recommend appropriate focused bundles."""
        from router.models import TaskRequest
        req = TaskRequest(
            query="Build a high performance Next.js web application",
            project_type="web",
            framework="react",
        )
        res = self.router.route(req)
        self.assertIn("bus-web-app-builder", res.recommended_bundles)

    def test_all_sources_cataloged(self):
        """Verify that registry/sources.json has all 31 sources referenced in the prompt."""
        sources_path = self.registry_dir / "sources.json"
        with open(sources_path, "r", encoding="utf-8") as f:
            sources = json.load(f)
        self.assertEqual(len(sources), 31)
        source_ids = {s["id"] for s in sources}
        self.assertIn("cloudflare-skills", source_ids)
        self.assertIn("neondatabase-agent-skills", source_ids)
        self.assertIn("prisma-skills", source_ids)
        self.assertIn("laravel-agent-skills", source_ids)
        self.assertIn("sickn33-agentic-awesome-skills", source_ids)
        self.assertIn("snyk-agent-scan", source_ids)


if __name__ == "__main__":
    unittest.main()
