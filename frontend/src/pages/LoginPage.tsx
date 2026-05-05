import { useState } from "react";
import type { FormEvent } from "react";
import { Apple } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { loginApi } from "@/api/authAPI";
import { loginSchema } from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ username, password });

    if (!result.success) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await loginApi(username.trim(), password.trim());
      login(response.accessToken, username.trim());
    } catch { 
      setError("Identifiants incorrects.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">
        <section className="hidden lg:block">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700 shadow-sm">
            <Apple className="h-8 w-8" />
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-slate-950">
            FoodStock
          </h1>

          <p className="mt-4 max-w-md text-lg text-slate-600">
            Gérez votre stock alimentaire maison, suivez les dates d’expiration
            et ajoutez vos produits avec un code-barres.
          </p>

          <div className="mt-8 grid max-w-md gap-3">
            <div className="rounded-2xl border border-green-100 bg-white/70 p-4 shadow-sm">
              🥕 Stock clair et organisé
            </div>
            <div className="rounded-2xl border border-green-100 bg-white/70 p-4 shadow-sm">
              📦 Ajout rapide par code-barres
            </div>
            <div className="rounded-2xl border border-green-100 bg-white/70 p-4 shadow-sm">
              ⏰ Suivi des dates d’expiration
            </div>
          </div>
        </section>

        <Card className="border-green-100 bg-white/90 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <Apple className="h-7 w-7" />
            </div>

            <CardTitle className="text-2xl">Connexion</CardTitle>

            <p className="text-sm text-slate-500">
              Connecte-toi pour accéder à ton stock.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 border-green-100 bg-green-50/50"
              />

              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-green-100 bg-green-50/50"
              />

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full bg-green-600 text-white hover:bg-green-700"
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}