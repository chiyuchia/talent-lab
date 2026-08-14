import sys
from io import BytesIO
from types import SimpleNamespace

import pytest
from werkzeug.datastructures import FileStorage

from app import create_app
from app.extensions import db
from app.models import Candidate
from app.services.resume_storage import make_resume_storage


class FakeR2Client:
    def __init__(self):
        self.objects: dict[tuple[str, str], bytes] = {}
        self.client_kwargs: dict = {}

    def upload_fileobj(self, stream, bucket, key, ExtraArgs):
        assert ExtraArgs == {"ContentType": "application/pdf"}
        self.objects[(bucket, key)] = stream.read()

    def get_object(self, Bucket, Key):
        return {"Body": BytesIO(self.objects[(Bucket, Key)])}

    def delete_object(self, Bucket, Key):
        self.objects.pop((Bucket, Key), None)


def make_r2_app():
    return create_app(
        {
            "TESTING": True,
            "APP_ACCESS_KEY": "test-key",
            "SECRET_KEY": "test-secret",
            "RESUME_STORAGE_BACKEND": "r2",
            "R2_ACCOUNT_ID": "account-id",
            "R2_ACCESS_KEY_ID": "access-key",
            "R2_SECRET_ACCESS_KEY": "secret-key",
            "R2_BUCKET_NAME": "talent-lab-resumes",
            "R2_OBJECT_PREFIX": "private/resumes",
        }
    )


def test_r2_storage_uploads_reads_and_deletes(monkeypatch):
    fake_client = FakeR2Client()

    def make_client(**kwargs):
        fake_client.client_kwargs = kwargs
        return fake_client

    monkeypatch.setitem(sys.modules, "boto3", SimpleNamespace(client=make_client))
    app = make_r2_app()

    with app.app_context():
        storage = make_resume_storage()
        reference = storage.save(
            FileStorage(BytesIO(b"%PDF-1.4\nresume"), filename="resume.pdf"),
            "upload-resume.pdf",
        )

        assert reference == "private/resumes/upload-resume.pdf"
        assert fake_client.client_kwargs["region_name"] == "auto"
        assert storage.read(reference) == b"%PDF-1.4\nresume"

        storage.delete(reference)
        assert fake_client.objects == {}


def test_r2_configuration_requires_all_credentials():
    with pytest.raises(RuntimeError, match="Missing required R2 settings"):
        create_app({"RESUME_STORAGE_BACKEND": "r2"})


def test_r2_resume_is_previewed_and_removed_through_candidate_api(monkeypatch):
    fake_client = FakeR2Client()
    monkeypatch.setitem(sys.modules, "boto3", SimpleNamespace(client=lambda **_: fake_client))
    app = make_r2_app()

    with app.app_context():
        db.create_all()
        storage = make_resume_storage()
        reference = storage.save(
            FileStorage(BytesIO(b"%PDF-1.4\nresume"), filename="resume.pdf"),
            "upload-resume.pdf",
        )
        candidate = Candidate(
            upload_batch_id="batch",
            original_filename="resume.pdf",
            pdf_path=reference,
            storage_backend="r2",
        )
        db.session.add(candidate)
        db.session.commit()
        candidate_id = candidate.id

    client = app.test_client()
    client.post("/api/auth/login", json={"access_key": "test-key"})

    preview_response = client.get(f"/api/candidates/{candidate_id}/pdf")
    assert preview_response.status_code == 200
    assert preview_response.data == b"%PDF-1.4\nresume"

    delete_response = client.delete(f"/api/candidates/{candidate_id}")
    assert delete_response.status_code == 200
    assert fake_client.objects == {}
