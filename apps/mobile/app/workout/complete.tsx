import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { Check, Clock, Dumbbell, TrendingUp, Target } from "@/components/icons";

const WORKOUT_SUMMARY = {
  name: "Push Day A",
  duration: "52:34",
  exercises: 6,
  sets: 20,
  totalVolume: "12,450 kg",
  prs: [
    { exercise: "Bench Press", type: "Weight", value: "82.5 kg" },
  ],
};

export default function WorkoutCompleteScreen() {
  const router = useRouter();

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
        <Text style={styles.subtitle}>{WORKOUT_SUMMARY.name}</Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Clock size={24} color={colors.emerald500} />
            <Text style={styles.statValue}>{WORKOUT_SUMMARY.duration}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Dumbbell size={24} color={colors.emerald500} />
            <Text style={styles.statValue}>{WORKOUT_SUMMARY.exercises}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={24} color={colors.emerald500} />
            <Text style={styles.statValue}>{WORKOUT_SUMMARY.sets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color={colors.emerald500} />
            <Text style={styles.statValue}>{WORKOUT_SUMMARY.totalVolume}</Text>
            <Text style={styles.statLabel}>Volume</Text>
          </View>
        </View>

        {/* PRs */}
        {WORKOUT_SUMMARY.prs.length > 0 && (
          <View style={styles.prSection}>
            <Text style={styles.prTitle}>Personal Records</Text>
            {WORKOUT_SUMMARY.prs.map((pr, index) => (
              <View key={index} style={styles.prCard}>
                <View style={styles.prIcon}>
                  <TrendingUp size={20} color={colors.emerald500} />
                </View>
                <View style={styles.prContent}>
                  <Text style={styles.prExercise}>{pr.exercise}</Text>
                  <Text style={styles.prDetail}>
                    {pr.type}: {pr.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Share Workout</Text>
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
  prSection: {
    width: "100%",
    marginTop: spacing.xl,
  },
  prTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  prCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.emeraldAlpha10,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.emerald500,
  },
  prIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.emeraldAlpha20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  prContent: {
    flex: 1,
  },
  prExercise: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: 2,
  },
  prDetail: {
    fontSize: fontSize.sm,
    color: colors.emerald400,
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
