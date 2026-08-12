export type EducationItem = {
  school?: string;
  graduation_time?: string;
  major?: string;
  degree?: string;
};

export type WorkExperienceItem = {
  company?: string;
  period?: string;
  title?: string;
  summary?: string;
};

export type ProjectItem = {
  name?: string;
  tech_stack?: string[];
  responsibilities?: string;
  highlights?: string;
};

export type StreamResumeData = {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  skills?: string[];
  education?: EducationItem[];
  work_experience?: WorkExperienceItem[];
  projects?: ProjectItem[];
};

// Resilient partial JSON repairing and parsing
export function repairJson(jsonStr: string): string {
  let str = jsonStr.trim();
  if (!str) return "{}";

  // Strip trailing commas, colons, or incomplete properties
  str = str.replace(/,\s*$/, "");
  str = str.replace(/:\s*$/, "");

  // Handle unclosed quote cut-offs
  let inString = false;
  let isEscaped = false;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '"' && !isEscaped) {
      inString = !inString;
    }
    if (str[i] === '\\' && !isEscaped) {
      isEscaped = true;
    } else {
      isEscaped = false;
    }
  }
  if (inString) {
    str += '"';
  }

  // Parse structural brackets using a stack
  const stack: ("object" | "array")[] = [];
  inString = false;
  isEscaped = false;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '"' && !isEscaped) {
      inString = !inString;
    }
    if (str[i] === '\\' && !isEscaped) {
      isEscaped = true;
    } else {
      isEscaped = false;
    }
    if (inString) continue;
    if (str[i] === "{") stack.push("object");
    if (str[i] === "[") stack.push("array");
    if (str[i] === "}") stack.pop();
    if (str[i] === "]") stack.pop();
  }

  while (stack.length > 0) {
    const top = stack.pop();
    if (top === "object") {
      str = str.trim().replace(/,\s*$/, "");
      str += "}";
    }
    if (top === "array") {
      str = str.trim().replace(/,\s*$/, "");
      str += "]";
    }
  }

  return str;
}

export function parsePartialJson(jsonStr: string): Partial<StreamResumeData> {
  try {
    const repaired = repairJson(jsonStr);
    return JSON.parse(repaired) as Partial<StreamResumeData>;
  } catch {
    return {};
  }
}
