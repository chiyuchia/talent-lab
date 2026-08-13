import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "../components/AppShell";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { RouteLoadingBoundary } from "../components/RouteLoadingBoundary";

const CandidateDetailPage = lazy(() =>
  import("../pages/CandidateDetailPage").then((module) => ({
    default: module.CandidateDetailPage,
  })),
);
const CandidatesPage = lazy(() =>
  import("../pages/CandidatesPage").then((module) => ({
    default: module.CandidatesPage,
  })),
);
const DashboardPage = lazy(() =>
  import("../pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const JobsPage = lazy(() =>
  import("../pages/JobsPage").then((module) => ({
    default: module.JobsPage,
  })),
);
const LoginPage = lazy(() =>
  import("../pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const UploadPage = lazy(() =>
  import("../pages/UploadPage").then((module) => ({
    default: module.UploadPage,
  })),
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <RouteLoadingBoundary fullScreen>
        <LoginPage />
      </RouteLoadingBoundary>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: (
              <RouteLoadingBoundary>
                <DashboardPage />
              </RouteLoadingBoundary>
            ),
          },
          {
            path: "upload",
            element: (
              <RouteLoadingBoundary>
                <UploadPage />
              </RouteLoadingBoundary>
            ),
          },
          {
            path: "candidates",
            element: (
              <RouteLoadingBoundary>
                <CandidatesPage />
              </RouteLoadingBoundary>
            ),
            handle: { fullWidth: true },
          },
          {
            path: "candidates/:candidateId",
            element: (
              <RouteLoadingBoundary>
                <CandidateDetailPage />
              </RouteLoadingBoundary>
            ),
            handle: { fullWidth: true },
          },
          {
            path: "jobs",
            element: (
              <RouteLoadingBoundary>
                <JobsPage />
              </RouteLoadingBoundary>
            ),
            handle: { fullWidth: true },
          },
        ],
      },
    ],
  },
]);
