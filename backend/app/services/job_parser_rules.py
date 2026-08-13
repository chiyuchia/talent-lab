import re

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
)
RESPONSIBILITY_MARKERS = ("岗位职责", "工作职责", "responsibilities", "what you'll do")
ALL_SECTION_MARKERS = (*BONUS_MARKERS, *REQUIRED_MARKERS, *RESPONSIBILITY_MARKERS)
GENERIC_HEADINGS = {"jd", "job description", "职位描述", "岗位描述", "招聘信息"}


def extract_labeled_value(text: str, labels: str) -> str:
    pattern = re.compile(rf"^(?:{labels})\s*[:：]\s*(.+)$", re.IGNORECASE)
    for line in text.splitlines():
        match = pattern.match(clean_line(line))
        if match:
            return match.group(1).strip()
    return ""


def extract_title(text: str) -> str:
    explicit = extract_labeled_value(text, r"(?:职位|岗位)(?:名称)?|job\s*title|position")
    if explicit:
        return explicit
    for line in text.splitlines():
        cleaned = clean_line(line)
        if cleaned and cleaned.casefold().rstrip("：:") not in GENERIC_HEADINGS:
            return cleaned
    return "未命名岗位"


def extract_responsibilities(text: str) -> list[str]:
    collecting = False
    result = []
    for line in text.splitlines():
        cleaned = clean_line(line)
        lowered = cleaned.casefold().rstrip("：:")
        if any(marker in lowered for marker in RESPONSIBILITY_MARKERS):
            collecting = True
            remainder = re.sub(r"^[^:：]+[:：]", "", cleaned).strip()
            if remainder:
                result.append(remainder)
            continue
        if collecting and any(marker in lowered for marker in (*REQUIRED_MARKERS, *BONUS_MARKERS)):
            break
        if collecting and cleaned:
            result.append(cleaned)
    return result[:20]


def extract_experience_range(text: str) -> tuple[float | None, float | None]:
    match = re.search(r"(\d+(?:\.\d+)?)\s*[-–~至]\s*(\d+(?:\.\d+)?)\s*年", text)
    if match:
        return float(match.group(1)), float(match.group(2))
    match = re.search(r"(\d+(?:\.\d+)?)\s*年(?:以上|及以上|\+)", text)
    return (float(match.group(1)), None) if match else (None, None)


def extract_education(text: str) -> str:
    levels = (
        ("doctorate", r"博士|doctorate|ph\.?d"),
        ("master", r"硕士|研究生|master"),
        ("bachelor", r"本科|学士|bachelor"),
        ("associate", r"大专|专科|associate"),
        ("high_school", r"高中|high school"),
    )
    for value, pattern in levels:
        if re.search(pattern, text, re.IGNORECASE):
            return value
    return ""


def extract_salary(text: str) -> tuple[float | None, float | None, str, str]:
    match = re.search(r"(\d+(?:\.\d+)?)\s*[kK千]\s*[-–~至]\s*(\d+(?:\.\d+)?)\s*[kK千]", text)
    if match:
        return float(match.group(1)) * 1000, float(match.group(2)) * 1000, "CNY", "month"
    return None, None, "", ""


def extract_enum(text: str, patterns: tuple[tuple[str, str], ...]) -> str:
    for value, pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return value
    return ""


def clean_line(line: str) -> str:
    return re.sub(r"^[#>*\-\d.、\s]+", "", line).strip()
