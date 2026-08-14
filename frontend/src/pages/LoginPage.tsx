import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { authApi } from "../lib/api";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { getErrorMessage } from "../lib/errors";

export function LoginPage() {
  const { t } = useTranslation();
  const [accessKey, setAccessKey] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "session"], data);
      navigate(from, { replace: true });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate(accessKey);
  }

  if (loginMutation.data?.authenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <main className="relative grid min-h-dvh bg-background text-foreground lg:grid-cols-2">
      <LanguageSwitcher className="absolute right-4 top-4 z-10 lg:right-6 lg:top-6" />
      {/* Brand panel: the one place the primary color gets full stage */}
      <div className="brand-panel hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <p className="text-sm font-medium opacity-90">Talent Lab</p>
        <div className="animate-login-hero-enter">
          <p className="text-5xl font-semibold leading-tight">Talent Lab</p>
          <p className="mt-4 max-w-sm text-lg opacity-90">
            {t("智能求职管理平台")}
          </p>
        </div>
        <p className="text-sm opacity-90">{t("上传 PDF 简历，AI 结构化提取，岗位匹配评分")}</p>
      </div>

      <div className="grid place-items-center px-4 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm animate-login-form-enter">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold">Talent Lab</h1>
          <p className="mt-1 text-sm text-muted-foreground lg:hidden">{t("智能求职管理平台")}</p>
          <label className="mt-8 block text-sm font-medium" htmlFor="access-key">
            {t("访问密钥")}
          </label>
          <Input
            id="access-key"
            value={accessKey}
            onChange={(event) => setAccessKey(event.target.value)}
            type="password"
            autoComplete="current-password"
            className="mt-2 h-11"
          />
          {loginMutation.isError ? <p className="mt-3 text-sm text-destructive animate-fade-in">{getErrorMessage(loginMutation.error)}</p> : null}
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-6 h-11 w-full"
          >
            {t(loginMutation.isPending ? "验证中" : "进入工作台")}
          </Button>
        </form>
      </div>
    </main>
  );
}
