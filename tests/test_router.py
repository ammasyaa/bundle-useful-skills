"""
Tests for router classification, stack assembly, and the 5 canonical examples.
"""

import unittest
from pathlib import Path

from router.engine import SkillsRouter
from router.models import TaskRequest

ROOT = Path(__file__).resolve().parent.parent


class TestSkillsRouter(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.router = SkillsRouter(base_dir=ROOT)

    def test_canonical_example_1_nextjs_webapp(self):
        """
        Example 1: Premium Next.js web app
        Expected: Superpowers -> Taste / Vercel -> Emil -> OWASP/Impeccable
        """
        req = TaskRequest(
            query="Build a premium Next.js landing page with Stripe payments and Supabase database"
        )
        res = self.router.route(req)

        self.assertEqual(res.project_type, "web")
        self.assertEqual(res.framework, "react")
        self.assertEqual(res.primary_authority, "vercel-react-best-practices")
        self.assertEqual(res.risk_level, "HIGH")  # Triggered by Stripe/payments

        skill_ids = [s.id for s in res.selected_skills]
        self.assertIn("superpowers-brainstorming", skill_ids)
        self.assertIn("vercel-react-best-practices", skill_ids)
        self.assertIn("supabase-postgres-best-practices", skill_ids)
        self.assertIn("emil-design-eng", skill_ids)
        self.assertIn("owasp-secure-agent-playbook", skill_ids)

        # Ensure budget constraint (max 7 for high risk)
        self.assertLessEqual(len(res.selected_skills), 7)
        self.assertGreaterEqual(len(res.selected_skills), 2)

    def test_canonical_example_2_ios_app(self):
        """
        Example 2: iOS app
        Expected: Superpowers -> Apple HIG / OpenAI iOS -> Emil -> verification
        """
        req = TaskRequest(query="Build an iOS SwiftUI app with fluid animations and haptics")
        res = self.router.route(req)

        self.assertEqual(res.project_type, "mobile")
        self.assertIn(res.framework, ["swiftui-ios", "ios"])
        self.assertEqual(res.primary_authority, "openai-build-ios-apps")

        skill_ids = [s.id for s in res.selected_skills]
        self.assertIn("superpowers-brainstorming", skill_ids)
        self.assertIn("openai-build-ios-apps", skill_ids)
        self.assertIn("emil-design-eng", skill_ids)

        self.assertLessEqual(len(res.selected_skills), 5)

    def test_canonical_example_3_windows_app(self):
        """
        Example 3: Windows WinUI app
        Expected: Superpowers -> Microsoft WinUI -> Emil craft -> verification
        """
        req = TaskRequest(query="Build a Windows WinUI 3 desktop dashboard with Fluent Design")
        res = self.router.route(req)

        self.assertEqual(res.project_type, "desktop")
        self.assertEqual(res.framework, "winui")
        self.assertEqual(res.primary_authority, "microsoft-winui")

        skill_ids = [s.id for s in res.selected_skills]
        self.assertIn("superpowers-brainstorming", skill_ids)
        self.assertIn("microsoft-winui", skill_ids)
        self.assertIn("emil-design-eng", skill_ids)

        self.assertLessEqual(len(res.selected_skills), 5)

    def test_canonical_example_4_flutter_app(self):
        """
        Example 4: Flutter app
        Expected: Superpowers -> Flutter -> Dart -> Emil -> verification
        """
        req = TaskRequest(query="Build a cross-platform mobile Flutter app with smooth animations")
        res = self.router.route(req)

        self.assertEqual(res.project_type, "mobile")
        self.assertEqual(res.framework, "flutter")
        self.assertEqual(res.primary_authority, "flutter-agent-plugins")

        skill_ids = [s.id for s in res.selected_skills]
        self.assertIn("superpowers-brainstorming", skill_ids)
        self.assertIn("flutter-agent-plugins", skill_ids)
        self.assertIn("dart-lang-skills", skill_ids)

        self.assertLessEqual(len(res.selected_skills), 5)

    def test_canonical_example_5_deep_research(self):
        """
        Example 5: Deep research
        Expected: Firecrawl -> DeerFlow -> Last30Days -> Browser Use (if interactive)
        """
        req = TaskRequest(
            query="Perform deep research on current state of LLM inference engines with latest community benchmarks"
        )
        res = self.router.route(req)

        self.assertEqual(res.project_type, "search-research")
        self.assertEqual(res.task_type, "requirements")

        skill_ids = [s.id for s in res.selected_skills]
        self.assertIn("firecrawl-cli", skill_ids)
        self.assertIn("deer-flow-deep-research", skill_ids)
        self.assertIn("last30days-skill", skill_ids)

        self.assertLessEqual(len(res.selected_skills), 5)

    def test_debugging_task_process_selection(self):
        """
        Bug fix / debugging task should activate systematic-debugging rather than brainstorming.
        """
        req = TaskRequest(query="Fix crash and debug memory leak in iOS SwiftUI table view")
        res = self.router.route(req)

        self.assertEqual(res.task_type, "debugging")
        skill_ids = [s.id for s in res.selected_skills]
        self.assertIn("superpowers-systematic-debugging", skill_ids)
        self.assertNotIn("superpowers-brainstorming", skill_ids)

    def test_context_budgeting_ceiling(self):
        """
        Normal tasks must activate <= 5 skills.
        """
        req = TaskRequest(query="Create simple portfolio about page with responsive css")
        res = self.router.route(req)
        self.assertLessEqual(len(res.selected_skills), 5)
        self.assertGreaterEqual(len(res.selected_skills), 2)


if __name__ == "__main__":
    unittest.main()
