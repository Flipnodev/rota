import AsyncStorage from "@react-native-async-storage/async-storage";
import { createMobileClient, type SupabaseClient } from "@rota/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Warn in development but don't throw to prevent app crashes during hot reload
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file."
  );
}

// Create a typed Supabase client for React Native with AsyncStorage persistence
// Use fallback empty strings to prevent crashes - the client will fail gracefully on API calls
export const supabase: SupabaseClient = createMobileClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    getItem: async (key: string) => {
      if (typeof window === "undefined") return null;
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.warn("AsyncStorage getItem error:", error);
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      if (typeof window === "undefined") return;
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.warn("AsyncStorage setItem error:", error);
      }
    },
    removeItem: async (key: string) => {
      if (typeof window === "undefined") return;
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.warn("AsyncStorage removeItem error:", error);
      }
    },
  }
);

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
