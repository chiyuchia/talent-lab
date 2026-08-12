import re

from .resume_text import SECTION_ALIASES


class MockResumeEducationMixin:
    def _extract_mock_education(self, text: str) -> list[dict[str, str]]:
        lines = self._section_lines(text, SECTION_ALIASES["education"])
        if not lines:
            lines = [
                line
                for line in self._clean_lines(text)
                if self._contains_school(line) or self._contains_degree(line)
            ]

        entries = []
        for group in self._group_lines(lines, self._looks_like_education_start):
            joined = " ".join(group)
            school = self._extract_school(group)
            degree = self._extract_degree(joined)
            period = self._extract_period(joined)
            major = self._extract_major(joined, school, degree, period)
            if school or major or degree or period:
                entries.append(
                    {
                        "school": school,
                        "major": major,
                        "degree": degree,
                        "graduation_time": period,
                    }
                )
        return entries

    def _contains_school(self, line: str) -> bool:
        lowered = line.lower()
        return any(
            keyword in lowered
            for keyword in ["大学", "学院", "学校", "university", "college", "institute", "school"]
        )

    def _contains_degree(self, line: str) -> bool:
        return bool(
            re.search(
                r"博士|硕士|研究生|本科|学士|大专|ph\.?d|doctor|master|bachelor|b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?a\.?",
                line,
                re.IGNORECASE,
            )
        )

    def _looks_like_education_start(self, line: str) -> bool:
        return self._contains_school(line) or bool(self._extract_period(line) and self._contains_degree(line))

    def _extract_school(self, lines: list[str]) -> str:
        for line in lines:
            if not self._contains_school(line):
                continue
            without_period = self._remove_period(line, self._extract_period(line))
            parts = re.split(r"\s{2,}|[|｜]", without_period)
            candidate = parts[0].strip(" -—–,，;；")
            if re.search(r"[\u4e00-\u9fff]", candidate) and re.search(r"\s", candidate):
                sub_parts = re.split(r"\s+|[,，;；]", candidate)
                for part in sub_parts:
                    part_stripped = part.strip(" -—–,，;；")
                    if self._contains_school(part_stripped):
                        return part_stripped
            match = re.search(
                r"([\u4e00-\u9fffA-Za-z0-9&.'’（）()\-\s]{0,50}(?:大学|学院|学校|University|College|Institute|School)[\u4e00-\u9fffA-Za-z0-9&.'’（）()\-\s]{0,50})",
                candidate,
                re.IGNORECASE,
            )
            if match:
                return match.group(1).strip(" -—–,，;；")
            return candidate[:80]
        return ""

    def _extract_degree(self, text: str) -> str:
        degree_patterns = [
            ("博士", r"博士|ph\.?d|doctor"),
            ("硕士", r"硕士|研究生|master|m\.?s\.?|m\.?a\.?"),
            ("本科", r"本科|学士|bachelor|b\.?s\.?|b\.?a\.?"),
            ("大专", r"大专|专科|associate"),
        ]
        for label, pattern in degree_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return label
        return ""

    def _extract_major(self, text: str, school: str, degree: str, period: str) -> str:
        major_match = re.search(r"(?:专业|major)[:：\s]*([^\n,，;；|｜]+)", text, re.IGNORECASE)
        if major_match:
            return major_match.group(1).strip()

        cleaned = self._remove_period(text, period)
        for value in [school, degree]:
            if value:
                cleaned = cleaned.replace(value, "")
        cleaned = re.sub(r"毕业|学历|专业|major|degree", "", cleaned, flags=re.IGNORECASE)
        parts = [
            part.strip(" -—–,，;；")
            for part in re.split(r"\s{2,}|[|｜/]", cleaned)
            if part.strip(" -—–,，;；")
        ]
        return parts[0][:80] if parts else ""
