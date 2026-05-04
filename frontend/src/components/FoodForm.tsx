import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateFoodItemRequest } from "@/api/stockAPI";
import { getProductByBarcode } from "@/api/OpenFoodsFactsAPI";
import BarcodeScanner from "@/components/BarcodeScanner";

type FoodFormProps = {
  onSubmit: (data: CreateFoodItemRequest) => Promise<void>;
};

export default function FoodForm({ onSubmit }: FoodFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("grammes");
  const [expirationDate, setExpirationDate] = useState("");
  const [location, setLocation] = useState("frigo");
  const [minimumQuantity, setMinimumQuantity] = useState(0);
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
        quantity,
        unit: unit.trim(),
        expirationDate,
        location: location.trim(),
        minimumQuantity,
        notes: notes.trim() || undefined,
      });

      setName("");
      setCategory("");
      setQuantity(1);
      setUnit("grammes");
      setExpirationDate("");
      setLocation("frigo");
      setMinimumQuantity(0);
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
        alert("Produit introuvable");
        return;
        }

        const product = result.product;

        setName(product.product_name_fr || product.product_name || "");
        setCategory(product.categories?.split(",")[0]?.trim() || "");
        setNotes(product.brands ? `Marque: ${product.brands}` : "");
    } catch (error) {
        console.error(error);
        alert("Erreur pendant la recherche du code-barres");
    } finally {
        setIsSearchingBarcode(false);
    }
    };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid gap-4 rounded-2xl border border-green-100 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4"
    >
      <div className="flex gap-2 md:col-span-2 lg:col-span-4">
        <Input
            placeholder="Code-barres"
            value={barcode}
            className="border-green-100 bg-green-50/50"
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
            className="lg:col-span-4 bg-green-600 text-white hover:bg-green-700"
            disabled={isSearchingBarcode}
        >
            {isSearchingBarcode ? "Recherche..." : "Rechercher"}
        </Button>
      </div>
      <Input
        placeholder="Nom"
        value={name}
        className="border-green-100 bg-green-50/50"
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        placeholder="Catégorie"
        value={category}
        className="border-green-100 bg-green-50/50"
        onChange={(e) => setCategory(e.target.value)}
      />

      <Input
        type="number"
        placeholder="Quantité"
        value={quantity}
        className="border-green-100 bg-green-50/50"
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <Input
        placeholder="Unité"
        value={unit}
        className="border-green-100 bg-green-50/50"
        onChange={(e) => setUnit(e.target.value)}
      />

      <Input
        type="date"
        value={expirationDate}
        className="border-green-100 bg-green-50/50"
        onChange={(e) => setExpirationDate(e.target.value)}
      />

      <Input
        placeholder="Emplacement"
        value={location}
        className="border-green-100 bg-green-50/50"
        onChange={(e) => setLocation(e.target.value)}
      />

      <Input
        type="number"
        placeholder="Quantité minimum"
        value={minimumQuantity}
        className="border-green-100 bg-green-50/50"
        onChange={(e) => setMinimumQuantity(Number(e.target.value))}
      />

      <Input
        placeholder="Notes"
        value={notes}
        className="border-green-100 bg-green-50/50"
        onChange={(e) => setNotes(e.target.value)}
      />

      <Button type="submit" disabled={isSubmitting} className="lg:col-span-4 bg-green-600 text-white hover:bg-green-700">
        {isSubmitting ? "Ajout..." : "Ajouter l’aliment"}
      </Button>
    </form>
  );
}