import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { showAlert, showError } from "@/lib/alert";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Calendar,
  ChevronRight,
  Settings,
  Target,
  TrendingUp,
  User,
  Dumbbell,
} from "@/components/icons";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "@/constants/theme";
import { useProfile } from "@/hooks/use-profile";
import { useWorkoutLogs } from "@/hooks/use-workout-logs";
import { useActiveProgram } from "@/hooks/use-active-program";
import { useAuth } from "@/providers/auth-provider";

interface OnboardingData {
  fitness_goal?: string;
  experience_level?: string;
  available_equipment?: string;
  preferred_schedule?: string;
}

const GOAL_LABELS: Record<string, string> = {
  strength: "Build Strength",
  muscle: "Build Muscle",
  endurance: "Improve Endurance",
  health: "General Health",
};

const SCHEDULE_LABELS: Record<string, string> = {
  "2": "2 days/week",
  "3": "3 days/week",
  "4": "4 days/week",
  "5": "5 days/week",
  "6": "6 days/week",
};

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

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "??";
}

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, isLoading: profileLoading } = useProfile();
  const { stats, isLoading: logsLoading } = useWorkoutLogs();
  const { activeProgram, isLoading: programLoading } = useActiveProgram();
  const { signOut, loading: authLoading } = useAuth();

  const isLoading = profileLoading || logsLoading || programLoading;

  // Get onboarding data
  const onboardingData = profile?.onboarding_data as OnboardingData | null;
  const currentGoal = onboardingData?.fitness_goal
    ? GOAL_LABELS[onboardingData.fitness_goal] || onboardingData.fitness_goal
    : null;
  const currentSchedule = onboardingData?.preferred_schedule
    ? SCHEDULE_LABELS[onboardingData.preferred_schedule] || `${onboardingData.preferred_schedule} days/week`
    : null;

  const handleSignOut = async () => {
    showAlert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await signOut();
            if (error) {
              showError("Error", "Failed to sign out. Please try again.");
            } else {
              router.replace("/auth");
            }
          } catch (err) {
            showError("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.emerald500} />
        </View>
      </SafeAreaView>
    );
  }

  const displayName =
    profile?.display_name || profile?.email?.split("@")[0] || "User";
  const email = profile?.email || "";
  const initials = getInitials(
    profile?.display_name || null,
    profile?.email || null,
  );

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
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.thisMonth}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Current Program & Goals */}
        {(activeProgram || currentGoal || currentSchedule) && (
          <View style={styles.currentInfoCard}>
            {activeProgram && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Dumbbell size={16} color={colors.emerald500} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Current Program</Text>
                  <Text style={styles.infoValue}>{activeProgram.program?.name}</Text>
                </View>
              </View>
            )}
            {currentGoal && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Target size={16} color={colors.emerald500} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Fitness Goal</Text>
                  <Text style={styles.infoValue}>{currentGoal}</Text>
                </View>
              </View>
            )}
            {currentSchedule && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Calendar size={16} color={colors.emerald500} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Training Schedule</Text>
                  <Text style={styles.infoValue}>{currentSchedule}</Text>
                </View>
              </View>
            )}
          </View>
        )}

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
                  onPress={() => router.push(item.route as any)}
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
        <Pressable
          style={styles.logoutButton}
          onPress={handleSignOut}
          disabled={authLoading}
        >
          <Text style={styles.logoutText}>
            {authLoading ? "Signing out..." : "Sign Out"}
          </Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  currentInfoCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.emeraldAlpha10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
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
