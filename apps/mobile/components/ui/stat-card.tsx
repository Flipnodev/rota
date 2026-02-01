import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

export function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
  iconContainer: {
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.sm,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: spacing.xs,
  },
});
