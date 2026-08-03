import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import yaml


SCRIPT_PATH = Path(__file__).parents[1] / "scripts" / "find_citation_candidates.py"
SPEC = importlib.util.spec_from_file_location("citation_monitor", SCRIPT_PATH)
MONITOR = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MONITOR)


class CitationMonitorApplyTests(unittest.TestCase):
    def test_citing_works_reads_every_openalex_page(self):
        pages = [
            {"results": [{"id": "first"}], "meta": {"next_cursor": "next"}},
            {"results": [{"id": "second"}], "meta": {"next_cursor": None}},
        ]

        with mock.patch.object(MONITOR, "openalex_query", side_effect=pages) as query:
            results = MONITOR.citing_works("https://openalex.org/W123")

        self.assertEqual([item["id"] for item in results], ["first", "second"])
        self.assertEqual(query.call_count, 2)
        self.assertEqual(query.call_args_list[0].args[0]["cursor"], "*")
        self.assertEqual(query.call_args_list[1].args[0]["cursor"], "next")

    def test_apply_candidates_preserves_structure_and_groups_by_publication(self):
        source = """publications:
  - id: "one"
    title: "First"
    cited_by:
      - "Existing citation, 2024."

  - id: "two"
    title: "Second"
    cited_by:
"""
        candidates = [
            {"local_id": "one", "formatted": 'Author. “A \\"quoted\\" title.” 2026.'},
            {"local_id": "two", "formatted": "Other. “Second title.” 2025."},
        ]

        with tempfile.TemporaryDirectory() as directory:
            data_file = Path(directory) / "publications.yml"
            data_file.write_text(source, encoding="utf-8")

            applied = MONITOR.apply_candidates(data_file, candidates)
            applied_again = MONITOR.apply_candidates(data_file, candidates)
            parsed = yaml.safe_load(data_file.read_text(encoding="utf-8"))

        self.assertEqual(applied, 2)
        self.assertEqual(applied_again, 0)
        self.assertEqual(
            parsed["publications"][0]["cited_by"],
            ['Author. “A \\"quoted\\" title.” 2026.', "Existing citation, 2024."],
        )
        self.assertEqual(
            parsed["publications"][1]["cited_by"],
            ["Other. “Second title.” 2025."],
        )

    def test_apply_candidates_rejects_unknown_publication(self):
        with tempfile.TemporaryDirectory() as directory:
            data_file = Path(directory) / "publications.yml"
            data_file.write_text("publications: []\n", encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "Publication id not found"):
                MONITOR.apply_candidates(
                    data_file,
                    [{"local_id": "missing", "formatted": "Citation, 2026."}],
                )


if __name__ == "__main__":
    unittest.main()
