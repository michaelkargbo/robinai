import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react-native";
import Colors from "../../constants/colors";
import { useAuth } from "../../store/AuthContext";

export default function SignInScreen() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    try {
      if (mode === "signin") {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, name.trim());
      }
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.topNavTitle}>RobinAI</Text>
          <TouchableOpacity onPress={handleGuestContinue}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Header */}
          <View style={styles.brandHero}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logoImage}
            />
            <Text style={styles.heroTitle}>
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </Text>
            <Text style={styles.heroSub}>
              {mode === "signin"
                ? "Sign in to synchronize your chat history, on-chain intelligence, and settings with the RobinAI web platform."
                : "Join RobinAI for intelligent general assistance and real-time Web3 & crypto security intelligence."}
            </Text>
          </View>

          {/* Segmented Mode Switcher */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                mode === "signin" && styles.segmentBtnActive,
              ]}
              onPress={() => {
                setMode("signin");
                setError(null);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentBtnText,
                  mode === "signin" && styles.segmentBtnTextActive,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentBtn,
                mode === "signup" && styles.segmentBtnActive,
              ]}
              onPress={() => {
                setMode("signup");
                setError(null);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentBtnText,
                  mode === "signup" && styles.segmentBtnTextActive,
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.form}>
            {mode === "signup" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrap}>
                  <User size={18} color={Colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor={Colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Mail size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                {mode === "signin" && (
                  <TouchableOpacity onPress={() => router.push("/(auth)/forgot")}>
                    <Text style={styles.forgotLink}>Forgot password?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputWrap}>
                <Lock size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={Colors.textMuted} />
                  ) : (
                    <Eye size={18} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.background} />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {mode === "signin" ? "Sign In to RobinAI" : "Create Account"}
                  </Text>
                  <ArrowRight size={16} color={Colors.background} />
                </>
              )}
            </TouchableOpacity>

            {/* Guest / Continue without login */}
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={handleGuestContinue}
              activeOpacity={0.7}
            >
              <Text style={styles.guestBtnText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          {/* Social login style divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Quick SSO Options */}
          <View style={styles.ssoRow}>
            <TouchableOpacity
              style={styles.ssoBtn}
              onPress={handleGuestContinue}
              activeOpacity={0.7}
            >
              <Text style={styles.ssoBtnText}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ssoBtn}
              onPress={handleGuestContinue}
              activeOpacity={0.7}
            >
              <Text style={styles.ssoBtnText}>Google</Text>
            </TouchableOpacity>
          </View>

          {/* Security & Disclaimer Footer */}
          <View style={styles.footerNote}>
            <ShieldCheck size={14} color={Colors.primary} />
            <Text style={styles.footerText}>
              RobinAI uses end-to-end encryption. Never share your recovery phrases or private keys.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.secondaryBg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  topNavTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  skipText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 8,
  },
  content: {
    padding: 24,
    paddingTop: 28,
  },
  brandHero: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
    marginBottom: 16,
    backgroundColor: Colors.secondaryBg,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  heroSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 10,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: Colors.secondaryBg,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  segmentBtnTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: Colors.errorBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 92, 92, 0.4)",
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  forgotLink: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    paddingVertical: 13,
  },
  eyeBtn: {
    padding: 4,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  guestBtn: {
    paddingVertical: 10,
    alignItems: "center",
  },
  guestBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
  },
  ssoRow: {
    flexDirection: "row",
    gap: 12,
  },
  ssoBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ssoBtnText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 28,
    paddingHorizontal: 20,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 15,
  },
});
