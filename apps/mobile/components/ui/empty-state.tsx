import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "card" | "inline";
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "card",
}: EmptyStateProps) {
  return (
    <View style={[styles.container, variant === "card" && styles.card]}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Pressable style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.whiteAlpha5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    textAlign: "center",
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: colors.emerald500,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
  },
  actionButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },
});
