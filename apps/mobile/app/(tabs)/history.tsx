import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { Calendar, TrendingUp, ChevronRight, Check } from "@/components/icons";

const WORKOUT_HISTORY = [
  {
    id: "1",
    name: "Push Day A",
    date: "Today",
    duration: "52 min",
    exercises: 6,
    totalVolume: "12,450 kg",
    prs: 1,
  },
  {
    id: "2",
    name: "Pull Day A",
    date: "Yesterday",
    duration: "48 min",
    exercises: 6,
    totalVolume: "11,200 kg",
    prs: 0,
  },
  {
    id: "3",
    name: "Legs Day A",
    date: "Jan 22",
    duration: "61 min",
    exercises: 5,
    totalVolume: "18,900 kg",
    prs: 2,
  },
  {
    id: "4",
    name: "Push Day B",
    date: "Jan 21",
    duration: "55 min",
    exercises: 6,
    totalVolume: "13,100 kg",
    prs: 0,
  },
  {
    id: "5",
    name: "Pull Day B",
    date: "Jan 20",
    duration: "50 min",
    exercises: 6,
    totalVolume: "10,800 kg",
    prs: 1,
  },
];

const STATS = {
  thisWeek: 4,
  thisMonth: 16,
  totalVolume: "245,000 kg",
  streak: 12,
};

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Track your progress over time</Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{STATS.thisWeek}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{STATS.thisMonth}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{STATS.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Calendar Placeholder */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Calendar size={20} color={colors.emerald500} />
            <Text style={styles.calendarTitle}>January 2026</Text>
          </View>
          <View style={styles.calendarPlaceholder}>
            <Text style={styles.placeholderText}>Calendar view coming soon</Text>
          </View>
        </View>

        {/* Workout History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>

          {WORKOUT_HISTORY.map((workout) => (
            <Pressable key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutIcon}>
                <Check size={16} color={colors.emerald500} />
              </View>
              <View style={styles.workoutContent}>
                <View style={styles.workoutHeader}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  {workout.prs > 0 && (
                    <View style={styles.prBadge}>
                      <TrendingUp size={12} color={colors.emerald500} />
                      <Text style={styles.prText}>{workout.prs} PR</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.workoutMeta}>
                  {workout.date} · {workout.duration} · {workout.totalVolume}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.zinc600} />
            </Pressable>
          ))}
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
    paddingHorizontal: spacing.md,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.zinc400,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  statValue: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: 2,
  },
  calendarCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
    marginBottom: spacing.lg,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  calendarTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  calendarPlaceholder: {
    height: 200,
    backgroundColor: colors.zinc800,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
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
  workoutCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  workoutIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.emeraldAlpha10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  workoutContent: {
    flex: 1,
  },
  workoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 2,
  },
  workoutName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  prBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.emeraldAlpha10,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  prText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.emerald500,
  },
  workoutMeta: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
});
