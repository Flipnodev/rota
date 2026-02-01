import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { layout, header as headerStyles, typography, card } from "@/constants/styles";
import { X, TrendingUp, AlertCircle } from "@/components/icons";
import { useExercise } from "@/hooks/use-exercise";
import type { MuscleGroup, EquipmentType } from "@rota/database";

function formatMuscleGroup(muscle: MuscleGroup): string {
  const labels: Record<MuscleGroup, string> = {
    chest: "Chest",
    back: "Back",
    shoulders: "Shoulders",
    biceps: "Biceps",
    triceps: "Triceps",
    forearms: "Forearms",
    abs: "Abs",
    obliques: "Obliques",
    quads: "Quads",
    hamstrings: "Hamstrings",
    glutes: "Glutes",
    calves: "Calves",
    traps: "Traps",
    lats: "Lats",
  };
  return labels[muscle] || muscle;
}

function formatEquipment(equipment: EquipmentType): string {
  const labels: Record<EquipmentType, string> = {
    barbell: "Barbell",
    dumbbell: "Dumbbell",
    kettlebell: "Kettlebell",
    cable: "Cable",
    machine: "Machine",
    bodyweight: "Bodyweight",
    resistance_band: "Resistance Band",
    bench: "Bench",
    pull_up_bar: "Pull-up Bar",
    none: "None",
  };
  return labels[equipment] || equipment;
}

function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatVolume(volume: number): string {
  return `${volume.toLocaleString()} kg`;
}

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exercise, history, personalRecord, isLoading, error } = useExercise(id);

  if (isLoading) {
    return (
      <SafeAreaView style={layout.container} edges={["top"]}>
        <View style={headerStyles.containerRow}>
          <Pressable style={headerStyles.backButton} onPress={() => router.back()}>
            <X size={24} color={colors.white} />
          </Pressable>
          <Text style={typography.sectionTitle}>Exercise Info</Text>
          <View style={headerStyles.placeholder} />
        </View>
        <View style={layout.centered}>
          <ActivityIndicator size="large" color={colors.emerald500} />
          <Text style={[typography.bodySm, { marginTop: spacing.md }]}>Loading exercise...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !exercise) {
    return (
      <SafeAreaView style={layout.container} edges={["top"]}>
        <View style={headerStyles.containerRow}>
          <Pressable style={headerStyles.backButton} onPress={() => router.back()}>
            <X size={24} color={colors.white} />
          </Pressable>
          <Text style={typography.sectionTitle}>Exercise Info</Text>
          <View style={headerStyles.placeholder} />
        </View>
        <View style={layout.centered}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={styles.errorText}>
            {error?.message || "Exercise not found"}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const muscleGroups = exercise.muscle_groups || [];
  const equipmentList = exercise.equipment || [];
  const instructions = exercise.instructions || [];
  const hasHistory = history.length > 0;
  const hasInstructions = instructions.length > 0;

  return (
    <SafeAreaView style={layout.container} edges={["top"]}>
      {/* Header */}
      <View style={headerStyles.containerRow}>
        <Pressable style={headerStyles.backButton} onPress={() => router.back()}>
          <X size={24} color={colors.white} />
        </Pressable>
        <Text style={typography.sectionTitle}>Exercise Info</Text>
        <View style={headerStyles.placeholder} />
      </View>

      <ScrollView style={layout.scroll} showsVerticalScrollIndicator={false}>
        {/* Exercise Name */}
        <Text style={typography.pageTitle}>{exercise.name}</Text>

        {/* Tags */}
        <View style={styles.tags}>
          {muscleGroups.map((muscle) => (
            <View key={muscle} style={styles.tag}>
              <Text style={styles.tagText}>{formatMuscleGroup(muscle)}</Text>
            </View>
          ))}
          {equipmentList.map((equip) => (
            <View key={equip} style={[styles.tag, styles.tagEquipment]}>
              <Text style={styles.tagTextEquipment}>{formatEquipment(equip)}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        {exercise.description && (
          <View style={[card.base, styles.descriptionCard]}>
            <Text style={styles.descriptionText}>{exercise.description}</Text>
          </View>
        )}

        {/* Personal Record */}
        {personalRecord && (
          <View style={[card.large, styles.prCard]}>
            <View style={[layout.row, layout.gapSm]}>
              <TrendingUp size={20} color={colors.emerald500} />
              <Text style={styles.prTitle}>Personal Record</Text>
            </View>
            <View style={styles.prStats}>
              <View style={styles.prStat}>
                <Text style={styles.prValue}>{personalRecord.weight} kg</Text>
                <Text style={typography.caption}>Weight</Text>
              </View>
              <View style={styles.prDivider} />
              <View style={styles.prStat}>
                <Text style={styles.prValue}>{personalRecord.reps}</Text>
                <Text style={typography.caption}>Reps</Text>
              </View>
            </View>
            <Text style={[typography.caption, { textAlign: "center" }]}>
              Set on {formatFullDate(personalRecord.date)}
            </Text>
          </View>
        )}

        {/* Instructions */}
        {hasInstructions && (
          <View style={styles.section}>
            <Text style={typography.sectionTitle}>Instructions</Text>
            {instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        )}

        {/* History */}
        {hasHistory && (
          <View style={styles.section}>
            <Text style={typography.sectionTitle}>Recent History</Text>
            <View style={styles.historyHeader}>
              <Text style={styles.historyHeaderText}>Date</Text>
              <Text style={styles.historyHeaderText}>Sets</Text>
              <Text style={styles.historyHeaderText}>Max</Text>
              <Text style={styles.historyHeaderText}>Volume</Text>
            </View>
            {history.map((entry, index) => (
              <View key={index} style={[card.base, styles.historyItem]}>
                <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                <Text style={styles.historySets}>
                  {entry.sets}×{Math.round(entry.totalReps / entry.sets)}
                </Text>
                <Text style={styles.historyWeight}>{entry.maxWeight} kg</Text>
                <Text style={styles.historyVolume}>{formatVolume(entry.totalVolume)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Empty state */}
        {!hasHistory && !personalRecord && (
          <View style={[card.large, styles.emptyHistoryCard]}>
            <Text style={styles.emptyHistoryTitle}>No History Yet</Text>
            <Text style={typography.bodySm}>
              Complete workouts with this exercise to track your progress and set personal records.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: fontSize.base,
    color: colors.error,
    textAlign: "center",
    marginTop: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.zinc900,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  retryButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  tag: {
    backgroundColor: colors.zinc900,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  tagEquipment: {
    borderColor: colors.emerald500,
    backgroundColor: colors.emeraldAlpha10,
  },
  tagText: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },
  tagTextEquipment: {
    fontSize: fontSize.sm,
    color: colors.emerald400,
  },
  descriptionCard: {
    marginBottom: spacing.lg,
  },
  descriptionText: {
    fontSize: fontSize.base,
    color: colors.zinc300,
    lineHeight: 24,
  },
  prCard: {
    borderColor: colors.emerald500,
    marginBottom: spacing.lg,
  },
  prTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.emerald500,
  },
  prStats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xl,
    marginVertical: spacing.md,
  },
  prStat: {
    alignItems: "center",
  },
  prValue: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  prDivider: {
    width: 1,
    backgroundColor: colors.zinc700,
  },
  section: {
    marginBottom: spacing.xl,
  },
  instructionItem: {
    flexDirection: "row",
    marginTop: spacing.md,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.zinc900,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  instructionNumberText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.zinc400,
  },
  instructionText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.zinc300,
    lineHeight: 24,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  historyHeaderText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.zinc500,
    fontWeight: fontWeight.medium,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  historyDate: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },
  historySets: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.white,
  },
  historyWeight: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.white,
  },
  historyVolume: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.zinc500,
    textAlign: "right",
  },
  emptyHistoryCard: {
    alignItems: "center",
  },
  emptyHistoryTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
