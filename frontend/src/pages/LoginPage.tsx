import { useState } from "react";
import type { SubmitEvent } from "react";
import { Apple, Moon, Sun } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { loginApi } from "@/api/authAPI";
import { loginSchema } from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/useTheme";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ username, password });

    if (!result.success) {
      setError(result.error.issues.map((issue) => issue.message).join(", "));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await loginApi(username.trim(), password.trim());
      login(response.accessToken, username.trim());
      navigate("/");
    } catch {
      setError(t("auth.invalidCredentials"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">
        <section className="hidden lg:block">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700 shadow-sm dark:bg-slate-700 dark:text-slate-300">
            <Apple className="h-8 w-8" />
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-slate-950 dark:text-slate-100">
            FoodStock
          </h1>

          <p className="mt-4 max-w-md text-lg text-slate-600 dark:text-slate-400">
            {t("auth.info")}
          </p>

          <div className="mt-8 grid max-w-md gap-3">
            <div className="rounded-2xl border border-green-100 bg-white/70 p-4 shadow-sm dark:bg-slate-700 dark:text-slate-300">
              🥕 {t("auth.card_1")}
            </div>
            <div className="rounded-2xl border border-green-100 bg-white/70 p-4 shadow-sm dark:bg-slate-700 dark:text-slate-300">
              📦 {t("auth.card_2")}
            </div>
            <div className="rounded-2xl border border-green-100 bg-white/70 p-4 shadow-sm dark:bg-slate-700 dark:text-slate-300">
              ⏰ {t("auth.card_3")}
            </div>
          </div>
        </section>

        <Card className="border-green-100 bg-white/90 shadow-xl dark:bg-slate-800 dark:border-slate-600">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-end">
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
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-slate-700 dark:text-slate-300">
              <Apple className="h-7 w-7" />
            </div>

            <CardTitle className="text-2xl">{t("auth.loginTitle")}</CardTitle>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("auth.loginSubtitle")}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder={t("auth.username")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 border-green-100 bg-green-50/50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
              />

              <Input
                type="password"
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-green-100 bg-green-50/50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
              />

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900 dark:text-red-300">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300 disabled:hover:bg-green-300 dark:bg-green-500 dark:hover:bg-green-600 dark:disabled:bg-green-300 dark:disabled:hover:bg-green-300"
              >
                {isLoading ? t("auth.loading") : t("auth.loginButton")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}