#!/usr/bin/env python3
"""Find likely missing citation entries for publications.yml.

The script is intentionally conservative: it only reports candidates. It never
edits _data/home/publications.yml because citation matching requires review.
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
    }
    return openalex_query(params).get("results", [])


def load_publications(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle)
    return data.get("publications", [])


def build_report(candidates: list[dict[str, Any]], checked_count: int) -> str:
    today = dt.date.today().isoformat()
    lines = [
        f"# Citation Monitor Report ({today})",
        "",
        f"Publicaciones rastreadas: {checked_count}",
        f"Candidatas nuevas no-autocita: {len(candidates)}",
        "",
    ]

    if not candidates:
        lines.extend(
            [
                "No se han encontrado candidatas nuevas con las fuentes consultadas.",
                "",
                "Fuente consultada: OpenAlex. El rastreo excluye citantes con Álvaro Cuéllar como autor/coautor y no modifica el YAML automáticamente.",
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
            "- Estas candidatas requieren revisión manual antes de incorporarse a `_data/home/publications.yml`.",
            "- Se excluyen autocitas detectadas por autoría de OpenAlex.",
            "- OpenAlex no cubre todo Dialnet ni todas las revistas de Humanidades; el informe es una alarma semanal, no una auditoría exhaustiva.",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-file", type=Path, default=DEFAULT_DATA_FILE)
    parser.add_argument("--output", type=Path, default=Path("citation-candidates.md"))
    parser.add_argument("--max-publications", type=int, default=0)
    args = parser.parse_args()

    publications = load_publications(args.data_file)
    if args.max_publications > 0:
        publications = publications[: args.max_publications]

    candidates: list[dict[str, Any]] = []
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
            candidates.append(
                {
                    "local_id": publication.get("id", ""),
                    "cited_title": title,
                    "formatted": format_candidate(citing),
                    "source": citing.get("doi") or citing.get("id"),
                    "match_score": round(score, 3),
                }
            )

    candidates.sort(key=lambda item: (item["local_id"], item["formatted"]))
    report = build_report(candidates, checked_count)
    args.output.write_text(report, encoding="utf-8")

    print(f"Checked publications: {checked_count}")
    print(f"New non-self citation candidates: {len(candidates)}")
    print(f"Report written to: {args.output}")
    return 1 if candidates else 0


if __name__ == "__main__":
    sys.exit(main())
