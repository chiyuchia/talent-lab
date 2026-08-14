import re

DATE_TOKEN_PATTERN = r"(?:19|20)\d{2}(?:[./\-年](?:0?[1-9]|1[0-2])月?)?|至今|现在|Present|Current|Now"
PERIOD_PATTERN = re.compile(
    rf"({DATE_TOKEN_PATTERN})\s*(?:[-~\u2014\u2013至到]|to)\s*({DATE_TOKEN_PATTERN})",
    re.IGNORECASE,
)
SINGLE_DATE_PATTERN = re.compile(DATE_TOKEN_PATTERN, re.IGNORECASE)

SECTION_ALIASES = {
    "education": [
        "教育",
        "教育背景",
        "教育经历",
        "education",
        "academic background",
        "educational background",
    ],
    "work": [
        "工作",
        "工作经历",
        "工作经验",
        "实习经历",
        "experience",
        "work experience",
        "professional experience",
        "employment history",
        "internship experience",
    ],
    "projects": [
        "项目",
        "项目经历",
        "项目经验",
        "projects",
        "project experience",
    ],
    "skills": [
        "技能",
        "专业技能",
        "技能清单",
        "skills",
        "technical skills",
    ],
}
OTHER_SECTION_ALIASES = [
    "个人信息",
    "基本信息",
    "联系方式",
    "证书",
    "获奖",
    "荣誉",
    "自我评价",
    "求职意向",
    "profile",
    "contact",
    "certifications",
    "awards",
    "summary",
]
ALL_SECTION_ALIASES = [
    alias for aliases in SECTION_ALIASES.values() for alias in aliases
] + OTHER_SECTION_ALIASES


class ResumeTextMixin:
    def _clean_lines(self, text: str) -> list[str]:
        return [line.strip() for line in text.splitlines() if line.strip()]

    def _section_lines(self, text: str, aliases: list[str]) -> list[str]:
        lines = self._clean_lines(text)
        start_index = next(
            (
                index
                for index, line in enumerate(lines)
                if self._is_section_heading(line, aliases)
            ),
            None,
        )
        if start_index is None:
            return []

        section_lines = []
        for line in lines[start_index + 1 :]:
            if self._is_section_heading(line, ALL_SECTION_ALIASES):
                break
            section_lines.append(self._strip_bullet(line))
        return [line for line in section_lines if line]

    def _is_section_heading(self, line: str, aliases: list[str]) -> bool:
        normalized = re.sub(r"[\s:：/｜|_-]+", " ", line.strip().lower()).strip()
        normalized = re.sub(r"\s+", " ", normalized)
        if len(normalized) > 40:
            return False
        return any(
            normalized == alias.lower()
            or normalized.startswith(f"{alias.lower()} ")
            or normalized.endswith(f" {alias.lower()}")
            for alias in aliases
        )

    def _strip_bullet(self, line: str) -> str:
        return re.sub(r"^[\s\-*•·●○▪▫◦\d.、)）]+", "", line).strip()

    def _group_lines(self, lines: list[str], start_detector) -> list[list[str]]:
        groups: list[list[str]] = []
        current: list[str] = []
        for raw_line in lines:
            line = self._strip_bullet(raw_line)
            if not line:
                continue
            if current and start_detector(line):
                groups.append(current)
                current = [line]
                continue
            current.append(line)
        if current:
            groups.append(current)
        return groups

    def _extract_period(self, text: str) -> str:
        match = PERIOD_PATTERN.search(text)
        if match:
            return f"{match.group(1)} - {match.group(2)}"

        dates = SINGLE_DATE_PATTERN.findall(text)
        if dates:
            return dates[-1]
        return ""

    def _remove_period(self, text: str, period: str) -> str:
        if not period:
            return text
        start, _, end = period.partition(" - ")
        text = text.replace(start, "")
        if end:
            text = text.replace(end, "")
        return text.replace(period, "")
