import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { ChevronRight } from "@/components/icons";

interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "default" | "card";
}

export function ListItem({
  title,
  subtitle,
  icon,
  trailing,
  showChevron = false,
  onPress,
  disabled = false,
  variant = "default",
}: ListItemProps) {
  const content = (
    <>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <Text style={[styles.title, disabled && styles.titleDisabled]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      {trailing && <View style={styles.trailing}>{trailing}</View>}
      {showChevron && !trailing && (
        <ChevronRight size={20} color={disabled ? colors.zinc700 : colors.zinc500} />
      )}
    </>
  );

  const containerStyle = [
    styles.container,
    variant === "card" && styles.card,
    disabled && styles.disabled,
  ];

  if (onPress && !disabled) {
    return (
      <Pressable style={containerStyle} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.whiteAlpha5,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  titleDisabled: {
    color: colors.zinc500,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    marginTop: 2,
  },
  trailing: {
    flexShrink: 0,
  },
});
