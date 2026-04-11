import sqlite3
import os
import uuid
from datetime import datetime, timedelta

DB_PATH = "System/Cron/cron_log.db"

class CronLog:
    def __init__(self):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS cron_runs (
                    run_id TEXT PRIMARY KEY,
                    job_name TEXT,
                    start_ts DATETIME DEFAULT CURRENT_TIMESTAMP,
                    end_ts DATETIME,
                    status TEXT,
                    duration_ms INTEGER,
                    summary TEXT,
                    pid INTEGER
                )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_job_name ON cron_runs(job_name)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_start_ts ON cron_runs(start_ts)")

    def log_start(self, job_name, pid):
        run_id = str(uuid.uuid4())
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("""
                INSERT INTO cron_runs (run_id, job_name, pid, status)
                VALUES (?, ?, ?, 'running')
            """, (run_id, job_name, pid))
        return run_id

    def log_end(self, run_id, status, duration_ms, summary):
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("""
                UPDATE cron_runs 
                SET end_ts = CURRENT_TIMESTAMP, status = ?, duration_ms = ?, summary = ?
                WHERE run_id = ?
            """, (status, duration_ms, summary, run_id))

    def should_run(self, job_name, interval_hours=23):
        """Idempotency check: has it succeeded recently?"""
        cutoff = (datetime.utcnow() - timedelta(hours=interval_hours)).strftime('%Y-%m-%d %H:%M:%S')
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.execute("""
                SELECT COUNT(*) FROM cron_runs 
                WHERE job_name = ? AND status = 'success' AND start_ts > ?
            """, (job_name, cutoff))
            count = cursor.fetchone()[0]
        return count == 0

    def cleanup_stale(self, timeout_hours=2):
        cutoff = (datetime.utcnow() - timedelta(hours=timeout_hours)).strftime('%Y-%m-%d %H:%M:%S')
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("""
                UPDATE cron_runs 
                SET status = 'failed', summary = 'Stale job cleanup (timeout)'
                WHERE status = 'running' AND start_ts < ?
            """, (cutoff,))

    def get_failure_count(self, job_name, window_hours=6):
        cutoff = (datetime.utcnow() - timedelta(hours=window_hours)).strftime('%Y-%m-%d %H:%M:%S')
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.execute("""
                SELECT COUNT(*) FROM cron_runs 
                WHERE job_name = ? AND status = 'failed' AND start_ts > ?
            """, (job_name, cutoff))
            return cursor.fetchone()[0]

cron_log = CronLog()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "cleanup_stale":
        cron_log.cleanup_stale()