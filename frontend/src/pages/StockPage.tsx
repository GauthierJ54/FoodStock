import { useEffect, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { getStock, deleteFoodItem } from "@/api/stockAPI";
import type { FoodItem, CreateFoodItemRequest } from "@/api/stockAPI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FoodForm from "@/components/FoodForm";
import { createFoodItem } from "@/api/stockAPI";
import Navbar from "@/components/Navbar";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function StockPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    if (!token) return;

    getStock(token).then(setItems).catch(console.error);
  }, [token]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [sortByExpired, setSortByExpired] = useState(false);

  const categories = [...new Set(items.map((item) => item.category))];
  const locations = [...new Set(items.map((item) => item.location))];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "all" || item.category === category;

    const matchesLocation =
      location === "all" || item.location === location;

    return matchesSearch && matchesCategory && matchesLocation;
  }).sort((a, b) => {
    if (!sortByExpired) return a.name.localeCompare(b.name);
    return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
  });

  const handleCreate = async (data: CreateFoodItemRequest) => {
    if (!token) return;

    const newItem = await createFoodItem(token, data);
    setItems((prev) => [...prev, newItem]);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    const confirmDelete = confirm("Supprimer cet aliment ?");

    if (!confirmDelete) return;

    try {
      await deleteFoodItem(token, id);

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  function getExpirationStatus(date: string) {
    const today = new Date();
    const expiration = new Date(date);

    const diff = Math.ceil(
      (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff < 0) return "expired";
    if (diff <= 3) return "soon";
    return "ok";
  }

  return (
    <div className="min-h-screen bg-green-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl p-6">
        <h1 className="mb-6 text-3xl font-bold">Mon stock alimentaire</h1>

        <FoodForm onSubmit={handleCreate} />
        <div className="mx-auto mb-6 mt-10 flex items-center gap-4">
          <Input
            placeholder="Rechercher un aliment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-green-300 bg-green-100/50"
          />

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="border-green-300 bg-green-100/50">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="border-green-300 bg-green-100/50">
              <SelectValue placeholder="Emplacement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les emplacements</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Checkbox
            id="sortByExpired"
            checked={sortByExpired}
            className="bg-green-100/50 data-[state=checked]:bg-green-600"
            onCheckedChange={(checked) => setSortByExpired(checked === true)}
          />
          <label htmlFor="sortByExpired" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Date d'expiration
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
              const status = getExpirationStatus(item.expirationDate)

              const diffDays = Math.ceil(
                (new Date(item.expirationDate).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              );
            return (
            <Card key={item.id} className="border-green-100 bg-white shadow-sm hover:shadow-md transition">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-slate-900">{item.name}</CardTitle>
                  <Badge
                    className={
                      status === "expired"
                        ? "bg-red-100 text-red-700"
                        : status === "soon"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }
                  >
                    {status === "expired"
                      ? "Expiré depuis " + Math.abs(diffDays) + "j"
                      : status === "soon"
                      ? "Bientôt expiré dans " + diffDays + "j"
                      : "Bon jusqu'au " + item.expirationDate}
                  </Badge>
                  <Badge variant="secondary">{item.category}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Quantité</span>
                  <span>
                    {item.quantity} {item.unit}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Emplacement</span>
                  <span>{item.location}</span>
                </div>

                {item.notes && (
                  <div className="rounded-md bg-slate-800 p-3 text-slate-300">
                    {item.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          )})}
        </div>
      </main>
    </div>
  );
}