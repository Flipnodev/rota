import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fontSize, fontWeight } from "@/constants/theme";

interface SectionHeaderProps {
  title: string;
  trailing?: React.ReactNode;
}

export function SectionHeader({ title, trailing }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {trailing && <View style={styles.trailing}>{trailing}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  trailing: {
    flexShrink: 0,
  },
});
