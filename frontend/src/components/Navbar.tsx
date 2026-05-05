import { Apple, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/useTheme";

export default function Navbar() {

  const { logout, username } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

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

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-green-100 dark:hover:bg-slate-700"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

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