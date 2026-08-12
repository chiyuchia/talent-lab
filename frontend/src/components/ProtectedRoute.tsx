import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { authApi } from "../lib/api";

export function ProtectedRoute() {
  const { t } = useTranslation();
  const location = useLocation();
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: authApi.session,
  });

  if (sessionQuery.isLoading) {
    return <div className="grid min-h-screen place-items-center bg-background text-foreground">{t("加载中")}</div>;
  }

  if (!sessionQuery.data?.authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
