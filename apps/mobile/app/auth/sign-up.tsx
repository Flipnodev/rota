import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/providers/auth-provider";
import { colors } from "@/constants/theme";
import { layout, auth, input, button } from "@/constants/styles";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signUpError } = await signUp(email.trim(), password);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      router.replace("/");
    }
  };

  return (
    <KeyboardAvoidingView
      style={layout.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={auth.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={auth.header}>
          <Text style={auth.title}>Create account</Text>
          <Text style={auth.subtitle}>Start your fitness journey with ROTA</Text>
        </View>

        <View style={auth.form}>
          {error && (
            <View style={auth.errorContainer}>
              <Text style={auth.errorText}>{error}</Text>
            </View>
          )}

          <View style={input.group}>
            <Text style={input.label}>Email</Text>
            <TextInput
              style={input.base}
              placeholder="Enter your email"
              placeholderTextColor={colors.zinc500}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={input.group}>
            <Text style={input.label}>Password</Text>
            <TextInput
              style={input.base}
              placeholder="Enter your password"
              placeholderTextColor={colors.zinc500}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={input.group}>
            <Text style={input.label}>Confirm Password</Text>
            <TextInput
              style={input.base}
              placeholder="Confirm your password"
              placeholderTextColor={colors.zinc500}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <Pressable
            style={[button.primary, loading && button.disabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <Text style={button.primaryText}>Sign Up</Text>
            )}
          </Pressable>
        </View>

        <View style={auth.footer}>
          <Text style={auth.footerText}>Already have an account? </Text>
          <Link href="/auth/sign-in" asChild>
            <Pressable disabled={loading}>
              <Text style={auth.linkText}>Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
