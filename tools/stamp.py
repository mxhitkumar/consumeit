#!/usr/bin/env python3
"""Stamp the shared page shell into every HTML page.

The site is plain static HTML with no build step on the host. The head
boilerplate, header/drawer and footer are identical on every page, so they live
once in _partials/ and are copied into the pages between marker comments:

    <!-- @stamp head-common -->      ...generated...   <!-- @/stamp head-common -->
    <!-- @stamp header current=/ -->  ...generated...   <!-- @/stamp header -->
    <!-- @stamp footer -->            ...generated...   <!-- @/stamp footer -->

Everything outside the markers is the page's own content and is never touched.
The pages that result are committed, so Render still serves plain static files.

    python3 tools/stamp.py            stamp all pages in place
    python3 tools/stamp.py --check    exit 1 if any page is out of date (no writes)

Edit a partial, run the script, review the diff, commit.

`current=` on the header marker names the nav link that gets aria-current="page".
Partials mark those spots with {{cur:/href}}.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARTIALS = ROOT / "_partials"
SKIP = {"removedthings.html"}
# xxxxxxx/ is the leftover ThemeForest demo (slated for deletion), not a site page.
SKIP_DIRS = {"_partials", "tools", ".git", "xxxxxxx", "node_modules"}

MARK = re.compile(
    r"(?P<open>(?P<indent>[ \t]*)<!-- @stamp (?P<name>[a-z-]+)(?: current=(?P<current>\S+))? -->\n)"
    r"(?P<body>.*?)"
    r"(?P<close>(?P=indent)<!-- @/stamp (?P=name) -->)",
    re.S,
)
CUR = re.compile(r"\{\{cur:([^}]+)\}\}")


def render(name: str, current: str | None) -> str:
    text = (PARTIALS / f"{name}.html").read_text(encoding="utf-8")
    return CUR.sub(lambda m: ' aria-current="page"' if m.group(1) == current else "", text)


def stamp(text: str, path: Path) -> str:
    seen = []

    def sub(m: re.Match) -> str:
        seen.append(m.group("name"))
        return m.group("open") + render(m.group("name"), m.group("current")) + m.group("close")

    out = MARK.sub(sub, text)
    if not seen:
        raise SystemExit(f"{path.relative_to(ROOT)}: no @stamp markers found")
    return out


def pages():
    for p in sorted(ROOT.rglob("*.html")):
        rel = p.relative_to(ROOT)
        if rel.parts[0] in SKIP_DIRS or rel.name in SKIP:
            continue
        yield p


def main() -> int:
    check = "--check" in sys.argv[1:]
    stale = []
    for p in pages():
        old = p.read_text(encoding="utf-8")
        new = stamp(old, p)
        if new != old:
            stale.append(p.relative_to(ROOT))
            if not check:
                p.write_text(new, encoding="utf-8")
    verb = "out of date" if check else "updated"
    for s in stale:
        print(f"{verb}: {s}")
    print(f"{len(stale)} page(s) {verb}")
    return 1 if (check and stale) else 0


if __name__ == "__main__":
    sys.exit(main())
