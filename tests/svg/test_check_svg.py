"""Positive and hostile input regression checks for SVG assets."""

from pathlib import Path
import tempfile
import unittest
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
from check_svg import validate_svg  # noqa: E402


class SvgChecks(unittest.TestCase):
    def check_markup(self, markup: str) -> list[str]:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "example.svg"
            path.write_text(markup, encoding="utf-8")
            return validate_svg(path)

    def test_valid_svg(self) -> None:
        self.assertEqual(
            self.check_markup('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>'),
            [],
        )

    def test_invalid_xml_is_rejected(self) -> None:
        self.assertTrue(self.check_markup("<svg><rect></svg>"))

    def test_active_script_is_rejected(self) -> None:
        self.assertTrue(
            any("script" in issue for issue in self.check_markup(
                '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
            ))
        )

    def test_event_handlers_are_rejected(self) -> None:
        self.assertTrue(
            any("handler" in issue for issue in self.check_markup(
                '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'
            ))
        )

    def test_references_are_rejected(self) -> None:
        self.assertTrue(
            any("reference" in issue for issue in self.check_markup(
                '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://example.org/x"/></svg>'
            ))
        )


if __name__ == "__main__":
    unittest.main()
