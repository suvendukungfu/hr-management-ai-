"""Repository graph and topology analysis tools."""

from __future__ import annotations

from collections import Counter
from pathlib import Path
from typing import Iterable

from config import TARGET_PROJECT, register_plugin

_IGNORE_DIRS = {
    ".git",
    ".idea",
    ".vscode",
    "node_modules",
    "venv",
    "__pycache__",
    "dist",
    "build",
}


def _iter_files(root: Path) -> Iterable[Path]:
    for path in root.rglob("*"):
        if any(part in _IGNORE_DIRS for part in path.parts):
            continue
        if path.is_file():
            yield path


def _humanize_count(counter: Counter[str], top_n: int = 10) -> str:
    if not counter:
        return "none"
    ranked = counter.most_common(top_n)
    return ", ".join(f"{ext or '[no-ext]'}: {count}" for ext, count in ranked)


def analyze_repo(repo_path: str | None = None) -> str:
    """
    Return a concise repository topology summary.

    This is a lightweight structural analysis, not a deep AST graph.
    """
    root = Path(repo_path).resolve() if repo_path else TARGET_PROJECT
    if not root.exists():
        return f"Repository path does not exist: {root}"
    if not root.is_dir():
        return f"Provided path is not a directory: {root}"

    files = list(_iter_files(root))
    if not files:
        return f"No source files found under {root}."

    ext_counter: Counter[str] = Counter()
    top_level_counter: Counter[str] = Counter()
    python_module_counter: Counter[str] = Counter()

    for file_path in files:
        ext_counter[file_path.suffix.lower()] += 1
        rel = file_path.relative_to(root)
        top_level = rel.parts[0] if rel.parts else "."
        top_level_counter[top_level] += 1
        if file_path.suffix == ".py":
            python_module_counter[str(rel.parent)] += 1

    lines = [
        "Repository Analysis",
        f"- Root: {root}",
        f"- Total files analyzed: {len(files)}",
        f"- Top file types: {_humanize_count(ext_counter)}",
        f"- Top-level density: {_humanize_count(top_level_counter)}",
    ]

    if python_module_counter:
        lines.append(
            "- Python module hotspots: "
            + _humanize_count(python_module_counter, top_n=5)
        )

    return "\n".join(lines)


def register() -> None:
    register_plugin("graph", {"analyze_repo": analyze_repo})
