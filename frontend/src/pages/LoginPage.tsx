import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { authApi } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export function LoginPage() {
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
    <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm animate-scale-in">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground animate-fade-in-up animation-delay-50">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-semibold animate-fade-in-up animation-delay-100">talent-lab</h1>
        <label className="mt-6 block text-sm font-medium animate-fade-in-up animation-delay-150" htmlFor="access-key">
          访问密钥
        </label>
        <Input
          id="access-key"
          value={accessKey}
          onChange={(event) => setAccessKey(event.target.value)}
          type="password"
          autoComplete="current-password"
          className="mt-2 h-11 animate-fade-in-up animation-delay-200"
        />
        {loginMutation.isError ? <p className="mt-3 text-sm text-destructive animate-fade-in">{loginMutation.error.message}</p> : null}
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="mt-6 h-11 w-full animate-fade-in-up animation-delay-250"
        >
          {loginMutation.isPending ? "验证中" : "进入工作台"}
        </Button>
      </form>
    </main>
  );
}
