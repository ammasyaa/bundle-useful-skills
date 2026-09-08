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
        self.assertIn("deterministically pinned with valid SHA-256 hashes", proc.stdout)

    def test_list_bundles_cli(self):
        proc = self.run_cmd(["scripts/route.py", "--list-bundles"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        self.assertIn("bus-web-app-builder", proc.stdout)
        self.assertIn("bus-engineering-core", proc.stdout)
        self.assertIn("bus-secure-app-builder", proc.stdout)

    def test_bundle_detail_cli(self):
        proc = self.run_cmd(["scripts/route.py", "--bundle", "bus-web-app-builder"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        self.assertIn("react-best-practices", proc.stdout)
        self.assertIn("frontend-ui-engineering", proc.stdout)
        self.assertIn("Runtime Rules:", proc.stdout)

    def test_supply_chain_scanner_cli(self):
        proc = self.run_cmd(["scripts/scan_supply_chain.py", "--check-all"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        self.assertIn("successfully passed supply-chain admission", proc.stdout)

    def test_audit_everything_cli(self):
        proc = self.run_cmd(["scripts/audit_everything.py"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        self.assertIn("Audit Summary: ALL 14 CRITERIA VERIFIED", proc.stdout)

    def test_verify_against_prompt_cli(self):
        proc = self.run_cmd(["scripts/verify_against_prompt.py"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        self.assertIn("PERFECT: 100% parity verified with prompt specifications!", proc.stdout)

    def test_check_conflicts_cli_pass(self):
        proc = self.run_cmd(["scripts/route.py", "--check-conflicts", "vercel-react-best-practices", "emil-design-eng"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        self.assertIn("[PASS] No conflicts or warnings detected", proc.stdout)

    def test_check_conflicts_cli_fail(self):
        proc = self.run_cmd(["scripts/route.py", "--check-conflicts", "microsoft-winui", "flutter-agent-plugins"])
        self.assertEqual(proc.returncode, 1, f"Expected conflict error, got exit code 0: {proc.stdout}")
        self.assertIn("[CONFLICT]", proc.stdout)

    def test_doctor_cli(self):
        proc = self.run_cmd(["scripts/route.py", "doctor"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        self.assertIn("[DOCTOR]", proc.stdout)
        self.assertIn("Google Antigravity", proc.stdout)
        self.assertIn("Claude Code", proc.stdout)

    def test_doctor_cli_json(self):
        proc = self.run_cmd(["scripts/route.py", "doctor", "--json"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        data = json.loads(proc.stdout)
        self.assertIn("agents", data)
        self.assertIn("antigravity", data["agents"])

    def test_install_dry_run_cli(self):
        proc = self.run_cmd(["scripts/install.py", "--dry-run", "--bundle", "all"])
        self.assertEqual(proc.returncode, 0, f"Error: {proc.stderr}")
        self.assertIn("[DRY-RUN]", proc.stdout)
        self.assertIn("[SUCCESS]", proc.stdout)


if __name__ == "__main__":
    unittest.main()
