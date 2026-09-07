"""
Core routing and orchestration engine for bundle-useful-skills.
"""

import json
from pathlib import Path
from typing import List, Dict, Optional, Set, Tuple, Any

from .models import (
    Skill,
    HardConflict,
    ConditionalWarning,
    TaskRequest,
    RouteResult,
    ExecutionStage,
)


class SkillsRouter:
    def __init__(self, base_dir: Optional[Path] = None):
        if base_dir is None:
            # Resolve root from file location: router/engine.py -> repo_root
            self.base_dir = Path(__file__).resolve().parent.parent
        else:
            self.base_dir = Path(base_dir).resolve()

        self.registry_dir = self.base_dir / "registry"
        self.profiles_dir = self.base_dir / "profiles"

        self.skills: Dict[str, Skill] = {}
        self.hard_conflicts: List[HardConflict] = []
        self.conditional_warnings: List[ConditionalWarning] = []
        self.compatibility: Dict[str, Any] = {}

        self._load_registry()

    def _load_registry(self) -> None:
        # Load skills
        skills_file = self.registry_dir / "skills.json"
        if skills_file.exists():
            with open(skills_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data:
                    skill = Skill.from_dict(item)
                    self.skills[skill.id] = skill

        # Load conflicts
        conflicts_file = self.registry_dir / "conflicts.json"
        if conflicts_file.exists():
            with open(conflicts_file, "r", encoding="utf-8") as f:
                c_data = json.load(f)
                for hc in c_data.get("hard_conflicts", []):
                    self.hard_conflicts.append(
                        HardConflict(
                            id=hc["id"],
                            description=hc["description"],
                            incompatible_skills=hc["incompatible_skills"],
                            resolution=hc["resolution"],
                        )
                    )
                for cw in c_data.get("conditional_warnings", []):
                    self.conditional_warnings.append(
                        ConditionalWarning(
                            id=cw["id"],
                            description=cw["description"],
                            skills=cw["skills"],
                            guidance=cw["guidance"],
                        )
                    )

        # Load compatibility
        compat_file = self.registry_dir / "compatibility.json"
        if compat_file.exists():
            with open(compat_file, "r", encoding="utf-8") as f:
                self.compatibility = json.load(f)

    def classify(self, query: str) -> Tuple[str, str, str, str, str]:
        """
        Classifies query into (project_type, task_type, platform, framework, risk_level).
        """
        import re
        q = query.lower()

        def has_any(words: List[str]) -> bool:
            for w in words:
                if re.search(r"\b" + re.escape(w) + r"\b", q):
                    return True
            return False

        # 1. Project Type
        if has_any(["paper", "literature", "search", "research", "scrape", "crawl"]) or "deep research" in q:
            project_type = "search-research"
        elif has_any(["winui", "windows", "macos", "appkit", "tauri", "electron", "desktop"]):
            project_type = "desktop"
        elif has_any(["ios", "swiftui", "android", "compose", "flutter", "expo", "mobile"]) or "react native" in q:
            if "desktop" in q:
                project_type = "desktop"
            else:
                project_type = "mobile"
        else:
            project_type = "web"

        # 2. Task Type
        if project_type == "search-research":
            task_type = "requirements"
        elif has_any(["audit", "critic"]) or "code review" in q:
            task_type = "audit"
        elif has_any(["debug", "fix", "bug", "crash", "issue"]):
            task_type = "debugging"
        elif has_any(["release", "deploy", "ship"]):
            task_type = "release"
        elif has_any(["test", "tests", "testing", "e2e", "qa"]):
            task_type = "testing"
        elif has_any(["security", "auth", "vulnerability", "leak", "secret"]):
            task_type = "security"
        elif has_any(["seo", "geo", "aeo", "schema", "sitemap"]):
            task_type = "seo"
        elif has_any(["ui", "design", "frontend", "style", "page", "landing", "css"]):
            task_type = "frontend"
        elif has_any(["database", "postgres", "sql", "migration", "prisma"]):
            task_type = "database"
        elif has_any(["api", "backend", "endpoint", "server", "worker"]):
            task_type = "backend"
        else:
            task_type = "requirements"

        # 3. Platform & Framework
        platform = "universal"
        framework = "generic"

        if has_any(["winui", "windows"]):
            platform = "windows"
            framework = "winui"
        elif has_any(["macos", "mac", "appkit"]):
            platform = "macos"
            framework = "swiftui-mac"
        elif has_any(["ios", "iphone", "ipad"]):
            platform = "ios"
            framework = "swiftui-ios"
        elif has_any(["android"]):
            platform = "android"
            framework = "android-compose"
        elif has_any(["flutter"]):
            platform = "cross-platform"
            framework = "flutter"
        elif has_any(["expo"]) or "react native" in q:
            platform = "mobile"
            framework = "expo"
        elif has_any(["tauri"]):
            platform = "desktop"
            framework = "tauri"
        elif has_any(["electron"]):
            platform = "desktop"
            framework = "electron"
        elif "next" in q or "react" in q or project_type == "web":
            platform = "web"
            framework = "react" if ("react" in q or "next" in q) else "generic"

        # 4. Risk Level
        high_risk_triggers = [
            "auth", "login", "payment", "stripe", "billing", "pii", "gdpr",
            "crypto", "password", "token", "credential", "secret", "migration",
            "ipc", "webview", "entitlement", "sandbox"
        ]
        if task_type == "release" or "release" in q:
            risk_level = "RELEASE"
        elif any(trigger in q for trigger in high_risk_triggers):
            risk_level = "HIGH"
        elif task_type in ["debugging", "testing", "seo"] and "refactor" not in q:
            risk_level = "LOW"
        else:
            risk_level = "MEDIUM"

        return project_type, task_type, platform, framework, risk_level

    def check_conflicts(self, skill_ids: List[str]) -> Tuple[List[str], List[str]]:
        """
        Evaluates active skill IDs against hard conflicts and conditional warnings.
        Returns (conflicts_detected, warnings_detected).
        """
        conflicts = []
        warnings = []
        skill_set = set(skill_ids)

        for hc in self.hard_conflicts:
            matched = [s for s in hc.incompatible_skills if s in skill_set]
            if len(matched) >= 2:
                conflicts.append(
                    f"Conflict [{hc.id}]: {hc.description} Activated: {matched}. Resolution: {hc.resolution}"
                )

        for cw in self.conditional_warnings:
            matched = [s for s in cw.skills if s in skill_set]
            if len(matched) == len(cw.skills):
                warnings.append(
                    f"Warning [{cw.id}]: {cw.description} Guidance: {cw.guidance}"
                )

        return conflicts, warnings

    def route(self, request: TaskRequest) -> RouteResult:
        """
        Executes the 11-step routing algorithm on the incoming task request.
        """
        # Step 1-4: Classification
        proj_type, t_type, plat, fw, r_level = self.classify(request.query)

        # Allow explicit overrides
        project_type = request.project_type or proj_type
        task_type = request.task_type or t_type
        platform = request.platform or plat
        framework = request.framework or fw
        risk_level = request.risk_level or r_level

        selected_skills: List[Skill] = []
        execution_stages: List[ExecutionStage] = []
        independent_auditors: List[Skill] = []
        primary_authority_id: Optional[str] = None

        q = request.query.lower()

        # Step 5: Resolve Process Layer (Superpowers)
        if task_type == "debugging":
            process_skill = self.skills.get("superpowers-systematic-debugging")
        elif task_type in ["testing", "audit", "release"]:
            process_skill = self.skills.get("superpowers-verification-before-completion")
        else:
            process_skill = self.skills.get("superpowers-brainstorming")

        if process_skill and project_type != "search-research":
            selected_skills.append(process_skill)

        # Step 6: Route Domain & Platform Authorities
        if project_type == "search-research":
            # Search / Research Stack
            if "firecrawl-cli" in self.skills:
                selected_skills.append(self.skills["firecrawl-cli"])
            if "deer-flow-deep-research" in self.skills:
                selected_skills.append(self.skills["deer-flow-deep-research"])

            if any(w in q for w in ["community", "fresh", "latest", "sentiment", "trend", "30 days"]):
                if "last30days-skill" in self.skills:
                    selected_skills.append(self.skills["last30days-skill"])

            if any(w in q for w in ["login", "form", "interactive", "browser", "dashboard"]):
                if "browser-use" in self.skills:
                    selected_skills.append(self.skills["browser-use"])

            primary_authority_id = "deer-flow-deep-research"

        elif project_type == "mobile":
            # Mobile Stacks
            if framework in ["swiftui-ios", "ios"] or "ios" in q or "swiftui" in q:
                primary_authority_id = "openai-build-ios-apps"
                if "openai-build-ios-apps" in self.skills:
                    selected_skills.append(self.skills["openai-build-ios-apps"])
                if "emil-design-eng" in self.skills:
                    selected_skills.append(self.skills["emil-design-eng"])
            elif framework == "android-compose" or "android" in q:
                primary_authority_id = "android-skills"
                if "android-skills" in self.skills:
                    selected_skills.append(self.skills["android-skills"])
                if "emil-design-eng" in self.skills:
                    selected_skills.append(self.skills["emil-design-eng"])
            elif framework == "flutter" or "flutter" in q:
                primary_authority_id = "flutter-agent-plugins"
                if "flutter-agent-plugins" in self.skills:
                    selected_skills.append(self.skills["flutter-agent-plugins"])
                if "dart-lang-skills" in self.skills:
                    selected_skills.append(self.skills["dart-lang-skills"])
                if "emil-design-eng" in self.skills:
                    selected_skills.append(self.skills["emil-design-eng"])
            elif framework == "expo" or "expo" in q or "react native" in q:
                primary_authority_id = "expo-skills"
                if "expo-skills" in self.skills:
                    selected_skills.append(self.skills["expo-skills"])
                if "emil-animate-expo" in self.skills:
                    selected_skills.append(self.skills["emil-animate-expo"])

        elif project_type == "desktop":
            # Desktop Stacks
            if framework == "winui" or "winui" in q or "windows" in q:
                primary_authority_id = "microsoft-winui"
                if "microsoft-winui" in self.skills:
                    selected_skills.append(self.skills["microsoft-winui"])
                if "emil-design-eng" in self.skills:
                    selected_skills.append(self.skills["emil-design-eng"])
            elif framework == "swiftui-mac" or "macos" in q or "mac" in q:
                primary_authority_id = "openai-build-macos-apps"
                if "openai-build-macos-apps" in self.skills:
                    selected_skills.append(self.skills["openai-build-macos-apps"])
                if "emil-design-eng" in self.skills:
                    selected_skills.append(self.skills["emil-design-eng"])
            elif framework == "tauri" or "tauri" in q:
                primary_authority_id = "tauri-official-guidance"
                if "tauri-official-guidance" in self.skills:
                    selected_skills.append(self.skills["tauri-official-guidance"])
            elif framework == "electron" or "electron" in q:
                primary_authority_id = "electron-official-guidance"
                if "electron-official-guidance" in self.skills:
                    selected_skills.append(self.skills["electron-official-guidance"])

        else:
            # Web Stack
            # Creative Direction / Reference
            if any(w in q for w in ["marketing", "landing", "brand", "portfolio", "editorial"]):
                if "anthropic-frontend-design" in q or "anthropic" in q:
                    if "anthropic-frontend-design" in self.skills:
                        selected_skills.append(self.skills["anthropic-frontend-design"])
                else:
                    if "taste-skill-frontend" in self.skills:
                        selected_skills.append(self.skills["taste-skill-frontend"])
            elif any(w in q for w in ["saas", "dashboard", "table", "chart", "palette", "typography"]):
                if "ui-ux-pro-max" in self.skills:
                    selected_skills.append(self.skills["ui-ux-pro-max"])

            # Framework Authority
            primary_authority_id = "vercel-react-best-practices"
            if "vercel-react-best-practices" in self.skills:
                selected_skills.append(self.skills["vercel-react-best-practices"])

            # Backend & Database
            if any(w in q for w in ["supabase", "postgres", "sql"]):
                if "supabase-postgres-best-practices" in self.skills:
                    selected_skills.append(self.skills["supabase-postgres-best-practices"])
            elif any(w in q for w in ["backend", "api", "database", "queue", "worker"]):
                if "backend-engineering" in self.skills:
                    selected_skills.append(self.skills["backend-engineering"])

            # Interaction Craft
            if "emil-design-eng" in self.skills and len(selected_skills) < 5:
                selected_skills.append(self.skills["emil-design-eng"])

            # SEO/GEO for public routes
            if any(w in q for w in ["seo", "geo", "aeo", "schema", "search engine", "crawl"]):
                if "marketingskills-seo-audit" in self.skills:
                    selected_skills.append(self.skills["marketingskills-seo-audit"])

        # Step 7: Security & Independent Auditing
        if risk_level in ["HIGH", "RELEASE"]:
            if "owasp-secure-agent-playbook" in self.skills:
                selected_skills.append(self.skills["owasp-secure-agent-playbook"])
            if risk_level == "RELEASE" and "trailofbits-skills" in self.skills:
                independent_auditors.append(self.skills["trailofbits-skills"])

        # Add UI critic if UI work and not exceeding context budget
        if project_type in ["web", "desktop", "mobile"] and task_type in ["frontend", "design", "audit", "release"]:
            if "pbakaus-impeccable" in self.skills and self.skills["pbakaus-impeccable"] not in selected_skills:
                if len(selected_skills) < 5 or task_type == "audit":
                    independent_auditors.append(self.skills["pbakaus-impeccable"])

        # Add code quality auditor for release / audit
        if task_type in ["audit", "release", "code review"]:
            if "addy-code-review-and-quality" in self.skills and self.skills["addy-code-review-and-quality"] not in selected_skills:
                independent_auditors.append(self.skills["addy-code-review-and-quality"])

        # Deduplicate while preserving order
        deduped: List[Skill] = []
        seen_ids: Set[str] = set()
        for s in selected_skills:
            if s.id not in seen_ids:
                deduped.append(s)
                seen_ids.add(s.id)

        # Context Budget Enforcement: Hard ceiling of 5 for normal, 7 for complex
        max_budget = 7 if risk_level in ["HIGH", "RELEASE"] or task_type in ["architecture", "audit"] else 5
        if len(deduped) > max_budget:
            deduped = deduped[:max_budget]

        # Step 8: Conflict Check
        all_active_ids = [s.id for s in deduped] + [a.id for a in independent_auditors]
        conflicts_detected, warnings = self.check_conflicts(all_active_ids)

        # Step 9: Progressive Execution Stages
        execution_stages = self._build_execution_stages(deduped, independent_auditors, project_type, risk_level)

        # Step 10: Release Gate
        release_gate = self._build_release_gate(project_type, risk_level)

        return RouteResult(
            request=request,
            project_type=project_type,
            task_type=task_type,
            framework=framework,
            platform=platform,
            risk_level=risk_level,
            primary_authority=primary_authority_id,
            selected_skills=deduped,
            execution_stages=execution_stages,
            independent_auditors=independent_auditors,
            conflicts_detected=conflicts_detected,
            warnings=warnings,
            release_gate=release_gate,
        )

    def _build_execution_stages(
        self,
        skills: List[Skill],
        auditors: List[Skill],
        project_type: str,
        risk_level: str
    ) -> List[ExecutionStage]:
        stages = []
        stage_num = 1

        # Stage 1: Process / Planning
        process_skills = [s.id for s in skills if s.domain == "engineering-process"]
        if process_skills:
            stages.append(
                ExecutionStage(
                    stage_number=stage_num,
                    name="Engineering Process & Planning",
                    purpose="Structure user intent, requirements, and testable bite-sized steps",
                    skills=process_skills,
                    instructions="Brainstorm approach, produce architecture design doc, and write TDD test plan."
                )
            )
            stage_num += 1

        # Stage 2: Creative Direction & Reference
        design_skills = [s.id for s in skills if s.domain in ["design-taste", "search-research"]]
        if design_skills:
            stages.append(
                ExecutionStage(
                    stage_number=stage_num,
                    name="Design Direction / Research",
                    purpose="Establish high-taste visual language or synthesize authoritative evidence",
                    skills=design_skills,
                    instructions="Align visual craft and references; avoid cargo-culting cross-platform aesthetics."
                )
            )
            stage_num += 1

        # Stage 3: Implementation Authority
        impl_skills = [s.id for s in skills if s.domain in ["frontend", "backend", "database", "desktop", "mobile"]]
        if impl_skills:
            stages.append(
                ExecutionStage(
                    stage_number=stage_num,
                    name="Implementation Authority",
                    purpose="Execute core logic according to official platform conventions",
                    skills=impl_skills,
                    instructions="Implement clean component boundaries, database correctness, and test coverage."
                )
            )
            stage_num += 1

        # Stage 4: Independent Audit
        audit_skills = [s.id for s in skills if s.domain in ["security", "audit", "code-review"]] + [a.id for a in auditors]
        if audit_skills:
            stages.append(
                ExecutionStage(
                    stage_number=stage_num,
                    name="Independent Multi-Perspective Audit",
                    purpose="Challenge implementation across security, UI hierarchy, and code quality",
                    skills=list(set(audit_skills)),
                    instructions="Verify boundaries, anti-slop criteria, accessibility, and static security analysis."
                )
            )
            stage_num += 1

        # Stage 5: Verification
        stages.append(
            ExecutionStage(
                stage_number=stage_num,
                name="Evidence-Backed Verification",
                purpose="Confirm runtime behavior and release criteria",
                skills=["superpowers-verification-before-completion"],
                instructions="Run automated test suite, verify clean exit codes, and compile concrete evidence."
            )
        )

        return stages

    def _build_release_gate(self, project_type: str, risk_level: str) -> List[str]:
        base_checks = [
            "Functional problem requested by user is fully solved",
            "Official platform and framework idioms are strictly adhered to",
            "Automated unit and integration test suite passes cleanly",
            "Code quality, formatting, and boundary clarity are verified",
            "Zero unmitigated security vulnerabilities or hard-coded secrets",
            "Independent audit perspective has reviewed the implementation",
            "Concrete terminal or test evidence confirms completion",
        ]

        if project_type == "web":
            base_checks.extend([
                "Core Web Vitals meet thresholds (LCP < 2.5s, INP < 200ms, CLS < 0.1)",
                "Accessibility checks (WCAG 2.1 AA) pass without violations",
                "Public indexable routes have semantic HTML, canonical tags, and structured schema",
            ])
        elif project_type == "mobile":
            base_checks.extend([
                "Touch targets meet minimum 48x48dp / 44x44pt standards",
                "Dynamic font scaling works without layout breakage or truncation",
                "Screen reader labels (TalkBack / VoiceOver) are verified",
            ])
        elif project_type == "desktop":
            base_checks.extend([
                "Full keyboard navigation and shortcut support verified",
                "High DPI display scaling and window resizing operate without artifacts",
                "IPC boundary and application permissions strictly enforce least privilege",
            ])

        return base_checks
