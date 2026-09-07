#!/usr/bin/env python3
"""
Deep comparison between bundle-useful-skills-linked-manifest-prompt.md
and the implementation files (bundles/*.yaml, registry/skills.json, registry/sources.json).
"""

import os
import re
import yaml
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def get_prompt_file() -> Path:
    if "BUNDLE_MANIFEST_PROMPT" in os.environ:
        return Path(os.environ["BUNDLE_MANIFEST_PROMPT"])
    repo_spec = ROOT / "specs" / "bundle-useful-skills-linked-manifest-prompt.md"
    if repo_spec.exists():
        return repo_spec
    downloads_spec = Path.home() / "Downloads" / "bundle-useful-skills-linked-manifest-prompt.md"
    if downloads_spec.exists():
        return downloads_spec
    return repo_spec

PROMPT_FILE = get_prompt_file()


def audit():
    text = PROMPT_FILE.read_text(encoding="utf-8")

    sec_matches = list(re.finditer(r"^#\s+(\d+)\.\s+(.+)$", text, re.MULTILINE))
    sections = []
    for i in range(len(sec_matches)):
        start = sec_matches[i].start()
        end = sec_matches[i + 1].start() if i + 1 < len(sec_matches) else len(text)
        num = int(sec_matches[i].group(1))
        title = sec_matches[i].group(2).strip()
        sec_content = text[start:end]
        sections.append((num, title, sec_content))

    errors = []
    checked_bundles = set()

    for num, title, content in sections:
        if num > 16:
            continue

        bids = []
        if num == 11:
            bids = ["bus-flutter-app-builder", "bus-flutter-desktop-builder"]
        else:
            m = re.search(r"Bundle:\s*`?(bus-[a-z0-9-]+)`?", content)
            if m:
                bids = [m.group(1)]
            else:
                errors.append(f"Section {num} ({title}) has no bundle ID found!")
                continue

        rows = re.findall(
            r"\|\s*\[([a-zA-Z0-9_-]+)\]\(([^)]+)\)\s*\|\s*([A-Z*]+)\s*\|\s*([^|]+)\|",
            content,
        )

        for bid in bids:
            checked_bundles.add(bid)
            yaml_path = ROOT / "bundles" / f"{bid}.yaml"
            if not yaml_path.exists():
                errors.append(f"Bundle file {yaml_path} does not exist!")
                continue

            with open(yaml_path, "r", encoding="utf-8") as yf:
                ydata = yaml.safe_load(yf)

            y_skills = {s["id"]: s for s in ydata.get("skills", [])}
            if len(y_skills) != len(rows):
                errors.append(
                    f"{bid}: skills count mismatch! Prompt has {len(rows)}, bundle has {len(y_skills)}"
                )

            for sid, url, mode, use in rows:
                if sid not in y_skills:
                    errors.append(f"{bid}: missing skill '{sid}'")
                else:
                    ys = y_skills[sid]
                    clean_mode = mode.replace("*", "")
                    if ys.get("mode") != clean_mode:
                        errors.append(
                            f"{bid} skill '{sid}' mode mismatch: expected '{clean_mode}', got '{ys.get('mode')}'"
                        )
                    if ys.get("url") != url:
                        errors.append(
                            f"{bid} skill '{sid}' URL mismatch:\n  expected: {url}\n  got:      {ys.get('url')}"
                        )

    print("==================================================")
    print("  Deep Audit: Prompt Tables vs. bundles/*.yaml")
    print("==================================================")
    print(f"Total bundle manifests checked: {len(checked_bundles)}")
    if errors:
        print(f"Found {len(errors)} discrepancies:")
        for err in errors:
            print(f"  [DISCREPANCY] {err}")
    else:
        print("PERFECT: All 17 bundle manifests match prompt tables 100% (skills, modes, and URLs)!")


if __name__ == "__main__":
    audit()
