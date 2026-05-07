export type OpenFoodFactsProduct = {
  product_name?: string;
  categories?: string;
  product_quantity?: string;
  product_quantity_unit?: string;
  brands?: string;
  nutriscore_grade?: string;
};

export type OpenFoodFactsResponse = {
  code: string;
  status: number;
  status_verbose: string;
  product?: OpenFoodFactsProduct;
};

export async function getProductByBarcode(
  barcode: string
): Promise<OpenFoodFactsResponse> {

  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,categories,product_quantity,product_quantity_unit,brands,nutriscore_grade`
  );

  if (!response.ok) {
    throw new Error("Erreur OpenFoodFacts");
  }

  return response.json();
}