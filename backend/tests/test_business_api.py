from io import BytesIO

from app import create_app
from app.extensions import db
from app.models import Candidate, ResumeProfile


def make_client():
    app = create_app(
        {
            "TESTING": True,
            "APP_ACCESS_KEY": "test-key",
            "SECRET_KEY": "test-secret",
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "UPLOAD_DIR": "instance/test_uploads",
        }
    )
    with app.app_context():
        db.create_all()
    client = app.test_client()
    client.post("/api/auth/login", json={"access_key": "test-key"})
    return client


def test_create_and_list_job():
    client = make_client()

    create_response = client.post(
        "/api/jobs",
        json={
            "title": "Frontend Engineer",
            "description": "Build React applications",
            "required_skills": ["React", "TypeScript"],
            "bonus_skills": ["Python"],
        },
    )

    assert create_response.status_code == 201
    assert create_response.get_json()["data"]["title"] == "Frontend Engineer"

    list_response = client.get("/api/jobs")
    assert len(list_response.get_json()["data"]["items"]) == 1


def test_parse_job_description_without_creating_job():
    client = make_client()
    jd_text = """岗位名称：Python 后端工程师
任职要求：熟悉 Python、Flask、PostgreSQL
加分项：有 Docker 和 Kubernetes 经验"""

    response = client.post("/api/jobs/parse", json={"text": jd_text})

    assert response.status_code == 200
    parsed = response.get_json()["data"]
    assert parsed["title"] == "Python 后端工程师"
    assert parsed["description"] == jd_text
    assert parsed["required_skills"] == ["Python", "Flask", "PostgreSQL"]
    assert parsed["bonus_skills"] == ["Docker", "Kubernetes"]

    list_response = client.get("/api/jobs")
    assert list_response.get_json()["data"]["items"] == []


def test_parse_job_description_requires_text():
    client = make_client()

    response = client.post("/api/jobs/parse", json={"text": "  "})

    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "VALIDATION_ERROR"


def test_create_personal_job_opportunity_and_initial_timeline():
    client = make_client()
    response = client.post(
        "/api/jobs",
        json={
            "company_name": "星河科技",
            "title": "Senior Frontend Engineer",
            "raw_jd": "Build a React platform",
            "source_url": "https://example.com/jobs/1",
            "locations": ["上海", "上海"],
            "work_mode": "hybrid",
            "employment_type": ["full_time", "contract", "full_time"],
            "responsibilities": ["负责核心产品开发"],
            "experience_min_years": 3,
            "minimum_education": "bachelor",
            "skill_requirements": [
                {"name": "React", "importance": "required", "min_years": 3},
                {"name": "react", "importance": "preferred"},
                {"name": "Docker", "importance": "preferred"},
            ],
            "salary_min": 25000,
            "salary_max": 35000,
            "salary_currency": "CNY",
            "salary_period": "month",
            "application_status": "saved",
            "is_favorite": True,
        },
    )

    assert response.status_code == 201
    job = response.get_json()["data"]
    assert job["company_name"] == "星河科技"
    assert job["raw_jd"] == "Build a React platform"
    assert job["description"] == job["raw_jd"]
    assert job["locations"] == ["上海"]
    assert job["employment_type"] == ["full_time", "contract"]
    assert job["required_skills"] == ["React"]
    assert job["bonus_skills"] == ["Docker"]

    events = client.get(f"/api/jobs/{job['id']}/events").get_json()["data"]["items"]
    assert len(events) == 1
    assert events[0]["status"] == "saved"


def test_job_status_changes_create_timeline_and_manual_events():
    client = make_client()
    job_id = client.post(
        "/api/jobs",
        json={"company_name": "Acme", "title": "Engineer", "raw_jd": "Python role"},
    ).get_json()["data"]["id"]

    update_response = client.patch(
        f"/api/jobs/{job_id}", json={"application_status": "applied"}
    )
    assert update_response.status_code == 200
    assert update_response.get_json()["data"]["application_status"] == "applied"

    event_response = client.post(
        f"/api/jobs/{job_id}/events",
        json={
            "type": "interview",
            "occurred_at": "2099-08-20T10:00:00",
            "status": "interview",
            "title": "技术一面",
            "notes": "准备系统设计",
        },
    )
    assert event_response.status_code == 201

    events = client.get(f"/api/jobs/{job_id}/events").get_json()["data"]["items"]
    assert [event["type"] for event in events] == ["interview", "status_change", "status_change"]
    assert client.get("/api/jobs").get_json()["data"]["items"][0]["application_status"] == "interview"


def test_job_favorite_can_be_toggled_and_filtered():
    client = make_client()
    job_id = client.post(
        "/api/jobs",
        json={"company_name": "Acme", "title": "Engineer", "raw_jd": "Role"},
    ).get_json()["data"]["id"]

    update_response = client.patch(
        f"/api/jobs/{job_id}", json={"is_favorite": True}
    )

    assert update_response.status_code == 200
    assert update_response.get_json()["data"]["is_favorite"] is True
    favorites = client.get("/api/jobs?favorite=true").get_json()["data"]["items"]
    assert [job["id"] for job in favorites] == [job_id]

    client.patch(f"/api/jobs/{job_id}", json={"is_favorite": False})
    assert client.get("/api/jobs?favorite=true").get_json()["data"]["items"] == []


def test_job_opportunity_validates_ranges_and_url():
    client = make_client()
    base = {"company_name": "Acme", "title": "Engineer", "raw_jd": "Role"}

    salary_response = client.post(
        "/api/jobs", json={**base, "salary_min": 30000, "salary_max": 20000}
    )
    url_response = client.post(
        "/api/jobs", json={**base, "source_url": "not-a-url"}
    )
    date_response = client.post(
        "/api/jobs", json={**base, "application_deadline": "next Friday"}
    )
    resume_response = client.post(
        "/api/jobs", json={**base, "submitted_resume_id": "not-an-id"}
    )
    employment_response = client.post(
        "/api/jobs", json={**base, "employment_type": ["full_time", "temporary"]}
    )

    assert salary_response.status_code == 400
    assert url_response.status_code == 400
    assert date_response.status_code == 400
    assert resume_response.status_code == 400
    assert employment_response.status_code == 400


def test_submitted_resume_is_protected_from_deletion():
    client = make_client()
    with client.application.app_context():
        candidate = Candidate(
            upload_batch_id="resume-version",
            original_filename="frontend.pdf",
            pdf_path="/tmp/frontend.pdf",
        )
        db.session.add(candidate)
        db.session.commit()
        candidate_id = candidate.id

    response = client.post(
        "/api/jobs",
        json={
            "company_name": "Acme",
            "title": "Engineer",
            "raw_jd": "Role",
            "submitted_resume_id": candidate_id,
        },
    )

    assert response.status_code == 201
    delete_response = client.delete(f"/api/candidates/{candidate_id}")
    assert delete_response.status_code == 409
    assert delete_response.get_json()["error"]["code"] == "RESUME_IN_USE"


def test_job_draft_without_requirements_cannot_be_scored():
    client = make_client()
    with client.application.app_context():
        candidate = Candidate(
            upload_batch_id="batch",
            original_filename="resume.pdf",
            pdf_path="/tmp/resume.pdf",
        )
        db.session.add(candidate)
        db.session.commit()
        candidate_id = candidate.id

    job_id = client.post(
        "/api/jobs", json={"company_name": "Acme", "title": "Draft", "raw_jd": ""}
    ).get_json()["data"]["id"]
    response = client.post(
        "/api/scores", json={"candidate_id": candidate_id, "job_ids": [job_id]}
    )

    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "JOB_NOT_READY"


def test_upload_rejects_non_pdf():
    client = make_client()

    response = client.post(
        "/api/uploads/resumes",
        data={"files": (BytesIO(b"not a pdf"), "resume.txt")},
        content_type="multipart/form-data",
    )

    assert response.status_code == 400


def test_upload_rejects_more_than_five_pdfs():
    client = make_client()

    response = client.post(
        "/api/uploads/resumes",
        data={
            "files": [
                (BytesIO(b"%PDF-1.4\n% test\n"), f"resume-{index}.pdf")
                for index in range(6)
            ]
        },
        content_type="multipart/form-data",
    )

    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "TOO_MANY_FILES"


def test_compare_requires_two_or_three_candidates():
    client = make_client()

    response = client.post("/api/candidates/compare", json={"candidate_ids": [1]})

    assert response.status_code == 400


def test_candidate_profile_update_and_list():
    client = make_client()
    with client.application.app_context():
        candidate = Candidate(
            upload_batch_id="batch",
            original_filename="resume.pdf",
            pdf_path="/tmp/resume.pdf",
        )
        db.session.add(candidate)
        db.session.commit()
        candidate_id = candidate.id

    response = client.patch(
        f"/api/candidates/{candidate_id}/profile",
        json={
            "name": "Ada Lovelace",
            "email": "ada@example.com",
            "skills": ["Python", "React"],
        },
    )

    assert response.status_code == 200
    assert response.get_json()["data"]["profile"]["name"] == "Ada Lovelace"

    list_response = client.get("/api/candidates?q=ada")
    assert list_response.get_json()["data"]["total"] == 1


def test_candidate_list_filters_by_multiple_skills():
    client = make_client()
    profiles = [
        ("Ada Lovelace", ["React", "TypeScript"]),
        ("Grace Hopper", ["Python", "React"]),
        ("Linus Torvalds", ["Python", "Go"]),
    ]

    with client.application.app_context():
        for name, skills in profiles:
            candidate = Candidate(
                upload_batch_id="batch",
                original_filename=f"{name}.pdf",
                pdf_path=f"/tmp/{name}.pdf",
            )
            db.session.add(candidate)
            db.session.flush()
            db.session.add(
                ResumeProfile(candidate_id=candidate.id, name=name, skills=skills)
            )
        db.session.commit()

    response = client.get("/api/candidates?skill=React&skill=TypeScript")
    data = response.get_json()["data"]

    assert data["total"] == 1
    assert data["items"][0]["name"] == "Ada Lovelace"

    comma_response = client.get("/api/candidates?skills=React,Python")
    comma_data = comma_response.get_json()["data"]

    assert comma_data["total"] == 1
    assert comma_data["items"][0]["name"] == "Grace Hopper"


def test_candidate_list_filters_by_keyword_fields_and_terms():
    client = make_client()
    profiles = [
        {
            "name": "Ada Lovelace",
            "city": "Beijing",
            "skills": ["React", "TypeScript"],
            "education": [{"school": "清华大学", "major": "Computer Science"}],
        },
        {
            "name": "Grace Hopper",
            "city": "New York",
            "skills": ["Python", "COBOL"],
            "education": [{"school": "Yale University", "major": "Mathematics"}],
        },
        {
            "name": "Alan Turing",
            "city": "London",
            "skills": ["Cryptography"],
            "education": [{"school": "Princeton University", "major": "Mathematics"}],
        },
    ]

    with client.application.app_context():
        for profile in profiles:
            candidate = Candidate(
                upload_batch_id="batch",
                original_filename=f"{profile['name']}.pdf",
                pdf_path=f"/tmp/{profile['name']}.pdf",
            )
            db.session.add(candidate)
            db.session.flush()
            db.session.add(ResumeProfile(candidate_id=candidate.id, **profile))
        db.session.commit()

    school_response = client.get("/api/candidates", query_string={"q": "清华"})
    school_data = school_response.get_json()["data"]

    assert school_data["total"] == 1
    assert school_data["items"][0]["name"] == "Ada Lovelace"

    combined_response = client.get("/api/candidates", query_string={"q": "React 清华"})
    combined_data = combined_response.get_json()["data"]

    assert combined_data["total"] == 1
    assert combined_data["items"][0]["name"] == "Ada Lovelace"

    mismatch_response = client.get("/api/candidates", query_string={"q": "React Yale"})
    assert mismatch_response.get_json()["data"]["total"] == 0


def test_score_candidate_against_job():
    client = make_client()
    with client.application.app_context():
        candidate = Candidate(
            upload_batch_id="batch",
            original_filename="resume.pdf",
            pdf_path="/tmp/resume.pdf",
        )
        db.session.add(candidate)
        db.session.flush()
        db.session.add(
            ResumeProfile(
                candidate_id=candidate.id,
                name="Ada Lovelace",
                skills=["React", "TypeScript"],
            )
        )
        second_candidate = Candidate(
            upload_batch_id="batch",
            original_filename="resume-backend.pdf",
            pdf_path="/tmp/resume-backend.pdf",
        )
        db.session.add(second_candidate)
        db.session.flush()
        db.session.add(
            ResumeProfile(
                candidate_id=second_candidate.id,
                name="Grace Hopper",
                skills=["Python"],
            )
        )
        db.session.commit()
        candidate_id = candidate.id
        second_candidate_id = second_candidate.id

    job_response = client.post(
        "/api/jobs",
        json={
            "company_name": "Acme",
            "title": "Frontend Engineer",
            "raw_jd": "React role",
            "skill_requirements": [
                {"name": "React", "importance": "required"},
                {"name": "TypeScript", "importance": "required"},
                {"name": "Docker", "importance": "required"},
            ],
        },
    )
    job_id = job_response.get_json()["data"]["id"]

    score_response = client.post(
        "/api/scores", json={"candidate_id": candidate_id, "job_ids": [job_id]}
    )

    assert score_response.status_code == 201
    score = score_response.get_json()["data"]["items"][0]
    assert score["total_score"] >= 0
    assert score["details"]["matched_required_skills"] == ["React", "TypeScript"]
    assert score["details"]["missing_required_skills"] == ["Docker"]
    assert score["details"]["cover_letter_points"]
    assert score["details"]["interview_questions"]

    second_score_response = client.post(
        "/api/scores",
        json={"candidate_id": second_candidate_id, "job_ids": [job_id]},
    )
    assert second_score_response.status_code == 201
    scores = client.get(f"/api/scores?job_id={job_id}").get_json()["data"]["items"]
    assert {item["candidate_id"] for item in scores} == {
        candidate_id,
        second_candidate_id,
    }


def test_candidate_pdf_preview_uses_backend_relative_path(tmp_path):
    client = make_client()
    pdf_path = tmp_path / "resume.pdf"
    pdf_path.write_bytes(b"%PDF-1.4\n% test\n")

    with client.application.app_context():
        candidate = Candidate(
            upload_batch_id="batch",
            original_filename="resume.pdf",
            pdf_path=str(pdf_path),
        )
        db.session.add(candidate)
        db.session.commit()
        candidate_id = candidate.id

    response = client.get(f"/api/candidates/{candidate_id}/pdf")

    assert response.status_code == 200
    assert response.mimetype == "application/pdf"
