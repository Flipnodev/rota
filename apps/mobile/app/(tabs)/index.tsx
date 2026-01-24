import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { Play, TrendingUp, Calendar, ChevronRight } from "@/components/icons";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.title}>Ready to train?</Text>
        </View>

        {/* Active Program Card */}
        <Pressable
          style={styles.programCard}
          onPress={() => router.push("/program/1")}
        >
          <View style={styles.programBadge}>
            <Text style={styles.programBadgeText}>CURRENT PROGRAM</Text>
          </View>
          <Text style={styles.programName}>Push Pull Legs</Text>
          <Text style={styles.programMeta}>Week 2 of 8 · Day 4</Text>

          <View style={styles.programProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "25%" }]} />
            </View>
            <Text style={styles.progressText}>25% complete</Text>
          </View>

          <Pressable
            style={styles.startButton}
            onPress={() => router.push("/workout/active")}
          >
            <Play size={20} color={colors.black} />
            <Text style={styles.startButtonText}>Start Today's Workout</Text>
          </Pressable>
        </Pressable>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <TrendingUp size={20} color={colors.emerald500} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={20} color={colors.emerald500} />
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable onPress={() => router.push("/(tabs)/history")}>
              <Text style={styles.sectionLink}>See all</Text>
            </Pressable>
          </View>

          {[
            { name: "Push Day A", date: "Today", duration: "52 min" },
            { name: "Pull Day A", date: "Yesterday", duration: "48 min" },
            { name: "Legs Day A", date: "2 days ago", duration: "61 min" },
          ].map((workout, index) => (
            <Pressable key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Play size={16} color={colors.emerald500} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityName}>{workout.name}</Text>
                <Text style={styles.activityMeta}>
                  {workout.date} · {workout.duration}
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
  greeting: {
    fontSize: fontSize.base,
    color: colors.zinc400,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  programCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  programBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.emeraldAlpha20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  programBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.emerald500,
    letterSpacing: 0.5,
  },
  programName: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  programMeta: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
    marginBottom: spacing.lg,
  },
  programProgress: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.zinc800,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.emerald500,
    borderRadius: radius.full,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emerald500,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  startButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  statValue: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  sectionLink: {
    fontSize: fontSize.sm,
    color: colors.emerald500,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.emeraldAlpha10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
});
