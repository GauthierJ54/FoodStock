import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import ProtectedRoute from "@/components/ProtectedRoute";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const StockPage = lazy(() => import("@/pages/StockPage"));
const DashboardPage = lazy(() => import("@/pages/DashBoardPage"));
const RecipesPage = lazy(() => import("@/pages/RecipesPages"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function App() {
  const { t } = useTranslation();

  return (
    <>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center border-2 border-dashed border-green-500 bg-green-50 text-lg font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
            {t("app.loading")}
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/stock"
            element={
              <ProtectedRoute>
                <StockPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recipes"
            element={
              <ProtectedRoute>
                <RecipesPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster richColors position="top-center" />

      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;