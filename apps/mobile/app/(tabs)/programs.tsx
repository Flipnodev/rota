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
import { ChevronDown, Dumbbell, Check, Plus } from "@/components/icons";
import { ProgramCard, SectionHeader, EmptyState } from "@/components/ui";
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

export default function ProgramsScreen() {
  const router = useRouter();
  const { activeProgram, pausedPrograms, templatePrograms, userPrograms, isLoading } = usePrograms();
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
          return (DIFFICULTY_ORDER[a.difficulty] || 0) - (DIFFICULTY_ORDER[b.difficulty] || 0);
        case "difficulty_desc":
          return (DIFFICULTY_ORDER[b.difficulty] || 0) - (DIFFICULTY_ORDER[a.difficulty] || 0);
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [templatePrograms, activeProgram?.id, sortBy]);

  const currentSortLabel = SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "Sort";
  const hasSections = activeProgram || userPrograms.length > 0 || pausedPrograms.length > 0;

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
          <Text style={styles.subtitle}>Choose a program or create your own</Text>
        </View>

        {/* Current Active Program */}
        {activeProgram && (
          <ProgramCard
            name={activeProgram.name}
            description={activeProgram.description}
            difficulty={activeProgram.difficulty}
            durationWeeks={activeProgram.duration_weeks}
            daysPerWeek={activeProgram.days_per_week}
            variant="active"
            onPress={() => router.push(`/program/${activeProgram.id}`)}
          />
        )}

        {/* My Programs Section */}
        {userPrograms.length > 0 && (
          <View style={[styles.section, activeProgram && styles.sectionWithActive]}>
            <SectionHeader title="My Programs" />
            {userPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                name={program.name}
                description={program.description}
                difficulty={program.difficulty}
                durationWeeks={program.duration_weeks}
                daysPerWeek={program.days_per_week}
                variant="user"
                onPress={() => router.push(`/program/${program.id}`)}
                onEdit={() => router.push(`/program/edit/${program.id}`)}
              />
            ))}
          </View>
        )}

        {/* Paused Programs Section */}
        {pausedPrograms.length > 0 && (
          <View style={[styles.section, hasSections && styles.sectionWithActive]}>
            <SectionHeader title="Paused Programs" />
            {pausedPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                name={program.name}
                description={program.description}
                difficulty={program.difficulty}
                durationWeeks={program.duration_weeks}
                daysPerWeek={program.days_per_week}
                variant="paused"
                onPress={() => router.push(`/program/${program.id}`)}
              />
            ))}
          </View>
        )}

        {/* Program Library */}
        <View style={[styles.section, hasSections && styles.sectionWithActive]}>
          <SectionHeader
            title="Program Library"
            trailing={
              <Pressable style={styles.sortButton} onPress={() => setShowSortModal(true)}>
                <Text style={styles.sortButtonText}>{currentSortLabel}</Text>
                <ChevronDown size={16} color={colors.zinc400} />
              </Pressable>
            }
          />

          {sortedPrograms.length > 0 ? (
            sortedPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                name={program.name}
                description={program.description}
                difficulty={program.difficulty}
                durationWeeks={program.duration_weeks}
                daysPerWeek={program.days_per_week}
                isPremium={program.is_premium}
                onPress={() => router.push(`/program/${program.id}`)}
              />
            ))
          ) : (
            <EmptyState
              icon={<Dumbbell size={32} color={colors.zinc500} />}
              title="No Programs Available"
              description="Check back later for new training programs"
            />
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
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
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
                {sortBy === option.value && <Check size={18} color={colors.emerald500} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* FAB - Create Program */}
      <Pressable style={styles.fab} onPress={() => router.push("/program/create")}>
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
