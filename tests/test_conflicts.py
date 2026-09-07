"""
Tests for hard conflict detection and mutual exclusions.
"""

import unittest
from pathlib import Path

from router.engine import SkillsRouter

ROOT = Path(__file__).resolve().parent.parent


class TestConflicts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.router = SkillsRouter(base_dir=ROOT)

    def test_winui_vs_flutter_desktop_conflict(self):
        skills = ["microsoft-winui", "flutter-agent-plugins", "superpowers-brainstorming"]
        conflicts, warnings = self.router.check_conflicts(skills)
        self.assertTrue(any("winui-vs-flutter-desktop" in c for c in conflicts))

    def test_flutter_vs_expo_mobile_conflict(self):
        skills = ["flutter-agent-plugins", "expo-skills"]
        conflicts, warnings = self.router.check_conflicts(skills)
        self.assertTrue(any("flutter-vs-expo-mobile" in c for c in conflicts))

    def test_android_vs_ios_conflict(self):
        skills = ["android-skills", "openai-build-ios-apps"]
        conflicts, warnings = self.router.check_conflicts(skills)
        self.assertTrue(any("android-vs-ios-implementation" in c for c in conflicts))

    def test_react_on_flutter_conflict(self):
        skills = ["vercel-react-best-practices", "flutter-agent-plugins"]
        conflicts, warnings = self.router.check_conflicts(skills)
        self.assertTrue(any("react-patterns-on-flutter" in c for c in conflicts))

    def test_tauri_vs_electron_conflict(self):
        skills = ["tauri-official-guidance", "electron-official-guidance"]
        conflicts, warnings = self.router.check_conflicts(skills)
        self.assertTrue(any("tauri-vs-electron-architecture" in c for c in conflicts))

    def test_dual_creative_directors_conflict(self):
        skills = ["taste-skill-frontend", "anthropic-frontend-design"]
        conflicts, warnings = self.router.check_conflicts(skills)
        self.assertTrue(any("dual-creative-directors" in c for c in conflicts))

    def test_ui_craft_and_impeccable_warning(self):
        skills = ["olzn-ui-craft", "pbakaus-impeccable"]
        conflicts, warnings = self.router.check_conflicts(skills)
        self.assertEqual(len(conflicts), 0)
        self.assertTrue(any("ui-craft-and-impeccable-dual-load" in w for w in warnings))


if __name__ == "__main__":
    unittest.main()
