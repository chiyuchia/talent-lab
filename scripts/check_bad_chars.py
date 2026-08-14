#!/usr/bin/env python3
"""Reject characters listed by vscode-highlight-bad-chars."""

from __future__ import annotations

import subprocess
import sys
import unicodedata
from pathlib import Path

SOURCE_URL = (
    "https://github.com/WengerK/vscode-highlight-bad-chars/"
    "blob/master/src/bad-characters.ts"
)

# Snapshot verified 2026-08-14: 92 unique code points (U+200B is duplicated upstream).
BAD_CODE_POINTS = frozenset(
    {
        0x0082,
        0x0084,
        0x0085,
        0x0088,
        0x0091,
        0x0092,
        0x0093,
        0x0094,
        0x0095,
        0x0096,
        0x0097,
        0x0099,
        0x00A0,
        0x00A6,
        0x00A8,
        0x00AB,
        0x00B1,
        0x00BB,
        0x00BC,
        0x00BD,
        0x00BE,
        0x00BF,
        0x00AD,
        0x00B8,
        0x01C0,
        0x037E,
        0x061C,
        0x1680,
        0x180E,
        *range(0x2000, 0x200C),
        0x200D,
        0x200E,
        0x200F,
        0x2013,
        0x2014,
        0x2028,
        *range(0x202A, 0x202F),
        0x202F,
        0x205F,
        *range(0x2066, 0x206A),
        0x2223,
        0x3000,
        0xFEFF,
        0xFFFC,
        *range(0x00, 0x09),
        0x0B,
        0x0C,
        *range(0x0E, 0x20),
        0x7F,
    }
)

BINARY_SUFFIXES = {
    ".7z",
    ".avi",
    ".db",
    ".gif",
    ".gz",
    ".ico",
    ".jpeg",
    ".jpg",
    ".mov",
    ".mp3",
    ".mp4",
    ".otf",
    ".pdf",
    ".png",
    ".sqlite",
    ".sqlite3",
    ".ttf",
    ".wav",
    ".webm",
    ".webp",
    ".woff",
    ".woff2",
    ".zip",
}


def repository_files() -> list[Path]:
    result = subprocess.run(
        ["git", "ls-files", "-co", "--exclude-standard", "-z"],
        check=True,
        capture_output=True,
    )
    return [Path(value) for value in result.stdout.decode().split("\0") if value]


def read_text(path: Path) -> str | None:
    if path.suffix.casefold() in BINARY_SUFFIXES:
        return None
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None


def find_bad_characters(text: str):
    line = 1
    column = 1
    for character in text:
        code_point = ord(character)
        if code_point in BAD_CODE_POINTS:
            yield line, column, code_point
        if character == "\n":
            line += 1
            column = 1
        else:
            column += 1


def describe(code_point: int) -> str:
    name = unicodedata.name(chr(code_point), "CONTROL OR UNNAMED")
    return f"U+{code_point:04X} ({name})"


def main(arguments: list[str]) -> int:
    paths = [Path(value) for value in arguments] if arguments else repository_files()
    found = False
    for path in paths:
        text = read_text(path)
        if text is None:
            continue
        for line, column, code_point in find_bad_characters(text):
            found = True
            print(f"{path}:{line}:{column}: Bad char {describe(code_point)}")
    if found:
        print(f"Bad character list: {SOURCE_URL}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
