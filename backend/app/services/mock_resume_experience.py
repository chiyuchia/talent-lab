import re
from typing import Any

from .resume_text import SECTION_ALIASES


class MockResumeExperienceMixin:
    def _mock_skills(self, text: str) -> list[str]:
        known = [
            "Python",
            "Flask",
            "React",
            "TypeScript",
            "SQL",
            "Docker",
            "AWS",
            "Java",
            "Node.js",
            "Machine Learning",
        ]
        lowered = text.lower()
        found = [skill for skill in known if skill.lower() in lowered]
        return found

    def _extract_mock_work_experience(self, text: str) -> list[dict[str, str]]:
        lines = self._section_lines(text, SECTION_ALIASES["work"])
        if not lines:
            lines = [
                line
                for line in self._clean_lines(text)
                if self._extract_period(line) and self._contains_company_or_title(line)
            ]

        entries = []
        for group in self._group_lines(lines, self._looks_like_work_start):
            joined = " ".join(group)
            period = self._extract_period(joined)
            company = self._extract_company(group, period)
            title = self._extract_title(group, company, period)
            summary = self._extract_summary(group, [company, title, period])
            if company or title or period or summary:
                entries.append(
                    {
                        "company": company,
                        "title": title,
                        "period": period,
                        "summary": summary,
                    }
                )
        return entries

    def _extract_mock_projects(self, text: str) -> list[dict[str, Any]]:
        lines = self._section_lines(text, SECTION_ALIASES["projects"])
        if not lines:
            lines = [
                line
                for line in self._clean_lines(text)
                if "项目" in line.lower() or "project" in line.lower()
            ]

        entries = []
        for group in self._group_lines(lines, self._looks_like_project_start):
            joined = " ".join(group)
            name = self._extract_project_name(group)
            tech_stack = self._known_skills(joined)
            responsibilities = self._extract_project_detail(group, ["职责", "负责", "responsibil"])
            highlights = self._extract_project_detail(group, ["亮点", "成果", "成效", "优化", "提升", "highlight"])
            if not responsibilities:
                responsibilities = self._extract_summary(group[1:], [name])
            if name or tech_stack or responsibilities or highlights:
                entries.append(
                    {
                        "name": name,
                        "tech_stack": tech_stack,
                        "responsibilities": responsibilities,
                        "highlights": highlights,
                    }
                )
        return entries

    def _contains_company_or_title(self, line: str) -> bool:
        lowered = line.lower()
        company_keywords = ["公司", "科技", "集团", "inc", "ltd", "llc", "corp", "company", "co."]
        title_keywords = [
            "工程师",
            "开发",
            "经理",
            "产品",
            "设计",
            "实习",
            "engineer",
            "developer",
            "manager",
            "designer",
            "analyst",
            "intern",
        ]
        return any(keyword in lowered for keyword in company_keywords + title_keywords)

    def _looks_like_work_start(self, line: str) -> bool:
        return bool(self._extract_period(line) and self._contains_company_or_title(line))

    def _extract_company(self, lines: list[str], period: str) -> str:
        for line in lines[:3]:
            if not self._contains_company_or_title(line):
                continue
            cleaned = self._remove_period(line, period)
            parts = [
                part.strip(" -\u2014\u2013,，;；")
                for part in re.split(r"\s{2,}|[|｜]", cleaned)
                if part.strip(" -\u2014\u2013,，;；")
            ]
            if parts:
                candidate = parts[0]
                if re.search(r"[\u4e00-\u9fff]", candidate) and re.search(r"\s", candidate):
                    sub_parts = re.split(r"\s+", candidate)
                    if sub_parts:
                        return sub_parts[0][:80]
                return candidate[:80]
        return ""

    def _extract_title(self, lines: list[str], company: str, period: str) -> str:
        title_pattern = re.compile(
            r"([\u4e00-\u9fffA-Za-z0-9+/&.\-\s]*(?:工程师|开发|经理|产品|设计|顾问|实习生|实习|Engineer|Developer|Manager|Designer|Analyst|Consultant|Architect|Intern)[\u4e00-\u9fffA-Za-z0-9+/&.\-\s]*)",
            re.IGNORECASE,
        )
        for line in lines[:3]:
            cleaned = self._remove_period(line, period)
            if company:
                cleaned = cleaned.replace(company, "")
            match = title_pattern.search(cleaned)
            if match:
                return match.group(1).strip(" -\u2014\u2013,，;；")[:80]
        return ""

    def _extract_summary(self, lines: list[str], ignored_values: list[str]) -> str:
        details = []
        for line in lines:
            cleaned = line
            for value in ignored_values:
                if value:
                    cleaned = cleaned.replace(value, "")
            cleaned = self._remove_period(cleaned, self._extract_period(cleaned)).strip(" -\u2014\u2013,，;；")
            if cleaned:
                details.append(cleaned)
        return "；".join(details[:4])[:300]

    def _looks_like_project_start(self, line: str) -> bool:
        lowered = line.lower()
        return (
            "项目" in lowered
            or "project" in lowered
            or bool(self._extract_period(line) and len(line) <= 80)
        )

    def _extract_project_name(self, lines: list[str]) -> str:
        for line in lines:
            cleaned = re.sub(r"^(?:项目名称|项目|project name|project)[:：\s]*", "", line, flags=re.IGNORECASE)
            cleaned = self._remove_period(cleaned, self._extract_period(cleaned)).strip(" -\u2014\u2013,，;；")
            if cleaned:
                return cleaned[:80]
        return ""

    def _extract_project_detail(self, lines: list[str], keywords: list[str]) -> str:
        for line in lines:
            lowered = line.lower()
            if any(keyword.lower() in lowered for keyword in keywords):
                return re.sub(r"^[^:：]{0,12}[:：]\s*", "", line).strip()[:300]
        return ""

    def _known_skills(self, text: str) -> list[str]:
        return self._mock_skills(text)
