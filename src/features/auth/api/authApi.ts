import apiClient from "@/lib/api/client";
import { LoginFormValues, RegisterFormValues } from "../schemas/authSchema";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export type LoginResponse = unknown;
export type RegisterResponse = unknown;
export type RefreshResponse = unknown;
export type UserResponse = unknown;

export const authApi = {
  register: async (data: RegisterFormValues): Promise<RegisterResponse> => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginFormValues): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  signInWithGoogle: async (redirectTo?: string): Promise<{ url?: string; error?: any }> => {
    const supabase = getSupabaseBrowserClient();
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const targetRedirect = `${origin}/auth/callback${
      redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""
    }`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: targetRedirect,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) throw error;
    return data;
  },

  syncOAuthUser: async (token?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.post("/auth/oauth-sync", {}, { headers });
    return response.data;
  },

  refresh: async (): Promise<RefreshResponse> => {
    const response = await apiClient.post("/auth/refresh");
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      if (typeof window !== "undefined") {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn("[authApi] Supabase client signOut warning:", e);
    }
    await apiClient.post("/auth/logout");
  },

  me: async (): Promise<UserResponse> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};
