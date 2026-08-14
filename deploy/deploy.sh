#!/usr/bin/env bash
set -Eeuo pipefail

readonly DEPLOY_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly COMPOSE_FILE="${DEPLOY_DIR}/docker-compose.yml"
readonly PROD_ENV_FILE="${DEPLOY_DIR}/.env.production"
readonly RELEASE_ENV_FILE="${DEPLOY_DIR}/.env.release"
readonly IMAGE_REPOSITORY="ghcr.io/chiyuchia/talent-lab-backend"
readonly HEALTH_TIMEOUT="90"
release_temp=""

cleanup() {
  [[ -z "$release_temp" ]] || rm -f -- "$release_temp"
}

trap cleanup EXIT

usage() {
  echo "Usage: $0 ghcr.io/chiyuchia/talent-lab-backend@sha256:<digest>" >&2
  exit 64
}

fail() {
  echo "Deployment error: $1" >&2
  exit 1
}

assert_root_controlled() {
  local path="$1"
  local mode
  [[ "$(stat -c '%u' "$path")" == "0" ]] || fail "$path must be owned by root"
  mode="$(stat -c '%a' "$path")"
  (( (8#$mode & 8#022) == 0 )) || fail "$path must not be group/world writable"
}

compose_with_env() {
  local env_file="$1"
  shift
  docker compose \
    --project-directory "$DEPLOY_DIR" \
    --env-file "$env_file" \
    -f "$COMPOSE_FILE" \
    "$@"
}

backup_database() {
  local env_file="$1"
  [[ -n "$(compose_with_env "$env_file" ps -q backend)" ]] || return

  compose_with_env "$env_file" exec -T backend python - <<'PYTHON'
from datetime import datetime, timezone
from pathlib import Path
import sqlite3

database = Path("/data/talent-lab.sqlite3")
if database.exists():
    backup_dir = database.parent / "backups"
    backup_dir.mkdir(exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    destination = backup_dir / f"talent-lab-{timestamp}.sqlite3"
    with sqlite3.connect(database) as source, sqlite3.connect(destination) as target:
        source.backup(target)
    print(f"Database backup created: {destination}")
PYTHON
}

rollback() {
  [[ -f "$RELEASE_ENV_FILE" ]] || return
  echo "Attempting to restore the previous image." >&2
  compose_with_env "$RELEASE_ENV_FILE" up -d --no-build --wait \
    --wait-timeout "$HEALTH_TIMEOUT" backend || true
}

remove_old_backend_images() {
  local active_image_ref="$1"
  local image_ref
  local image_refs

  if ! image_refs="$(
    docker image ls "$IMAGE_REPOSITORY" --digests \
      --format '{{.Repository}}@{{.Digest}}'
  )"; then
    echo "Warning: unable to list old backend images." >&2
    return
  fi

  while IFS= read -r image_ref; do
    [[ "$image_ref" =~ ^ghcr\.io/chiyuchia/talent-lab-backend@sha256:[[:xdigit:]]{64}$ ]] || continue
    [[ "$image_ref" == "$active_image_ref" ]] && continue

    if ! docker image rm "$image_ref"; then
      echo "Warning: unable to remove old backend image: $image_ref" >&2
    fi
  done <<< "$image_refs"
}

main() {
  [[ $# -eq 1 ]] || usage
  local image_ref="$1"

  if [[ ! "$image_ref" =~ ^ghcr\.io/chiyuchia/talent-lab-backend@sha256:[[:xdigit:]]{64}$ ]]; then
    usage
  fi

  [[ -f "$COMPOSE_FILE" ]] || fail "Missing $COMPOSE_FILE"
  [[ -f "$PROD_ENV_FILE" ]] || fail "Missing $PROD_ENV_FILE"
  assert_root_controlled "$DEPLOY_DIR"
  assert_root_controlled "${DEPLOY_DIR}/deploy.sh"
  assert_root_controlled "$COMPOSE_FILE"
  assert_root_controlled "$PROD_ENV_FILE"

  release_temp="$(mktemp "${DEPLOY_DIR}/.env.release.XXXXXX")"
  printf 'BACKEND_IMAGE=%s\n' "$image_ref" > "$release_temp"
  chmod 600 "$release_temp"

  compose_with_env "$release_temp" config -q
  compose_with_env "$release_temp" pull backend
  backup_database "$release_temp"
  compose_with_env "$release_temp" run --rm --no-deps backend \
    flask --app wsgi init-db

  if ! compose_with_env "$release_temp" up -d --no-build --wait \
    --wait-timeout "$HEALTH_TIMEOUT" backend; then
    rollback
    fail "The new backend did not become healthy"
  fi

  mv "$release_temp" "$RELEASE_ENV_FILE"
  release_temp=""
  remove_old_backend_images "$image_ref"
  echo "Deployment complete: $image_ref"
}

main "$@"
