import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { showAlert, showError } from "@/lib/alert";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/theme";
import { layout, header as headerStyles, typography, input, button } from "@/constants/styles";
import { ChevronLeft } from "@/components/icons";
import { useProfile } from "@/hooks/use-profile";

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, isLoading, updateProfile } = useProfile();
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      showError("Error", "Display name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ display_name: displayName.trim() });
      showAlert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Failed to update profile:", error);
      showError("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | null, email: string | null): string => {
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

  const initials = getInitials(displayName || profile?.display_name || null, profile?.email || null);

  return (
    <SafeAreaView style={layout.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={layout.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={headerStyles.containerRow}>
            <Pressable style={headerStyles.backButton} onPress={() => router.back()}>
              <ChevronLeft size={24} color={colors.white} />
            </Pressable>
            <Text style={typography.screenTitle}>Edit Profile</Text>
            <View style={headerStyles.placeholder} />
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Pressable style={styles.changeAvatarButton}>
              <Text style={styles.changeAvatarText}>Change Avatar</Text>
            </Pressable>
            <Text style={typography.caption}>Avatar upload coming soon</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={input.group}>
              <Text style={input.label}>Display Name</Text>
              <TextInput
                style={input.base}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
                placeholderTextColor={colors.zinc600}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={input.group}>
              <Text style={input.label}>Email</Text>
              <View style={[input.base, input.disabled]}>
                <Text style={styles.disabledInputText}>{profile?.email}</Text>
              </View>
              <Text style={typography.caption}>Email cannot be changed</Text>
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            style={[button.primary, isSaving && button.disabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.black} />
            ) : (
              <Text style={button.primaryText}>Save Changes</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.emerald500,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.black,
  },
  changeAvatarButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.zinc900,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
    marginBottom: spacing.sm,
  },
  changeAvatarText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  form: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  disabledInputText: {
    fontSize: fontSize.base,
    color: colors.zinc500,
  },
});
