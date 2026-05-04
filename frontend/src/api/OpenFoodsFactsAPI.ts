export type OpenFoodFactsProduct = {
  product_name?: string;
  product_name_fr?: string;
  categories?: string;
  quantity?: string;
  brands?: string;
  image_url?: string;
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

  console.log("Fetching product for barcode:", barcode); // debug  
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,product_name_fr,categories,quantity,brands,image_url`
  );

  if (!response.ok) {
    throw new Error("Erreur OpenFoodFacts");
  }

  return response.json();
}