import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { enGB, fr } from "react-day-picker/locale"
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { FoodItem, CreateFoodItemRequest } from "@/api/stockAPI";
import { getProductByBarcode } from "@/api/OpenFoodsFactsAPI";
import BarcodeScanner from "@/components/BarcodeScanner";
import { useTranslation } from "react-i18next";

type FoodFormProps = {
  onSubmit: (data: CreateFoodItemRequest) => Promise<void>;
  items: FoodItem[];
};

export default function FoodForm({ onSubmit, items }: FoodFormProps) {
  const [name, setName] = useState("");
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [location, setLocation] = useState("");
  const [minimumQuantity, setMinimumQuantity] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;
    if (!category.trim()) return;
    if (!expirationDate) return;
    if (!location.trim()) return;

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        category: category.trim(),
        quantity: quantity || 1,
        unit: unit.trim(),
        expirationDate,
        location: location.trim(),
        minimumQuantity: minimumQuantity || 0,
        notes: notes.trim() || undefined,
      });

      setName("");
      setCategory("");
      setQuantity(undefined);
      setUnit("");
      setExpirationDate("");
      setLocation("");
      setMinimumQuantity(undefined);
      setNotes("");
      setBarcode("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBarcodeSearch = async () => {
    if (!barcode.trim()) return;

    setIsSearchingBarcode(true);

    try {
      const result = await getProductByBarcode(barcode.trim());

      if (result.status !== 1 || !result.product) {
        alert(t("food.notFound"));
        return;
      }

      const product = result.product;

      setName(product.product_name_fr || product.product_name || "");
      setCategory(product.categories?.split(",")[0]?.trim() || "");
      setNotes(product.brands ? `Marque: ${product.brands}` : "");
    } catch (error) {
      console.error(error);
      alert(t("food.searchError"));
    } finally {
      setIsSearchingBarcode(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-2xl border border-green-100 bg-white p-4 shadow-sm dark:bg-slate-700 dark:border-slate-600"
    >
      <div className="flex gap-2 md:col-span-2 lg:col-span-4 border-b border-green-100 pb-4 dark:border-slate-600">
        <Input
          placeholder={t("food.barcode")}
          value={barcode}
          className="border-green-100 bg-green-50/50 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300"
          onChange={(e) => setBarcode(e.target.value)}
        />

        <BarcodeScanner
          onDetected={(code) => {
            setBarcode(code);
          }}
        />

        <Button
          type="button"
          onClick={handleBarcodeSearch}
          className="lg:col-span-4 bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          disabled={isSearchingBarcode}
        >
          {isSearchingBarcode ? t("food.searching") : t("food.search")}
        </Button>
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-1 lg:grid-cols-4">

        <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-3">
          <Input
            placeholder={t("food.name")}
            value={name}
            className="border-green-100 bg-green-50/50 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300"
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder={t("food.category")}
            value={category}
            className="border-green-100 bg-green-50/50 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300"
            onChange={(e) => setCategory(e.target.value)}
          />

          <Input
            type="number"
            placeholder={t("food.quantity")}
            value={quantity}
            className="border-green-100 bg-green-50/50 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300"
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="border-green-100 bg-green-50/50 w-full dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300">
              <SelectValue placeholder={t("food.unit")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="g">g</SelectItem>
              <SelectItem value="l">l</SelectItem>
              <SelectItem value="ml">ml</SelectItem>
            </SelectContent>
          </Select>

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="border-green-100 bg-green-50/50 w-full dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300">
              <SelectValue placeholder={t("food.location")} />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => item.location)
                .filter((loc, index, self) => loc && self.indexOf(loc) === index)
                .map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              <SelectItem key="custom" value="custom">
                {t("food.customLocation")}
              </SelectItem>
            </SelectContent>
          </Select>

          {location === "custom" && (
            <Input
              placeholder={t("food.customLocation")}  
              className="border-green-100 bg-green-50/50 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300 dark:bg-slate-600"
              onChange={(e) => setLocation(e.target.value)}
            />
          )}

          <Input
            type="number"
            placeholder={t("food.minimumQuantity")}
            value={minimumQuantity}
            className="border-green-100 bg-green-50/50 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300 dark:bg-slate-600"
            onChange={(e) => setMinimumQuantity(Number(e.target.value))}
          />

          <Input
            placeholder={t("food.notes")}
            value={notes}
            className="border-green-100 bg-green-50/50 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300 dark:bg-slate-600"
            onChange={(e) => setNotes(e.target.value)}
          />

        </div>

        <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1 border-green-100 bg-green-50/50 rounded-lg p-4 dark:border-slate-500 dark:bg-slate-600">
          <Label htmlFor="expiration-date" className="text-sm font-medium text-green-700 dark:text-slate-300">
            {t("food.expirationDate")}
          </Label>
          <Calendar
            mode="single"
            selected={expirationDate ? new Date(expirationDate) : undefined}
            onSelect={(date) => setExpirationDate(date ? date.toISOString().split("T")[0] : "")}
            locale={i18n.language === "fr" ? fr : enGB}
            className="border-green-100 bg-green-50/50 rounded-lg w-full dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300"
          />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting} className="mt-4 bg-green-600 text-white hover:bg-green-700 w-full dark:bg-green-500 dark:hover:bg-green-600">
        {isSubmitting ? t("food.adding") : t("food.addFood")}
      </Button>
    </form>
  );
}