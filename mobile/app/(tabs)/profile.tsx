import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  User,
  Crown,
  Settings as SettingsIcon,
  LogOut,
  Trash2,
  Edit2,
  ChevronRight,
  Shield,
  Activity,
  Zap,
} from "lucide-react-native";
import Colors from "../../constants/colors";
import { useAuth } from "../../store/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, isAuthenticated, logout, updateProfile } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(profile?.name || "Robin User");

  const isPro = profile?.accountType === "pro";

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of RobinAI?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch {}
          await logout();
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    await updateProfile(editName.trim());
    setEditModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <User size={36} color={Colors.primary} />
        </View>

        <View style={{ alignItems: "center", gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={styles.userName}>
              {isAuthenticated ? profile?.name || "Robin User" : "Guest User"}
            </Text>
            {isAuthenticated && (
              <TouchableOpacity
                onPress={() => {
                  setEditName(profile?.name || "");
                  setEditModalVisible(true);
                }}
              >
                <Edit2 size={14} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userEmail}>
            {isAuthenticated ? user?.email : "Local offline session"}
          </Text>

          <View
            style={[
              styles.tierBadge,
              isPro ? styles.tierBadgePro : styles.tierBadgeFree,
            ]}
          >
            <Crown size={12} color={isPro ? Colors.background : Colors.primary} />
            <Text
              style={[
                styles.tierBadgeText,
                isPro ? styles.tierTextPro : styles.tierTextFree,
              ]}
            >
              {isPro ? "PRO SUBSCRIBER" : "FREE PLAN"}
            </Text>
          </View>
        </View>
      </View>

      {/* Subscription Action Tile */}
      <TouchableOpacity
        style={styles.upgradeCard}
        onPress={() => router.push("/subscription")}
        activeOpacity={0.8}
      >
        <View style={styles.upgradeHeader}>
          <Zap size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.upgradeTitle}>
              {isPro ? "Manage RobinAI Pro" : "Upgrade to RobinAI Pro"}
            </Text>
            <Text style={styles.upgradeSubtitle}>
              {isPro
                ? "Active Plan: Unlimited queries & VIP deep reasoning."
                : "Unlock unlimited queries, multi-model routing & zero queue."}
            </Text>
          </View>
          <ChevronRight size={18} color={Colors.primary} />
        </View>
      </TouchableOpacity>

      {/* Usage Analytics */}
      <Text style={styles.sectionTitle}>Usage & Account Limits</Text>
      <View style={styles.card}>
        <View style={styles.usageRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Activity size={16} color={Colors.primary} />
            <Text style={styles.usageLabel}>Daily AI Queries</Text>
          </View>
          <Text style={styles.usageVal}>
            {isPro ? "Unlimited" : `${profile?.queriesUsed || 14} / 50`}
          </Text>
        </View>

        <View style={styles.progressBarWrap}>
          <View
            style={[
              styles.progressBarFill,
              { width: isPro ? "100%" : "28%" },
            ]}
          />
        </View>

        <View style={styles.usageRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Shield size={16} color={Colors.primary} />
            <Text style={styles.usageLabel}>Crypto Threat Screener</Text>
          </View>
          <Text style={styles.usageVal}>Active & Enabled</Text>
        </View>
      </View>

      {/* Quick Menu Options */}
      <Text style={styles.sectionTitle}>Preferences & System</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => router.push("/settings")}
        >
          <View style={styles.menuRowLeft}>
            <SettingsIcon size={18} color={Colors.textSecondary} />
            <Text style={styles.menuRowText}>Settings & AI Engine</Text>
          </View>
          <ChevronRight size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        {isAuthenticated ? (
          <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
            <View style={styles.menuRowLeft}>
              <LogOut size={18} color={Colors.error} />
              <Text style={[styles.menuRowText, { color: Colors.error }]}>
                Log Out
              </Text>
            </View>
            <ChevronRight size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push("/(auth)/login")}
          >
            <View style={styles.menuRowLeft}>
              <User size={18} color={Colors.primary} />
              <Text style={[styles.menuRowText, { color: Colors.primary }]}>
                Log In to Sync Account
              </Text>
            </View>
            <ChevronRight size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your full name"
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 16,
  },
  userCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.secondaryBg,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  userName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  userEmail: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  tierBadgeFree: {
    backgroundColor: Colors.primarySubtle,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  tierBadgePro: {
    backgroundColor: Colors.primary,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  tierTextFree: {
    color: Colors.primary,
  },
  tierTextPro: {
    color: Colors.background,
  },
  upgradeCard: {
    backgroundColor: Colors.secondaryBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  upgradeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  upgradeTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  upgradeSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  usageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  usageLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  usageVal: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarWrap: {
    height: 6,
    backgroundColor: Colors.secondaryBg,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuRowText: {
    color: Colors.text,
    fontSize: 13.5,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  modalInput: {
    backgroundColor: Colors.input,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancel: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  modalSave: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalSaveText: {
    color: Colors.background,
    fontWeight: "700",
    fontSize: 13,
  },
});
