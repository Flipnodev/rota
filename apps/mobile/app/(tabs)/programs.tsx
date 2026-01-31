import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { ChevronRight, ChevronDown, Dumbbell, Star, Check, Plus, Edit } from "@/components/icons";
import { usePrograms } from "@/hooks/use-programs";

type SortOption =
  | "name_asc"
  | "name_desc"
  | "duration_asc"
  | "duration_desc"
  | "difficulty_asc"
  | "difficulty_desc"
  | "newest"
  | "oldest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "duration_asc", label: "Duration (Shortest)" },
  { value: "duration_desc", label: "Duration (Longest)" },
  { value: "difficulty_asc", label: "Difficulty (Beginner first)" },
  { value: "difficulty_desc", label: "Difficulty (Advanced first)" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

const DIFFICULTY_ORDER: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ProgramsScreen() {
  const router = useRouter();
  const { activeProgram, templatePrograms, userPrograms, isLoading } = usePrograms();
  const [sortBy, setSortBy] = useState<SortOption>("difficulty_asc");
  const [showSortModal, setShowSortModal] = useState(false);

  const sortedPrograms = useMemo(() => {
    const programs = templatePrograms.filter((p) => p.id !== activeProgram?.id);

    return [...programs].sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "duration_asc":
          return a.duration_weeks - b.duration_weeks;
        case "duration_desc":
          return b.duration_weeks - a.duration_weeks;
        case "difficulty_asc":
          return (
            (DIFFICULTY_ORDER[a.difficulty] || 0) -
            (DIFFICULTY_ORDER[b.difficulty] || 0)
          );
        case "difficulty_desc":
          return (
            (DIFFICULTY_ORDER[b.difficulty] || 0) -
            (DIFFICULTY_ORDER[a.difficulty] || 0)
          );
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        default:
          return 0;
      }
    });
  }, [templatePrograms, activeProgram?.id, sortBy]);

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "Sort";

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
            Choose a program or create your own
          </Text>
        </View>

        {/* Current Active Program */}
        {activeProgram && (
          <Pressable
            style={[styles.programCard, styles.activeProgramCard]}
            onPress={() => router.push(`/program/${activeProgram.id}`)}
          >
            <View style={styles.programContent}>
              <View style={styles.programHeader}>
                <Text style={[styles.programName, styles.activeProgramName]}>
                  {activeProgram.name}
                </Text>
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>CURRENT</Text>
                </View>
              </View>
              <Text style={styles.programDescription}>
                {activeProgram.description || "No description"}
              </Text>

              <View style={styles.programMeta}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>
                    {capitalizeFirst(activeProgram.difficulty)}
                  </Text>
                </View>
                <Text style={styles.programDuration}>
                  {activeProgram.duration_weeks} weeks · {activeProgram.days_per_week}{" "}
                  days/week
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.emerald500} />
          </Pressable>
        )}

        {/* My Programs Section */}
        {userPrograms.length > 0 && (
          <View style={[styles.section, activeProgram && styles.sectionWithActive]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Programs</Text>
            </View>
            {userPrograms.map((program) => (
              <Pressable
                key={program.id}
                style={[styles.programCard, styles.userProgramCard]}
                onPress={() => router.push(`/program/${program.id}`)}
              >
                <View style={styles.programContent}>
                  <View style={styles.programHeader}>
                    <Text style={styles.programName}>{program.name}</Text>
                    <Pressable
                      style={styles.editBadge}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/program/edit/${program.id}`);
                      }}
                    >
                      <Edit size={12} color={colors.zinc300} />
                    </Pressable>
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
            ))}
          </View>
        )}

        {/* Program Library */}
        <View style={[styles.section, (activeProgram || userPrograms.length > 0) && styles.sectionWithActive]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Program Library</Text>
            <Pressable
              style={styles.sortButton}
              onPress={() => setShowSortModal(true)}
            >
              <Text style={styles.sortButtonText}>{currentSortLabel}</Text>
              <ChevronDown size={16} color={colors.zinc400} />
            </Pressable>
          </View>

          {sortedPrograms.length > 0 ? (
            sortedPrograms.map((program) => (
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

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort by</Text>
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={styles.sortOption}
                onPress={() => {
                  setSortBy(option.value);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option.value && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Check size={18} color={colors.emerald500} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* FAB - Create Program */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push("/program/create")}
      >
        <Plus size={24} color={colors.black} />
      </Pressable>
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
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionWithActive: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.zinc800,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  sortButtonText: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
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
  activeProgramCard: {
    borderColor: colors.emerald500,
    backgroundColor: colors.emeraldAlpha10,
  },
  activeProgramName: {
    color: colors.emerald500,
  },
  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.emeraldAlpha20,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.emerald500,
    letterSpacing: 0.5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  sortOptionText: {
    fontSize: fontSize.base,
    color: colors.zinc400,
  },
  sortOptionTextActive: {
    color: colors.emerald500,
    fontWeight: fontWeight.medium,
  },
  userProgramCard: {
    borderColor: colors.zinc700,
  },
  editBadge: {
    padding: spacing.xs,
    backgroundColor: colors.zinc800,
    borderRadius: radius.sm,
  },
  fab: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.emerald500,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
