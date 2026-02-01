import { View, Pressable, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing, radius } from "@/constants/theme";

type CardVariant = "default" | "highlighted" | "success" | "warning" | "muted";

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles: Record<CardVariant, { bg: string; border: string }> = {
  default: { bg: colors.zinc900, border: colors.zinc800 },
  highlighted: { bg: colors.zinc900, border: colors.zinc700 },
  success: { bg: colors.emeraldAlpha10, border: colors.emerald500 },
  warning: { bg: colors.zinc900, border: colors.amber500 + "40" },
  muted: { bg: colors.zinc900, border: colors.zinc800 },
};

const paddingStyles: Record<string, number> = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
};

export function Card({
  children,
  variant = "default",
  onPress,
  style,
  padding = "md",
}: CardProps) {
  const colorStyle = variantStyles[variant];
  const paddingValue = paddingStyles[padding];

  const containerStyle = [
    styles.container,
    {
      backgroundColor: colorStyle.bg,
      borderColor: colorStyle.border,
      padding: paddingValue,
    },
    variant === "muted" && styles.muted,
    style,
  ];

  if (onPress) {
    return (
      <Pressable style={containerStyle} onPress={onPress}>
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  muted: {
    opacity: 0.85,
  },
});
