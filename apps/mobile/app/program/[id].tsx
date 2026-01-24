import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import {
  ChevronLeft,
  Calendar,
  Target,
  Clock,
  ChevronRight,
  Play,
} from "@/components/icons";

const PROGRAM = {
  id: "1",
  name: "Push Pull Legs",
  description:
    "A classic 6-day split that separates your training into push, pull, and leg movements. Ideal for intermediate lifters looking to build muscle.",
  duration: "8 weeks",
  level: "Intermediate",
  daysPerWeek: 6,
  currentWeek: 2,
  currentDay: 4,
  schedule: [
    { day: "Monday", workout: "Push Day A", completed: true },
    { day: "Tuesday", workout: "Pull Day A", completed: true },
    { day: "Wednesday", workout: "Legs Day A", completed: true },
    { day: "Thursday", workout: "Push Day B", completed: false, isToday: true },
    { day: "Friday", workout: "Pull Day B", completed: false },
    { day: "Saturday", workout: "Legs Day B", completed: false },
    { day: "Sunday", workout: "Rest", completed: false, isRest: true },
  ],
};

export default function ProgramDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Program Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Program Info */}
        <View style={styles.programCard}>
          <Text style={styles.programName}>{PROGRAM.name}</Text>
          <Text style={styles.programDescription}>{PROGRAM.description}</Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Calendar size={18} color={colors.emerald500} />
              <Text style={styles.metaValue}>{PROGRAM.duration}</Text>
              <Text style={styles.metaLabel}>Duration</Text>
            </View>
            <View style={styles.metaItem}>
              <Target size={18} color={colors.emerald500} />
              <Text style={styles.metaValue}>{PROGRAM.daysPerWeek}</Text>
              <Text style={styles.metaLabel}>Days/Week</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={18} color={colors.emerald500} />
              <Text style={styles.metaValue}>{PROGRAM.level}</Text>
              <Text style={styles.metaLabel}>Level</Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Week {PROGRAM.currentWeek} of 8</Text>
              <Text style={styles.progressPercent}>25%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "25%" }]} />
            </View>
          </View>
        </View>

        {/* Weekly Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          {PROGRAM.schedule.map((day, index) => (
            <Pressable
              key={index}
              style={[
                styles.scheduleItem,
                day.isToday && styles.scheduleItemToday,
              ]}
              onPress={() => !day.isRest && router.push("/workout/active")}
            >
              <View style={styles.scheduleDay}>
                <Text
                  style={[
                    styles.scheduleDayText,
                    day.isToday && styles.scheduleDayTextToday,
                  ]}
                >
                  {day.day}
                </Text>
                {day.isToday && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>TODAY</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.scheduleWorkout,
                  day.completed && styles.scheduleWorkoutCompleted,
                  day.isRest && styles.scheduleWorkoutRest,
                ]}
              >
                {day.workout}
              </Text>
              {!day.isRest && (
                day.completed ? (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                ) : (
                  <ChevronRight size={20} color={colors.zinc600} />
                )
              )}
            </Pressable>
          ))}
        </View>

        {/* Start Button */}
        <Pressable
          style={styles.startButton}
          onPress={() => router.push("/workout/active")}
        >
          <Play size={20} color={colors.black} />
          <Text style={styles.startButtonText}>Start Today's Workout</Text>
        </Pressable>

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
  backButton: {
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
  programCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  programName: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  programDescription: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.zinc800,
  },
  metaItem: {
    alignItems: "center",
  },
  metaValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.xs,
  },
  metaLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: 2,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  progressCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },
  progressPercent: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.emerald500,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.zinc800,
    borderRadius: radius.full,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.emerald500,
    borderRadius: radius.full,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  scheduleItemToday: {
    borderColor: colors.emerald500,
  },
  scheduleDay: {
    width: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  scheduleDayText: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  scheduleDayTextToday: {
    color: colors.emerald500,
    fontWeight: fontWeight.medium,
  },
  todayBadge: {
    backgroundColor: colors.emeraldAlpha20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  todayBadgeText: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.emerald500,
  },
  scheduleWorkout: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.white,
  },
  scheduleWorkoutCompleted: {
    color: colors.zinc500,
    textDecorationLine: "line-through",
  },
  scheduleWorkoutRest: {
    color: colors.zinc600,
    fontStyle: "italic",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.emerald500,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emerald500,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  startButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
