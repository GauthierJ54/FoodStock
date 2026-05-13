import { X, Search, Tags, MapPin, CalendarClock, PackageCheck, ArrowDownAZ, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTranslation } from "react-i18next";
import type { FoodItem } from "@/api/generated/foodstockapi/stockAPI";

type FiltersPanelProps = {
    search: string;
    setSearch: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    location: string;
    setLocation: (value: string) => void;
    categories: string[];
    locations: string[];
    items: FoodItem[]; // Replace with your actual item type
    filteredItems: FoodItem[]; // Replace with your actual item type
    expirationFilter: string;
    setExpirationFilter: (value: string) => void;
    stockLevelFilter: string;
    setStockLevelFilter: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    resetFilters: () => void;
    activeFilterCount: number;
    setIsFiltersOpen: (value: boolean) => void;
};

export default function FiltersPanel({
    search,
    setSearch,
    category,
    setCategory,
    location,
    setLocation,
    categories,
    locations,
    items,
    filteredItems,
    expirationFilter,
    setExpirationFilter,
    stockLevelFilter,
    setStockLevelFilter,
    sortBy,
    setSortBy,
    resetFilters,
    activeFilterCount,
    setIsFiltersOpen
}: FiltersPanelProps) {
    const { t } = useTranslation();

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
                                <SelectItem key={category} value={category || ""}>
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
                                <SelectItem key={location} value={location || ""}>
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
                            <SelectItem value="name">{t("stock.sortName")}</SelectItem>frontend/src/components/FiltersPanel.tsx
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