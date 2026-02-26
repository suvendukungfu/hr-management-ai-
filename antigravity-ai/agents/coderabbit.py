"""Lightweight static code review helper plugin."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import re

from config import TARGET_PROJECT, register_plugin

_TODO_PATTERN = re.compile(r"\b(TODO|FIXME|HACK)\b", re.IGNORECASE)
_DEBUG_PATTERN = re.compile(r"\b(console\.log|print\()")


@dataclass(frozen=True)
class Finding:
    severity: str
    line: int
    message: str


def _is_within_target(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def review_code(file_path: str) -> str:
    """Run a practical style and risk review on a single source file."""
    target = TARGET_PROJECT if TARGET_PROJECT.exists() else Path.cwd()
    candidate = Path(file_path)
    if not candidate.is_absolute():
        candidate = (target / candidate).resolve()

    if not candidate.exists() or not candidate.is_file():
        return f"Review failed: file not found ({candidate})."

    if not _is_within_target(candidate, target):
        return "Review blocked: file must be inside target project."

    text = candidate.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    findings: list[Finding] = []

    for idx, line in enumerate(lines, start=1):
        if len(line) > 120:
            findings.append(
                Finding("MEDIUM", idx, "Line exceeds 120 characters; reduce for readability.")
            )
        if _TODO_PATTERN.search(line):
            findings.append(
                Finding("LOW", idx, "Pending TODO/FIXME/HACK marker found.")
            )
        if _DEBUG_PATTERN.search(line):
            findings.append(
                Finding("LOW", idx, "Debug logging call found; verify if needed in committed code.")
            )
        if line.rstrip() != line:
            findings.append(
                Finding("LOW", idx, "Trailing whitespace detected.")
            )

    if not lines:
        findings.append(Finding("HIGH", 1, "File is empty."))

    rel_path = candidate.relative_to(target)
    output = [f"Code Review: {rel_path}"]

    if not findings:
        output.append("- No obvious quality or safety issues detected.")
        output.append("- Residual risk: this is static text scanning, not execution-aware analysis.")
        return "\n".join(output)

    severity_rank = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    findings.sort(key=lambda item: (severity_rank[item.severity], item.line))

    output.append(f"- Findings: {len(findings)}")
    for finding in findings[:30]:
        output.append(f"  [{finding.severity}] line {finding.line}: {finding.message}")
    if len(findings) > 30:
        output.append(f"  ... and {len(findings) - 30} more findings.")

    output.append("- Residual risk: no semantic or runtime analysis performed.")
    return "\n".join(output)


def register() -> None:
    register_plugin("coderabbit", {"review_code": review_code})
