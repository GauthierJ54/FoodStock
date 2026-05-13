import { useState } from "react";
import { Apple, LogOut, Menu, Moon, X } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/useTheme";
import { Switch } from "@/components/ui/switch";
import { NavLink } from "react-router-dom";
import { z } from "zod";

export default function Navbar() {
  const { logout, username } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-950"
      : "rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800";

  const changeLanguage = () => {
    i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
    z.config(i18n.language === "fr" ? z.locales.en() : z.locales.fr());
  };

  return (
    <header className="sticky top-0 z-50 border-b border-green-100 bg-white/80 backdrop-blur dark:bg-slate-900/80 dark:border-slate-700">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-slate-700 dark:text-slate-300">
            <Apple className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("app.name")}
            </h1>
            <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
              {t("app.subtitle")}
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={linkClass}>
            {t("dashboard.eyebrow")}
          </NavLink>

          <NavLink to="/stock" className={linkClass}>
            {t("stock.eyebrow")}
          </NavLink>

          <NavLink to="/recipes" className={linkClass}>
            {t("recipes.eyebrow")}
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Avatar>
            <AvatarFallback className="bg-green-100 text-green-700 dark:bg-slate-700 dark:text-slate-300">
              {username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <Button
            variant="ghost"
            size="icon"
            onClick={changeLanguage}
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

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-green-100 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:hidden">
          <nav className="grid gap-2">
            <NavLink to="/" className={linkClass} onClick={() => setIsMenuOpen(false)}>
              {t("dashboard.eyebrow")}
            </NavLink>
            <NavLink to="/stock" className={linkClass} onClick={() => setIsMenuOpen(false)}>
              {t("stock.eyebrow")}
            </NavLink>
            <NavLink to="/recipes" className={linkClass} onClick={() => setIsMenuOpen(false)}>
              {t("recipes.eyebrow")}
            </NavLink>
          </nav>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-green-50 p-3 dark:bg-slate-800">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-green-100 text-green-700 dark:bg-slate-700 dark:text-slate-300">
                  {username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                {username}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={changeLanguage}>
                {i18n.language === "fr" ? "EN" : "FR"}
              </Button>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
