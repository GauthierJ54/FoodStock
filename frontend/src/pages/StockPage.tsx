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
import {
  ArrowDownAZ,
  CalendarClock,
  Filter,
  MapPin,
  Package,
  PackageCheck,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Tags,
  Trash2,
  Warehouse,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [expirationFilter, setExpirationFilter] = useState("all");
  const [stockLevelFilter, setStockLevelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFoodFormOpen, setIsFoodFormOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];
  const locations = [...new Set(items.map((item) => item.location).filter(Boolean))];
  const activeFilterCount = [
    search.trim(),
    category !== "all",
    location !== "all",
    expirationFilter !== "all",
    stockLevelFilter !== "all",
    sortBy !== "name",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setLocation("all");
    setExpirationFilter("all");
    setStockLevelFilter("all");
    setSortBy("name");
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "all" || item.category === category;

    const matchesLocation =
      location === "all" || item.location === location;

    const expirationStatus = getExpirationStatus(item.expirationDate);
    const matchesExpiration =
      expirationFilter === "all" || expirationStatus === expirationFilter;

    const isLowStock = item.quantity <= item.minimumQuantity;
    const matchesStockLevel =
      stockLevelFilter === "all" ||
      (stockLevelFilter === "low" && isLowStock) ||
      (stockLevelFilter === "ok" && !isLowStock);

    return matchesSearch && matchesCategory && matchesLocation && matchesExpiration && matchesStockLevel;
  }).sort((a, b) => {
    if (sortBy === "expiration") {
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    }

    if (sortBy === "quantity") {
      return a.quantity - b.quantity;
    }

    return a.name.localeCompare(b.name);
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

  function FiltersPanel() {
    return (
      <aside className="flex h-full w-80 max-w-[calc(100vw-2rem)] flex-col border-r border-green-100 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-green-100 p-4 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
              {t("stock.filters")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("stock.resultsCount", { count: filteredItems.length, total: items.length })}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsFiltersOpen(false)}
            className="hover:bg-green-100 dark:hover:bg-slate-800"
            aria-label={t("stock.closeFilters")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Search className="h-4 w-4 text-green-700 dark:text-green-400" />
              {t("stock.searchLabel")}
            </label>
            <Input
              placeholder={t("stock.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-green-200 bg-green-50/60 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Tags className="h-4 w-4 text-green-700 dark:text-green-400" />
              {t("stock.category")}
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-green-200 bg-green-50/60 dark:border-slate-700 dark:bg-slate-800">
                <SelectValue placeholder={t("stock.category")} />
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
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <MapPin className="h-4 w-4 text-green-700 dark:text-green-400" />
              {t("stock.location")}
            </label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="border-green-200 bg-green-50/60 dark:border-slate-700 dark:bg-slate-800">
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
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <CalendarClock className="h-4 w-4 text-green-700 dark:text-green-400" />
              {t("stock.expirationStatus")}
            </label>
            <Select value={expirationFilter} onValueChange={setExpirationFilter}>
              <SelectTrigger className="border-green-200 bg-green-50/60 dark:border-slate-700 dark:bg-slate-800">
                <SelectValue placeholder={t("stock.expirationStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("stock.allExpirationStatuses")}</SelectItem>
                <SelectItem value="expired">{t("expiration.expired")}</SelectItem>
                <SelectItem value="soon">{t("expiration.soon")}</SelectItem>
                <SelectItem value="ok">{t("expiration.ok")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <PackageCheck className="h-4 w-4 text-green-700 dark:text-green-400" />
              {t("stock.stockLevel")}
            </label>
            <Select value={stockLevelFilter} onValueChange={setStockLevelFilter}>
              <SelectTrigger className="border-green-200 bg-green-50/60 dark:border-slate-700 dark:bg-slate-800">
                <SelectValue placeholder={t("stock.stockLevel")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("stock.allStockLevels")}</SelectItem>
                <SelectItem value="low">{t("stock.lowStock")}</SelectItem>
                <SelectItem value="ok">{t("stock.stockOk")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <ArrowDownAZ className="h-4 w-4 text-green-700 dark:text-green-400" />
              {t("stock.sortBy")}
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-green-200 bg-green-50/60 dark:border-slate-700 dark:bg-slate-800">
                <SelectValue placeholder={t("stock.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t("stock.sortName")}</SelectItem>
                <SelectItem value="expiration">{t("stock.sortExpiration")}</SelectItem>
                <SelectItem value="quantity">{t("stock.sortQuantity")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t border-green-100 p-4 dark:border-slate-700">
          <Button
            type="button"
            variant="outline"
            onClick={resetFilters}
            className="w-full border-green-200 bg-white hover:bg-green-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            disabled={activeFilterCount === 0}
          >
            <RotateCcw className="h-4 w-4" />
            {t("stock.resetFilters")}
          </Button>
        </div>
      </aside>
    );
  }

  function getExpirationLabel(status: string, diffDays: number) {
    if (status === "expired") {
      return t("expiration.expiredSince", { count: -diffDays });
    }

    if (status === "soon") {
      if (diffDays === 0) {
        return t("expiration.expiresToday");
      }
      return t("expiration.expiresIn", { count: diffDays });
    }

    return t("expiration.ok");
  }

  function getExpirationBadgeClass(status: string) {
    if (status === "expired") {
      return "bg-red-100 text-red-700 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-800";
    }

    if (status === "soon") {
      return "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800";
    }

    return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800";
  }

  function FoodCard({ item }: { item: FoodItem }) {
    const status = getExpirationStatus(item.expirationDate);
    const diffDays = Math.ceil(
      (new Date(item.expirationDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
    );
    const isLowStock = item.quantity <= item.minimumQuantity;

    return (
      <Card
        onClick={() => { setSelectedItem(item); setIsEditMode(false); }}
        className="group cursor-pointer overflow-hidden border-green-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
      >
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <CardTitle className="truncate text-lg font-semibold text-slate-950 dark:text-slate-100">
                {item.name}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-green-50 text-green-800 dark:bg-slate-700 dark:text-slate-200">
                  <Tags className="mr-1 h-3 w-3" />
                  {item.category}
                </Badge>
                {isLowStock && (
                  <Badge className="bg-orange-100 text-orange-800 ring-1 ring-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-800">
                    {t("stock.lowStock")}
                  </Badge>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
              className="text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300"
              aria-label={t("stock.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <Badge className={getExpirationBadgeClass(status)}>
            <CalendarClock className="mr-1 h-3.5 w-3.5" />
            {getExpirationLabel(status, diffDays)}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <div className="rounded-xl border border-green-100 bg-green-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                  <Package className="h-3.5 w-3.5" />
                  {t("stock.quantity")}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-slate-100">
                  {item.quantity}
                  <span className="ml-1 text-base font-semibold text-slate-500 dark:text-slate-400">
                    {item.unit}
                  </span>
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("stock.minimumShort")}
                </p>
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  {item.minimumQuantity}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Warehouse className="h-3.5 w-3.5" />
                {t("stock.location")}
              </p>
              <p className="mt-1 truncate font-medium text-slate-900 dark:text-slate-100">
                {item.location}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <CalendarClock className="h-3.5 w-3.5" />
                {t("stock.expirationDate")}
              </p>
              <p className="mt-1 truncate font-medium text-slate-900 dark:text-slate-100">
                {new Date(item.expirationDate).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>

          {item.notes && (
            <p className="line-clamp-2 rounded-lg bg-slate-50 p-3 text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
              {item.notes}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="min-h-screen bg-green-50 text-slate-900 dark:bg-slate-900 dark:text-slate-300">
      <Navbar />

      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {t("stock.eyebrow")}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              {t("stock.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              {t("stock.subtitle")}
            </p>
          </div>
        </div>

        <Collapsible
          open={isFoodFormOpen}
          onOpenChange={setIsFoodFormOpen}
          className="mb-6"
        >
          <CollapsibleTrigger asChild>
            <Button className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
              <Plus className="mr-2 h-4 w-4" />
              {isFoodFormOpen ? t("food.close") : t("food.open")}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <FoodForm
              onSubmit={async (data) => {
                await handleCreate(data);
                setIsFoodFormOpen(false);
              }} items={items} />
          </CollapsibleContent>
        </Collapsible>

        <div className="mb-6 flex flex-wraps gap-4 sm:flex-row">
          <Button
            type="button"
            onClick={() => setIsFiltersOpen(true)}
            className="w-full bg-white text-slate-900 shadow-sm hover:bg-green-100 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:w-auto"
          >
            <Filter className="h-4 w-4 text-green-700 dark:text-green-400" />
            {t("stock.openFilters")}
            {activeFilterCount > 0 && (
              <Badge className="ml-1 bg-green-700 text-white dark:bg-green-500">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t("stock.resultsCount", { count: filteredItems.length, total: items.length })}
          </p>
        </div>
        {activeFilterCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {search.trim() && <Badge variant="secondary">{t("stock.searchLabel")}: {search.trim()}</Badge>}
            {category !== "all" && <Badge variant="secondary">{t("stock.category")}: {category}</Badge>}
            {location !== "all" && <Badge variant="secondary">{t("stock.location")}: {location}</Badge>}
            {expirationFilter !== "all" && <Badge variant="secondary">{t("stock.expirationStatus")}: {t(`stock.expirationFilter.${expirationFilter}`)}</Badge>}
            {stockLevelFilter !== "all" && <Badge variant="secondary">{t("stock.stockLevel")}: {t(`stock.stockFilter.${stockLevelFilter}`)}</Badge>}
            {sortBy !== "name" && <Badge variant="secondary">{t("stock.sortBy")}: {t(`stock.sort.${sortBy}`)}</Badge>}
            <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-3.5 w-3.5" />
              {t("stock.resetFilters")}
            </Button>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </main>

      <div
        className={`fixed inset-0 z-50 transition ${isFiltersOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!isFiltersOpen}
      >
        <div
          className={`absolute inset-0 bg-slate-950/40 transition-opacity ${isFiltersOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsFiltersOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 transition-transform duration-300 ease-out ${isFiltersOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <FiltersPanel />
        </div>
      </div>

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
                  <DialogTitle className="text-2xl text-slate-900 dark:text-slate-300">
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
                <div className="space-y-4 text-sm dark:text-slate-300">
                  <div className="grid grid-cols-2 gap-3 dark:text-slate-600">
                    <Detail label={t("stock.category")} value={selectedItem.category} />
                    <Detail label={t("stock.quantity")} value={`${selectedItem.quantity} ${selectedItem.unit}`} />
                    <Detail label={t("stock.location")} value={selectedItem.location} />
                    <Detail label={t("stock.expirationDate")} value={selectedItem.expirationDate} />
                    <Detail label={t("stock.minimumQuantity")} value={selectedItem.minimumQuantity.toString()} />
                    <Detail label={t("stock.createdAt")} value={new Date(selectedItem.createdAt).toLocaleString()} />
                    <Detail label={t("stock.updatedAt")} value={new Date(selectedItem.updatedAt).toLocaleString()} />
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
                  TODO EDITION
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
