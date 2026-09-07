"""
End-to-end tests for CLI commands and tools.
"""

import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class TestCLICommands(unittest.TestCase):
    def run_cmd(self, args: list) -> subprocess.CompletedProcess:
        cmd = [sys.executable] + args
        return subprocess.run(
            cmd,
            cwd=str(ROOT),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
        )

    def test_route_cli_markdown(self):
        proc = self.run_cmd(["scripts/route.py", "Build a Next.js e-commerce app"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        self.assertIn("Routing Plan:", proc.stdout)
        self.assertIn("vercel-react-best-practices", proc.stdout)

    def test_route_cli_json(self):
        proc = self.run_cmd(["scripts/route.py", "Audit iOS app for memory leaks", "--json"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        data = json.loads(proc.stdout)
        self.assertEqual(data["classification"]["project_type"], "mobile")
        self.assertIn("openai-build-ios-apps", [s["id"] for s in data["selected_skills"]])

    def test_validate_registry_cli(self):
        proc = self.run_cmd(["scripts/validate_registry.py"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        self.assertIn("SUCCESS: All registry files, schemas, and references are valid!", proc.stdout)

    def test_verify_lock_cli(self):
        proc = self.run_cmd(["scripts/verify_lock.py"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        self.assertIn("[PASS] All 44 skills deterministically pinned", proc.stdout)

    def test_audit_everything_cli(self):
        proc = self.run_cmd(["scripts/audit_everything.py"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        self.assertIn("Audit Summary: ALL 14 CRITERIA VERIFIED", proc.stdout)

    def test_check_conflicts_cli_pass(self):
        proc = self.run_cmd(["scripts/route.py", "--check-conflicts", "vercel-react-best-practices", "emil-design-eng"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        self.assertIn("[PASS] No conflicts or warnings detected", proc.stdout)

    def test_check_conflicts_cli_fail(self):
        proc = self.run_cmd(["scripts/route.py", "--check-conflicts", "microsoft-winui", "flutter-agent-plugins"])
        self.assertEqual(proc.returncode, 1, f"Expected conflict error, got exit code 0: {proc.stdout}")
        self.assertIn("[CONFLICT]", proc.stdout)


if __name__ == "__main__":
    unittest.main()
