import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Search,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  ScanLine,
  Wallet,
  ExternalLink,
} from "lucide-react-native";
import Colors from "../../constants/colors";
import { FALLBACK_MARKETS, MarketItem } from "../../services/api";

export default function IntelligenceScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"market" | "scam" | "scanner">("market");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [markets, setMarkets] = useState<MarketItem[]>(FALLBACK_MARKETS);

  const onRefresh = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setRefreshing(true);
    setTimeout(() => {
      setMarkets((prev) =>
        prev.map((m) => ({
          ...m,
          p: parseFloat((m.p + (Math.random() - 0.49) * 50).toFixed(2)),
        }))
      );
      setRefreshing(false);
    }, 600);
  };

  const handleAskAI = (prompt: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push({
      pathname: "/chat",
      params: { initialPrompt: prompt },
    });
  };

  const filtered = markets.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.sym.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Category Segment Selector */}
      <View style={styles.segmentWrap}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === "market" && styles.segmentBtnActive]}
          onPress={() => setActiveTab("market")}
        >
          <TrendingUp size={14} color={activeTab === "market" ? Colors.background : Colors.textSecondary} />
          <Text
            style={[
              styles.segmentText,
              activeTab === "market" && styles.segmentTextActive,
            ]}
          >
            Market Radar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === "scam" && styles.segmentBtnActive]}
          onPress={() => setActiveTab("scam")}
        >
          <ShieldAlert size={14} color={activeTab === "scam" ? Colors.background : Colors.textSecondary} />
          <Text
            style={[
              styles.segmentText,
              activeTab === "scam" && styles.segmentTextActive,
            ]}
          >
            Anti-Scam Guard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === "scanner" && styles.segmentBtnActive]}
          onPress={() => setActiveTab("scanner")}
        >
          <ScanLine size={14} color={activeTab === "scanner" ? Colors.background : Colors.textSecondary} />
          <Text
            style={[
              styles.segmentText,
              activeTab === "scanner" && styles.segmentTextActive,
            ]}
          >
            On-Chain Scan
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── TAB 1: MARKET RADAR ──────────────────────────────── */}
      {activeTab === "market" && (
        <View style={{ gap: 14 }}>
          <View style={styles.searchBar}>
            <Search size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search crypto assets (e.g., BTC, Solana)..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.marketList}>
            {filtered.map((item) => {
              const isUp = item.c >= 0;
              return (
                <View key={item.sym} style={styles.tokenCard}>
                  <View style={styles.tokenLeft}>
                    <View style={styles.tokenBadge}>
                      <Text style={styles.tokenBadgeText}>{item.sym}</Text>
                    </View>
                    <View>
                      <Text style={styles.tokenName}>{item.name}</Text>
                      <Text style={styles.tokenMeta}>
                        Cap: ${item.cap} · Vol: ${item.vol}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tokenRight}>
                    <Text style={styles.tokenPrice}>
                      ${item.p.toLocaleString()}
                    </Text>
                    <View style={styles.changeRow}>
                      {isUp ? (
                        <ArrowUpRight size={12} color={Colors.primary} />
                      ) : (
                        <ArrowDownRight size={12} color={Colors.error} />
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

                  <TouchableOpacity
                    style={styles.actionPill}
                    onPress={() =>
                      handleAskAI(
                        `Analyze market structure, order book liquidity, and 24h momentum for ${item.name} (${item.sym}).`
                      )
                    }
                  >
                    <Sparkles size={12} color={Colors.background} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* ── TAB 2: ANTI-SCAM ─────────────────────────────────── */}
      {activeTab === "scam" && (
        <View style={{ gap: 14 }}>
          <View style={styles.alertCard}>
            <ShieldAlert size={24} color={Colors.error} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>RobinAI Security Guard</Text>
              <Text style={styles.alertDesc}>
                Always remember: Never share your 12/24-word recovery phrase or
                private key. Legitimate platforms will never ask for them.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Common Red Flags to Watch</Text>
          <View style={styles.card}>
            {[
              "Guaranteed high returns or doubling funds in 24 hours.",
              "Asking you to pay gas or unlock fees first to withdraw funds.",
              "Unsolicited DMs from fake 'support' agents or verified imposters.",
              "Wallet drainer Permit2 / eth_sign signatures on suspicious links.",
              "Fake recovery services promising to retrieve stolen crypto for an upfront fee.",
            ].map((text, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() =>
              handleAskAI(
                "Is this a scam? Someone on Telegram claims they will double my crypto if I send 0.2 ETH first."
              )
            }
          >
            <Sparkles size={16} color={Colors.background} />
            <Text style={styles.primaryActionBtnText}>
              Audit a Suspicious Offer with Robin
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── TAB 3: ON-CHAIN SCANNER ──────────────────────────── */}
      {activeTab === "scanner" && (
        <View style={{ gap: 14 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Inspect Transaction Hash</Text>
            <Text style={styles.cardSubtitle}>
              Paste any 64-character Ethereum or EVM transaction hash to check
              block status, gas fee, and confirmations.
            </Text>
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() =>
                handleAskAI(
                  "Check transaction 0x8f3a1e2b9c4d6f7a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a on Ethereum Mainnet."
                )
              }
            >
              <ScanLine size={16} color={Colors.primary} />
              <Text style={styles.toolBtnText}>Decode Sample Tx Hash</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Inspect Wallet Hygiene</Text>
            <Text style={styles.cardSubtitle}>
              Evaluate public token allowances, balances, and transaction count
              for any checksummed 0x address.
            </Text>
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() =>
                handleAskAI(
                  "Analyze wallet address 0x742d35Cc6634C0532925a3b844Bc454e4438f44e and check for malicious token approvals."
                )
              }
            >
              <Wallet size={16} color={Colors.primary} />
              <Text style={styles.toolBtnText}>Inspect Sample Wallet</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingBottom: 36,
  },
  segmentWrap: {
    flexDirection: "row",
    backgroundColor: Colors.secondaryBg,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    color: Colors.textSecondary,
    fontSize: 11.5,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: Colors.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
    paddingVertical: 10,
  },
  marketList: {
    gap: 8,
  },
  tokenCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tokenLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  tokenBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.secondaryBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  tokenBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  tokenName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  tokenMeta: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  tokenRight: {
    alignItems: "flex-end",
    marginRight: 10,
  },
  tokenPrice: {
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
    fontSize: 11,
    fontWeight: "600",
  },
  actionPill: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  alertCard: {
    backgroundColor: Colors.errorBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 92, 92, 0.35)",
  },
  alertTitle: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  alertDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  sectionHeader: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.error,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryActionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryActionBtnText: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: "800",
  },
  toolBtn: {
    backgroundColor: Colors.secondaryBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  toolBtnText: {
    color: Colors.text,
    fontSize: 12.5,
    fontWeight: "600",
  },
});
