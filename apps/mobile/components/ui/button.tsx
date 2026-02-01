import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  PressableProps,
} from "react-native";
import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<
  ButtonVariant,
  { bg: string; bgPressed: string; text: string; border?: string }
> = {
  primary: {
    bg: colors.emerald500,
    bgPressed: colors.emerald600,
    text: colors.black,
  },
  secondary: {
    bg: colors.zinc800,
    bgPressed: colors.zinc700,
    text: colors.white,
    border: colors.zinc700,
  },
  danger: {
    bg: "rgba(239, 68, 68, 0.1)",
    bgPressed: "rgba(239, 68, 68, 0.2)",
    text: colors.error,
    border: colors.error,
  },
  ghost: {
    bg: "transparent",
    bgPressed: colors.whiteAlpha5,
    text: colors.zinc400,
  },
};

const sizeStyles: Record<ButtonSize, { paddingV: number; paddingH: number; fontSize: number }> = {
  sm: { paddingV: spacing.xs, paddingH: spacing.sm, fontSize: fontSize.sm },
  md: { paddingV: spacing.md, paddingH: spacing.lg, fontSize: fontSize.base },
  lg: { paddingV: spacing.lg, paddingH: spacing.xl, fontSize: fontSize.lg },
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = true,
  ...pressableProps
}: ButtonProps) {
  const colorStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? colorStyle.bgPressed : colorStyle.bg,
          paddingVertical: sizeStyle.paddingV,
          paddingHorizontal: sizeStyle.paddingH,
          borderColor: colorStyle.border || "transparent",
          borderWidth: colorStyle.border ? 1 : 0,
        },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      disabled={disabled || loading}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={colorStyle.text}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === "left" && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.label,
              { color: colorStyle.text, fontSize: sizeStyle.fontSize },
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === "right" && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: fontWeight.semibold,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});
