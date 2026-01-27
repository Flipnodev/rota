import { useEffect, useState, useCallback } from "react";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";

type SubscriptionPlan = "free" | "premium" | "lifetime";
type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial";

interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  current_period_end: string | null;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isPremium: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (queryError && queryError.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine
        throw new Error(queryError.message);
      }

      setSubscription(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch subscription")
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Check if user has premium access
  const isPremium = Boolean(
    subscription &&
      subscription.status === "active" &&
      (subscription.plan === "premium" || subscription.plan === "lifetime") &&
      (subscription.current_period_end === null ||
        new Date(subscription.current_period_end) > new Date())
  );

  return {
    subscription,
    isPremium,
    isLoading,
    error,
    refetch: fetchSubscription,
  };
}
