import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { useExercises } from "@/hooks/use-exercises";
import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { Dumbbell, ChevronRight } from "@/components/icons";
import type { Exercise } from "@rota/database";

// Helper to format muscle groups for display
function formatMuscleGroups(groups: string[]): string {
  if (!groups || groups.length === 0) return "";
  return groups
    .map((g) => g.charAt(0).toUpperCase() + g.slice(1))
    .join(", ");
}

// Helper to format equipment for display
function formatEquipment(equipment: string[]): string {
  if (!equipment || equipment.length === 0) return "No equipment";
  return equipment
    .map((e) => e.replace(/_/g, " ").charAt(0).toUpperCase() + e.replace(/_/g, " ").slice(1))
    .join(", ");
}

interface ExerciseItemProps {
  exercise: Exercise;
  onPress: (exercise: Exercise) => void;
}

function ExerciseItem({ exercise, onPress }: ExerciseItemProps) {
  return (
    <Pressable style={styles.exerciseItem} onPress={() => onPress(exercise)}>
      <View style={styles.exerciseIcon}>
        <Dumbbell size={20} color={colors.emerald500} />
      </View>
      <View style={styles.exerciseContent}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseMeta}>
          {formatMuscleGroups(exercise.muscle_groups)}
        </Text>
        <Text style={styles.exerciseEquipment}>
          {formatEquipment(exercise.equipment)}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.zinc600} />
    </Pressable>
  );
}

export function ExercisesList() {
  const router = useRouter();
  const { exercises, isLoading, error, refetch } = useExercises();

  const handleExercisePress = (exercise: Exercise) => {
    router.push(`/exercise/${exercise.id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.emerald500} />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load exercises</Text>
        <Text style={styles.errorDescription}>{error.message}</Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (exercises.length === 0) {
    return (
      <View style={styles.centered}>
        <Dumbbell size={48} color={colors.zinc600} />
        <Text style={styles.emptyText}>No exercises found</Text>
        <Text style={styles.emptyDescription}>
          Exercises will appear here once they are added to the database.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={exercises}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ExerciseItem exercise={item} onPress={handleExercisePress} />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Exercises</Text>
          <Text style={styles.headerSubtitle}>
            {exercises.length} exercises from database
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: colors.zinc400,
  },
  errorText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  errorDescription: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.emerald500,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  retryButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginTop: spacing.md,
  },
  emptyDescription: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.emerald500,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.emeraldAlpha10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
    marginBottom: 2,
  },
  exerciseEquipment: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
  },
});
