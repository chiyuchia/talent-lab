import re
from typing import Any

from .prompts import JOB_PARSER_SYSTEM_PROMPT

SKILL_PATTERNS = (
    ("TypeScript", r"\btypescript\b"),
    ("JavaScript", r"\bjavascript\b"),
    ("Node.js", r"\bnode(?:\.js|js)?\b"),
    ("React", r"\breact(?:\.js)?\b"),
    ("Vue", r"\bvue(?:\.js)?\b"),
    ("Angular", r"\bangular\b"),
    ("Python", r"\bpython\b"),
    ("Flask", r"\bflask\b"),
    ("Django", r"\bdjango\b"),
    ("FastAPI", r"\bfastapi\b"),
    ("Java", r"\bjava\b"),
    ("Go", r"\bgolang\b|\bgo\b"),
    ("C++", r"(?<!\w)c\+\+(?!\+)"),
    ("C#", r"(?<!\w)c#(?!\w)"),
    ("SQL", r"\bsql\b"),
    ("PostgreSQL", r"\bpostgres(?:ql)?\b"),
    ("MySQL", r"\bmysql\b"),
    ("Redis", r"\bredis\b"),
    ("Docker", r"\bdocker\b"),
    ("Kubernetes", r"\bkubernetes\b|\bk8s\b"),
    ("AWS", r"\baws\b"),
    ("Azure", r"\bazure\b"),
    ("GCP", r"\bgcp\b|google cloud"),
    ("Git", r"\bgit\b"),
    ("Linux", r"\blinux\b"),
    ("HTML", r"\bhtml5?\b"),
    ("CSS", r"\bcss3?\b"),
    ("Tailwind CSS", r"\btailwind(?:\s*css)?\b"),
    ("REST", r"\brest(?:ful)?\b"),
    ("GraphQL", r"\bgraphql\b"),
)

BONUS_MARKERS = ("加分", "优先", "preferred", "nice to have", "bonus")
REQUIRED_MARKERS = (
    "任职要求",
    "岗位要求",
    "职位要求",
    "必备",
    "requirements",
    "qualifications",
    "岗位职责",
    "responsibilities",
)
GENERIC_HEADINGS = {
    "jd",
    "job description",
    "职位描述",
    "岗位描述",
    "招聘信息",
}


class JobParserMixin:
    def parse_job_description(self, text: str) -> dict[str, Any]:
        description = text.strip()
        if self.mode == "real":
            parsed = self._call_json_model(
                [
                    {"role": "system", "content": JOB_PARSER_SYSTEM_PROMPT},
                    {"role": "user", "content": description[:20000]},
                ]
            )
        else:
            parsed = self._parse_job_description_mock(description)

        required_skills = self._normalize_skills(parsed.get("required_skills"))
        required_keys = {skill.casefold() for skill in required_skills}
        bonus_skills = [
            skill
            for skill in self._normalize_skills(parsed.get("bonus_skills"))
            if skill.casefold() not in required_keys
        ]
        title = str(parsed.get("title") or self._extract_job_title(description)).strip()
        return {
            "title": title[:160],
            "description": description,
            "required_skills": required_skills,
            "bonus_skills": bonus_skills,
        }

    def _parse_job_description_mock(self, text: str) -> dict[str, Any]:
        required_skills: list[str] = []
        bonus_skills: list[str] = []
        bonus_section = False

        for line in text.splitlines():
            normalized = line.strip()
            if not normalized:
                continue
            lowered = normalized.casefold()
            if any(marker in lowered for marker in BONUS_MARKERS):
                bonus_section = True
            elif any(marker in lowered for marker in REQUIRED_MARKERS):
                bonus_section = False

            target = bonus_skills if bonus_section else required_skills
            for skill, pattern in SKILL_PATTERNS:
                if re.search(pattern, normalized, flags=re.IGNORECASE) and skill not in target:
                    target.append(skill)

        return {
            "title": self._extract_job_title(text),
            "required_skills": required_skills,
            "bonus_skills": bonus_skills,
        }

    @staticmethod
    def _extract_job_title(text: str) -> str:
        title_pattern = re.compile(
            r"^(?:(?:职位|岗位)(?:名称)?|job\s*title|position)\s*[:：]\s*(.+)$",
            re.IGNORECASE,
        )
        candidates = []
        for line in text.splitlines():
            cleaned = re.sub(r"^[#>*\-\d.、\s]+", "", line).strip()
            if not cleaned:
                continue
            match = title_pattern.match(cleaned)
            if match:
                return match.group(1).strip()
            if cleaned.casefold().rstrip("：:") not in GENERIC_HEADINGS:
                candidates.append(cleaned)
        return candidates[0] if candidates else "未命名岗位"

    @staticmethod
    def _normalize_skills(value: Any) -> list[str]:
        if isinstance(value, str):
            items = re.split(r"[,，、;；\n]", value)
        elif isinstance(value, list):
            items = value
        else:
            items = []

        result = []
        seen = set()
        for item in items:
            skill = str(item).strip()[:80]
            key = skill.casefold()
            if skill and key not in seen:
                seen.add(key)
                result.append(skill)
        return result[:30]
