import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { X, TrendingUp, Target, Clock } from "@/components/icons";

const EXERCISE = {
  id: "1",
  name: "Bench Press",
  muscleGroups: ["Chest", "Triceps", "Front Delts"],
  equipment: "Barbell",
  instructions: [
    "Lie flat on a bench with your feet firmly on the ground",
    "Grip the bar slightly wider than shoulder-width apart",
    "Unrack the bar and hold it above your chest with arms extended",
    "Lower the bar to your mid-chest in a controlled manner",
    "Press the bar back up to the starting position",
    "Keep your shoulder blades retracted throughout the movement",
  ],
  tips: [
    "Keep your wrists straight and grip tight",
    "Drive through your feet for stability",
    "Control the descent - don't let the bar drop",
  ],
  history: [
    { date: "Today", sets: "4×8", weight: "80 kg", volume: "2,560 kg" },
    { date: "Jan 18", sets: "4×8", weight: "77.5 kg", volume: "2,480 kg" },
    { date: "Jan 14", sets: "4×8", weight: "77.5 kg", volume: "2,480 kg" },
    { date: "Jan 10", sets: "4×8", weight: "75 kg", volume: "2,400 kg" },
  ],
  personalRecord: {
    weight: "82.5 kg",
    reps: "8",
    date: "Jan 22, 2026",
  },
};

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

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
        <Text style={styles.exerciseName}>{EXERCISE.name}</Text>

        {/* Tags */}
        <View style={styles.tags}>
          {EXERCISE.muscleGroups.map((muscle) => (
            <View key={muscle} style={styles.tag}>
              <Text style={styles.tagText}>{muscle}</Text>
            </View>
          ))}
          <View style={[styles.tag, styles.tagEquipment]}>
            <Text style={styles.tagText}>{EXERCISE.equipment}</Text>
          </View>
        </View>

        {/* Personal Record */}
        <View style={styles.prCard}>
          <View style={styles.prHeader}>
            <TrendingUp size={20} color={colors.emerald500} />
            <Text style={styles.prTitle}>Personal Record</Text>
          </View>
          <View style={styles.prStats}>
            <View style={styles.prStat}>
              <Text style={styles.prValue}>{EXERCISE.personalRecord.weight}</Text>
              <Text style={styles.prLabel}>Weight</Text>
            </View>
            <View style={styles.prDivider} />
            <View style={styles.prStat}>
              <Text style={styles.prValue}>{EXERCISE.personalRecord.reps}</Text>
              <Text style={styles.prLabel}>Reps</Text>
            </View>
          </View>
          <Text style={styles.prDate}>Set on {EXERCISE.personalRecord.date}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {EXERCISE.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipsCard}>
            {EXERCISE.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent History</Text>
          {EXERCISE.history.map((entry, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyDate}>{entry.date}</Text>
              <Text style={styles.historySets}>{entry.sets}</Text>
              <Text style={styles.historyWeight}>{entry.weight}</Text>
              <Text style={styles.historyVolume}>{entry.volume}</Text>
            </View>
          ))}
        </View>

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
  tipsCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  tipBullet: {
    fontSize: fontSize.base,
    color: colors.emerald500,
    marginRight: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.zinc400,
    lineHeight: 20,
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
    width: 70,
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },
  historySets: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.white,
  },
  historyWeight: {
    width: 70,
    fontSize: fontSize.sm,
    color: colors.white,
    textAlign: "right",
  },
  historyVolume: {
    width: 80,
    fontSize: fontSize.sm,
    color: colors.zinc500,
    textAlign: "right",
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
