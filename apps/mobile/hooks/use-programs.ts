import { useEffect, useState, useCallback } from "react";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";
import { useSubscription } from "@/hooks/use-subscription";

// Extended Program type with is_premium field
interface Program {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
  days_per_week: number;
  difficulty: string;
  goal: string;
  equipment: string[];
  is_template: boolean;
  is_public: boolean;
  is_premium: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UseProgramsReturn {
  programs: Program[];
  activeProgram: Program | null;
  templatePrograms: Program[];
  isPremium: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePrograms(): UseProgramsReturn {
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const { isPremium, isLoading: subscriptionLoading } = useSubscription();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch user's own programs
      const userProgramsPromise = user?.id
        ? supabase
            .from("programs")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null });

      // Fetch template programs
      const templateProgramsPromise = supabase
        .from("programs")
        .select("*")
        .eq("is_template", true)
        .order("created_at", { ascending: false });

      const [userResult, templateResult] = await Promise.all([
        userProgramsPromise,
        templateProgramsPromise,
      ]);

      if (userResult.error) {
        throw new Error(userResult.error.message);
      }
      if (templateResult.error) {
        throw new Error(templateResult.error.message);
      }

      // Combine and deduplicate programs
      const allPrograms = [...(userResult.data || [])];
      const userProgramIds = new Set(allPrograms.map((p) => p.id));

      for (const template of templateResult.data || []) {
        if (!userProgramIds.has(template.id)) {
          allPrograms.push(template);
        }
      }

      setPrograms(allPrograms);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch programs")
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Find active program (user's program that is not a template)
  const userPrograms = programs.filter(
    (p) => p.user_id === user?.id && !p.is_template
  );
  const activeProgram = userPrograms.length > 0 ? userPrograms[0] : null;

  // Template programs for the library
  const templatePrograms = programs.filter((p) => p.is_template);

  return {
    programs,
    activeProgram,
    templatePrograms,
    isPremium,
    isLoading: isLoading || subscriptionLoading,
    error,
    refetch: fetchPrograms,
  };
}
