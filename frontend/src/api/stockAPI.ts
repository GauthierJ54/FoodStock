import { apiFetch } from "./apiClient";

const API_URL = import.meta.env.VITE_API_URL;

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

export type CreateFoodItemRequest = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate: string;
  location: string;
  minimumQuantity: number;
  notes?: string;
};

export function getStock(token: string) {
  return apiFetch<FoodItem[]>(`${API_URL}/foods`, token);
}

export function createFoodItem(token: string, data: CreateFoodItemRequest) {
  return apiFetch<FoodItem>(`${API_URL}/foods`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteFoodItem(token: string, id: string) {
  return apiFetch<void>(`${API_URL}/foods/${id}`, token, {
    method: "DELETE",
  });
}