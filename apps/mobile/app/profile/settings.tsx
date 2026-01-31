import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { ChevronLeft, ChevronRight, Trash } from "@/components/icons";
import { useSettings, type AppSettings } from "@/hooks/use-settings";
import { useActiveProgram } from "@/hooks/use-active-program";
import { showAlert, showError } from "@/lib/alert";

interface SettingToggle {
  id: keyof AppSettings;
  label: string;
  description: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, isLoading, updateSetting } = useSettings();
  const { activeProgram, stopProgram, progress } = useActiveProgram();
  const [isStoppingProgram, setIsStoppingProgram] = useState(false);

  const notificationSettings: SettingToggle[] = [
    {
      id: "notifications",
      label: "Push Notifications",
      description: "Receive workout reminders and updates",
    },
    {
      id: "workoutReminders",
      label: "Workout Reminders",
      description: "Get reminded on your scheduled workout days",
    },
  ];

  const appSettings: SettingToggle[] = [
    {
      id: "soundEffects",
      label: "Sound Effects",
      description: "Play sounds during workouts",
    },
    {
      id: "hapticFeedback",
      label: "Haptic Feedback",
      description: "Vibration feedback when completing sets",
    },
  ];

  const handleToggle = async (id: keyof AppSettings) => {
    await updateSetting(id, !settings[id]);
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://rota.app/privacy");
  };

  const handleTermsOfService = () => {
    Linking.openURL("https://rota.app/terms");
  };

  const handleStopProgram = () => {
    if (!activeProgram) return;

    showAlert(
      "Stop Program",
      `Are you sure you want to stop "${activeProgram.program.name}"? Your workout history will be preserved, but you'll need to start a new program.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop Program",
          style: "destructive",
          onPress: async () => {
            setIsStoppingProgram(true);
            const result = await stopProgram();
            setIsStoppingProgram(false);

            if (!result.success) {
              showError("Error", result.error || "Failed to stop program");
            }
          },
        },
      ]
    );
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingsCard}>
            {notificationSettings.map((setting, index) => (
              <View
                key={setting.id}
                style={[
                  styles.settingItem,
                  index < notificationSettings.length - 1 && styles.settingItemBorder,
                ]}
              >
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{setting.label}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={settings[setting.id] as boolean}
                  onValueChange={() => handleToggle(setting.id)}
                  trackColor={{ false: colors.zinc700, true: colors.emerald500 }}
                  thumbColor={colors.white}
                />
              </View>
            ))}
          </View>
        </View>

        {/* App Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.settingsCard}>
            {appSettings.map((setting, index) => (
              <View
                key={setting.id}
                style={[
                  styles.settingItem,
                  index < appSettings.length - 1 && styles.settingItemBorder,
                ]}
              >
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{setting.label}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={settings[setting.id] as boolean}
                  onValueChange={() => handleToggle(setting.id)}
                  trackColor={{ false: colors.zinc700, true: colors.emerald500 }}
                  thumbColor={colors.white}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Units Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Units</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Weight Units</Text>
                <Text style={styles.settingDescription}>
                  {settings.useMetric ? "Kilograms (kg)" : "Pounds (lbs)"}
                </Text>
              </View>
              <View style={styles.unitToggle}>
                <Pressable
                  style={[
                    styles.unitButton,
                    settings.useMetric && styles.unitButtonActive,
                  ]}
                  onPress={() => updateSetting("useMetric", true)}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      settings.useMetric && styles.unitButtonTextActive,
                    ]}
                  >
                    kg
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.unitButton,
                    !settings.useMetric && styles.unitButtonActive,
                  ]}
                  onPress={() => updateSetting("useMetric", false)}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      !settings.useMetric && styles.unitButtonTextActive,
                    ]}
                  >
                    lbs
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Active Program Section */}
        {activeProgram && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Program</Text>
            <View style={styles.settingsCard}>
              <View style={styles.programItem}>
                <View style={styles.programInfo}>
                  <Text style={styles.programName}>{activeProgram.program.name}</Text>
                  <Text style={styles.programProgress}>
                    {progress}% complete • Week {Math.min(
                      Math.floor(activeProgram.progress.completed_workouts / activeProgram.program.days_per_week) + 1,
                      activeProgram.program.duration_weeks
                    )} of {activeProgram.program.duration_weeks}
                  </Text>
                </View>
                <Pressable
                  style={styles.stopProgramButton}
                  onPress={handleStopProgram}
                  disabled={isStoppingProgram}
                >
                  {isStoppingProgram ? (
                    <ActivityIndicator size="small" color={colors.error} />
                  ) : (
                    <Trash size={20} color={colors.error} />
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingsCard}>
            <Pressable style={styles.linkItem} onPress={handlePrivacyPolicy}>
              <Text style={styles.linkLabel}>Privacy Policy</Text>
              <ChevronRight size={20} color={colors.zinc600} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.linkItem} onPress={handleTermsOfService}>
              <Text style={styles.linkLabel}>Terms of Service</Text>
              <ChevronRight size={20} color={colors.zinc600} />
            </Pressable>
            <View style={styles.divider} />
            <View style={styles.linkItem}>
              <Text style={styles.linkLabel}>App Version</Text>
              <Text style={styles.linkValue}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Footer Note */}
        <Text style={styles.footerNote}>
          Settings are synced across your devices.
        </Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.zinc900,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
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
  settingsCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.zinc800,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc800,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  unitToggle: {
    flexDirection: "row",
    backgroundColor: colors.zinc800,
    borderRadius: radius.md,
    padding: 2,
  },
  unitButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md - 2,
  },
  unitButtonActive: {
    backgroundColor: colors.emerald500,
  },
  unitButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.zinc400,
  },
  unitButtonTextActive: {
    color: colors.black,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.zinc800,
  },
  linkLabel: {
    fontSize: fontSize.base,
    color: colors.white,
  },
  linkValue: {
    fontSize: fontSize.base,
    color: colors.zinc500,
  },
  footerNote: {
    fontSize: fontSize.xs,
    color: colors.zinc600,
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    lineHeight: 18,
  },
  programItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
    marginBottom: 2,
  },
  programProgress: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },
  stopProgramButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.error + "20",
    alignItems: "center",
    justifyContent: "center",
  },
});
