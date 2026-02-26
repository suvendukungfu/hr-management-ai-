"""CLI entrypoint for Antigravity extension plugins."""

from __future__ import annotations

import argparse

import agents.coderabbit
import agents.graph_tools
import agents.gsd_executor
from config import PLUGINS_LIST, TARGET_PROJECT, get_available_tools, get_tool


def init_plugins() -> None:
    """Register enabled plugins from configuration."""
    print("Initializing Antigravity Extension Plugins...")

    enabled = set(PLUGINS_LIST)
    if "gsd" in enabled:
        agents.gsd_executor.register()
    if "graph" in enabled:
        agents.graph_tools.register()
    if "coderabbit" in enabled:
        agents.coderabbit.register()

    print(f"Enabled plugins: {', '.join(sorted(enabled)) or 'none'}")
    print(f"Target project: {TARGET_PROJECT}")
    print("\n" + get_available_tools() + "\n")


def run_smoke_tests() -> None:
    """Run lightweight checks against registered plugin actions."""
    print("=" * 58)
    print("Executing Antigravity Plugin Smoke Tests")
    print("=" * 58 + "\n")

    print("--- [TEST 1] GSD: list target project files ---")
    gsd_run = get_tool("gsd", "run")
    print(gsd_run("ls -la"))

    print("\n--- [TEST 2] Graph: analyze repository topology ---")
    analyze_repo = get_tool("graph", "analyze_repo")
    print(analyze_repo(str(TARGET_PROJECT)))

    print("\n--- [TEST 3] CodeRabbit: review a frontend file ---")
    review_code = get_tool("coderabbit", "review_code")
    print(review_code("frontend/src/app/GodModeDashboard.tsx"))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Antigravity extension tool runner.",
    )
    parser.add_argument(
        "--skip-tests",
        action="store_true",
        help="Initialize plugins only and skip smoke tests.",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    init_plugins()
    if not args.skip_tests:
        run_smoke_tests()


if __name__ == "__main__":
    main()
