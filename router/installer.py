"""
Universal installer module for bundle-useful-skills.
Handles detection and installation of the router and focused bundles into AI agent environments.
"""

import json
import os
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple


def get_project_root() -> Path:
    """Return the root directory of the repository/package."""
    # If installed inside repo, router is at <root>/router
    candidate = Path(__file__).resolve().parent.parent
    if (candidate / "bundles").exists() or (candidate / "plugins").exists():
        return candidate
    return Path(__file__).resolve().parent


def get_agent_targets(home_dir: Optional[Path] = None, workspace_dir: Optional[Path] = None) -> Dict[str, List[Path]]:
    """
    Resolve potential skill/plugin directories for each supported AI agent platform.
    """
    home = home_dir or Path.home()
    workspace = workspace_dir or Path.cwd()
    codex_home = Path(os.environ.get("CODEX_HOME", home / ".codex"))

    targets = {
        "antigravity": [
            home / ".gemini" / "antigravity" / "skills",
            home / ".gemini" / "config" / "skills",
        ],
        "codex": [
            codex_home / "skills",
        ],
        "claude": [
            home / ".claude" / "plugins",
            home / ".claude" / "skills",
        ],
        "cursor": [
            workspace / ".cursor" / "skills",
            home / ".cursor" / "skills",
        ],
    }
    return targets


def detect_installed_agents(home_dir: Optional[Path] = None) -> Dict[str, Dict[str, any]]:
    """
    Detect which AI agent environments are present on the current machine.
    """
    targets = get_agent_targets(home_dir=home_dir)
    status = {}

    for name, paths in targets.items():
        existing = [p for p in paths if p.parent.exists() or p.exists()]
        status[name] = {
            "detected": len(existing) > 0,
            "paths": [str(p) for p in paths],
            "active_path": str(existing[0]) if existing else str(paths[0]),
        }
    return status


def install_router_to_dir(destination_dir: Path, dry_run: bool = False) -> Tuple[bool, str]:
    """
    Install the bundle-useful-skills router SKILL.md into a skills directory.
    """
    root = get_project_root()
    dest_skill = destination_dir / "bundle-useful-skills"
    source_skill = root / "router" / "SKILL.md"

    if not source_skill.exists():
        source_skill = Path(__file__).resolve().parent / "SKILL.md"

    if not source_skill.exists():
        return False, f"Source SKILL.md not found at {source_skill}"

    if dry_run:
        return True, f"[DRY-RUN] Would install router to {dest_skill / 'SKILL.md'}"

    dest_skill.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source_skill, dest_skill / "SKILL.md")

    # Also copy references and conflict rules if available
    router_dir = source_skill.parent
    for subdir in ["references", "conflicts"]:
        src_sub = router_dir / subdir
        if src_sub.exists():
            dest_sub = dest_skill / subdir
            if dest_sub.exists():
                shutil.rmtree(dest_sub)
            shutil.copytree(src_sub, dest_sub)

    return True, f"Installed router to {dest_skill}"


def install_bundle_to_dir(bundle_id: str, destination_dir: Path, dry_run: bool = False) -> Tuple[bool, str]:
    """
    Install all skills from a specific focused bundle into a skills directory.
    """
    root = get_project_root()
    plugin_skills_dir = root / "plugins" / bundle_id / "skills"

    if not plugin_skills_dir.exists():
        return False, f"Bundle '{bundle_id}' not found at {plugin_skills_dir}"

    installed_skills = []
    for skill_dir in sorted(plugin_skills_dir.iterdir()):
        if skill_dir.is_dir() and (skill_dir / "SKILL.md").exists():
            target_skill_dir = destination_dir / skill_dir.name
            if dry_run:
                installed_skills.append(f"[DRY-RUN] {skill_dir.name} -> {target_skill_dir}")
            else:
                if target_skill_dir.exists():
                    shutil.rmtree(target_skill_dir)
                shutil.copytree(skill_dir, target_skill_dir)
                installed_skills.append(skill_dir.name)

    prefix = "[DRY-RUN] Would install" if dry_run else "Installed"
    summary = f"{prefix} {len(installed_skills)} skills from '{bundle_id}' to {destination_dir}"
    return True, summary


def run_installation(
    target: str = "all",
    bundle: Optional[str] = None,
    home_dir: Optional[Path] = None,
    dry_run: bool = False,
    uninstall: bool = False,
) -> Dict[str, any]:
    """
    Execute installation across specified targets.
    """
    root = get_project_root()
    all_targets = get_agent_targets(home_dir=home_dir)
    results = {"success": True, "target": target, "bundle": bundle, "details": []}

    selected_names = list(all_targets.keys()) if target == "all" else [target]

    # Available bundles check
    all_bundles = sorted([d.name for d in (root / "bundles").glob("*.yaml")])
    all_bundle_ids = [b.replace(".yaml", "") for b in all_bundles]

    if bundle and bundle != "all" and bundle not in all_bundle_ids:
        results["success"] = False
        results["error"] = f"Unknown bundle '{bundle}'. Available bundles: {', '.join(all_bundle_ids)}"
        return results

    for agent_name in selected_names:
        paths = all_targets.get(agent_name, [])
        if not paths:
            continue

        target_dir = None
        for p in paths:
            if p.exists() or p.parent.exists():
                target_dir = p
                break
        if not target_dir:
            target_dir = paths[0]

        if uninstall:
            dest = target_dir / "bundle-useful-skills"
            if dry_run:
                results["details"].append(f"[DRY-RUN] Would remove {dest}")
            elif dest.exists():
                shutil.rmtree(dest)
                results["details"].append(f"Uninstalled from {agent_name} ({dest})")
            else:
                results["details"].append(f"Not installed at {agent_name} ({dest})")
            continue

        # Install router
        if not bundle:
            ok, msg = install_router_to_dir(target_dir, dry_run=dry_run)
            results["details"].append(f"[{agent_name}] {msg}")
            if not ok:
                results["success"] = False

        # Install specific or all bundles
        if bundle:
            bundles_to_install = all_bundle_ids if bundle == "all" else [bundle]
            for b_id in bundles_to_install:
                ok, msg = install_bundle_to_dir(b_id, target_dir, dry_run=dry_run)
                results["details"].append(f"[{agent_name}] {msg}")
                if not ok:
                    results["success"] = False

    return results
