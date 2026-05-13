import { AuthService } from "@/api/generated/foodstockapi";
import { configureFoodStockClient } from "@/api/generated/foodstockapi/foodStockClient";

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
};

export async function loginApi(username: string, password: string): Promise<LoginResponse> {
  configureFoodStockClient();

  return AuthService.postApiAuthLogin({
    username,
    password,
  }) as Promise<LoginResponse>;
}
