#!/usr/bin/env python3
"""Find and optionally add missing citation entries to publications.yml.

Candidates come from OpenAlex's citation graph, are matched to a local work by
title, exclude Álvaro Cuéllar's own authorship, and are deduplicated against the
existing citation list. ``--apply`` performs a minimal text edit so the YAML's
comments and hand-maintained formatting remain intact.
"""

from __future__ import annotations

import argparse
import datetime as dt
import difflib
import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

import yaml


OPENALEX_API = "https://api.openalex.org/works"
DEFAULT_DATA_FILE = Path("_data/home/publications.yml")
SELF_AUTHOR_PATTERNS = (
    "alvaro cuellar",
    "alvaro cuellar gonzalez",
    "alvaro cuellar gonzález",
    "cuellar gonzalez alvaro",
    "cuéllar gonzález álvaro",
)


def normalize(value: Any) -> str:
    text = "" if value is None else str(value)
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def compact(value: Any) -> str:
    return normalize(value).replace(" ", "")


def fetch_json(url: str, delay: float = 0.12) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "PaginaPersonal citation monitor (GitHub Actions)",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        data = json.loads(response.read().decode("utf-8"))
    time.sleep(delay)
    return data


def openalex_query(params: dict[str, str]) -> dict[str, Any]:
    return fetch_json(f"{OPENALEX_API}?{urllib.parse.urlencode(params)}")


def title_similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, normalize(a), normalize(b)).ratio()


def find_openalex_work(title: str, year: Any) -> tuple[dict[str, Any] | None, float]:
    query = {
        "search": title,
        "per-page": "8",
        "select": "id,display_name,publication_year,cited_by_count,doi,authorships",
    }
    data = openalex_query(query)
    candidates = data.get("results", [])
    if not candidates:
        return None, 0.0

    expected_year = str(year or "")
    best = None
    best_score = 0.0
    for candidate in candidates:
        score = title_similarity(title, candidate.get("display_name", ""))
        if expected_year.isdigit() and str(candidate.get("publication_year")) == expected_year:
            score += 0.05
        if score > best_score:
            best = candidate
            best_score = score

    if best_score < 0.82:
        return None, best_score
    return best, min(best_score, 1.0)


def author_names(work: dict[str, Any]) -> list[str]:
    names = []
    for authorship in work.get("authorships", []) or []:
        author = authorship.get("author") or {}
        name = author.get("display_name")
        if name:
            names.append(name)
    return names


def is_self_citation(work: dict[str, Any]) -> bool:
    normalized_names = [normalize(name) for name in author_names(work)]
    for name in normalized_names:
        if any(pattern in name for pattern in SELF_AUTHOR_PATTERNS):
            return True
    return False


def local_has_citation(local_citations: list[str], citing_title: str) -> bool:
    normalized_title = normalize(citing_title)
    compact_title = compact(citing_title)
    if not normalized_title:
        return False

    for citation in local_citations:
        normalized_citation = normalize(citation)
        compact_citation = compact(citation)
        if normalized_title in normalized_citation:
            return True
        if compact_title and compact_title in compact_citation:
            return True
        if title_similarity(citing_title, citation) > 0.86:
            return True
    return False


def format_authors(names: list[str]) -> str:
    if not names:
        return "Autor desconocido"
    if len(names) == 1:
        return names[0]
    if len(names) == 2:
        return f"{names[0]} y {names[1]}"
    return f"{names[0]} et al."


def format_candidate(work: dict[str, Any]) -> str:
    title = work.get("display_name") or "Título desconocido"
    year = work.get("publication_year") or "s. f."
    source = (
        work.get("primary_location", {})
        .get("source", {})
        .get("display_name")
        if work.get("primary_location")
        else None
    )
    biblio = work.get("biblio") or {}
    parts = [f"{format_authors(author_names(work))}. “{title}.”"]
    if source:
        publication = source
        if biblio.get("volume"):
            publication += f", vol. {biblio['volume']}"
        if biblio.get("issue"):
            publication += f", no. {biblio['issue']}"
        if biblio.get("first_page") and biblio.get("last_page"):
            publication += f", pp. {biblio['first_page']}–{biblio['last_page']}"
        parts.append(publication)
    parts.append(str(year))
    doi = work.get("doi")
    if doi:
        parts.append(f"DOI: {doi.removeprefix('https://doi.org/')}")
    return " ".join(parts).replace("..", ".")


def citing_works(openalex_id: str) -> list[dict[str, Any]]:
    work_id = openalex_id.rsplit("/", 1)[-1]
    params = {
        "filter": f"cites:{work_id}",
        "per-page": "200",
        "select": (
            "id,display_name,publication_year,doi,authorships,primary_location,biblio"
        ),
        "sort": "publication_year:desc",
        "cursor": "*",
    }
    results: list[dict[str, Any]] = []
    while True:
        data = openalex_query(dict(params))
        results.extend(data.get("results", []))
        next_cursor = (data.get("meta") or {}).get("next_cursor")
        if not next_cursor or next_cursor == params["cursor"]:
            break
        params["cursor"] = next_cursor
    return results


def load_publications(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle)
    return data.get("publications", [])


def yaml_double_quoted(value: str) -> str:
    """Return a single-line YAML double-quoted scalar."""
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    escaped = re.sub(r"\s+", " ", escaped).strip()
    return f'"{escaped}"'


def apply_candidates(path: Path, candidates: list[dict[str, Any]]) -> int:
    """Insert candidates under each publication's ``cited_by`` key.

    Edits are applied from the bottom of the file upwards to keep previously
    resolved line indexes stable. The complete result is parsed before it is
    written, so invalid YAML never replaces the source file.
    """
    publications = load_publications(path)
    existing_by_id = {
        str(publication.get("id") or ""): publication.get("cited_by") or []
        for publication in publications
    }
    grouped: dict[str, list[str]] = {}
    for item in candidates:
        local_id = str(item.get("local_id") or "").strip()
        citation = str(item.get("formatted") or "").strip()
        if not local_id or not citation:
            continue
        normalized_existing = {
            normalize(existing) for existing in existing_by_id.get(local_id, [])
        }
        if normalize(citation) in normalized_existing:
            continue
        citations = grouped.setdefault(local_id, [])
        if citation not in citations:
            citations.append(citation)

    if not grouped:
        return 0

    original = path.read_text(encoding="utf-8")
    lines = original.splitlines(keepends=True)
    insertions: list[tuple[int, list[str]]] = []
    id_pattern = re.compile(r"^  - id:\s*[\"']?([^\"'\s]+)[\"']?\s*$")

    publication_starts: list[tuple[int, str]] = []
    for index, line in enumerate(lines):
        match = id_pattern.match(line.rstrip("\r\n"))
        if match:
            publication_starts.append((index, match.group(1)))

    starts_by_id = {local_id: index for index, local_id in publication_starts}
    for local_id, citations in grouped.items():
        if local_id not in starts_by_id:
            raise ValueError(f"Publication id not found in YAML: {local_id}")

        block_start = starts_by_id[local_id]
        block_end = next(
            (index for index, _ in publication_starts if index > block_start),
            len(lines),
        )
        cited_by_index = next(
            (
                index
                for index in range(block_start, block_end)
                if re.match(r"^    cited_by:\s*$", lines[index].rstrip("\r\n"))
            ),
            None,
        )
        if cited_by_index is None:
            raise ValueError(f"cited_by key not found for publication: {local_id}")

        new_lines = [f"      - {yaml_double_quoted(citation)}\n" for citation in citations]
        insertions.append((cited_by_index + 1, new_lines))

    for index, new_lines in sorted(insertions, reverse=True):
        lines[index:index] = new_lines

    updated = "".join(lines)
    yaml.safe_load(updated)
    path.write_text(updated, encoding="utf-8")
    return sum(len(new_lines) for _, new_lines in insertions)


def build_report(
    candidates: list[dict[str, Any]], checked_count: int, applied_count: int = 0
) -> str:
    today = dt.date.today().isoformat()
    lines = [
        f"# Citation Monitor Report ({today})",
        "",
        f"Publicaciones rastreadas: {checked_count}",
        f"Candidatas nuevas no-autocita: {len(candidates)}",
        f"Citas añadidas automáticamente: {applied_count}",
        "",
    ]

    if not candidates:
        lines.extend(
            [
                "No se han encontrado candidatas nuevas con las fuentes consultadas.",
                "",
                "Fuente consultada: OpenAlex. El rastreo excluye citantes con Álvaro Cuéllar como autor/coautor y evita duplicados por título.",
            ]
        )
        return "\n".join(lines) + "\n"

    lines.extend(
        [
            "## Candidatas",
            "",
            "| Publicación citada | ID local | Cita candidata | Fuente |",
            "| --- | --- | --- | --- |",
        ]
    )
    for item in candidates:
        cited = item["cited_title"].replace("|", "\\|")
        candidate = item["formatted"].replace("|", "\\|")
        source = item["source"]
        lines.append(
            f"| {cited} | `{item['local_id']}` | {candidate} | {source} |"
        )

    lines.extend(
        [
            "",
            "Notas:",
            "- Las candidatas se han incorporado automáticamente a `_data/home/publications.yml` cuando el rastreo se ejecutó con `--apply`.",
            "- Se excluyen autocitas detectadas por autoría de OpenAlex.",
            "- OpenAlex no cubre todo Dialnet ni todas las revistas de Humanidades; el informe conserva la trazabilidad semanal de las altas automáticas.",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-file", type=Path, default=DEFAULT_DATA_FILE)
    parser.add_argument("--output", type=Path, default=Path("citation-candidates.md"))
    parser.add_argument("--max-publications", type=int, default=0)
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Add verified non-self candidates to publications.yml.",
    )
    args = parser.parse_args()

    publications = load_publications(args.data_file)
    if args.max_publications > 0:
        publications = publications[: args.max_publications]

    candidates: list[dict[str, Any]] = []
    seen_candidates: set[tuple[str, str]] = set()
    checked_count = 0

    for publication in publications:
        title = publication.get("title")
        if not title:
            continue

        work, score = find_openalex_work(title, publication.get("year"))
        if not work:
            continue

        checked_count += 1
        local_citations = publication.get("cited_by") or []
        for citing in citing_works(work["id"]):
            citing_title = citing.get("display_name") or ""
            if not citing_title:
                continue
            if is_self_citation(citing):
                continue
            if local_has_citation(local_citations, citing_title):
                continue
            candidate_key = (publication.get("id", ""), normalize(citing_title))
            if candidate_key in seen_candidates:
                continue
            seen_candidates.add(candidate_key)
            candidates.append(
                {
                    "local_id": publication.get("id", ""),
                    "cited_title": title,
                    "citing_title": citing_title,
                    "formatted": format_candidate(citing),
                    "source": citing.get("doi") or citing.get("id"),
                    "match_score": round(score, 3),
                }
            )

    candidates.sort(key=lambda item: (item["local_id"], item["formatted"]))
    applied_count = apply_candidates(args.data_file, candidates) if args.apply else 0
    report = build_report(candidates, checked_count, applied_count)
    args.output.write_text(report, encoding="utf-8")

    print(f"Checked publications: {checked_count}")
    print(f"New non-self citation candidates: {len(candidates)}")
    print(f"Automatically added citations: {applied_count}")
    print(f"Report written to: {args.output}")
    return 0 if args.apply else (1 if candidates else 0)


if __name__ == "__main__":
    sys.exit(main())
