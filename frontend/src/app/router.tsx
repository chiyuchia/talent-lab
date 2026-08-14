import { lazy } from "react";
import { createBrowserRouter, Navigate, redirect } from "react-router-dom";

import { AppShell } from "../components/AppShell";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { RouteLoadingBoundary } from "../components/RouteLoadingBoundary";

const CandidateDetailPage = lazy(() =>
  import("../pages/CandidateDetailPage").then((module) => ({
    default: module.CandidateDetailPage,
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
const ResumesPage = lazy(() =>
  import("../pages/ResumesPage").then((module) => ({
    default: module.ResumesPage,
  })),
);
const ResumeAddPage = lazy(() =>
  import("../pages/ResumeAddPage").then((module) => ({
    default: module.ResumeAddPage,
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
            path: "resumes",
            element: (
              <RouteLoadingBoundary>
                <ResumesPage />
              </RouteLoadingBoundary>
            ),
            handle: { fullWidth: true },
          },
          {
            path: "resumes/new",
            element: (
              <RouteLoadingBoundary>
                <ResumeAddPage />
              </RouteLoadingBoundary>
            ),
            handle: { fullWidth: true },
          },
          {
            path: "resumes/:candidateId",
            element: (
              <RouteLoadingBoundary>
                <CandidateDetailPage />
              </RouteLoadingBoundary>
            ),
            handle: { fullWidth: true },
          },
          {
            path: "upload",
            element: <Navigate to="/resumes/new" replace />,
          },
          {
            path: "candidates",
            element: <Navigate to="/resumes" replace />,
          },
          {
            path: "candidates/:candidateId",
            loader: ({ params }) => redirect(`/resumes/${params.candidateId}`),
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
