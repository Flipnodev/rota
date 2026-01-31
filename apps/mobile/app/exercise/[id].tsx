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
import { X, TrendingUp, AlertCircle } from "@/components/icons";
import { useExercise } from "@/hooks/use-exercise";
import type { MuscleGroup, EquipmentType } from "@rota/database";

// Format muscle group enum to readable text
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

// Format equipment enum to readable text
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

// Format date to relative or absolute
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

// Format full date for personal record
function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format volume (e.g., 2560 -> "2,560 kg")
function formatVolume(volume: number): string {
  return `${volume.toLocaleString()} kg`;
}

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exercise, history, personalRecord, isLoading, error } = useExercise(id);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Exercise Info</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.emerald500} />
          <Text style={styles.loadingText}>Loading exercise...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !exercise) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Exercise Info</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Exercise Info</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Exercise Name */}
        <Text style={styles.exerciseName}>{exercise.name}</Text>

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
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{exercise.description}</Text>
          </View>
        )}

        {/* Personal Record */}
        {personalRecord && (
          <View style={styles.prCard}>
            <View style={styles.prHeader}>
              <TrendingUp size={20} color={colors.emerald500} />
              <Text style={styles.prTitle}>Personal Record</Text>
            </View>
            <View style={styles.prStats}>
              <View style={styles.prStat}>
                <Text style={styles.prValue}>{personalRecord.weight} kg</Text>
                <Text style={styles.prLabel}>Weight</Text>
              </View>
              <View style={styles.prDivider} />
              <View style={styles.prStat}>
                <Text style={styles.prValue}>{personalRecord.reps}</Text>
                <Text style={styles.prLabel}>Reps</Text>
              </View>
            </View>
            <Text style={styles.prDate}>Set on {formatFullDate(personalRecord.date)}</Text>
          </View>
        )}

        {/* Instructions */}
        {hasInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
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
            <Text style={styles.sectionTitle}>Recent History</Text>
            <View style={styles.historyHeader}>
              <Text style={styles.historyHeaderText}>Date</Text>
              <Text style={styles.historyHeaderText}>Sets</Text>
              <Text style={styles.historyHeaderText}>Max</Text>
              <Text style={styles.historyHeaderText}>Volume</Text>
            </View>
            {history.map((entry, index) => (
              <View key={index} style={styles.historyItem}>
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

        {/* Empty state for no history */}
        {!hasHistory && !personalRecord && (
          <View style={styles.emptyHistoryCard}>
            <Text style={styles.emptyHistoryTitle}>No History Yet</Text>
            <Text style={styles.emptyHistoryText}>
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
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.zinc900,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.base,
    color: colors.zinc400,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.error,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.zinc900,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  retryButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  exerciseName: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
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
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
    marginBottom: spacing.lg,
  },
  descriptionText: {
    fontSize: fontSize.base,
    color: colors.zinc300,
    lineHeight: 24,
  },
  prCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.emerald500,
    marginBottom: spacing.lg,
  },
  prHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
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
    marginBottom: spacing.sm,
  },
  prStat: {
    alignItems: "center",
  },
  prValue: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  prLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: 2,
  },
  prDivider: {
    width: 1,
    backgroundColor: colors.zinc700,
  },
  prDate: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    textAlign: "center",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: spacing.md,
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
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.zinc800,
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
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  emptyHistoryTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  emptyHistoryText: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
