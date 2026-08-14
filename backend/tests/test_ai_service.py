from app.services.ai_service import AiService
from app.services.resume_text import PERIOD_PATTERN


def test_mock_resume_extraction_uses_resume_text_for_experience_sections():
    resume_text = """
张三
zhangsan@example.com
教育经历
清华大学 计算机科学与技术 本科 2018.09 - 2022.06
工作经历
字节跳动 后端工程师 2022.07 - 至今
负责 Flask API 开发与 SQL 性能优化
项目经历
talent-lab 智能简历分析平台
技术栈：React, TypeScript, Flask, SQL
负责上传解析和候选人评分模块
"""

    profile = AiService(mode="mock").extract_resume(resume_text)

    assert profile["education"][0]["school"] == "清华大学"
    assert "计算机" in profile["education"][0]["major"]
    assert profile["education"][0]["degree"] == "本科"
    assert profile["work_experience"][0]["company"] == "字节跳动"
    assert "后端工程师" in profile["work_experience"][0]["title"]
    assert "Flask API" in profile["work_experience"][0]["summary"]
    assert profile["projects"][0]["name"] == "talent-lab 智能简历分析平台"
    assert "React" in profile["projects"][0]["tech_stack"]
    assert "本地模拟提取" not in str(profile)


def test_mock_resume_extraction_returns_empty_sections_when_not_found():
    profile = AiService(mode="mock").extract_resume("张三\nzhangsan@example.com")

    assert profile["education"] == []
    assert profile["work_experience"] == []
    assert profile["projects"] == []


def test_period_pattern_accepts_escaped_unicode_dashes():
    for separator in ("\u2013", "\u2014"):
        match = PERIOD_PATTERN.search(f"2020{separator}Present")

        assert match
        assert match.groups() == ("2020", "Present")


def test_mock_job_parser_accepts_escaped_unicode_dashes():
    job = AiService(mode="mock").parse_job_description(
        "职位名称：后端工程师\n经验要求：3\u20135 年\n薪资：25k\u201435k"
    )

    assert job["experience_min_years"] == 3
    assert job["experience_max_years"] == 5
    assert job["salary_min"] == 25000
    assert job["salary_max"] == 35000


def test_mock_job_description_parser_extracts_title_and_skills():
    jd_text = """
公司名称：星河科技
职位名称：高级前端工程师
工作地点：上海
用工类型：全职，也可接受合同工
薪资：25k-35k

岗位职责：
- 负责核心 Web 产品的架构与开发

任职要求：
- 3 年以上经验，熟练掌握 React、TypeScript 和 CSS
- 熟悉 REST API，能够使用 Git 协作
- 本科及以上学历

加分项：
- 有 Node.js、Docker 或 AWS 经验者优先
"""

    job = AiService(mode="mock").parse_job_description(jd_text)

    assert job["company_name"] == "星河科技"
    assert job["title"] == "高级前端工程师"
    assert job["raw_jd"] == jd_text.strip()
    assert job["description"] == jd_text.strip()
    assert job["locations"] == ["上海"]
    assert job["employment_type"] == ["full_time", "contract"]
    assert job["seniority"] == "senior"
    assert job["responsibilities"] == ["负责核心 Web 产品的架构与开发"]
    assert job["experience_min_years"] == 3
    assert job["minimum_education"] == "bachelor"
    assert job["salary_min"] == 25000
    assert job["salary_max"] == 35000
    assert job["required_skills"] == ["TypeScript", "React", "CSS", "Git", "REST"]
    assert job["bonus_skills"] == ["Node.js", "Docker", "AWS"]
    react = next(item for item in job["skill_requirements"] if item["name"] == "React")
    assert react["min_years"] == 3
    assert react["proficiency"] == "proficient"
