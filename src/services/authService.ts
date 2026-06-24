import { apiFetch, clearTokens, storeTokens } from "./apiClient";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
};

export async function login(
  email: string,
  password: string,
): Promise<{ user: UserProfile; tokens: AuthTokens }> {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await storeTokens(data.accessToken, data.refreshToken);
  return { user: data.user, tokens: data };
}

export async function signup(
  fullName: string,
  email: string,
  password: string,
): Promise<{ user: UserProfile; tokens: AuthTokens }> {
  const data = await apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password }),
  });
  await storeTokens(data.accessToken, data.refreshToken);
  return { user: data.user, tokens: data };
}

export async function logout() {
  await clearTokens();
}
