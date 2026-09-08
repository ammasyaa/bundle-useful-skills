"""
Universal installer module for bundle-useful-skills.
Handles detection and installation of the router and focused bundles into AI agent environments.
"""

import json
import os
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple


AGENT_METADATA = {
    "antigravity": {
        "name": "Google Antigravity",
        "description": "Google AI IDE & Antigravity CLI",
        "doc_url": "https://antigravity.google/docs/skills",
        "verification_hint": (
            "Restart or start a new Antigravity session. In the chat prompt, check "
            "'Available skills' or ask: 'What skills do you have access to?'."
        ),
    },
    "claude": {
        "name": "Claude Code",
        "description": "Anthropic Claude Code CLI",
        "doc_url": "https://docs.anthropic.com/en/docs/agents-and-tools/claude-code",
        "verification_hint": (
            "Run `claude` in terminal and ask: 'What skills do you have?' "
            "or inspect `ls ~/.claude/skills`."
        ),
    },
    "codex": {
        "name": "OpenAI Codex",
        "description": "OpenAI Codex CLI & Agent Runtime",
        "doc_url": "https://github.com/openai/skills",
        "verification_hint": (
            "Run `codex`. Skills in ~/.codex/skills are automatically indexed "
            "and injected by the runtime."
        ),
    },
    "cursor": {
        "name": "Cursor",
        "description": "Cursor AI Code Editor",
        "doc_url": "https://docs.cursor.com/context/rules",
        "verification_hint": (
            "Open Cursor. Skills installed in ~/.cursor/skills are automatically "
            "accessible to the agent."
        ),
    },
    "windsurf": {
        "name": "Windsurf",
        "description": "Codeium Windsurf IDE (Cascade)",
        "doc_url": "https://docs.codeium.com/windsurf",
        "verification_hint": (
            "Open Windsurf. Global skills in ~/.codeium/windsurf/skills are indexed "
            "by Cascade."
        ),
    },
}


def get_project_root() -> Path:
    """Return the root directory of the repository/package."""
    candidate = Path(__file__).resolve().parent.parent
    if (candidate / "bundles").exists() or (candidate / "plugins").exists():
        return candidate
    user_repo = Path.home() / ".bundle-useful-skills"
    if (user_repo / "bundles").exists() or (user_repo / "plugins").exists():
        return user_repo
    return Path(__file__).resolve().parent


def get_agent_targets(home_dir: Optional[Path] = None, workspace_dir: Optional[Path] = None) -> Dict[str, List[Path]]:
    """
    Resolve potential skill/plugin directories for each supported AI agent platform.
    Primary discovery paths are listed first.
    """
    home = home_dir or Path.home()
    workspace = workspace_dir or Path.cwd()
    codex_home = Path(os.environ.get("CODEX_HOME", home / ".codex"))

    targets = {
        "antigravity": [
            home / ".gemini" / "config" / "skills",
            home / ".gemini" / "antigravity" / "skills",
        ],
        "claude": [
            home / ".claude" / "skills",
            home / ".claude" / "plugins",
        ],
        "codex": [
            codex_home / "skills",
        ],
        "cursor": [
            home / ".cursor" / "skills",
            workspace / ".cursor" / "skills",
        ],
        "windsurf": [
            home / ".codeium" / "windsurf" / "skills",
            home / ".windsurf" / "skills",
            workspace / ".windsurf" / "skills",
        ],
    }
    return targets


def get_unique_skills_from_plugins() -> Dict[str, Path]:
    """
    Collect all unique skill directories across all bundles in plugins/.
    Returns a dict mapping skill_name -> Path to skill directory containing SKILL.md.
    """
    root = get_project_root()
    plugins_dir = root / "plugins"
    skills_map: Dict[str, Path] = {}

    if not plugins_dir.exists():
        return skills_map

    for bundle_dir in sorted(plugins_dir.iterdir()):
        bundle_skills = bundle_dir / "skills"
        if bundle_skills.is_dir():
            for s_dir in sorted(bundle_skills.iterdir()):
                if s_dir.is_dir() and (s_dir / "SKILL.md").exists():
                    skills_map[s_dir.name] = s_dir
    return skills_map


def count_skills_in_dir(directory: Path) -> Tuple[int, bool, List[str]]:
    """
    Count valid skill directories (containing SKILL.md) in a directory.
    Returns: (total_count, router_installed, list_of_skill_names)
    """
    if not directory.exists() or not directory.is_dir():
        return 0, False, []

    skills = []
    router_installed = False

    for child in sorted(directory.iterdir()):
        if child.is_dir() and (child / "SKILL.md").exists():
            skills.append(child.name)
            if child.name == "bundle-useful-skills":
                router_installed = True

    return len(skills), router_installed, skills


def detect_installed_agents(home_dir: Optional[Path] = None, workspace_dir: Optional[Path] = None) -> Dict[str, Dict[str, any]]:
    """
    Detect which AI agent environments are present on the current machine,
    and inspect whether skills and router are currently installed.
    """
    targets = get_agent_targets(home_dir=home_dir, workspace_dir=workspace_dir)
    status = {}

    for name, paths in targets.items():
        existing = [p for p in paths if p.parent.exists() or p.exists()]
        active_path = existing[0] if existing else paths[0]

        skills_count, router_installed, installed_skills = count_skills_in_dir(active_path)
        meta = AGENT_METADATA.get(name, {})

        status[name] = {
            "name": meta.get("name", name),
            "detected": len(existing) > 0,
            "paths": [str(p) for p in paths],
            "active_path": str(active_path),
            "skills_count": skills_count,
            "router_installed": router_installed,
            "installed_skills": installed_skills,
            "verification_hint": meta.get("verification_hint", ""),
        }
    return status


def get_doctor_report(home_dir: Optional[Path] = None, workspace_dir: Optional[Path] = None) -> Dict[str, any]:
    """
    Run diagnostic checks across all agentic app environments.
    """
    agents = detect_installed_agents(home_dir=home_dir, workspace_dir=workspace_dir)
    total_detected_agents = sum(1 for a in agents.values() if a["detected"])
    agents_with_skills = sum(1 for a in agents.values() if a["skills_count"] > 0)
    total_skills_catalog = len(get_unique_skills_from_plugins()) + 1  # +1 for router

    return {
        "agents": agents,
        "total_detected_agents": total_detected_agents,
        "agents_with_skills": agents_with_skills,
        "total_skills_catalog": total_skills_catalog,
    }


def format_doctor_report(report: Dict[str, any]) -> str:
    """
    Format a doctor diagnostic report into a clear human-readable string.
    """
    lines = [
        "=" * 70,
        "  [DOCTOR] Bundle Useful Skills: Agentic App Detection & Health Check",
        "=" * 70,
    ]

    for key, data in report["agents"].items():
        status_label = "[DETECTED]" if data["detected"] else "[NOT FOUND]"
        router_status = "[ROUTER ACTIVE]" if data["router_installed"] else "[NO ROUTER]"
        lines.append(f"\n{status_label:<12} {data['name']}")
        lines.append(f"  Target Path : {data['active_path']}")
        lines.append(f"  Status      : {data['skills_count']} skills installed | {router_status}")

        if data["installed_skills"]:
            sample = data["installed_skills"][:5]
            more = f" ... and {len(data['installed_skills']) - 5} more" if len(data['installed_skills']) > 5 else ""
            lines.append(f"  Sample      : {', '.join(sample)}{more}")
        else:
            lines.append("  Sample      : (No skills installed yet)")

        if data["verification_hint"]:
            lines.append(f"  Verify In-App: {data['verification_hint']}")

    lines.append("\n" + "-" * 70)
    summary_text = (
        f"Summary: {report['agents_with_skills']}/{len(report['agents'])} agent platforms have skills installed. "
        f"Full catalog has {report['total_skills_catalog']} skills."
    )
    lines.append(summary_text)
    lines.append("To install all skills across all detected agents:")
    lines.append("  bus --install all --bundle all")
    lines.append("=" * 70)
    return "\n".join(lines)


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
    Install all skills from a specific focused bundle into a skills directory,
    and ensure the router SKILL.md is also present.
    """
    root = get_project_root()
    plugin_skills_dir = root / "plugins" / bundle_id / "skills"

    if not plugin_skills_dir.exists():
        return False, f"Bundle '{bundle_id}' not found at {plugin_skills_dir}"

    if not dry_run:
        destination_dir.mkdir(parents=True, exist_ok=True)
        # Always ensure router is present alongside bundle
        install_router_to_dir(destination_dir, dry_run=False)

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


def install_all_skills_to_dir(destination_dir: Path, dry_run: bool = False) -> Tuple[bool, str, int]:
    """
    Install the router plus all unique skills across all 17 bundles into destination_dir.
    """
    unique_skills = get_unique_skills_from_plugins()
    total_count = len(unique_skills) + 1  # skills + router

    if dry_run:
        return True, f"[DRY-RUN] Would install router + {len(unique_skills)} unique skills to {destination_dir}", total_count

    destination_dir.mkdir(parents=True, exist_ok=True)

    # 1. Install router
    install_router_to_dir(destination_dir, dry_run=False)

    # 2. Copy each unique skill
    installed_count = 0
    for skill_name, skill_path in unique_skills.items():
        dest_skill = destination_dir / skill_name
        if dest_skill.exists():
            shutil.rmtree(dest_skill)
        shutil.copytree(skill_path, dest_skill)
        installed_count += 1

    summary = f"Installed router + {installed_count} unique skills to {destination_dir}"
    return True, summary, installed_count + 1


def run_installation(
    target: str = "all",
    bundle: Optional[str] = None,
    home_dir: Optional[Path] = None,
    dry_run: bool = False,
    uninstall: bool = False,
) -> Dict[str, any]:
    """
    Execute installation across specified targets.
    If bundle is 'all', installs router + all unique skills.
    If bundle is a specific bundle id, installs router + that bundle's skills.
    If bundle is None (or empty), installs router only.
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

    unique_skills = get_unique_skills_from_plugins()

    for agent_name in selected_names:
        paths = all_targets.get(agent_name, [])
        if not paths:
            continue

        # Determine target directories for this agent.
        # For Antigravity, if both config/skills and antigravity/skills can exist or be populated,
        # we populate both so both discovery mechanisms succeed.
        dirs_to_update: List[Path] = []
        if agent_name == "antigravity":
            # Always ensure primary config/skills is updated
            dirs_to_update.append(paths[0])
            # If antigravity/skills exists or parent exists, or for completeness, update secondary too
            if len(paths) > 1:
                dirs_to_update.append(paths[1])
        else:
            target_dir = None
            for p in paths:
                if p.exists() or p.parent.exists():
                    target_dir = p
                    break
            if not target_dir:
                target_dir = paths[0]
            dirs_to_update.append(target_dir)

        for target_dir in dirs_to_update:
            if uninstall:
                dest = target_dir / "bundle-useful-skills"
                if dry_run:
                    results["details"].append(f"[DRY-RUN] Would remove router from {dest}")
                elif dest.exists():
                    shutil.rmtree(dest)
                    results["details"].append(f"Uninstalled router from {agent_name} ({dest})")
                else:
                    results["details"].append(f"Router not installed at {agent_name} ({dest})")

                # If uninstalling all bundles as well
                if bundle == "all":
                    removed_count = 0
                    for s_name in unique_skills.keys():
                        s_dest = target_dir / s_name
                        if not dry_run and s_dest.exists():
                            shutil.rmtree(s_dest)
                            removed_count += 1
                    prefix = "[DRY-RUN] Would remove" if dry_run else "Removed"
                    results["details"].append(f"{prefix} bundle skills from {agent_name} ({target_dir})")
                continue

            # Case 1: Install all skills + router
            if bundle == "all":
                ok, msg, count = install_all_skills_to_dir(target_dir, dry_run=dry_run)
                results["details"].append(f"[{agent_name}] {msg}")
                if not ok:
                    results["success"] = False

            # Case 2: Install specific bundle + router
            elif bundle and bundle in all_bundle_ids:
                ok, msg = install_bundle_to_dir(bundle, target_dir, dry_run=dry_run)
                results["details"].append(f"[{agent_name}] {msg}")
                if not ok:
                    results["success"] = False

            # Case 3: Install router only
            else:
                ok, msg = install_router_to_dir(target_dir, dry_run=dry_run)
                results["details"].append(f"[{agent_name}] {msg}")
                if not ok:
                    results["success"] = False

    return results

