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

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email.trim(), password);

    if (signInError) {
      setError(signInError.message);
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
          <Text style={auth.title}>Welcome back</Text>
          <Text style={auth.subtitle}>Sign in to continue your fitness journey</Text>
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

          <Pressable
            style={[button.primary, loading && button.disabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <Text style={button.primaryText}>Sign In</Text>
            )}
          </Pressable>
        </View>

        <View style={auth.footer}>
          <Text style={auth.footerText}>Don't have an account? </Text>
          <Link href="/auth/sign-up" asChild>
            <Pressable disabled={loading}>
              <Text style={auth.linkText}>Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
