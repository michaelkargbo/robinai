import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
} from "lucide-react-native";
import Colors from "../../constants/colors";
import { FALLBACK_MARKETS, MarketItem } from "../../services/api";

export default function RadarScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [markets, setMarkets] = useState<MarketItem[]>(FALLBACK_MARKETS);

  const onRefresh = React.useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setRefreshing(true);
    // Simulate refreshing prices with slight variance
    setTimeout(() => {
      setMarkets((prev) =>
        prev.map((m) => {
          const delta = (Math.random() - 0.49) * (m.p * 0.005);
          return {
            ...m,
            p: parseFloat((m.p + delta).toFixed(2)),
          };
        })
      );
      setRefreshing(false);
    }, 800);
  }, []);

  const filtered = markets.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.sym.toLowerCase().includes(search.toLowerCase())
  );

  const handleAnalyze = (item: MarketItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push({
      pathname: "/chat",
      params: {
        initialPrompt: `Analyze current market momentum, 24h volume, and key support levels for ${item.name} (${item.sym}).`,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.headerBox}>
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Filter tokens (e.g. BTC, Solana)..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Market List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.sym}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isUp = item.c >= 0;
          return (
            <View style={styles.rowCard}>
              <View style={styles.tokenInfo}>
                <View style={styles.tokenBadge}>
                  <Text style={styles.tokenSymbol}>{item.sym}</Text>
                </View>
                <View>
                  <Text style={styles.tokenName}>{item.name}</Text>
                  <Text style={styles.tokenMeta}>
                    Cap: ${item.cap} · Vol: ${item.vol}
                  </Text>
                </View>
              </View>

              <View style={styles.priceCol}>
                <Text style={styles.tokenPrice}>
                  ${item.p.toLocaleString()}
                </Text>
                <View style={styles.changeBadge}>
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
                style={styles.analyzeBtn}
                onPress={() => handleAnalyze(item)}
                activeOpacity={0.7}
              >
                <Sparkles size={12} color={Colors.background} />
                <Text style={styles.analyzeBtnText}>Analyze</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBox: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.secondaryBg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.input,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
    paddingVertical: 8,
  },
  listContent: {
    padding: 14,
    gap: 10,
  },
  rowCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1.2,
  },
  tokenBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.secondaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tokenSymbol: {
    color: Colors.primary,
    fontWeight: "800",
    fontSize: 11,
  },
  tokenName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  tokenMeta: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  priceCol: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  tokenPrice: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  changeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  analyzeBtn: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  analyzeBtnText: {
    color: Colors.background,
    fontSize: 11,
    fontWeight: "700",
  },
});
