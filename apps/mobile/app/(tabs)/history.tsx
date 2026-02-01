import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { layout, header as headerStyles, typography, card, iconContainer } from "@/constants/styles";
import { ChevronRight, Check, Dumbbell } from "@/components/icons";
import { EmptyState } from "@/components/ui";
import { useWorkoutLogs } from "@/hooks/use-workout-logs";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0 min";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Weekly bar chart component with blobs
function WeeklyChart({ workoutCounts }: { workoutCounts: { day: string; count: number; isToday: boolean }[] }) {
  const maxCount = Math.max(...workoutCounts.map((d) => d.count), 1);
  const containerHeight = 100;
  const padding = 8;
  const gap = 3;
  const availableHeight = containerHeight - padding;

  const totalGaps = maxCount > 1 ? (maxCount - 1) * gap : 0;
  const blobHeight = (availableHeight - totalGaps) / maxCount;

  return (
    <View style={[card.large, styles.chartCard]}>
      <Text style={typography.sectionTitle}>This Week</Text>
      <View style={styles.chartContainer}>
        {workoutCounts.map((day, index) => (
          <View key={index} style={styles.chartBar}>
            <View style={styles.barContainer}>
              {Array.from({ length: day.count }).map((_, blobIndex) => (
                <View
                  key={blobIndex}
                  style={[
                    styles.blob,
                    {
                      height: blobHeight,
                      marginTop: blobIndex > 0 ? gap : 0,
                    },
                    day.isToday && styles.blobToday,
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.barLabel, day.isToday && styles.barLabelToday]}>
              {day.day}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Workout card that navigates to detail page
function WorkoutCard({
  log,
  onPress,
}: {
  log: any;
  onPress: () => void;
}) {
  return (
    <Pressable style={[card.base, styles.workoutCard]} onPress={onPress}>
      <View style={styles.workoutCardHeader}>
        <View style={[iconContainer.sm, styles.workoutIcon]}>
          <Check size={16} color={colors.emerald500} />
        </View>
        <View style={styles.workoutContent}>
          <Text style={styles.workoutName}>
            {log.workout?.name || "Workout"}
          </Text>
          <Text style={typography.bodySm}>
            {formatDate(log.started_at)} · {formatDuration(log.duration_seconds)}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.zinc600} />
      </View>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { workoutLogs, stats, isLoading } = useWorkoutLogs();

  // Calculate workout counts for the past 7 days
  const weeklyData = useMemo(() => {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const today = new Date();
    const todayDayOfWeek = today.getDay();

    const startOfWeek = new Date(today);
    const diff = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const result = days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);

      const count = workoutLogs.filter((log) => {
        if (!log.completed_at) return false;
        const logDate = new Date(log.started_at);
        return (
          logDate.getDate() === date.getDate() &&
          logDate.getMonth() === date.getMonth() &&
          logDate.getFullYear() === date.getFullYear()
        );
      }).length;

      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      return { day, count, isToday };
    });

    return result;
  }, [workoutLogs]);

  if (isLoading) {
    return (
      <SafeAreaView style={layout.container} edges={["top"]}>
        <View style={layout.centered}>
          <ActivityIndicator size="large" color={colors.emerald500} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={layout.container} edges={["top"]}>
      <ScrollView style={layout.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={headerStyles.container}>
          <Text style={typography.pageTitle}>History</Text>
          <Text style={typography.subtitle}>Track your progress over time</Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <View style={[card.base, styles.statCard]}>
            <Text style={styles.statValue}>{stats.thisWeek}</Text>
            <Text style={typography.caption}>This Week</Text>
          </View>
          <View style={[card.base, styles.statCard]}>
            <Text style={styles.statValue}>{stats.thisMonth}</Text>
            <Text style={typography.caption}>This Month</Text>
          </View>
          <View style={[card.base, styles.statCard]}>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={typography.caption}>Day Streak</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <WeeklyChart workoutCounts={weeklyData} />

        {/* Workout History */}
        <View style={styles.section}>
          <Text style={typography.sectionTitle}>
            Recent Workouts ({stats.totalWorkouts})
          </Text>

          {workoutLogs.filter((log) => log.completed_at !== null).length > 0 ? (
            workoutLogs
              .filter((log) => log.completed_at !== null)
              .map((log) => (
                <WorkoutCard
                  key={log.id}
                  log={log}
                  onPress={() => router.push(`/history/${log.id}`)}
                />
              ))
          ) : (
            <EmptyState
              icon={<Dumbbell size={32} color={colors.zinc500} />}
              title="No Workout History"
              description="Complete your first workout to start tracking your progress"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  chartCard: {
    marginBottom: spacing.lg,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    marginTop: spacing.lg,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
  },
  barContainer: {
    width: 28,
    height: 100,
    backgroundColor: colors.zinc800,
    borderRadius: radius.md,
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "hidden",
    padding: 4,
  },
  blob: {
    width: "100%",
    backgroundColor: colors.emerald500,
    borderRadius: 4,
  },
  blobToday: {
    backgroundColor: colors.emerald400,
  },
  barLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: spacing.sm,
  },
  barLabelToday: {
    color: colors.emerald500,
    fontWeight: fontWeight.semibold,
  },
  section: {
    marginBottom: spacing.xl,
  },
  workoutCard: {
    marginTop: spacing.md,
  },
  workoutCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutIcon: {
    backgroundColor: colors.emeraldAlpha10,
    marginRight: spacing.md,
  },
  workoutContent: {
    flex: 1,
  },
  workoutName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
    marginBottom: 2,
  },
});
