.PHONY: backend-install backend-init backend-dev frontend-install frontend-dev backend-test check-badchars compose-up compose-down

backend-install:
	python3 -m venv backend/.venv
	backend/.venv/bin/python -m pip install -r backend/requirements.txt

backend-init:
	cd backend && .venv/bin/flask --app wsgi init-db

backend-dev: backend-init
	cd backend && .venv/bin/flask --app wsgi run --host 0.0.0.0 --port 8000 --debug

frontend-install:
	cd frontend && npm ci

frontend-dev:
	cd frontend && npm run dev

backend-test:
	cd backend && .venv/bin/pytest

check-badchars:
	python3 scripts/check_bad_chars.py

compose-up:
	docker compose -f deploy/docker-compose.yml up -d --build

compose-down:
	docker compose -f deploy/docker-compose.yml down
