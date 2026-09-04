import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AnimatedPage } from "../components/AnimatedPage";
import { ResumeLibrary } from "../components/resumes/ResumeLibrary";
import { Button } from "../components/ui/button";

export function ResumesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  function openAddResume() {
    navigate("/resumes/new");
  }

  return (
    <AnimatedPage>
      <section className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t("简历")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("上传、解析与管理你的简历版本")}</p>
          </div>
          <Button onClick={openAddResume}>
            <Plus className="h-4 w-4" />
            {t("添加简历")}
          </Button>
        </div>
        <ResumeLibrary onUpload={openAddResume} />
      </section>
    </AnimatedPage>
  );
}
