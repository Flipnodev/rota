import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { layout, button, card, success, typography } from "@/constants/styles";
import { Check, Clock, Dumbbell, TrendingUp, Target } from "@/components/icons";
import { formatElapsedTime } from "@/hooks/use-workout-session";

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

  const duration = parseInt(durationSeconds || "0", 10);
  const exercises = parseInt(exerciseCount || "0", 10);
  const sets = parseInt(setCount || "0", 10);
  const volume = parseFloat(totalVolume || "0");

  return (
    <SafeAreaView style={layout.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Icon */}
        <View style={success.iconContainer}>
          <Check size={48} color={colors.black} />
        </View>

        <Text style={success.title}>Workout Complete!</Text>
        <Text style={styles.subtitle}>{workoutName || "Workout"}</Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Clock size={24} color={colors.emerald500} />
            <Text style={styles.statValue}>{formatElapsedTime(duration)}</Text>
            <Text style={typography.caption}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Dumbbell size={24} color={colors.emerald500} />
            <Text style={styles.statValue}>{exercises}</Text>
            <Text style={typography.caption}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={24} color={colors.emerald500} />
            <Text style={styles.statValue}>{sets}</Text>
            <Text style={typography.caption}>Sets</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color={colors.emerald500} />
            <Text style={styles.statValue}>{formatVolume(volume)}</Text>
            <Text style={typography.caption}>Volume</Text>
          </View>
        </View>

        {/* Encouragement message */}
        <View style={[card.info, styles.encouragementCard]}>
          <View style={styles.encouragementContent}>
            <Text style={styles.encouragementTitle}>
              {sets > 0 ? "Great work!" : "Session logged"}
            </Text>
            <Text style={styles.encouragementText}>
              {sets > 0
                ? `You completed ${sets} set${sets !== 1 ? "s" : ""} and lifted ${formatVolume(volume)} total volume. Keep pushing!`
                : "Your workout session has been recorded. Every workout counts!"}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={button.primary}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={button.primaryText}>Done</Text>
          </Pressable>

          <Pressable
            style={[card.base, styles.secondaryButton]}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing["2xl"],
    alignItems: "center",
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
  encouragementCard: {
    width: "100%",
    marginTop: spacing.xl,
    flexDirection: "column",
    alignItems: "center",
  },
  encouragementContent: {
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
  secondaryButton: {
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
});
