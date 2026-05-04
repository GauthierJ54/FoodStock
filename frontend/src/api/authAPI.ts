export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
};

const API_URL = import.meta.env.VITE_API_URL;

export async function loginApi(
  username: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
}