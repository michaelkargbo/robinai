import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import chatService, { Conversation, MessageItem } from "../services/chatService";
import { sendChatMessage } from "../services/api";
import { useAuth } from "./AuthContext";

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: MessageItem[];
  isLoading: boolean;
  loadConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  createNewConversation: (title?: string) => Promise<string>;
  renameConversation: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  sendMessage: (content: string, model?: string) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  loadConversations: async () => {},
  selectConversation: async () => {},
  createNewConversation: async () => "",
  renameConversation: async () => {},
  deleteConversation: async () => {},
  sendMessage: async () => {},
  regenerateLastResponse: async () => {},
});

const DEFAULT_INTRO: MessageItem = {
  id: "intro",
  role: "assistant",
  content:
    "I’m Robin, your AI assistant.\n\nI can help you with general knowledge, writing, coding, or specialized cryptocurrency and blockchain questions.\n\n*Reminder: Never share your seed phrase or private key with anyone.*",
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([DEFAULT_INTRO]);
  const [isLoading, setIsLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const list = await chatService.getConversations();
      setConversations(list);
      if (list.length > 0 && !activeConversationId) {
        selectConversation(list[0].id);
      }
    } catch {}
  }, [isAuthenticated, activeConversationId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    } else {
      setConversations([]);
      setActiveConversationId(null);
      setMessages([DEFAULT_INTRO]);
    }
  }, [isAuthenticated, loadConversations]);

  const selectConversation = async (id: string) => {
    setActiveConversationId(id);
    setIsLoading(true);
    try {
      const history = await chatService.getMessages(id);
      setMessages(history.length > 0 ? history : [DEFAULT_INTRO]);
    } catch {
      setMessages([DEFAULT_INTRO]);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async (title = "New Conversation"): Promise<string> => {
    if (isAuthenticated) {
      try {
        const conv = await chatService.createConversation(title);
        setConversations((prev) => [conv, ...prev]);
        setActiveConversationId(conv.id);
        setMessages([DEFAULT_INTRO]);
        return conv.id;
      } catch {}
    }
    // Guest fallback
    const guestId = `guest_${Date.now()}`;
    setActiveConversationId(guestId);
    setMessages([DEFAULT_INTRO]);
    return guestId;
  };

  const renameConversation = async (id: string, title: string) => {
    if (isAuthenticated) {
      await chatService.renameConversation(id, title);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c))
      );
    }
  };

  const deleteConversation = async (id: string) => {
    if (isAuthenticated) {
      await chatService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([DEFAULT_INTRO]);
      }
    }
  };

  const sendMessage = async (content: string, model = "Robin Auto") => {
    const userMsg: MessageItem = {
      id: `u_${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let convId = activeConversationId;
    if (!convId && isAuthenticated) {
      convId = await createNewConversation(content.slice(0, 32));
    }

    if (convId && isAuthenticated) {
      chatService.saveMessage(convId, "user", content, null, model).catch(() => {});
    }

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const resp = await sendChatMessage(content, history, model);

      const botMsg: MessageItem = {
        id: `a_${Date.now()}`,
        role: "assistant",
        content: resp.content,
        thought: resp.thought,
        model,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (convId && isAuthenticated) {
        chatService.saveMessage(convId, "assistant", resp.content, resp.thought, model).catch(() => {});
      }
    } catch {
      const errMsg: MessageItem = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: "Something went wrong while reaching Robin AI. Please check your connection and try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateLastResponse = async () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    await sendMessage(lastUserMsg.content);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        messages,
        isLoading,
        loadConversations,
        selectConversation,
        createNewConversation,
        renameConversation,
        deleteConversation,
        sendMessage,
        regenerateLastResponse,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
export default ChatContext;
