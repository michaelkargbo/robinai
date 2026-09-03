import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react-native";
import Colors from "../../constants/colors";

export default function SafetyScreen() {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (stepIdx: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setCompletedSteps((prev) =>
      prev.includes(stepIdx)
        ? prev.filter((i) => i !== stepIdx)
        : [...prev, stepIdx]
    );
  };

  const steps = [
    {
      title: "1. Cease All Communication",
      desc: "Stop messaging the suspected scammer immediately. Block their username on Telegram, Discord, X, or email.",
    },
    {
      title: "2. Do Not Send Additional Funds",
      desc: "Never send 'gas fees', 'unlock fees', or 'tax fees' to release frozen assets. These are advance-fee tricks.",
    },
    {
      title: "3. Secure Affected Accounts & Passwords",
      desc: "If passwords or emails were shared, immediately change credentials and activate hardware 2FA (e.g. YubiKey / Authenticator).",
    },
    {
      title: "4. Revoke Wallet Permissions Immediately",
      desc: "Disconnect your wallet from all dApps and revoke active ERC-20 / NFT token approvals on Revoke.cash.",
      actionLabel: "Open Revoke.cash",
      actionUrl: "https://revoke.cash",
    },
    {
      title: "5. Preserve Digital Evidence",
      desc: "Take full screenshots of conversations, usernames, contract addresses, and transaction hashes before they are deleted.",
    },
    {
      title: "6. Save On-Chain Transaction Hashes",
      desc: "Record exact transaction IDs, sender/receiver addresses, and timestamps from block explorers.",
    },
    {
      title: "7. Report to Law Enforcement",
      desc: "File a cyber incident report with your local cybercrime division (e.g., IC3 in the US, Action Fraud in the UK) and platform admins.",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Alert Header */}
      <View style={styles.alertBox}>
        <View style={styles.alertHeader}>
          <ShieldAlert size={22} color={Colors.error} />
          <Text style={styles.alertTitle}>Anti-Scam & Emergency Center</Text>
        </View>
        <Text style={styles.alertText}>
          If you believe you have interacted with a suspicious link, malicious
          contract, or fraudulent individual, follow this protocol immediately.
        </Text>
      </View>

      {/* Warning on Fake Recovery Services */}
      <View style={styles.warningBox}>
        <AlertTriangle size={18} color={Colors.warning} />
        <View style={{ flex: 1 }}>
          <Text style={styles.warningTitle}>Beware Fake Recovery Agents</Text>
          <Text style={styles.warningText}>
            Never pay anyone who claims they can 'hack back' or guarantee the
            recovery of stolen crypto. These are secondary recovery scams.
          </Text>
        </View>
      </View>

      {/* Interactive 7-Step Protocol */}
      <Text style={styles.sectionTitle}>Emergency Response Checklist</Text>
      <View style={styles.stepsContainer}>
        {steps.map((s, idx) => {
          const isDone = completedSteps.includes(idx);
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.stepCard, isDone && styles.stepCardDone]}
              onPress={() => toggleStep(idx)}
              activeOpacity={0.8}
            >
              <View style={styles.stepRow}>
                <View
                  style={[
                    styles.checkCircle,
                    isDone && { backgroundColor: Colors.primary },
                  ]}
                >
                  {isDone ? (
                    <CheckCircle2 size={16} color={Colors.background} />
                  ) : (
                    <View style={styles.emptyCircle} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isDone && { textDecorationLine: "line-through", color: Colors.textMuted },
                    ]}
                  >
                    {s.title}
                  </Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>

                  {s.actionUrl && (
                    <TouchableOpacity
                      style={styles.linkButton}
                      onPress={() => Linking.openURL(s.actionUrl!)}
                    >
                      <Text style={styles.linkText}>{s.actionLabel}</Text>
                      <ExternalLink size={12} color={Colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Ask Robin to Analyze Scam */}
      <TouchableOpacity
        style={styles.auditButton}
        onPress={() =>
          router.push({
            pathname: "/chat",
            params: {
              initialPrompt:
                "Is this a scam? I received an unexpected message offering guaranteed profits. Please audit this situation.",
            },
          })
        }
        activeOpacity={0.8}
      >
        <Sparkles size={16} color={Colors.background} />
        <Text style={styles.auditButtonText}>
          Audit a Suspicious Message with Robin
        </Text>
      </TouchableOpacity>
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
    paddingBottom: 36,
  },
  alertBox: {
    backgroundColor: Colors.errorBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 92, 92, 0.35)",
    marginBottom: 14,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  alertTitle: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: "800",
  },
  alertText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  warningBox: {
    backgroundColor: Colors.secondaryBg,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  warningTitle: {
    color: Colors.warning,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  warningText: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  stepsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  stepCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepCardDone: {
    opacity: 0.6,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  emptyCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  stepTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  stepDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  auditButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  auditButtonText: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: "800",
  },
});
