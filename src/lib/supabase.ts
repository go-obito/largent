import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { useAuth } from "@clerk/expo";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Keep imports safe before project setup, but fail clearly if cloud access is requested.
  console.warn("Supabase is not configured. Add the project URL and publishable key to the app environment.");
}

export const supabase = createClient(
  supabaseUrl || "https://not-configured.supabase.co",
  supabaseKey || "missing-publishable-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: async (input, init = {}) => {
        // Attach a Clerk session token to every Supabase Data API request.
        const headers = new Headers(init.headers);
        // The actual token is injected per request by createClerkSupabaseClient below.
        return fetch(input, { ...init, headers });
      },
    },
  },
);

export function requireSupabaseConfig() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Cloud sync is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }
}

export function createClerkSupabaseClient(getToken: () => Promise<string | null>) {
  requireSupabaseConfig();
  return createClient(supabaseUrl!, supabaseKey!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: async (input, init = {}) => {
        const token = await getToken();
        if (!token) throw new Error("Your session has expired. Sign in again to sync.");
        const headers = new Headers(init.headers);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
  });
}
