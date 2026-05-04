import LoginPage from "@/pages/LoginPage";
import StockPage from "@/pages/StockPage";
import { useAuth } from "@/auth/useAuth";

function App() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <StockPage /> : <LoginPage />;
}

export default App;