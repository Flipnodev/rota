import { createContext, useContext, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { SupabaseClient } from "@rota/database";

interface DatabaseContextValue {
  supabase: SupabaseClient;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  return (
    <DatabaseContext.Provider value={{ supabase }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase(): DatabaseContextValue {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}

// Re-export the supabase client for direct imports if needed
export { supabase };
