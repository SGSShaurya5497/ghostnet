# backend/app/core/db.py
"""
SQLite persistence layer for GhostNet.

Uses stdlib sqlite3 — no additional dependencies required.

Tables:
  detections  — one row per detection produced by the inference pipeline
  reports     — one row per processed frame (summary / report item)

Seeded rows (from the 3 demo reports) are flagged with seeded=1 so they
can be filtered out of "real only" analytics queries if needed.
"""

import json
import logging
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

from app.core.config import settings

logger = logging.getLogger("ghostnet.db")

# ---------------------------------------------------------------------------
# DB connection helper
# ---------------------------------------------------------------------------

def _get_db_path() -> Path:
    path = Path(settings.DB_PATH)
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


@contextmanager
def get_conn() -> Generator[sqlite3.Connection, None, None]:
    """Context manager that yields a sqlite3 connection with row_factory set."""
    conn = sqlite3.connect(str(_get_db_path()), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")   # Better concurrent read performance
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

_CREATE_DETECTIONS = """
CREATE TABLE IF NOT EXISTS detections (
    id          TEXT PRIMARY KEY,
    frame_id    TEXT NOT NULL,
    label       TEXT NOT NULL DEFAULT 'ghost_net',
    confidence  REAL NOT NULL,
    bbox_json   TEXT NOT NULL,         -- {"x_min":..,"y_min":..,"x_max":..,"y_max":..}
    geo_json    TEXT,                  -- null or {"lat":..,"lon":..,"depth_m":..}
    geo_source  TEXT NOT NULL DEFAULT 'none',  -- 'manual_entry' | 'parsed_navigation_metadata' | 'none'
    sonar_meta_json TEXT NOT NULL,     -- {"range_m":..,"frequency_khz":..}
    severity    TEXT NOT NULL DEFAULT 'medium',
    area_m2     REAL,
    created_at  TEXT NOT NULL,
    seeded      INTEGER NOT NULL DEFAULT 0  -- 1 = demo/seed data, 0 = live detection
);
"""

_CREATE_REPORTS = """
CREATE TABLE IF NOT EXISTS reports (
    report_id         TEXT PRIMARY KEY,
    frame_id          TEXT NOT NULL,
    detection_count   INTEGER NOT NULL DEFAULT 0,
    highest_severity  TEXT NOT NULL DEFAULT 'low',
    created_at        TEXT NOT NULL,
    summary           TEXT NOT NULL DEFAULT '',
    seeded            INTEGER NOT NULL DEFAULT 0  -- 1 = seed/demo data
);
"""

_SEED_REPORTS = [
    {
        "report_id": "rep_01J982A1B2C3",
        "frame_id": "frame_20240315_001",
        "detection_count": 3,
        "highest_severity": "critical",
        "created_at": "2024-03-15T08:22:11+00:00",
        "summary": "Detected high-density monofilament gillnet cluster near shelf dropoff.",
        "seeded": 1,
    },
    {
        "report_id": "rep_01J982A1B2C4",
        "frame_id": "frame_20240315_002",
        "detection_count": 1,
        "highest_severity": "high",
        "created_at": "2024-03-15T09:45:33+00:00",
        "summary": "Isolated crab pot and synthetic line entanglement.",
        "seeded": 1,
    },
    {
        "report_id": "rep_01J982A1B2C5",
        "frame_id": "frame_20240315_003",
        "detection_count": 2,
        "highest_severity": "medium",
        "created_at": "2024-03-15T11:08:57+00:00",
        "summary": "Submerged trawl netting fragment partially silted.",
        "seeded": 1,
    },
]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def init_db() -> None:
    """Create tables if they don't exist and seed initial demo reports."""
    logger.info(f"Initializing SQLite database at: {_get_db_path()}")
    with get_conn() as conn:
        conn.execute(_CREATE_DETECTIONS)
        conn.execute(_CREATE_REPORTS)
        _seed_if_empty(conn)
    logger.info("Database initialized.")


def _seed_if_empty(conn: sqlite3.Connection) -> None:
    """Insert seed reports only if the reports table is empty."""
    count = conn.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
    if count == 0:
        logger.info("Seeding initial demo reports (seeded=1)...")
        conn.executemany(
            """
            INSERT OR IGNORE INTO reports
                (report_id, frame_id, detection_count, highest_severity, created_at, summary, seeded)
            VALUES
                (:report_id, :frame_id, :detection_count, :highest_severity, :created_at, :summary, :seeded)
            """,
            _SEED_REPORTS,
        )
        logger.info(f"Seeded {len(_SEED_REPORTS)} demo reports.")


# ---------------------------------------------------------------------------
# Detection persistence
# ---------------------------------------------------------------------------

def insert_detection(
    det_id: str,
    frame_id: str,
    label: str,
    confidence: float,
    bbox: dict,
    geo: dict | None,
    geo_source: str,
    sonar_meta: dict,
    severity: str,
    area_m2: float | None,
    created_at: str,
    seeded: int = 0,
) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT OR IGNORE INTO detections
                (id, frame_id, label, confidence, bbox_json, geo_json, geo_source,
                 sonar_meta_json, severity, area_m2, created_at, seeded)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                det_id,
                frame_id,
                label,
                confidence,
                json.dumps(bbox),
                json.dumps(geo) if geo else None,
                geo_source,
                json.dumps(sonar_meta),
                severity,
                area_m2,
                created_at,
                seeded,
            ),
        )


def get_all_detections(include_seeded: bool = True) -> list[dict]:
    """Return all stored detections as dicts."""
    with get_conn() as conn:
        query = "SELECT * FROM detections"
        if not include_seeded:
            query += " WHERE seeded = 0"
        query += " ORDER BY created_at DESC"
        rows = conn.execute(query).fetchall()
    result = []
    for row in rows:
        d = dict(row)
        d["bbox"] = json.loads(d.pop("bbox_json"))
        d["geo"] = json.loads(d.pop("geo_json")) if d["geo_json"] else None
        d["sonar_meta"] = json.loads(d.pop("sonar_meta_json"))
        result.append(d)
    return result


# ---------------------------------------------------------------------------
# Report persistence
# ---------------------------------------------------------------------------

def insert_report(
    report_id: str,
    frame_id: str,
    detection_count: int,
    highest_severity: str,
    created_at: str,
    summary: str,
    seeded: int = 0,
) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT OR IGNORE INTO reports
                (report_id, frame_id, detection_count, highest_severity, created_at, summary, seeded)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (report_id, frame_id, detection_count, highest_severity, created_at, summary, seeded),
        )


def get_reports(limit: int = 20, offset: int = 0) -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM reports ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset),
        ).fetchall()
    return [dict(row) for row in rows]


def count_reports() -> int:
    with get_conn() as conn:
        return conn.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
