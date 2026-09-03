import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  SafeAreaView,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Menu,
  ArrowUp,
  Plus,
  Sparkles,
  ShieldAlert,
  TrendingUp,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  User,
  Clock,
  Zap,
} from "lucide-react-native";
import Colors from "../../constants/colors";
import { FALLBACK_MARKETS } from "../../services/api";
import { useAuth } from "../../store/AuthContext";
import { useChat } from "../../store/ChatContext";

export default function HomeScreen() {
  const router = useRouter();
  const { profile, isAuthenticated } = useAuth();
  const { conversations, selectConversation, sendMessage } = useChat();
  const [quickInput, setQuickInput] = useState("");

  const handleQuickSubmit = () => {
    if (!quickInput.trim()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const text = quickInput.trim();
    setQuickInput("");
    router.push({
      pathname: "/chat",
      params: { initialPrompt: text },
    });
  };

  const handlePromptPill = (prompt: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: "/chat",
      params: { initialPrompt: prompt },
    });
  };

  const handleOpenChat = async (id: string) => {
    await selectConversation(id);
    router.push("/chat");
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Top Header Bar (ChatGPT-style with prominent Log in pill) ── */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push("/history")}
          activeOpacity={0.7}
        >
          <Menu size={22} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.headerLogo}
          />
          <Text style={styles.brandTitle}>RobinAI</Text>
        </View>

        {isAuthenticated ? (
          <TouchableOpacity
            style={styles.userProfilePill}
            onPress={() => router.push("/profile")}
            activeOpacity={0.8}
          >
            <User size={13} color={Colors.background} />
            <Text style={styles.userPillText} numberOfLines={1}>
              {profile?.name ? profile.name.split(" ")[0] : "Profile"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginPill}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.loginPillText}>Log in</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Center Hero: "What are you working on?" ── */}
        <View style={styles.centerHero}>
          <Text style={styles.centerHeroQuestion}>What are you working on?</Text>

          {/* Minimalist Floating Input Bar with '+' and 'Arrow Up' */}
          <View style={styles.floatingInputBar}>
            <TouchableOpacity
              style={styles.plusBtn}
              onPress={() => handlePromptPill("What can you do?")}
              activeOpacity={0.7}
            >
              <Plus size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TextInput
              style={styles.floatingInput}
              placeholder="Ask Robin anything..."
              placeholderTextColor={Colors.textMuted}
              value={quickInput}
              onChangeText={setQuickInput}
              onSubmitEditing={handleQuickSubmit}
              returnKeyType="send"
            />

            <TouchableOpacity
              style={[
                styles.arrowUpBtn,
                quickInput.trim().length > 0 && styles.arrowUpBtnActive,
              ]}
              onPress={handleQuickSubmit}
              disabled={!quickInput.trim()}
              activeOpacity={0.8}
            >
              <ArrowUp
                size={18}
                color={quickInput.trim() ? Colors.background : "#555"}
              />
            </TouchableOpacity>
          </View>

          {/* Prompt Pills below input */}
          <View style={styles.pillsRow}>
            <TouchableOpacity
              style={styles.primaryPill}
              onPress={() => handlePromptPill("What can you do? Give me an overview of RobinAI's capabilities.")}
              activeOpacity={0.7}
            >
              <Sparkles size={13} color={Colors.primary} />
              <Text style={styles.primaryPillText}>What can you do?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pill}
              onPress={() => handlePromptPill("Audit a suspicious Telegram crypto offer or DM.")}
              activeOpacity={0.7}
            >
              <ShieldAlert size={13} color={Colors.error} />
              <Text style={styles.pillText}>Audit a scam</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pill}
              onPress={() => handlePromptPill("Explain Ethereum Layer 2 rollups and how they scale blockchain.")}
              activeOpacity={0.7}
            >
              <Text style={styles.pillText}>Explain Layer 2</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pill}
              onPress={() => handlePromptPill("Analyze Bitcoin price structure, volume, and support levels.")}
              activeOpacity={0.7}
            >
              <TrendingUp size={13} color={Colors.blue} />
              <Text style={styles.pillText}>Bitcoin outlook</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Security Rule Banner ── */}
        <View style={styles.securityBanner}>
          <View style={styles.securityIconBox}>
            <Lock size={16} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>Permanent Security Rule</Text>
            <Text style={styles.securityDesc}>
              Never share your seed phrase or private key. RobinAI will never ask
              for passwords or recovery phrases.
            </Text>
          </View>
        </View>

        {/* ── Recent Conversations (if authenticated or saved) ── */}
        {conversations.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Chats</Text>
              <Pressable onPress={() => router.push("/history")}>
                <Text style={styles.seeAllText}>View all ({conversations.length}) →</Text>
              </Pressable>
            </View>

            <View style={styles.recentBox}>
              {conversations.slice(0, 3).map((conv) => (
                <TouchableOpacity
                  key={conv.id}
                  style={styles.recentRow}
                  onPress={() => handleOpenChat(conv.id)}
                  activeOpacity={0.7}
                >
                  <Clock size={14} color={Colors.primary} />
                  <Text style={styles.recentTitle} numberOfLines={1}>
                    {conv.title}
                  </Text>
                  <ChevronRight size={14} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Market Radar Quick Glance ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Crypto Market Radar</Text>
            <Pressable onPress={() => router.push("/intelligence")}>
              <Text style={styles.seeAllText}>Full Radar →</Text>
            </Pressable>
          </View>

          <View style={styles.marketCard}>
            {FALLBACK_MARKETS.slice(0, 4).map((item) => {
              const isUp = item.c >= 0;
              return (
                <TouchableOpacity
                  key={item.sym}
                  style={styles.marketRow}
                  onPress={() =>
                    handlePromptPill(
                      `Analyze current market momentum and support levels for ${item.name} (${item.sym}).`
                    )
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.coinBadge}>
                    <Text style={styles.coinSym}>{item.sym}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.coinName}>{item.name}</Text>
                    <Text style={styles.coinCap}>Vol: ${item.vol}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.coinPrice}>
                      ${item.p.toLocaleString()}
                    </Text>
                    <View style={styles.changeRow}>
                      {isUp ? (
                        <ArrowUpRight size={11} color={Colors.primary} />
                      ) : (
                        <ArrowDownRight size={11} color={Colors.error} />
                      )}
                      <Text
                        style={[
                          styles.changeText,
                          { color: isUp ? Colors.primary : Colors.error },
                        ]}
                      >
                        {isUp ? "+" : ""}
                        {item.c}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Bottom Legal Disclaimer (matching ChatGPT style) ── */}
        <Text style={styles.disclaimerText}>
          RobinAI is an intelligent assistant. By using it, you agree to our{" "}
          <Text
            style={styles.disclaimerLink}
            onPress={() => router.push("/settings")}
          >
            Terms & Privacy Policy
          </Text>
          . Never invest money you cannot afford to lose.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondaryBg,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerLogo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  brandTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  loginPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  loginPillText: {
    color: "#0A0A0A",
    fontSize: 13,
    fontWeight: "700",
  },
  userProfilePill: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  userPillText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: "800",
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 40,
    gap: 20,
  },
  centerHero: {
    alignItems: "center",
    paddingVertical: 10,
    gap: 16,
  },
  centerHeroQuestion: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  floatingInputBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  arrowUpBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowUpBtnActive: {
    backgroundColor: Colors.primary,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  primaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  primaryPillText: {
    color: Colors.primary,
    fontSize: 12.5,
    fontWeight: "600",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  securityBanner: {
    backgroundColor: Colors.secondaryBg,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  securityIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  securityTitle: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  securityDesc: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  seeAllText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  recentBox: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recentTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
    fontWeight: "500",
  },
  marketCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  marketRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  coinBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.secondaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coinSym: {
    color: Colors.primary,
    fontWeight: "800",
    fontSize: 11,
  },
  coinName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  coinCap: {
    color: Colors.textMuted,
    fontSize: 10.5,
  },
  coinPrice: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  changeText: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  disclaimerText: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  disclaimerLink: {
    color: Colors.primary,
    textDecorationLine: "underline",
  },
});
