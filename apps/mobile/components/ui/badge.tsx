import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "premium"
  | "info"
  | "muted";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.zinc800, text: colors.zinc400 },
  success: { bg: colors.emeraldAlpha20, text: colors.emerald500 },
  warning: { bg: colors.amber500 + "20", text: colors.amber500 },
  premium: { bg: colors.amber500 + "20", text: colors.amber500 },
  info: { bg: colors.zinc700, text: colors.zinc300 },
  muted: { bg: colors.whiteAlpha5, text: colors.zinc400 },
};

export function Badge({ label, variant = "default", icon, size = "sm" }: BadgeProps) {
  const colorStyle = variantStyles[variant];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorStyle.bg },
        size === "md" && styles.containerMd,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.label,
          { color: colorStyle.text },
          size === "md" && styles.labelMd,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  containerMd: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  icon: {
    marginRight: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  labelMd: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: 0,
  },
});
