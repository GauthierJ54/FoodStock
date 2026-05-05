import LoginPage from "@/pages/LoginPage";
import StockPage from "@/pages/StockPage";
import { useAuth } from "@/auth/useAuth";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      {isAuthenticated ? <StockPage /> : <LoginPage />}
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;