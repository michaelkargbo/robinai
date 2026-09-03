import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import {
  Server,
  Bell,
  Fingerprint,
  Globe,
  Shield,
  FileText,
  Mail,
  Trash2,
  LogOut,
  RefreshCw,
  Check,
  ChevronRight,
  ExternalLink,
} from "lucide-react-native";
import Colors from "../constants/colors";
import { getApiBaseUrl, setCustomApiUrl } from "../services/api";
import { useAuth } from "../store/AuthContext";

export default function FullSettingsScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connStatus, setConnStatus] = useState<string | null>(null);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleSaveUrl = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setCustomApiUrl(apiUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnStatus(null);
    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setConnStatus("Connected Successfully (HTTP 200)");
      } else {
        setConnStatus(`Server responded with HTTP ${res.status}`);
      }
    } catch {
      setConnStatus("Connection Failed. Check backend server and Wi-Fi IP.");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleToggleBiometrics = async (val: boolean) => {
    if (val) {
      const hasHw = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHw || !isEnrolled) {
        Alert.alert(
          "Biometrics Unavailable",
          "Face ID or Fingerprint is not configured on this device."
        );
        return;
      }
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable App Lock",
      });
      if (res.success) {
        setBiometricsEnabled(true);
      }
    } else {
      setBiometricsEnabled(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your RobinAI account and data? This action cannot be reversed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}
            await logout();
            Alert.alert("Account Deleted", "Your account has been deleted.");
            router.replace("/(tabs)");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Backend API Connection */}
      <Text style={styles.sectionHeader}>Backend Server</Text>
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Server size={18} color={Colors.primary} />
          <Text style={styles.cardTopTitle}>API Endpoint URL</Text>
        </View>
        <Text style={styles.cardDesc}>
          Connects to your RobinAI Express backend (`server.js`). For testing on
          your phone over local Wi-Fi, enter your computer's LAN IP address.
        </Text>
        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://192.168.1.100:4000"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveUrl}>
            {savedSuccess && <Check size={14} color={Colors.background} />}
            <Text style={styles.primaryBtnText}>
              {savedSuccess ? "Saved!" : "Save Endpoint"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={handleTestConnection}
            disabled={testingConnection}
          >
            <RefreshCw size={14} color={Colors.text} />
            <Text style={styles.outlineBtnText}>Test Ping</Text>
          </TouchableOpacity>
        </View>

        {connStatus && (
          <Text
            style={[
              styles.statusText,
              {
                color: connStatus.includes("Success")
                  ? Colors.primary
                  : Colors.error,
              },
            ]}
          >
            {connStatus}
          </Text>
        )}
      </View>

      {/* Preferences & Toggles */}
      <Text style={styles.sectionHeader}>App Preferences</Text>
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Dark Mode Aesthetics</Text>
            <Text style={styles.toggleSub}>RobinAI signature #0A0A0A theme</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </View>

        <View style={[styles.toggleRow, styles.divider]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Push Notifications</Text>
            <Text style={styles.toggleSub}>
              Security alerts, market news, and task updates
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </View>

        <View style={[styles.toggleRow, styles.divider]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Biometric Lock (Face ID)</Text>
            <Text style={styles.toggleSub}>Require biometrics to open app</Text>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={handleToggleBiometrics}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </View>
      </View>

      {/* Legal & About */}
      <Text style={styles.sectionHeader}>About & Legal</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.navRow}
          onPress={() => Linking.openURL("https://robinai-eight.vercel.app")}
        >
          <View style={styles.navRowLeft}>
            <Globe size={16} color={Colors.textSecondary} />
            <Text style={styles.navRowText}>Official Website</Text>
          </View>
          <ExternalLink size={14} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navRow, styles.divider]}
          onPress={() =>
            Alert.alert(
              "Privacy Policy",
              "RobinAI respects your privacy. We never store seed phrases or private keys. Optional API keys and tokens are stored encrypted via iOS Keychain / Android Keystore."
            )
          }
        >
          <View style={styles.navRowLeft}>
            <Shield size={16} color={Colors.textSecondary} />
            <Text style={styles.navRowText}>Privacy Policy</Text>
          </View>
          <ChevronRight size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navRow, styles.divider]}
          onPress={() =>
            Alert.alert(
              "Terms of Service",
              "RobinAI provides educational and problem-solving assistance. Crypto analyses are informative and not financial advice."
            )
          }
        >
          <View style={styles.navRowLeft}>
            <FileText size={16} color={Colors.textSecondary} />
            <Text style={styles.navRowText}>Terms of Service</Text>
          </View>
          <ChevronRight size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navRow, styles.divider]}
          onPress={() => Linking.openURL("mailto:support@robinai.com")}
        >
          <View style={styles.navRowLeft}>
            <Mail size={16} color={Colors.textSecondary} />
            <Text style={styles.navRowText}>Contact Support</Text>
          </View>
          <ChevronRight size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Account Danger Zone */}
      {isAuthenticated && (
        <>
          <Text style={styles.sectionHeader}>Account Actions</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.navRow} onPress={handleDeleteAccount}>
              <View style={styles.navRowLeft}>
                <Trash2 size={16} color={Colors.error} />
                <Text style={[styles.navRowText, { color: Colors.error }]}>
                  Delete Account & Data
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  sectionHeader: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTopTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  cardDesc: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  input: {
    backgroundColor: Colors.input,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 13,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: "700",
  },
  outlineBtn: {
    backgroundColor: Colors.secondaryBg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  outlineBtnText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  toggleLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  toggleSub: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  navRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  navRowText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
});
