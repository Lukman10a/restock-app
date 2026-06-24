import {
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
  UserProfile,
} from "@/services/authService";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

export type User = UserProfile;

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rehydrate user from stored token on boot
  useEffect(() => {
    async function loadUser() {
      try {
        const stored = await SecureStore.getItemAsync("user");
        if (stored) setUser(JSON.parse(stored));
      } catch {
        // ignore parse errors
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const { user } = await apiLogin(email, password);
      await SecureStore.setItemAsync("user", JSON.stringify(user));
      setUser(user);
    } catch (e: any) {
      setError(e.message ?? "Login failed. Please try again.");
      throw e;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const { user } = await apiSignup(name, email, password);

      await SecureStore.setItemAsync("user", JSON.stringify(user));
      setUser(user);
    } catch (e: any) {
      setError(e.message ?? "Sign up failed. Please try again.");
      throw e;
    }
  };

  const logout = async () => {
    await apiLogout();
    await SecureStore.deleteItemAsync("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
