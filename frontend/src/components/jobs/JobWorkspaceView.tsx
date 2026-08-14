import { useState } from "react";

import type { ApplicationStatus, CandidateSummary, JobOpportunity } from "../../types/api";
import { AnimatedPage } from "../AnimatedPage";
import { JobWorkspace } from "./JobWorkspace";
import { OriginalJobSidebar } from "./OriginalJobSidebar";

type Props = {
  job: JobOpportunity;
  resumeVersions: CandidateSummary[];
  favoriting: boolean;
  onBack: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
  onStatusChange: (status: ApplicationStatus) => void;
};

export function JobWorkspaceView(props: Props) {
  const [sourceOpen, setSourceOpen] = useState(false);
  return (
    <>
      <AnimatedPage>
        <JobWorkspace {...props} onOpenSource={() => setSourceOpen(true)} />
      </AnimatedPage>
      <OriginalJobSidebar
        open={sourceOpen}
        job={props.job}
        onClose={() => setSourceOpen(false)}
      />
    </>
  );
}
