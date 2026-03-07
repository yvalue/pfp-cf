#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
import sys
from shutil import which
from pathlib import Path


def resolve_executable(name: str) -> str:
    if which(name):
        return name
    if sys.platform.startswith("win"):
        win_name = f"{name}.cmd"
        if which(win_name):
            return win_name
    return name


def run_command(command: list[str], cwd: Path) -> int:
    executable = resolve_executable(command[0])
    final_command = [executable, *command[1:]]
    print(f"[RUN] {' '.join(command)}")
    try:
        process = subprocess.run(final_command, cwd=str(cwd))
    except FileNotFoundError:
        if sys.platform.startswith("win"):
            fallback_command = ["cmd", "/c", *command]
            print(f"[INFO] Fallback to cmd shell: {' '.join(fallback_command)}")
            process = subprocess.run(fallback_command, cwd=str(cwd))
        else:
            raise
    if process.returncode == 0:
        print(f"[OK]  {' '.join(command)}")
    else:
        print(f"[ERR] {' '.join(command)} (exit {process.returncode})")
    print("")
    return process.returncode


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run style quality gates for pfp-cf."
    )
    parser.add_argument("--repo", default=".", help="Repository root path.")
    parser.add_argument(
        "--fix",
        action="store_true",
        help="Run formatter write mode before checks.",
    )
    parser.add_argument(
        "--with-build",
        action="store_true",
        help="Include build check after format/lint checks.",
    )
    args = parser.parse_args()

    repo_root = Path(args.repo).resolve()
    if not (repo_root / "package.json").exists():
        print(f"[ERR] package.json not found under: {repo_root}")
        return 1

    commands: list[list[str]] = []
    if args.fix:
        commands.append(["pnpm", "format"])
    else:
        commands.append(["pnpm", "format:check"])
    commands.append(["pnpm", "lint"])
    if args.with_build:
        commands.append(["pnpm", "build"])

    failures = 0
    for command in commands:
        rc = run_command(command, repo_root)
        if rc != 0:
            failures += 1

    if failures == 0:
        print("[DONE] Style guard passed.")
        return 0

    print(f"[DONE] Style guard finished with {failures} failing step(s).")
    return 1


if __name__ == "__main__":
    sys.exit(main())
