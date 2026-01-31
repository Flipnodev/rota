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
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
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

      // Fetch user's active program from user_programs table
      const activeProgramPromise = user?.id
        ? supabase
            .from("user_programs")
            .select("program:programs(*)")
            .eq("user_id", user.id)
            .order("started_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null });

      const [userResult, templateResult, activeResult] = await Promise.all([
        userProgramsPromise,
        templateProgramsPromise,
        activeProgramPromise,
      ]);

      if (userResult.error) {
        throw new Error(userResult.error.message);
      }
      if (templateResult.error) {
        throw new Error(templateResult.error.message);
      }
      if (activeResult.error) {
        throw new Error(activeResult.error.message);
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

      // Set active program from user_programs join
      if (activeResult.data?.program) {
        setActiveProgram(activeResult.data.program as Program);
      } else {
        setActiveProgram(null);
      }
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
