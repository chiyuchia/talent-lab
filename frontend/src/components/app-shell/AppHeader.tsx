import { LogOut, Menu, Moon, Sun } from "lucide-react";

import { Button } from "../ui/button";

interface AppHeaderProps {
  pageTitle: string;
  theme: string;
  toggleTheme: () => void;
  onOpenSidebar: () => void;
  onLogout: () => void;
}

export function AppHeader({
  pageTitle,
  theme,
  toggleTheme,
  onOpenSidebar,
  onLogout,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenSidebar}
          className="lg:hidden"
          aria-label="展开导航"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <h1 className="text-base font-semibold">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label="切换主题"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onLogout}
          aria-label="退出登录"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
