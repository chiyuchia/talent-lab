CANDIDATE_STATUSES = {"pending", "screen_passed", "interviewing", "hired", "rejected"}

PARSE_STATUSES = {"uploaded", "parsing", "extracting", "completed", "failed"}

MAX_UPLOAD_FILES = 5

APPLICATION_STATUSES = {
    "saved",
    "preparing",
    "applied",
    "assessment",
    "interview",
    "offer",
    "accepted",
    "rejected",
    "withdrawn",
}
APPLICATION_EVENT_TYPES = {
    "status_change",
    "interview",
    "assessment",
    "offer",
    "note",
    "task",
}
WORK_MODES = {"on_site", "hybrid", "remote"}
EMPLOYMENT_TYPES = {"full_time", "part_time", "contract", "internship"}
SENIORITY_LEVELS = {"intern", "entry", "mid", "senior", "expert", "manager"}
SALARY_PERIODS = {"hour", "month", "year"}
JOB_PRIORITIES = {"low", "medium", "high"}
EDUCATION_LEVELS = {"high_school", "associate", "bachelor", "master", "doctorate", "other"}
