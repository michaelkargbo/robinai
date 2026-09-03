import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Crown,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  BrainCircuit,
  Lock,
} from "lucide-react-native";
import Colors from "../../constants/colors";
import { PLANS } from "../../services/subscriptionService";
import subscriptionService from "../../services/subscriptionService";
import { useAuth } from "../../store/AuthContext";

export default function SubscriptionScreen() {
  const router = useRouter();
  const { profile, refreshProfile, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<"pro_monthly" | "pro_yearly">("pro_monthly");
  const [loading, setLoading] = useState(false);

  const isPro = profile?.accountType === "pro";

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Account Required",
        "Please create a free account or log in to manage your subscription.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => router.push("/(auth)/login") },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    try {
      // In production, triggers RevenueCat / StoreKit on iOS or Google Play Billing on Android.
      // Here, calls our shared backend /api/user/subscription endpoint to update the account status:
      const storeType = Platform.OS === "ios" ? "apple" : "google";
      await subscriptionService.upgradePlan(selectedPlan, storeType);
      await refreshProfile();

      Alert.alert(
        "Welcome to RobinAI Pro!",
        "Your subscription has been activated successfully across both your mobile device and web browser.",
        [{ text: "Great", onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert("Subscription Error", err.message || "Unable to complete purchase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Header */}
      <View style={styles.heroBox}>
        <View style={styles.crownCircle}>
          <Crown size={28} color={Colors.background} />
        </View>
        <Text style={styles.heroTitle}>Upgrade to RobinAI Pro</Text>
        <Text style={styles.heroSubtitle}>
          Unlock high-speed reasoning, multi-model routing, and unlimited Web3 & crypto intelligence.
        </Text>
      </View>

      {/* Plan Selectors */}
      <View style={styles.plansContainer}>
        {PLANS.filter((p) => p.id !== "free").map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, isSelected && styles.planCardSelected]}
              onPress={() => setSelectedPlan(plan.id as any)}
              activeOpacity={0.8}
            >
              {plan.badge && (
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{plan.badge}</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
                <Text style={styles.planPrice}>{plan.price}</Text>
              </View>

              <View style={styles.featuresList}>
                {plan.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Check size={14} color={Colors.primary} />
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Security & Store Compliance Notice */}
      <View style={styles.complianceNotice}>
        <Lock size={14} color={Colors.textMuted} />
        <Text style={styles.complianceText}>
          Subscribed accounts sync immediately with the RobinAI website. In-App
          Purchases comply with Apple App Store and Google Play Store policies.
          Cancel anytime via App Store / Play Store subscription settings.
        </Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.subscribeBtn, loading && styles.btnDisabled]}
        onPress={handleSubscribe}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.background} />
        ) : (
          <>
            <Zap size={18} color={Colors.background} />
            <Text style={styles.subscribeBtnText}>
              {isPro ? "Update Subscription" : "Activate RobinAI Pro"}
            </Text>
          </>
        )}
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
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  heroBox: {
    alignItems: "center",
    marginBottom: 8,
  },
  crownCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  plansContainer: {
    gap: 14,
  },
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
  planCardSelected: {
    borderColor: Colors.primaryBorder,
    backgroundColor: "rgba(182, 255, 0, 0.04)",
  },
  planBadge: {
    position: "absolute",
    top: 12,
    right: 14,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planBadgeText: {
    color: Colors.background,
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  planName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  planPeriod: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  planPrice: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  featuresList: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  complianceNotice: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    backgroundColor: Colors.secondaryBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  complianceText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  subscribeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  subscribeBtnText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
