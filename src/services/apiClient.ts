import * as SecureStore from "expo-secure-store";

export const BASE_URL = "http://10.163.87.195:3000";

const TOKENS = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
} as const;

// ---------- Token Storage ----------
export async function getAccessToken() {
  return SecureStore.getItemAsync(TOKENS.ACCESS);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(TOKENS.REFRESH);
}

export async function storeTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(TOKENS.ACCESS, access);
  await SecureStore.setItemAsync(TOKENS.REFRESH, refresh);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(TOKENS.ACCESS);
  await SecureStore.deleteItemAsync(TOKENS.REFRESH);
}

// ---------- Base Fetch Wrapper ----------
export async function apiFetch(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<any> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Handle token refresh on 401
  if (res.status === 401 && retry) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiFetch(path, options, false);
    }
    // Could not refresh — caller must handle
    throw new Error("SESSION_EXPIRED");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `API error ${res.status}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  // For binary responses (CSV)
  return res.blob();
}

// ---------- Multipart Upload ----------
export async function apiUpload(
  path: string,
  formData: FormData,
): Promise<any> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Upload error ${res.status}`);
  }
  return res.json();
}

// ---------- Token Refresh ----------
async function refreshTokens(): Promise<boolean> {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return false;

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    await storeTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}
