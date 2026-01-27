import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { Check, Clock, Dumbbell, TrendingUp, Target } from "@/components/icons";
import { formatElapsedTime } from "@/hooks/use-workout-session";

// Helper to format volume
function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k kg`;
  }
  return `${Math.round(volume)} kg`;
}

export default function WorkoutCompleteScreen() {
  const router = useRouter();
  const {
    workoutLogId,
    workoutName,
    durationSeconds,
    exerciseCount,
    setCount,
    totalVolume,
  } = useLocalSearchParams<{
    workoutLogId: string;
    workoutName: string;
    durationSeconds: string;
    exerciseCount: string;
    setCount: string;
    totalVolume: string;
  }>();

  // Parse params
  const duration = parseInt(durationSeconds || "0", 10);
  const exercises = parseInt(exerciseCount || "0", 10);
  const sets = parseInt(setCount || "0", 10);
  const volume = parseFloat(totalVolume || "0");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <Check size={48} color={colors.black} />
        </View>

        <Text style={styles.title}>Workout Complete!</Text>
        <Text style={styles.subtitle}>{workoutName || "Workout"}</Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Clock size={24} color={colors.emerald500} />
            <Text style={styles.statValue}>{formatElapsedTime(duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Dumbbell size={24} color={colors.emerald500} />
            <Text style={styles.statValue}>{exercises}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={24} color={colors.emerald500} />
            <Text style={styles.statValue}>{sets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color={colors.emerald500} />
            <Text style={styles.statValue}>{formatVolume(volume)}</Text>
            <Text style={styles.statLabel}>Volume</Text>
          </View>
        </View>

        {/* Encouragement message based on performance */}
        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementTitle}>
            {sets > 0 ? "Great work!" : "Session logged"}
          </Text>
          <Text style={styles.encouragementText}>
            {sets > 0
              ? `You completed ${sets} set${sets !== 1 ? "s" : ""} and lifted ${formatVolume(volume)} total volume. Keep pushing!`
              : "Your workout session has been recorded. Every workout counts!"}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace("/(tabs)/history")}
          >
            <Text style={styles.secondaryButtonText}>View History</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing["2xl"],
    alignItems: "center",
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.emerald500,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.zinc400,
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    width: "100%",
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: 2,
  },
  encouragementCard: {
    width: "100%",
    marginTop: spacing.xl,
    backgroundColor: colors.emeraldAlpha10,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.emerald500,
    alignItems: "center",
  },
  encouragementTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.emerald500,
    marginBottom: spacing.sm,
  },
  encouragementText: {
    fontSize: fontSize.sm,
    color: colors.zinc300,
    textAlign: "center",
    lineHeight: 20,
  },
  actions: {
    width: "100%",
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.emerald500,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
  secondaryButton: {
    backgroundColor: colors.zinc900,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  secondaryButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
});
