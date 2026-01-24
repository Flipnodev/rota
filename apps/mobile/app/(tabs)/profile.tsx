import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import {
  User,
  Settings,
  Target,
  TrendingUp,
  ChevronRight,
  Calendar,
} from "@/components/icons";

const MENU_ITEMS = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Edit Profile", route: "/profile/edit" },
      { icon: Target, label: "Goals", route: "/profile/goals" },
      { icon: Calendar, label: "Workout Schedule", route: "/profile/schedule" },
    ],
  },
  {
    title: "App",
    items: [
      { icon: Settings, label: "Settings", route: "/profile/settings" },
      { icon: TrendingUp, label: "Statistics", route: "/profile/statistics" },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>john@example.com</Text>
          </View>
          <Pressable style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>127</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Programs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>89</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_ITEMS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.label}
                  style={[
                    styles.menuItem,
                    index < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => {
                    // Navigation placeholder
                  }}
                >
                  <View style={styles.menuItemIcon}>
                    <item.icon size={20} color={colors.zinc400} />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <ChevronRight size={20} color={colors.zinc600} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <Pressable style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>

        {/* App Version */}
        <Text style={styles.version}>ROTA v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.emerald500,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.black,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.whiteAlpha5,
    borderRadius: radius.md,
  },
  editButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.zinc800,
    marginVertical: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.zinc500,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.zinc800,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc800,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.whiteAlpha5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.white,
  },
  logoutButton: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.zinc800,
    marginBottom: spacing.md,
  },
  logoutText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.error,
  },
  version: {
    fontSize: fontSize.xs,
    color: colors.zinc600,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
});
