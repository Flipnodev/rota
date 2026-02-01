import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fontSize, radius } from "@/constants/theme";

interface ProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
  height?: number;
  variant?: "default" | "slim";
}

export function ProgressBar({
  progress,
  showLabel = false,
  height = 4,
  variant = "default",
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            { width: `${clampedProgress}%`, height },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>{clampedProgress}% complete</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  track: {
    backgroundColor: colors.zinc800,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    backgroundColor: colors.emerald500,
    borderRadius: radius.full,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: spacing.sm,
  },
});
