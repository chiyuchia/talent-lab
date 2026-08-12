import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { getErrorMessage } from "../lib/errors";
import i18n from "../i18n";
import { useUiStore } from "../lib/ui-store";
import { Button } from "./ui/button";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    useUiStore.getState().pushError({
      title: i18n.t("页面运行异常"),
      message: getErrorMessage(error, "页面渲染失败，请刷新后重试。"),
    });
    console.error(error, errorInfo);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
        <section className="w-full max-w-lg rounded-lg border border-border bg-card p-6 text-center shadow-sm animate-scale-in">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h1 className="mt-5 text-xl font-semibold">{i18n.t("页面遇到问题")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {getErrorMessage(this.state.error, "页面渲染失败，请刷新后重试。")}
          </p>
          <Button onClick={this.reset} className="mt-6">
            <RotateCcw className="h-4 w-4" />
            {i18n.t("重试")}
          </Button>
        </section>
      </main>
    );
  }
}
