from __future__ import annotations

from pathlib import PurePosixPath

from flask import current_app
from werkzeug.datastructures import FileStorage

from ..utils.paths import resolve_storage_path, upload_dir_path


class ResumeStorage:
    backend = ""

    def save(self, file: FileStorage, storage_name: str) -> str:
        raise NotImplementedError

    def read(self, reference: str) -> bytes:
        raise NotImplementedError

    def delete(self, reference: str) -> None:
        raise NotImplementedError


class LocalResumeStorage(ResumeStorage):
    backend = "local"

    def save(self, file: FileStorage, storage_name: str) -> str:
        path = upload_dir_path() / storage_name
        file.save(path)
        return str(path)

    def read(self, reference: str) -> bytes:
        return resolve_storage_path(reference).read_bytes()

    def delete(self, reference: str) -> None:
        path = resolve_storage_path(reference)
        upload_dir = upload_dir_path().resolve()
        try:
            path.resolve().relative_to(upload_dir)
        except ValueError:
            return
        path.unlink(missing_ok=True)


class R2ResumeStorage(ResumeStorage):
    backend = "r2"

    def __init__(self) -> None:
        self.bucket_name = current_app.config["R2_BUCKET_NAME"]
        self.object_prefix = current_app.config["R2_OBJECT_PREFIX"].strip("/")
        self.client = make_r2_client()

    def save(self, file: FileStorage, storage_name: str) -> str:
        key = self._new_key(storage_name)
        file.stream.seek(0)
        self.client.upload_fileobj(
            file.stream,
            self.bucket_name,
            key,
            ExtraArgs={"ContentType": "application/pdf"},
        )
        return key

    def read(self, reference: str) -> bytes:
        key = self._validate_key(reference)
        try:
            response = self.client.get_object(Bucket=self.bucket_name, Key=key)
        except Exception as exc:  # noqa: BLE001
            if is_missing_object_error(exc):
                raise FileNotFoundError(key) from exc
            raise
        return response["Body"].read()

    def delete(self, reference: str) -> None:
        self.client.delete_object(Bucket=self.bucket_name, Key=self._validate_key(reference))

    def _new_key(self, storage_name: str) -> str:
        name = self._validate_key(storage_name)
        return f"{self.object_prefix}/{name}" if self.object_prefix else name

    @staticmethod
    def _validate_key(value: str) -> str:
        path = PurePosixPath(value)
        if not value or path.is_absolute() or ".." in path.parts:
            raise ValueError("Invalid R2 object key")
        return path.as_posix()


def make_resume_storage(backend: str | None = None) -> ResumeStorage:
    selected_backend = backend or current_app.config["RESUME_STORAGE_BACKEND"]
    if selected_backend == "local":
        return LocalResumeStorage()
    if selected_backend == "r2":
        return R2ResumeStorage()
    raise ValueError(f"Unsupported resume storage backend: {selected_backend}")


def make_r2_client():
    try:
        import boto3
    except ImportError as exc:
        raise RuntimeError("boto3 is required when RESUME_STORAGE_BACKEND=r2") from exc

    account_id = current_app.config["R2_ACCOUNT_ID"]
    return boto3.client(
        service_name="s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=current_app.config["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=current_app.config["R2_SECRET_ACCESS_KEY"],
        region_name="auto",
    )


def is_missing_object_error(error: Exception) -> bool:
    response = getattr(error, "response", {})
    code = str(response.get("Error", {}).get("Code", ""))
    return code in {"404", "NoSuchKey", "NoSuchObject", "NotFound"}
