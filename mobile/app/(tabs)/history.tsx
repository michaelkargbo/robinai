import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Search,
  MessageSquare,
  Trash2,
  Edit3,
  ChevronRight,
  Plus,
  Clock,
} from "lucide-react-native";
import Colors from "../../constants/colors";
import { useChat } from "../../store/ChatContext";
import { useAuth } from "../../store/AuthContext";

export default function HistoryScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    conversations,
    selectConversation,
    createNewConversation,
    renameConversation,
    deleteConversation,
  } = useChat();

  const [search, setSearch] = useState("");
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleOpenConversation = async (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await selectConversation(id);
    router.push("/chat");
  };

  const handleNewChat = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await createNewConversation("New Conversation");
    router.push("/chat");
  };

  const handleOpenRename = (id: string, currentTitle: string) => {
    setSelectedConvId(id);
    setNewTitle(currentTitle);
    setRenameModalVisible(true);
  };

  const handleConfirmRename = async () => {
    if (!selectedConvId || !newTitle.trim()) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    await renameConversation(selectedConvId, newTitle.trim());
    setRenameModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this chat? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}
            await deleteConversation(id);
          },
        },
      ]
    );
  };

  // Group conversations into Today, Yesterday, Previous 7 days, Older
  const now = new Date().getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const groups: { [key: string]: typeof conversations } = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };

  filtered.forEach((conv) => {
    const time = new Date(conv.updatedAt || conv.createdAt).getTime();
    const diff = now - time;
    if (diff < oneDay) {
      groups.Today.push(conv);
    } else if (diff < 2 * oneDay) {
      groups.Yesterday.push(conv);
    } else if (diff < 7 * oneDay) {
      groups["Previous 7 Days"].push(conv);
    } else {
      groups.Older.push(conv);
    }
  });

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchWrap}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversation history..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <TouchableOpacity
          style={styles.newChatBtn}
          onPress={handleNewChat}
          activeOpacity={0.8}
        >
          <Plus size={16} color={Colors.background} />
          <Text style={styles.newChatBtnText}>New Chat</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!isAuthenticated && (
          <View style={styles.guestNotice}>
            <Text style={styles.guestTitle}>Guest Mode Active</Text>
            <Text style={styles.guestText}>
              Log in to sync and backup your conversation history across your
              iPhone, Android, and Web browsers.
            </Text>
            <TouchableOpacity
              style={styles.loginBannerBtn}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.loginBannerBtnText}>Log In or Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}

        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Clock size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Conversations Found</Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? "No chats matched your search query."
                : "Start your first conversation with Robin to see it here."}
            </Text>
            <TouchableOpacity style={styles.emptyAction} onPress={handleNewChat}>
              <Text style={styles.emptyActionText}>Start a New Chat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Object.entries(groups).map(([label, items]) => {
            if (items.length === 0) return null;
            return (
              <View key={label} style={styles.groupSection}>
                <Text style={styles.groupHeader}>{label}</Text>
                <View style={styles.groupList}>
                  {items.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.chatRow}
                      onPress={() => handleOpenConversation(c.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.chatIcon}>
                        <MessageSquare size={16} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.chatTitle} numberOfLines={1}>
                          {c.title}
                        </Text>
                        <Text style={styles.chatDate}>
                          {new Date(c.updatedAt || c.createdAt).toLocaleDateString()}
                        </Text>
                      </View>

                      {/* Rename and Delete Actions */}
                      <View style={styles.rowActions}>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => handleOpenRename(c.id, c.title)}
                        >
                          <Edit3 size={14} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => handleDelete(c.id)}
                        >
                          <Trash2 size={14} color={Colors.error} />
                        </TouchableOpacity>
                        <ChevronRight size={16} color={Colors.textMuted} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Rename Modal */}
      <Modal visible={renameModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rename Conversation</Text>
            <TextInput
              style={styles.modalInput}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleConfirmRename}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.secondaryBg,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.input,
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
    paddingVertical: 8,
  },
  newChatBtn: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  newChatBtnText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: "700",
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  guestNotice: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  guestTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  guestText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  loginBannerBtn: {
    backgroundColor: Colors.secondaryBg,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  loginBannerBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  groupSection: {
    marginBottom: 18,
  },
  groupHeader: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupList: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  chatIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.secondaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chatTitle: {
    color: Colors.text,
    fontSize: 13.5,
    fontWeight: "600",
    marginBottom: 2,
  },
  chatDate: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    padding: 6,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  emptyAction: {
    marginTop: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyActionText: {
    color: Colors.background,
    fontWeight: "700",
    fontSize: 13,
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
