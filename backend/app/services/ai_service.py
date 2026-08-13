import json
import re
from dataclasses import dataclass
from typing import Any

from flask import current_app

from .ai_scoring import AiScoringMixin
from .job_parser import JobParserMixin
from .mock_resume_education import MockResumeEducationMixin
from .mock_resume_experience import MockResumeExperienceMixin
from .prompts import RESUME_PARSER_SYSTEM_PROMPT
from .resume_text import ResumeTextMixin


@dataclass(frozen=True)
class AiService(
    ResumeTextMixin,
    MockResumeEducationMixin,
    MockResumeExperienceMixin,
    JobParserMixin,
    AiScoringMixin,
):
    mode: str = "mock"
    api_key: str = ""
    base_url: str = ""
    model: str = ""

    def extract_resume(self, text: str) -> dict[str, Any]:
        if self.mode == "real":
            return self._extract_resume_real(text)

        email_match = re.search(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+", text)
        phone_match = re.search(r"(?:\+?\d[\d\s().-]{7,}\d)", text)
        first_line = next((line.strip() for line in text.splitlines() if line.strip()), "")

        return {
            "name": first_line[:80] or "模拟候选人",
            "phone": phone_match.group(0).strip() if phone_match else "",
            "email": email_match.group(0) if email_match else "",
            "city": "",
            "education": self._extract_mock_education(text),
            "work_experience": self._extract_mock_work_experience(text),
            "skills": self._mock_skills(text),
            "projects": self._extract_mock_projects(text),
        }

    def extract_resume_stream(self, text: str):
        if self.mode == "real":
            if not self.api_key:
                raise RuntimeError("AI_MODE=real 时必须配置 API Key（OPENAI_API_KEY 或 MOONSHOT_API_KEY）。")

            from openai import OpenAI

            base_url = self.base_url or ""
            is_kimi_like = any(token in base_url for token in ("moonshot", "kimi.com"))

            headers = {}
            if is_kimi_like:
                headers["User-Agent"] = "claude-code/1.0.0"

            client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url or None,
                default_headers=headers,
            )

            model = self.model or ("kimi-for-coding" if is_kimi_like else "gpt-4o-mini")

            extra_kwargs = {}
            if not is_kimi_like:
                extra_kwargs["response_format"] = {"type": "json_object"}

            messages = [
                {"role": "system", "content": RESUME_PARSER_SYSTEM_PROMPT},
                {"role": "user", "content": text[:18000]},
            ]

            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.2,
                stream=True,
                **extra_kwargs,
            )
            for chunk in response:
                delta = chunk.choices[0].delta.content or ""
                if delta:
                    yield delta
        else:
            profile = self.extract_resume(text)
            profile_json = json.dumps(profile, ensure_ascii=False, indent=2)
            chunk_size = 15
            import time
            for i in range(0, len(profile_json), chunk_size):
                yield profile_json[i:i+chunk_size]
                time.sleep(0.02)

    def _extract_resume_real(self, text: str) -> dict[str, Any]:
        return self._call_json_model(
            [
                {"role": "system", "content": RESUME_PARSER_SYSTEM_PROMPT},
                {"role": "user", "content": text[:18000]},
            ]
        )

    def _call_json_model(self, messages: list[dict[str, str]]) -> dict[str, Any]:
        if not self.api_key:
            raise RuntimeError("AI_MODE=real 时必须配置 API Key（OPENAI_API_KEY 或 MOONSHOT_API_KEY）。")

        from openai import OpenAI

        base_url = self.base_url or ""
        is_kimi_like = any(token in base_url for token in ("moonshot", "kimi.com"))

        headers = {}
        if is_kimi_like:
            headers["User-Agent"] = "claude-code/1.0.0"

        client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url or None,
            default_headers=headers,
        )

        # Moonshot / Kimi 接口不支持 response_format={"type": "json_object"}
        # 通过 system prompt 要求返回 JSON，然后解析
        model = self.model or ("kimi-for-coding" if is_kimi_like else "gpt-4o-mini")

        extra_kwargs = {}
        if not is_kimi_like:
            extra_kwargs["response_format"] = {"type": "json_object"}

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2,
            **extra_kwargs,
        )
        content = response.choices[0].message.content or "{}"
        return self._extract_json(content)

    def _extract_json(self, text: str) -> dict[str, Any]:
        text = text.strip()
        if text.startswith("```"):
            # Extract JSON from markdown code block
            lines = text.splitlines()
            # Remove first line (```json or ```)
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            # Remove last line (```)
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines).strip()
        return json.loads(text)


def make_ai_service() -> AiService:
    provider = current_app.config.get("AI_PROVIDER", "openai")
    if provider == "moonshot":
        return AiService(
            mode=current_app.config["AI_MODE"],
            api_key=current_app.config["MOONSHOT_API_KEY"],
            base_url=current_app.config["MOONSHOT_BASE_URL"],
            model=current_app.config["MOONSHOT_MODEL"],
        )
    if provider == "deepseek":
        return AiService(
            mode=current_app.config["AI_MODE"],
            api_key=current_app.config["DEEPSEEK_API_KEY"],
            base_url=current_app.config["DEEPSEEK_BASE_URL"],
            model=current_app.config["DEEPSEEK_MODEL"],
        )
    return AiService(
        mode=current_app.config["AI_MODE"],
        api_key=current_app.config["OPENAI_API_KEY"],
        base_url=current_app.config["OPENAI_BASE_URL"],
        model=current_app.config["OPENAI_MODEL"],
    )
