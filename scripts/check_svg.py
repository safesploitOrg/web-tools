#!/usr/bin/env python3
"""Validate public SVG assets without adding a runtime or npm dependency."""

from __future__ import annotations

from pathlib import Path
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
SVG_DIRECTORY = ROOT / "public" / "assets" / "images"
SVG_NAMESPACE = "{http://www.w3.org/2000/svg}"
BLOCKED_ELEMENTS = frozenset({"script", "foreignObject", "iframe", "object", "embed"})


def validate_svg(path: Path) -> list[str]:
    """Return violations; fail closed on invalid XML and active content."""
    errors: list[str] = []
    try:
        root = ET.parse(path).getroot()
    except (ET.ParseError, OSError) as exc:
        return [f"invalid SVG XML: {exc}"]

    if root.tag != f"{SVG_NAMESPACE}svg":
        errors.append("root is not an SVG element in the SVG namespace")

    for element in root.iter():
        local_tag = element.tag.split("}", 1)[-1]
        if local_tag in BLOCKED_ELEMENTS:
            errors.append(f"disallowed active element: {local_tag}")
        for attribute, value in element.attrib.items():
            local_attribute = attribute.split("}", 1)[-1].lower()
            value_lower = value.lower().strip()
            if local_attribute.startswith("on"):
                errors.append(f"disallowed event handler attribute: {local_attribute}")
            if local_attribute in {"href", "base"}:
                errors.append(f"external or navigable reference not permitted: {local_attribute}")
            if "url(" in value_lower:
                errors.append(f"CSS/paint URL reference not permitted: {local_attribute}")
    return errors


def main() -> int:
    files = sorted(SVG_DIRECTORY.glob("*.svg"))
    if not files:
        print("FAIL: no SVG assets found", file=sys.stderr)
        return 1
    failures = 0
    for svg in files:
        for error in validate_svg(svg):
            print(f"FAIL: {svg.relative_to(ROOT)}: {error}", file=sys.stderr)
            failures += 1
    if failures:
        return 1
    print(f"PASS: {len(files)} well-formed SVG assets, without active content or references.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
