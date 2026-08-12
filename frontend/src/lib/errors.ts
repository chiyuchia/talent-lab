import i18n from "../i18n";

export type ApiErrorOptions = {
  status: number;
  code?: string;
  details?: unknown;
  path?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  path?: string;

  constructor(message: string, options: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.path = options.path;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function translateKnownMessage(message: string): string {
  return i18n.exists(message) ? i18n.t(message) : message;
}

export function getErrorMessage(error: unknown, fallback = "操作失败，请稍后重试。"): string {
  if (isApiError(error)) {
    if (error.message) return translateKnownMessage(error.message);
    return error.message ? translateKnownMessage(error.message) : i18n.t(fallback);
  }

  if (error instanceof Error) {
    if (error.name === "TypeError" && /fetch|network|failed/i.test(error.message)) {
      return i18n.t("网络连接异常，请检查服务状态后重试。");
    }
    return error.message || i18n.t(fallback);
  }

  if (typeof error === "string" && error.trim()) {
    return translateKnownMessage(error);
  }

  return i18n.t(fallback);
}

export function getErrorTitle(error: unknown): string {
  if (isApiError(error)) {
    if (error.status >= 500) return i18n.t("服务异常");
    if (error.status === 401) return i18n.t("登录状态失效");
    if (error.status === 403) return i18n.t("没有权限");
    if (error.status === 404) return i18n.t("资源不存在");
    return i18n.t("请求失败");
  }

  return i18n.t("操作失败");
}
