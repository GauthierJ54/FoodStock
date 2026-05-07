import { Apple, LogOut, Moon } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/useTheme";
import { Switch } from "@/components/ui/switch";
import { NavLink } from "react-router-dom"

export default function Navbar() {

  const { logout, username } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
      : "rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"

  return (
    <header className="sticky top-0 z-50 border-b border-green-100 bg-white/80 backdrop-blur dark:bg-slate-900/80 dark:border-slate-700">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-slate-700 dark:text-slate-300">
            <Apple className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("app.name")}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("app.subtitle")}
            </p>
          </div>

          <NavLink to="/" className={linkClass}>
            {t("dashboard.eyebrow")}
          </NavLink>

          <NavLink to="/stock" className={linkClass}>
            {t("stock.eyebrow")}
          </NavLink>

          <NavLink to="/recipes" className={linkClass}>
            {t("recipes.eyebrow")}
          </NavLink>
        </div>

        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback className="bg-green-100 text-green-700 dark:bg-slate-700 dark:text-slate-300">
              {username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr")}
            className="hover:bg-green-100 dark:hover:bg-slate-700"
          >
            {i18n.language === "fr" ? "EN" : "FR"}
          </Button>

          <div className="flex items-center gap-2">
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
            />
            <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="hover:bg-green-100 dark:hover:bg-slate-700"
          >
            <LogOut className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}