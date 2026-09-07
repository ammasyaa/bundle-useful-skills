"""
Data models for bundle-useful-skills router.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any


@dataclass
class Skill:
    id: str
    name: str
    source_repository: str
    source_path: str
    license: str
    version: str
    commit: str
    sha256: str
    last_reviewed: str
    authority_level: str
    platform: str
    framework: str
    domain: str
    task_types: List[str]
    activation_cost: str
    dependencies: List[str] = field(default_factory=list)
    conflicts: List[str] = field(default_factory=list)
    supersedes: List[str] = field(default_factory=list)
    notes: str = ""

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Skill":
        return cls(
            id=data["id"],
            name=data["name"],
            source_repository=data["source_repository"],
            source_path=data["source_path"],
            license=data["license"],
            version=data["version"],
            commit=data["commit"],
            sha256=data["sha256"],
            last_reviewed=data["last_reviewed"],
            authority_level=data["authority_level"],
            platform=data["platform"],
            framework=data.get("framework", "generic"),
            domain=data["domain"],
            task_types=data.get("task_types", []),
            activation_cost=data.get("activation_cost", "medium"),
            dependencies=data.get("dependencies", []),
            conflicts=data.get("conflicts", []),
            supersedes=data.get("supersedes", []),
            notes=data.get("notes", ""),
        )


@dataclass
class BundleSkillRef:
    id: str
    url: str
    mode: str
    use: str
    when: Optional[str] = None


@dataclass
class BundleManifest:
    id: str
    job: str
    skills: List[BundleSkillRef]
    recommended_with: List[str] = field(default_factory=list)
    runtime_rules: List[str] = field(default_factory=list)


@dataclass
class HardConflict:
    id: str
    description: str
    incompatible_skills: List[str]
    resolution: str


@dataclass
class ConditionalWarning:
    id: str
    description: str
    skills: List[str]
    guidance: str


@dataclass
class TaskRequest:
    query: str
    project_type: Optional[str] = None
    task_type: Optional[str] = None
    framework: Optional[str] = None
    platform: Optional[str] = None
    risk_level: Optional[str] = None  # LOW, MEDIUM, HIGH, RELEASE


@dataclass
class ExecutionStage:
    stage_number: int
    name: str
    purpose: str
    skills: List[str]
    instructions: str


@dataclass
class RouteResult:
    request: TaskRequest
    project_type: str
    task_type: str
    framework: str
    platform: str
    risk_level: str
    primary_authority: Optional[str]
    selected_skills: List[Skill]
    execution_stages: List[ExecutionStage]
    independent_auditors: List[Skill]
    conflicts_detected: List[str]
    warnings: List[str]
    release_gate: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "query": self.request.query,
            "classification": {
                "project_type": self.project_type,
                "task_type": self.task_type,
                "framework": self.framework,
                "platform": self.platform,
                "risk_level": self.risk_level,
                "primary_authority": self.primary_authority,
            },
            "selected_skills": [
                {
                    "id": s.id,
                    "name": s.name,
                    "authority_level": s.authority_level,
                    "activation_cost": s.activation_cost,
                    "repo": s.source_repository,
                    "commit": s.commit[:8],
                }
                for s in self.selected_skills
            ],
            "execution_stages": [
                {
                    "stage": stage.stage_number,
                    "name": stage.name,
                    "skills": stage.skills,
                    "instructions": stage.instructions,
                }
                for stage in self.execution_stages
            ],
            "independent_auditors": [a.id for a in self.independent_auditors],
            "conflicts_detected": self.conflicts_detected,
            "warnings": self.warnings,
            "release_gate": self.release_gate,
            "skill_count": len(self.selected_skills),
        }

    def to_markdown(self) -> str:
        lines = [
            f"# Routing Plan: {self.request.query}",
            "",
            "## 1. Classification & Context",
            f"- **Project Type**: `{self.project_type}`",
            f"- **Task Type**: `{self.task_type}`",
            f"- **Platform / Framework**: `{self.platform}` / `{self.framework}`",
            f"- **Primary Authority**: `{self.primary_authority or 'N/A'}`",
            f"- **Risk Level**: `{self.risk_level}`",
            f"- **Activated Skills Count**: **{len(self.selected_skills)}** (Target: 2-5 normal, 5-7 complex)",
            "",
            "## 2. Minimum Sufficient Skill Stack",
        ]

        for s in self.selected_skills:
            lines.append(
                f"- **`{s.id}`** - {s.name} "
                f"*(Authority: {s.authority_level}, Cost: {s.activation_cost}, Commit: `{s.commit[:7]}`)*"
            )

        if self.conflicts_detected:
            lines.extend(["", "## ⚠️ Conflicts Detected & Resolved"])
            for c in self.conflicts_detected:
                lines.append(f"- ❌ {c}")

        if self.warnings:
            lines.extend(["", "## ℹ️ Warnings & Guidance"])
            for w in self.warnings:
                lines.append(f"- ⚠️ {w}")

        lines.extend(["", "## 3. Progressive Execution Stages"])
        for stage in self.execution_stages:
            skills_str = ", ".join(f"`{s}`" for s in stage.skills)
            lines.append(f"### Stage {stage.stage_number}: {stage.name} ({skills_str})")
            lines.append(f"{stage.instructions}")
            lines.append("")

        if self.independent_auditors:
            lines.append("## 4. Independent Audit Perspectives")
            for a in self.independent_auditors:
                lines.append(f"- **`{a.id}`** ({a.name}): Independent verification")
            lines.append("")

        lines.append("## 5. Verification & Release Gate")
        for check in self.release_gate:
            lines.append(f"- [ ] {check}")

        return "\n".join(lines)
