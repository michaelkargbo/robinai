import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Share,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  RotateCcw,
  Check,
  BrainCircuit,
  Share2,
  Plus,
} from "lucide-react-native";
import Colors from "../../constants/colors";
import { useChat } from "../../store/ChatContext";

export default function ChatScreen() {
  const { initialPrompt } = useLocalSearchParams<{ initialPrompt?: string }>();
  const {
    messages,
    isLoading,
    sendMessage,
    regenerateLastResponse,
    createNewConversation,
  } = useChat();

  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (initialPrompt && typeof initialPrompt === "string") {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages.length, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    setInput("");
    await sendMessage(text);
  };

  const handleCopy = (id: string, text: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (text: string) => {
    try {
      await Share.share({ message: text, title: "RobinAI Response" });
    } catch {}
  };

  const handleNewChat = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await createNewConversation("New Conversation");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Top Controls Bar */}
      <View style={styles.topBar}>
        <View style={styles.modelTag}>
          <Bot size={14} color={Colors.primary} />
          <Text style={styles.modelText}>Robin Auto</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleNewChat}
            activeOpacity={0.7}
          >
            <Plus size={14} color={Colors.primary} />
            <Text style={[styles.actionBtnText, { color: Colors.primary }]}>
              New Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => regenerateLastResponse()}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <RotateCcw size={14} color={Colors.textSecondary} />
            <Text style={styles.actionBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Message List */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <View
              key={m.id}
              style={[
                styles.messageRow,
                isUser ? styles.userRow : styles.botRow,
              ]}
            >
              {!isUser && (
                <View style={styles.botAvatar}>
                  <Bot size={16} color={Colors.primary} />
                </View>
              )}

              <View style={{ flex: 1, alignItems: isUser ? "flex-end" : "flex-start" }}>
                {m.thought && (
                  <View style={styles.thoughtBox}>
                    <View style={styles.thoughtHeader}>
                      <BrainCircuit size={12} color={Colors.primary} />
                      <Text style={styles.thoughtTitle}>Robin Reasoning Engine</Text>
                    </View>
                    <Text style={styles.thoughtText}>{m.thought}</Text>
                  </View>
                )}

                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      isUser ? styles.userText : styles.botText,
                    ]}
                  >
                    {m.content}
                  </Text>
                </View>

                {/* Response Action Bar */}
                {!isUser && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleCopy(m.id, m.content)}
                    >
                      {copiedId === m.id ? (
                        <Check size={13} color={Colors.primary} />
                      ) : (
                        <Copy size={13} color={Colors.textMuted} />
                      )}
                      <Text style={styles.actionText}>
                        {copiedId === m.id ? "Copied" : "Copy"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleShare(m.content)}
                    >
                      <Share2 size={13} color={Colors.textMuted} />
                      <Text style={styles.actionText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {isUser && (
                <View style={styles.userAvatar}>
                  <User size={14} color={Colors.textSecondary} />
                </View>
              )}
            </View>
          );
        })}

        {isLoading && (
          <View style={styles.loadingRow}>
            <View style={styles.botAvatar}>
              <Bot size={16} color={Colors.primary} />
            </View>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Robin is formulating response...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggested Follow-Ups */}
      <View style={styles.quickPillsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 14 }}>
          {[
            "Analyze Bitcoin Outlook",
            "How do hardware wallets work?",
            "Detect phishing scam",
            "Solidity ERC-20 contract",
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.followUpPill}
              onPress={() => handleSend(item)}
              activeOpacity={0.7}
            >
              <Sparkles size={11} color={Colors.primary} />
              <Text style={styles.followUpText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Composer */}
      <View style={styles.composerContainer}>
        <View style={styles.composerBox}>
          <TextInput
            style={styles.input}
            placeholder="Ask Robin anything about crypto, coding, or research..."
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxHeight={100}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || isLoading) && styles.sendDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isLoading}
            activeOpacity={0.8}
          >
            <Send size={16} color={Colors.background} />
          </TouchableOpacity>
        </View>
        <Text style={styles.securityFooter}>
          RobinAI: Never share private keys or 12/24-word recovery phrases.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.secondaryBg,
  },
  modelTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modelText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  actionBtnText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 16,
  },
  messageRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.secondaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxWidth: "92%",
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: Colors.background,
    fontWeight: "500",
  },
  botText: {
    color: Colors.text,
  },
  thoughtBox: {
    backgroundColor: "#11140e",
    borderWidth: 1,
    borderColor: "#202a14",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    maxWidth: "92%",
  },
  thoughtHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  thoughtTitle: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  thoughtText: {
    color: "#c2e88a",
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 6,
    marginLeft: 4,
  },
  actionIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  quickPillsRow: {
    paddingVertical: 6,
    backgroundColor: Colors.secondaryBg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  followUpPill: {
    backgroundColor: Colors.card,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  followUpText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
  },
  loadingRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  loadingBubble: {
    backgroundColor: Colors.card,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  composerContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 12,
    backgroundColor: Colors.secondaryBg,
  },
  composerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.input,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    minHeight: 38,
    paddingVertical: 6,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendDisabled: {
    opacity: 0.3,
  },
  securityFooter: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 6,
  },
});
