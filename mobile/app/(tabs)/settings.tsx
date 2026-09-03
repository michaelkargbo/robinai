import React, { useState, useEffect } from "react";
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
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import {
  Sliders,
  Server,
  Fingerprint,
  Shield,
  ExternalLink,
  Check,
  CheckCircle2,
  Cpu,
  RefreshCw,
} from "lucide-react-native";
import Colors from "../../constants/colors";
import {
  getApiBaseUrl,
  setCustomApiUrl,
} from "../../services/api";

export default function SettingsScreen() {
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [selectedModel, setSelectedModel] = useState("Robin Auto");
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const models = [
    { id: "Robin Auto", desc: "Dynamic Intelligent Router" },
    { id: "Robin Crypto Pro", desc: "Specialized On-Chain Engine" },
    { id: "Gemini 1.5 Flash", desc: "Fast Google DeepMind Engine" },
    { id: "GPT-4o", desc: "OpenAI Flagship" },
  ];

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
    setConnectionStatus(null);
    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setConnectionStatus("Connected Successfully (HTTP 200)");
      } else {
        setConnectionStatus(`Server responded with HTTP ${res.status}`);
      }
    } catch (err: any) {
      setConnectionStatus("Failed to reach server. Check IP & port 4000.");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleToggleBiometrics = async (val: boolean) => {
    if (val) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Biometrics Unavailable",
          "Face ID or Fingerprint authentication is not set up on this device."
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with Biometrics",
      });

      if (result.success) {
        setBiometricsEnabled(true);
      }
    } else {
      setBiometricsEnabled(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Backend API Configuration */}
      <Text style={styles.sectionTitle}>Backend Connection</Text>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Server size={18} color={Colors.primary} />
          <Text style={styles.cardHeaderText}>API Endpoint URL</Text>
        </View>

        <Text style={styles.cardHint}>
          Point to your RobinAI Express backend (`server.js`). For testing on a
          physical device, use your computer's local Wi-Fi IP.
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

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveUrl}
            activeOpacity={0.7}
          >
            {savedSuccess ? (
              <Check size={14} color={Colors.background} />
            ) : null}
            <Text style={styles.saveBtnText}>
              {savedSuccess ? "Saved!" : "Save Endpoint"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestConnection}
            disabled={testingConnection}
            activeOpacity={0.7}
          >
            <RefreshCw
              size={14}
              color={Colors.text}
              style={testingConnection ? styles.spinning : undefined}
            />
            <Text style={styles.testBtnText}>Test Connection</Text>
          </TouchableOpacity>
        </View>

        {connectionStatus && (
          <Text
            style={[
              styles.statusText,
              {
                color: connectionStatus.includes("Success")
                  ? Colors.primary
                  : Colors.error,
              },
            ]}
          >
            {connectionStatus}
          </Text>
        )}
      </View>

      {/* AI Model Selection */}
      <Text style={styles.sectionTitle}>AI Model Router</Text>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Cpu size={18} color={Colors.primary} />
          <Text style={styles.cardHeaderText}>Select AI Routing Engine</Text>
        </View>

        <View style={{ gap: 8, marginTop: 8 }}>
          {models.map((m) => {
            const isSelected = selectedModel === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.modelRow, isSelected && styles.modelRowSelected]}
                onPress={() => setSelectedModel(m.id)}
                activeOpacity={0.7}
              >
                <View>
                  <Text
                    style={[
                      styles.modelTitle,
                      isSelected && { color: Colors.primary },
                    ]}
                  >
                    {m.id}
                  </Text>
                  <Text style={styles.modelDesc}>{m.desc}</Text>
                </View>
                {isSelected && (
                  <CheckCircle2 size={18} color={Colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Security & Device */}
      <Text style={styles.sectionTitle}>Device & Security</Text>
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Biometric App Lock</Text>
            <Text style={styles.switchSub}>
              Require Face ID / Fingerprint to open RobinAI
            </Text>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={handleToggleBiometrics}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </View>

        <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 14 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Haptic Feedback</Text>
            <Text style={styles.switchSub}>
              Tactile vibrations on key actions and alerts
            </Text>
          </View>
          <Switch
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </View>
      </View>

      {/* About & Legal */}
      <Text style={styles.sectionTitle}>About RobinAI</Text>
      <View style={styles.card}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Platform</Text>
          <Text style={styles.aboutVal}>RobinAI Suite v1.0.0</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Brand Color</Text>
          <Text style={[styles.aboutVal, { color: Colors.primary }]}>
            #B6FF00 (Neon Lime)
          </Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Shared Backend</Text>
          <Text style={styles.aboutVal}>Express + Gemini 1.5</Text>
        </View>

        <TouchableOpacity
          style={styles.legalLink}
          onPress={() => Linking.openURL("https://robinai-eight.vercel.app")}
        >
          <Text style={styles.legalLinkText}>Visit Web Platform</Text>
          <ExternalLink size={12} color={Colors.primary} />
        </TouchableOpacity>
      </View>
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
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 10,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  cardHeaderText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  cardHint: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  saveBtnText: {
    color: Colors.background,
    fontWeight: "700",
    fontSize: 12,
  },
  testBtn: {
    backgroundColor: Colors.secondaryBg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  testBtnText: {
    color: Colors.text,
    fontWeight: "600",
    fontSize: 12,
  },
  spinning: {
    transform: [{ rotate: "45deg" }],
  },
  statusText: {
    fontSize: 11,
    marginTop: 10,
    fontWeight: "600",
  },
  modelRow: {
    backgroundColor: Colors.secondaryBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modelRowSelected: {
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primarySubtle,
  },
  modelTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  modelDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  switchLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  switchSub: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aboutLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  aboutVal: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  legalLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    paddingVertical: 6,
  },
  legalLinkText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
});
