import Navbar from "@/components/Navbar";
import { useTranslation } from "react-i18next";


function RecipesPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-green-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <div>
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            {t("recipes.eyebrow")}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {t("recipes.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            {t("recipes.subtitle")}
          </p>
        </div>

        <div className="rounded-md border-2 border-green-500 bg-green-50 p-6 text-center text-lg font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
          {t("recipes.subtitle")}
        </div>
      </main>
    </div>
  );
}

export default RecipesPage;
