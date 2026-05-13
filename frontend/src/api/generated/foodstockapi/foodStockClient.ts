import { OpenAPI } from "@/api/generated/foodstockapi";

const configuredApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5175/api";

export function configureFoodStockClient(token?: string | null) {
  OpenAPI.BASE = normalizeBaseUrl(configuredApiUrl);
  OpenAPI.TOKEN = token || undefined;
}

function normalizeBaseUrl(url: string) {
  const trimmedUrl = url.replace(/\/+$/, "");

  return trimmedUrl.endsWith("/api")
    ? trimmedUrl.slice(0, -4)
    : trimmedUrl;
}
