import {
  FoodsService,
  type CreateFoodRequest,
  type SetFoodQuantityRequest,
  type UpdateFoodRequest,
} from "@/api/generated/foodstockapi";
import { configureFoodStockClient } from "@/api/generated/foodstockapi/foodStockClient";

export type FoodItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate: string;
  location: string;
  minimumQuantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateFoodItemRequest = Required<
  Pick<CreateFoodRequest, "name" | "category" | "quantity" | "unit" | "expirationDate" | "location" | "minimumQuantity">
> & {
  notes?: string | null;
};

export type UpdateFoodItemRequest = Required<
  Pick<UpdateFoodRequest, "name" | "category" | "quantity" | "unit" | "expirationDate" | "location" | "minimumQuantity">
> & {
  notes?: string | null;
};

export function getStock(token: string) {
  configureFoodStockClient(token);

  return FoodsService.getApiFoods() as Promise<FoodItem[]>;
}

export function createFoodItem(token: string, data: CreateFoodItemRequest) {
  configureFoodStockClient(token);

  return FoodsService.postApiFoods(data) as Promise<FoodItem>;
}

export function updateFoodItem(token: string, id: string, data: UpdateFoodItemRequest) {
  configureFoodStockClient(token);

  return FoodsService.putApiFoods(id, data) as Promise<FoodItem>;
}

export function setFoodQuantity(token: string, id: string, data: SetFoodQuantityRequest) {
  configureFoodStockClient(token);

  return FoodsService.patchApiFoodsQuantity(id, data) as Promise<FoodItem>;
}

export function deleteFoodItem(token: string, id: string) {
  configureFoodStockClient(token);

  return FoodsService.deleteApiFoods(id) as Promise<void>;
}
