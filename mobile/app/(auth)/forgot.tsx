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
import { Mail, KeyRound, CheckCircle2 } from "lucide-react-native";
import Colors from "../../constants/colors";
import authService from "../../services/authService";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email.trim() || !newPassword.trim()) {
      setError("Please fill in both email and your new password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    try {
      await authService.resetPassword(email.trim(), newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Password reset failed.");
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
            <KeyRound size={22} color={Colors.background} />
          </View>
          <Text style={styles.brandTitle}>Reset Account Password</Text>
          <Text style={styles.brandSubtitle}>
            Enter your account email and choose a new secure password.
          </Text>
        </View>

        {success ? (
          <View style={styles.successBox}>
            <CheckCircle2 size={32} color={Colors.primary} />
            <Text style={styles.successTitle}>Password Updated!</Text>
            <Text style={styles.successDesc}>
              Your password has been successfully reset. You can now log in with your
              new credentials.
            </Text>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text style={styles.actionBtnText}>Back to Log In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

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
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrap}>
                <KeyRound size={16} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="New secure password"
                  placeholderTextColor={Colors.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, loading && styles.btnDisabled]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.background} />
              ) : (
                <Text style={styles.actionBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
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
  errorBox: {
    backgroundColor: Colors.errorBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 92, 92, 0.4)",
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  actionBtnText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  successBox: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  successTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  successDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
});
