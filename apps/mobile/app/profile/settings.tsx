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
import { layout, header as headerStyles, typography, card, section as sectionStyles, listItem } from "@/constants/styles";
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
      <SafeAreaView style={layout.container} edges={["top"]}>
        <View style={layout.centered}>
          <ActivityIndicator size="large" color={colors.emerald500} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={layout.container} edges={["top"]}>
      <ScrollView style={layout.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={headerStyles.containerRow}>
          <Pressable style={headerStyles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.white} />
          </Pressable>
          <Text style={typography.screenTitle}>Settings</Text>
          <View style={headerStyles.placeholder} />
        </View>

        {/* Notifications Section */}
        <View style={sectionStyles.container}>
          <Text style={sectionStyles.title}>Notifications</Text>
          <View style={styles.settingsCard}>
            {notificationSettings.map((setting, index) => (
              <View
                key={setting.id}
                style={[
                  listItem.base,
                  index < notificationSettings.length - 1 && listItem.bordered,
                ]}
              >
                <View style={listItem.content}>
                  <Text style={listItem.title}>{setting.label}</Text>
                  <Text style={listItem.subtitle}>{setting.description}</Text>
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
        <View style={sectionStyles.container}>
          <Text style={sectionStyles.title}>App Preferences</Text>
          <View style={styles.settingsCard}>
            {appSettings.map((setting, index) => (
              <View
                key={setting.id}
                style={[
                  listItem.base,
                  index < appSettings.length - 1 && listItem.bordered,
                ]}
              >
                <View style={listItem.content}>
                  <Text style={listItem.title}>{setting.label}</Text>
                  <Text style={listItem.subtitle}>{setting.description}</Text>
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
        <View style={sectionStyles.container}>
          <Text style={sectionStyles.title}>Units</Text>
          <View style={styles.settingsCard}>
            <View style={listItem.base}>
              <View style={listItem.content}>
                <Text style={listItem.title}>Weight Units</Text>
                <Text style={listItem.subtitle}>
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
          <View style={sectionStyles.container}>
            <Text style={sectionStyles.title}>Active Program</Text>
            <View style={styles.settingsCard}>
              <View style={listItem.base}>
                <View style={listItem.content}>
                  <Text style={listItem.title}>{activeProgram.program.name}</Text>
                  <Text style={listItem.subtitle}>
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
        <View style={sectionStyles.container}>
          <Text style={sectionStyles.title}>About</Text>
          <View style={styles.settingsCard}>
            <Pressable style={[listItem.base, layout.rowSpaced]} onPress={handlePrivacyPolicy}>
              <Text style={typography.body}>Privacy Policy</Text>
              <ChevronRight size={20} color={colors.zinc600} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={[listItem.base, layout.rowSpaced]} onPress={handleTermsOfService}>
              <Text style={typography.body}>Terms of Service</Text>
              <ChevronRight size={20} color={colors.zinc600} />
            </Pressable>
            <View style={styles.divider} />
            <View style={[listItem.base, layout.rowSpaced]}>
              <Text style={typography.body}>App Version</Text>
              <Text style={typography.bodySm}>1.0.0</Text>
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

// Only screen-specific styles remain
const styles = StyleSheet.create({
  settingsCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.zinc800,
    overflow: "hidden",
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
  divider: {
    height: 1,
    backgroundColor: colors.zinc800,
  },
  footerNote: {
    fontSize: fontSize.xs,
    color: colors.zinc600,
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    lineHeight: 18,
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
