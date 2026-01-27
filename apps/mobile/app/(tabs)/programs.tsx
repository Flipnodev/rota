import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { ChevronRight, Target, Calendar, Dumbbell, Star } from "@/components/icons";
import { usePrograms } from "@/hooks/use-programs";

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ProgramsScreen() {
  const router = useRouter();
  const { activeProgram, templatePrograms, isPremium, isLoading, error } = usePrograms();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.emerald500} />
        </View>
      </SafeAreaView>
    );
  }

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
        {activeProgram && (
          <Pressable
            style={styles.activeCard}
            onPress={() => router.push(`/program/${activeProgram.id}`)}
          >
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
            <Text style={styles.activeName}>{activeProgram.name}</Text>
            <Text style={styles.activeDescription}>
              {activeProgram.description || "No description"}
            </Text>

            <View style={styles.activeMeta}>
              <View style={styles.metaItem}>
                <Calendar size={16} color={colors.zinc400} />
                <Text style={styles.metaText}>
                  {activeProgram.duration_weeks} weeks
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Target size={16} color={colors.zinc400} />
                <Text style={styles.metaText}>
                  {activeProgram.days_per_week} days/week
                </Text>
              </View>
            </View>

            <View style={styles.activeFooter}>
              <Text style={styles.continueText}>Continue program</Text>
              <ChevronRight size={20} color={colors.emerald500} />
            </View>
          </Pressable>
        )}

        {/* Program Library */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Program Library</Text>

          {templatePrograms.length > 0 ? (
            templatePrograms.map((program) => (
              <Pressable
                key={program.id}
                style={[
                  styles.programCard,
                  program.is_premium && styles.premiumCard,
                ]}
                onPress={() => router.push(`/program/${program.id}`)}
              >
                <View style={styles.programContent}>
                  <View style={styles.programHeader}>
                    <Text style={styles.programName}>{program.name}</Text>
                    {program.is_premium && (
                      <View style={styles.premiumBadge}>
                        <Star size={10} color={colors.amber500} />
                        <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.programDescription}>
                    {program.description || "No description"}
                  </Text>

                  <View style={styles.programMeta}>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>
                        {capitalizeFirst(program.difficulty)}
                      </Text>
                    </View>
                    <Text style={styles.programDuration}>
                      {program.duration_weeks} weeks · {program.days_per_week}{" "}
                      days/week
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={colors.zinc600} />
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyLibrary}>
              <View style={styles.emptyIconContainer}>
                <Dumbbell size={32} color={colors.zinc500} />
              </View>
              <Text style={styles.emptyTitle}>No Programs Available</Text>
              <Text style={styles.emptyText}>
                Check back later for new training programs
              </Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  premiumCard: {
    borderColor: colors.amber500,
    backgroundColor: colors.zinc900,
  },
  programContent: {
    flex: 1,
  },
  programHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 4,
  },
  programName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.amber500 + "20",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.amber500,
    letterSpacing: 0.5,
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
  emptyLibrary: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.zinc800,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.whiteAlpha5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    textAlign: "center",
  },
});
