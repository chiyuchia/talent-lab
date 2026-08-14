import json
import sqlite3

from app import create_app
from app.extensions import db
from app.models import Candidate, JobDescription


def test_init_db_migrates_legacy_job_rows(tmp_path):
    database_path = tmp_path / "legacy.sqlite3"
    connection = sqlite3.connect(database_path)
    connection.execute(
        """
        CREATE TABLE job_description (
            id INTEGER PRIMARY KEY,
            title VARCHAR(160) NOT NULL,
            description TEXT NOT NULL,
            required_skills JSON NOT NULL,
            bonus_skills JSON NOT NULL,
            employment_type VARCHAR(32),
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL
        )
        """
    )
    connection.execute(
        """
        INSERT INTO job_description
        (id, title, description, required_skills, bonus_skills, employment_type, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """,
        (
            1,
            "Legacy Engineer",
            "Legacy JD",
            json.dumps(["React"]),
            json.dumps(["Docker"]),
            "full_time",
        ),
    )
    connection.commit()
    connection.close()

    app = create_app(
        {
            "TESTING": True,
            "APP_ACCESS_KEY": "test-key",
            "SECRET_KEY": "test-secret",
            "SQLALCHEMY_DATABASE_URI": f"sqlite:///{database_path}",
            "UPLOAD_DIR": str(tmp_path / "uploads"),
        }
    )
    result = app.test_cli_runner().invoke(args=["init-db"])

    assert result.exit_code == 0
    with app.app_context():
        job = db.session.get(JobDescription, 1)
        assert job.title == "Legacy Engineer"
        assert job.application_status == "saved"
        assert job.employment_type == ["full_time"]
        assert job.skill_requirements == [
            {"name": "React", "importance": "required"},
            {"name": "Docker", "importance": "preferred"},
        ]


def test_init_db_marks_legacy_resumes_as_local_storage(tmp_path):
    database_path = tmp_path / "legacy-candidates.sqlite3"
    connection = sqlite3.connect(database_path)
    connection.execute(
        """
        CREATE TABLE candidate (
            id INTEGER PRIMARY KEY,
            upload_batch_id VARCHAR(64) NOT NULL,
            status VARCHAR(32) NOT NULL,
            original_filename VARCHAR(255) NOT NULL,
            pdf_path VARCHAR(512) NOT NULL,
            raw_text TEXT,
            parse_status VARCHAR(32) NOT NULL,
            error_message TEXT,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL
        )
        """
    )
    connection.execute(
        """
        INSERT INTO candidate
        (id, upload_batch_id, status, original_filename, pdf_path, parse_status,
        created_at, updated_at)
        VALUES (1, 'batch', 'pending', 'resume.pdf', '/uploads/resume.pdf', 'uploaded',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """
    )
    connection.commit()
    connection.close()

    app = create_app(
        {
            "TESTING": True,
            "APP_ACCESS_KEY": "test-key",
            "SECRET_KEY": "test-secret",
            "SQLALCHEMY_DATABASE_URI": f"sqlite:///{database_path}",
        }
    )
    result = app.test_cli_runner().invoke(args=["init-db"])

    assert result.exit_code == 0
    with app.app_context():
        candidate = db.session.get(Candidate, 1)
        assert candidate.storage_backend == "local"
