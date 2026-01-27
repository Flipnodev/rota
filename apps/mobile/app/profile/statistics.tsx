import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { ChevronLeft, TrendingUp, Clock, Dumbbell, Calendar } from "@/components/icons";
import { useWorkoutLogs } from "@/hooks/use-workout-logs";
import { useDatabase } from "@/providers/database-provider";
import { useAuth } from "@/providers/auth-provider";
import { useState, useEffect } from "react";

interface SetLogWithExercise {
  id: string;
  actual_reps: number;
  actual_weight: number;
  exercise_id: string;
}

interface ExtendedStats {
  totalVolume: number;
  averageDuration: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  favoriteDay: string;
}

export default function StatisticsScreen() {
  const router = useRouter();
  const { workoutLogs, stats, isLoading } = useWorkoutLogs();
  const { supabase } = useDatabase();
  const { user } = useAuth();
  const [setLogs, setSetLogs] = useState<SetLogWithExercise[]>([]);
  const [setLogsLoading, setSetLogsLoading] = useState(true);

  // Fetch set logs for volume calculation
  useEffect(() => {
    const fetchSetLogs = async () => {
      if (!user?.id) {
        setSetLogsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("set_logs")
          .select(`
            id,
            actual_reps,
            actual_weight,
            exercise_id,
            workout_log:workout_logs!inner(user_id)
          `)
          .eq("workout_log.user_id", user.id);

        if (error) {
          console.error("Error fetching set logs:", error);
        } else {
          setSetLogs(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch set logs:", err);
      } finally {
        setSetLogsLoading(false);
      }
    };

    fetchSetLogs();
  }, [supabase, user?.id]);

  // Calculate extended statistics
  const extendedStats = useMemo<ExtendedStats>(() => {
    // Total volume (sum of weight * reps for all sets)
    const totalVolume = setLogs.reduce((total, log) => {
      return total + (log.actual_weight * log.actual_reps);
    }, 0);

    // Average workout duration
    const completedLogs = workoutLogs.filter((log) => log.completed_at && log.duration_seconds);
    const averageDuration = completedLogs.length > 0
      ? completedLogs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) / completedLogs.length
      : 0;

    // Calculate favorite day of the week
    const dayCount: Record<number, number> = {};
    workoutLogs.forEach((log) => {
      const day = new Date(log.started_at).getDay();
      dayCount[day] = (dayCount[day] || 0) + 1;
    });

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let favoriteDay = "N/A";
    let maxCount = 0;
    Object.entries(dayCount).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteDay = days[parseInt(day)];
      }
    });

    return {
      totalVolume,
      averageDuration,
      workoutsThisWeek: stats.thisWeek,
      workoutsThisMonth: stats.thisMonth,
      favoriteDay,
    };
  }, [workoutLogs, setLogs, stats]);

  // Format duration from seconds to minutes
  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return "N/A";
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  // Format volume with units
  const formatVolume = (volume: number): string => {
    if (volume === 0) return "0 kg";
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M kg`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K kg`;
    }
    return `${volume.toFixed(0)} kg`;
  };

  // Generate workout frequency data for the last 4 weeks
  const weeklyData = useMemo(() => {
    const weeks: { label: string; count: number }[] = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const count = workoutLogs.filter((log) => {
        const logDate = new Date(log.started_at);
        return logDate >= weekStart && logDate <= weekEnd && log.completed_at;
      }).length;

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const label = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}`;

      weeks.push({ label, count });
    }

    return weeks;
  }, [workoutLogs]);

  const maxWeeklyCount = Math.max(...weeklyData.map((w) => w.count), 1);

  if (isLoading || setLogsLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.emerald500} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.title}>Statistics</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Dumbbell size={24} color={colors.emerald500} />
            </View>
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color={colors.emerald500} />
            </View>
            <Text style={styles.statValue}>{formatVolume(extendedStats.totalVolume)}</Text>
            <Text style={styles.statLabel}>Total Volume</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Clock size={24} color={colors.emerald500} />
            </View>
            <Text style={styles.statValue}>{formatDuration(extendedStats.averageDuration)}</Text>
            <Text style={styles.statLabel}>Avg Duration</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Calendar size={24} color={colors.emerald500} />
            </View>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartContainer}>
              {weeklyData.map((week, index) => (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(week.count / maxWeeklyCount) * 100}%`,
                          minHeight: week.count > 0 ? 8 : 0,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{week.label}</Text>
                  <Text style={styles.barValue}>{week.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Additional Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Stats</Text>
          <View style={styles.additionalStatsCard}>
            <View style={styles.additionalStatRow}>
              <Text style={styles.additionalStatLabel}>Workouts This Week</Text>
              <Text style={styles.additionalStatValue}>{extendedStats.workoutsThisWeek}</Text>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.additionalStatRow}>
              <Text style={styles.additionalStatLabel}>Workouts This Month</Text>
              <Text style={styles.additionalStatValue}>{extendedStats.workoutsThisMonth}</Text>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.additionalStatRow}>
              <Text style={styles.additionalStatLabel}>Favorite Training Day</Text>
              <Text style={styles.additionalStatValue}>{extendedStats.favoriteDay}</Text>
            </View>
          </View>
        </View>

        {/* Empty State or Motivational Message */}
        {stats.totalWorkouts === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No workouts yet</Text>
            <Text style={styles.emptyStateText}>
              Complete your first workout to start tracking your progress!
            </Text>
          </View>
        ) : (
          <View style={styles.motivationalCard}>
            <Text style={styles.motivationalText}>
              You've lifted a total of {formatVolume(extendedStats.totalVolume)} - keep pushing!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.zinc900,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: "47%",
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.emeraldAlpha10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.zinc500,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chartCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
  },
  barContainer: {
    flex: 1,
    width: "60%",
    justifyContent: "flex-end",
    marginBottom: spacing.sm,
  },
  bar: {
    backgroundColor: colors.emerald500,
    borderRadius: radius.sm,
    width: "100%",
  },
  barLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginBottom: 2,
  },
  barValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  additionalStatsCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.zinc800,
    overflow: "hidden",
  },
  additionalStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.zinc800,
  },
  additionalStatLabel: {
    fontSize: fontSize.base,
    color: colors.zinc400,
  },
  additionalStatValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  emptyState: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.zinc800,
    marginBottom: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: fontSize.base,
    color: colors.zinc500,
    textAlign: "center",
    lineHeight: 22,
  },
  motivationalCard: {
    backgroundColor: colors.emeraldAlpha10,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.emerald500,
    marginBottom: spacing.xl,
  },
  motivationalText: {
    fontSize: fontSize.base,
    color: colors.emerald400,
    textAlign: "center",
    lineHeight: 22,
  },
});
