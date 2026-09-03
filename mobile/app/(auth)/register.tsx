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
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { User, Mail, Lock, Sparkles, ArrowRight } from "lucide-react-native";
import Colors from "../../constants/colors";
import { useAuth } from "../../store/AuthContext";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    try {
      await register(email.trim(), password, name.trim());
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandBox}>
          <View style={styles.logoBadge}>
            <Sparkles size={20} color={Colors.background} />
          </View>
          <Text style={styles.brandTitle}>Create RobinAI Account</Text>
          <Text style={styles.brandSubtitle}>
            Unlock unified AI intelligence, saved history across mobile and web,
            and specialized crypto security insights.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrap}>
              <User size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrap}>
              <Mail size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="you@domain.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <Lock size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <>
                <Text style={styles.registerBtnText}>Create Account</Text>
                <ArrowRight size={16} color={Colors.background} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 36,
  },
  brandBox: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  brandTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  brandSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 12,
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
  inputLabel: {
    color: Colors.textSecondary,
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
    paddingVertical: 12,
  },
  registerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  registerBtnText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  loginPrompt: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
});
