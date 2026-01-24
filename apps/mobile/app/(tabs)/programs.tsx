import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { ChevronRight, Target, Calendar, TrendingUp } from "@/components/icons";

const PROGRAMS = [
  {
    id: "1",
    name: "Push Pull Legs",
    description: "Classic 6-day split for muscle building",
    duration: "8 weeks",
    level: "Intermediate",
    days: 6,
    isActive: true,
  },
  {
    id: "2",
    name: "Starting Strength",
    description: "Beginner barbell program focused on compound lifts",
    duration: "12 weeks",
    level: "Beginner",
    days: 3,
    isActive: false,
  },
  {
    id: "3",
    name: "Upper Lower Split",
    description: "4-day program balancing strength and hypertrophy",
    duration: "10 weeks",
    level: "Intermediate",
    days: 4,
    isActive: false,
  },
  {
    id: "4",
    name: "5/3/1",
    description: "Progressive overload program for strength gains",
    duration: "16 weeks",
    level: "Advanced",
    days: 4,
    isActive: false,
  },
];

export default function ProgramsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Programs</Text>
          <Text style={styles.subtitle}>
            Choose a program to follow or browse the library
          </Text>
        </View>

        {/* Active Program */}
        {PROGRAMS.filter((p) => p.isActive).map((program) => (
          <Pressable
            key={program.id}
            style={styles.activeCard}
            onPress={() => router.push(`/program/${program.id}`)}
          >
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
            <Text style={styles.activeName}>{program.name}</Text>
            <Text style={styles.activeDescription}>{program.description}</Text>

            <View style={styles.activeMeta}>
              <View style={styles.metaItem}>
                <Calendar size={16} color={colors.zinc400} />
                <Text style={styles.metaText}>{program.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Target size={16} color={colors.zinc400} />
                <Text style={styles.metaText}>{program.days} days/week</Text>
              </View>
            </View>

            <View style={styles.activeFooter}>
              <Text style={styles.continueText}>Continue program</Text>
              <ChevronRight size={20} color={colors.emerald500} />
            </View>
          </Pressable>
        ))}

        {/* Program Library */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Program Library</Text>

          {PROGRAMS.filter((p) => !p.isActive).map((program) => (
            <Pressable
              key={program.id}
              style={styles.programCard}
              onPress={() => router.push(`/program/${program.id}`)}
            >
              <View style={styles.programContent}>
                <Text style={styles.programName}>{program.name}</Text>
                <Text style={styles.programDescription}>
                  {program.description}
                </Text>

                <View style={styles.programMeta}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{program.level}</Text>
                  </View>
                  <Text style={styles.programDuration}>
                    {program.duration} · {program.days} days/week
                  </Text>
                </View>
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
  activeCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.emerald500,
  },
  activeBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.emeraldAlpha20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  activeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.emerald500,
    letterSpacing: 0.5,
  },
  activeName: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  activeDescription: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
    marginBottom: spacing.md,
  },
  activeMeta: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },
  activeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.zinc800,
  },
  continueText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.emerald500,
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  programCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  programContent: {
    flex: 1,
  },
  programName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: 4,
  },
  programDescription: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    marginBottom: spacing.sm,
  },
  programMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  levelBadge: {
    backgroundColor: colors.whiteAlpha5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  levelText: {
    fontSize: fontSize.xs,
    color: colors.zinc400,
  },
  programDuration: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
  },
});
