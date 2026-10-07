"""
Intelligent Pole-Vault Crossbar - Database Module
SQLite persistence layer storing:
  - athletes
  - training_sessions
  - attempts
  - sensor_readings
  - predictions
"""

import os
import json
import sqlite3
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "pole_vault.db")


def get_db_connection() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Athletes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS athletes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT DEFAULT 'Elite Pole Vault',
        personal_best_m REAL DEFAULT 5.85,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Training sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS training_sessions (
        id TEXT PRIMARY KEY,
        athlete_id TEXT NOT NULL,
        crossbar_height_m REAL DEFAULT 5.60,
        weather_condition TEXT DEFAULT 'Indoor / Controlled',
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (athlete_id) REFERENCES athletes(id)
    );
    """)

    # Attempts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        athlete_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        scenario TEXT NOT NULL,
        contact_detected INTEGER NOT NULL,
        contact_type TEXT NOT NULL,
        location TEXT NOT NULL,
        confidence REAL NOT NULL,
        estimated_x_m REAL DEFAULT 2.25,
        features_json TEXT NOT NULL,
        sensor_response_json TEXT NOT NULL,
        is_success INTEGER NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (athlete_id) REFERENCES athletes(id)
    );
    """)

    # Sensor readings (high-rate or downsampled summary)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        attempt_id INTEGER NOT NULL,
        sample_count INTEGER NOT NULL,
        duration_s REAL NOT NULL,
        p1_max REAL,
        p2_max REAL,
        p3_max REAL,
        sg1_max REAL,
        sg2_max REAL,
        imu_accel_max REAL,
        imu_gyro_max REAL,
        raw_data_summary_json TEXT,
        FOREIGN KEY (attempt_id) REFERENCES attempts(id)
    );
    """)

    # Seed default athlete if empty
    cursor.execute("SELECT COUNT(*) FROM athletes")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO athletes (id, name, category, personal_best_m)
        VALUES ('ATH-001', 'Elena Rostova', 'Olympic Track & Field', 4.95)
        """)
        cursor.execute("""
        INSERT INTO athletes (id, name, category, personal_best_m)
        VALUES ('ATH-002', 'Marcus Vance', 'Elite Pole Vault', 5.82)
        """)

    conn.commit()
    conn.close()


def save_attempt(
    athlete_id: str,
    scenario: str,
    contact_detected: bool,
    contact_type: str,
    location: str,
    confidence: float,
    estimated_x_m: float,
    features: Dict[str, Any],
    sensor_response: Dict[str, float],
    is_success: bool,
    session_id: str = "SESS-2026-01",
    notes: Optional[str] = None
) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO attempts (
        session_id, athlete_id, timestamp, scenario,
        contact_detected, contact_type, location,
        confidence, estimated_x_m, features_json,
        sensor_response_json, is_success, notes
    ) VALUES (?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        session_id,
        athlete_id,
        scenario,
        1 if contact_detected else 0,
        contact_type,
        location,
        confidence,
        estimated_x_m,
        json.dumps(features),
        json.dumps(sensor_response),
        1 if is_success else 0,
        notes or ""
    ))

    attempt_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return attempt_id


def get_all_attempts(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT a.*, ath.name as athlete_name
    FROM attempts a
    LEFT JOIN athletes ath ON a.athlete_id = ath.id
    ORDER BY a.id DESC
    LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        d = dict(r)
        d["features"] = json.loads(d["features_json"]) if d.get("features_json") else {}
        d["sensor_response"] = json.loads(d["sensor_response_json"]) if d.get("sensor_response_json") else {}
        d["contact_detected"] = bool(d["contact_detected"])
        d["is_success"] = bool(d["is_success"])
        result.append(d)
    return result


def get_attempt_by_id(attempt_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT a.*, ath.name as athlete_name
    FROM attempts a
    LEFT JOIN athletes ath ON a.athlete_id = ath.id
    WHERE a.id = ?
    """, (attempt_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    d = dict(row)
    d["features"] = json.loads(d["features_json"]) if d.get("features_json") else {}
    d["sensor_response"] = json.loads(d["sensor_response_json"]) if d.get("sensor_response_json") else {}
    d["contact_detected"] = bool(d["contact_detected"])
    d["is_success"] = bool(d["is_success"])
    return d


# Initialize schema on load
try:
    init_db()
except Exception as e:
    print(f"Warning initializing DB: {e}")
