import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { ChevronRight, Star, Pause, Edit } from "@/components/icons";
import { Badge } from "./badge";

type ProgramCardVariant = "default" | "active" | "paused" | "user";

interface ProgramCardProps {
  name: string;
  description?: string | null;
  difficulty: string;
  durationWeeks: number;
  daysPerWeek: number;
  variant?: ProgramCardVariant;
  isPremium?: boolean;
  onPress: () => void;
  onEdit?: () => void;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function ProgramCard({
  name,
  description,
  difficulty,
  durationWeeks,
  daysPerWeek,
  variant = "default",
  isPremium = false,
  onPress,
  onEdit,
}: ProgramCardProps) {
  const cardStyle = [
    styles.card,
    variant === "active" && styles.cardActive,
    variant === "paused" && styles.cardPaused,
    variant === "user" && styles.cardUser,
    isPremium && styles.cardPremium,
  ];

  return (
    <Pressable style={cardStyle} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.name,
              variant === "active" && styles.nameActive,
            ]}
          >
            {name}
          </Text>
          {variant === "active" && (
            <Badge label="CURRENT" variant="success" />
          )}
          {variant === "paused" && (
            <Badge
              label="PAUSED"
              variant="warning"
              icon={<Pause size={10} color={colors.amber500} />}
            />
          )}
          {isPremium && (
            <Badge
              label="PREMIUM"
              variant="premium"
              icon={<Star size={10} color={colors.amber500} />}
            />
          )}
          {variant === "user" && onEdit && (
            <Pressable
              style={styles.editButton}
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit size={12} color={colors.zinc300} />
            </Pressable>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {description || "No description"}
        </Text>

        <View style={styles.meta}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>
              {capitalizeFirst(difficulty)}
            </Text>
          </View>
          <Text style={styles.duration}>
            {durationWeeks} weeks · {daysPerWeek} days/week
          </Text>
        </View>
      </View>

      <ChevronRight
        size={20}
        color={variant === "active" ? colors.emerald500 : colors.zinc600}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  cardActive: {
    borderColor: colors.emerald500,
    backgroundColor: colors.emeraldAlpha10,
  },
  cardPaused: {
    borderColor: colors.amber500 + "40",
    opacity: 0.85,
  },
  cardUser: {
    borderColor: colors.zinc700,
  },
  cardPremium: {
    borderColor: colors.amber500,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 4,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  nameActive: {
    color: colors.emerald500,
  },
  editButton: {
    padding: spacing.xs,
    backgroundColor: colors.zinc800,
    borderRadius: radius.sm,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    marginBottom: spacing.sm,
  },
  meta: {
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
  duration: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
  },
});
