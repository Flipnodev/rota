import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { ChevronLeft, ChevronRight } from "@/components/icons";

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  value: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();

  // Local state for settings (these would normally be persisted)
  const [notifications, setNotifications] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [useMetric, setUseMetric] = useState(true);

  const toggleSettings: SettingToggle[] = [
    {
      id: "notifications",
      label: "Push Notifications",
      description: "Receive workout reminders and updates",
      value: notifications,
    },
    {
      id: "workoutReminders",
      label: "Workout Reminders",
      description: "Get reminded on your scheduled workout days",
      value: workoutReminders,
    },
    {
      id: "soundEffects",
      label: "Sound Effects",
      description: "Play sounds during workouts",
      value: soundEffects,
    },
    {
      id: "hapticFeedback",
      label: "Haptic Feedback",
      description: "Vibration feedback when completing sets",
      value: hapticFeedback,
    },
  ];

  const handleToggle = (id: string) => {
    switch (id) {
      case "notifications":
        setNotifications(!notifications);
        break;
      case "workoutReminders":
        setWorkoutReminders(!workoutReminders);
        break;
      case "soundEffects":
        setSoundEffects(!soundEffects);
        break;
      case "hapticFeedback":
        setHapticFeedback(!hapticFeedback);
        break;
    }
  };

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
            {toggleSettings.slice(0, 2).map((setting, index) => (
              <View
                key={setting.id}
                style={[
                  styles.settingItem,
                  index < 1 && styles.settingItemBorder,
                ]}
              >
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{setting.label}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={setting.value}
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
            {toggleSettings.slice(2).map((setting, index) => (
              <View
                key={setting.id}
                style={[
                  styles.settingItem,
                  index < 1 && styles.settingItemBorder,
                ]}
              >
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{setting.label}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={setting.value}
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
                  {useMetric ? "Kilograms (kg)" : "Pounds (lbs)"}
                </Text>
              </View>
              <View style={styles.unitToggle}>
                <Pressable
                  style={[
                    styles.unitButton,
                    useMetric && styles.unitButtonActive,
                  ]}
                  onPress={() => setUseMetric(true)}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      useMetric && styles.unitButtonTextActive,
                    ]}
                  >
                    kg
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.unitButton,
                    !useMetric && styles.unitButtonActive,
                  ]}
                  onPress={() => setUseMetric(false)}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      !useMetric && styles.unitButtonTextActive,
                    ]}
                  >
                    lbs
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingsCard}>
            <Pressable style={styles.linkItem}>
              <Text style={styles.linkLabel}>Privacy Policy</Text>
              <ChevronRight size={20} color={colors.zinc600} />
            </Pressable>
            <View style={styles.settingItemBorder} />
            <Pressable style={styles.linkItem}>
              <Text style={styles.linkLabel}>Terms of Service</Text>
              <ChevronRight size={20} color={colors.zinc600} />
            </Pressable>
            <View style={styles.settingItemBorder} />
            <View style={styles.linkItem}>
              <Text style={styles.linkLabel}>App Version</Text>
              <Text style={styles.linkValue}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Footer Note */}
        <Text style={styles.footerNote}>
          Settings are stored locally on your device. Some settings may require app restart to take effect.
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
});
