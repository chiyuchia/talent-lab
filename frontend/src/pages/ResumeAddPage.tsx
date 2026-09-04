import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AnimatedPage } from "../components/AnimatedPage";
import { ResumeUploadPanel } from "../components/resumes/ResumeUploadPanel";
import { Button } from "../components/ui/button";

export function ResumeAddPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <AnimatedPage>
      <section className="space-y-8">
        <Button variant="ghost" className="-ml-3" onClick={() => navigate("/resumes")}>
          <ArrowLeft className="h-4 w-4" />
          {t("返回简历列表")}
        </Button>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t("添加简历")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("添加 PDF 简历并查看实时解析进度")}</p>
        </div>
        <ResumeUploadPanel />
      </section>
    </AnimatedPage>
  );
}
