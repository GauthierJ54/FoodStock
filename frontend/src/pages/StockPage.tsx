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
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

export default function StockPage() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [items, setItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    if (!token) return;

    getStock(token).then(setItems).catch(console.error);
  }, [token]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [sortByExpired, setSortByExpired] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

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

  function Detail({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-xl border border-green-100 bg-green-50 p-3 dark:bg-slate-800 dark:border-slate-700">
        <p className="text-xs font-medium uppercase text-slate-500">
          {label}
        </p>
        <p className="mt-1 font-medium text-slate-900">
          {value}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 text-slate-900 dark:bg-slate-900 dark:text-slate-300">
      <Navbar />

      <main className="mx-auto max-w-7xl p-6">
        <h1 className="mb-6 text-3xl font-bold">{t("stock.title")}</h1>

        <FoodForm onSubmit={handleCreate} items={items} />
        <div className="mx-auto mb-6 mt-10 flex items-center gap-4">
          <Input
            placeholder={t("stock.search")}   
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-green-300 bg-green-100/50 dark:bg-slate-700 dark:border-slate-600"
          />

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="border-green-300 bg-green-100/50 dark:bg-slate-700 dark:border-slate-600">
              <SelectValue placeholder={t("stock.category")}  />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("stock.allCategories")}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="border-green-300 bg-green-100/50 dark:bg-slate-700 dark:border-slate-600">
              <SelectValue placeholder={t("stock.location")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("stock.allLocations")}</SelectItem>
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
            className="bg-green-100/50 data-[state=checked]:bg-green-600 dark:bg-slate-700 dark:data-[state=checked]:bg-slate-300"
            onCheckedChange={(checked) => setSortByExpired(checked === true)}
          />
          <label htmlFor="sortByExpired" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t("stock.sortByExpired")}
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
              <Card key={item.id} onClick={() => { setSelectedItem(item); setIsEditMode(false); }} className="cursor-pointer border-green-100 bg-white shadow-sm transition hover:shadow-md dark:bg-slate-800 dark:border-slate-600 dark:hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-slate-900">{item.name}</CardTitle>
                    <Badge
                      className={
                        status === "expired"
                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          : status === "soon"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      }
                    >
                      {status === "expired"
                        ? t("expiration.expiredSince", { count: -diffDays })
                        : status === "soon"
                          ? t("expiration.expiresIn", { count: diffDays })
                          : t("expiration.ok")}
                    </Badge>
                    <Badge variant="secondary">{item.category}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-slate-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("stock.quantity")}</span>
                    <span>
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("stock.location")}</span>
                    <span>{item.location}</span>
                  </div>

                  {item.notes && (
                    <div className="rounded-md bg-slate-800 p-3 text-slate-300 dark:bg-green-50 dark:text-slate-700">
                      {item.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null);
            setIsEditMode(false);
          }
        }}
      >
        <DialogContent className="border-green-100 bg-white sm:max-w-xl dark:bg-slate-800 dark:border-slate-600">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <DialogTitle className="text-2xl text-slate-900">
                    {selectedItem.name}
                  </DialogTitle>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditMode((prev) => !prev)}
                    className="hover:bg-green-100 dark:hover:bg-slate-600"
                  >
                    <Pencil className="h-5 w-5 text-green-700" />
                  </Button>
                </div>
              </DialogHeader>

              {!isEditMode ? (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <Detail label={t("stock.category")} value={selectedItem.category} />
                    <Detail label={t("stock.quantity")} value={`${selectedItem.quantity} ${selectedItem.unit}`} />
                    <Detail label={t("stock.location")} value={selectedItem.location} />
                    <Detail label={t("stock.expirationDate")} value={selectedItem.expirationDate} />
                    <Detail label={t("stock.minimumQuantity")} value={selectedItem.minimumQuantity.toString()} />
                    <Detail label={t("stock.createdDate")} value={new Date(selectedItem.createdAt).toLocaleString()} />
                    <Detail label={t("stock.updatedDate")} value={new Date(selectedItem.updatedAt).toLocaleString()} />
                  </div>

                  {selectedItem.notes && (
                    <div className="rounded-xl border border-green-100 bg-green-50 p-4 dark:bg-slate-700 dark:border-slate-600">
                      <p className="mb-1 text-xs font-medium uppercase text-slate-500">
                        {t("stock.notes")}
                      </p>
                      <p className="text-slate-700">{selectedItem.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300">
                  Mode édition à brancher ici.
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}