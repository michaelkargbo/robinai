import { getApiBaseUrl } from "./api";
import { authService } from "./authService";

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  thought?: string | null;
  model?: string;
  createdAt?: string;
}

class ChatService {
  private getAuthHeader() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getConversations(): Promise<Conversation[]> {
    const baseUrl = getApiBaseUrl();
    const headers = this.getAuthHeader();
    if (!headers.Authorization) return [];

    try {
      const res = await fetch(`${baseUrl}/api/conversations`, { headers });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  async createConversation(title = "New Conversation"): Promise<Conversation> {
    const baseUrl = getApiBaseUrl();
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
    };

    const res = await fetch(`${baseUrl}/api/conversations`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error("Failed to create conversation");
    return await res.json();
  }

  async renameConversation(convId: string, title: string): Promise<Conversation> {
    const baseUrl = getApiBaseUrl();
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
    };

    const res = await fetch(`${baseUrl}/api/conversations/${convId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error("Failed to rename conversation");
    return await res.json();
  }

  async deleteConversation(convId: string): Promise<boolean> {
    const baseUrl = getApiBaseUrl();
    const headers = this.getAuthHeader();

    const res = await fetch(`${baseUrl}/api/conversations/${convId}`, {
      method: "DELETE",
      headers,
    });

    return res.ok;
  }

  async getMessages(convId: string): Promise<MessageItem[]> {
    const baseUrl = getApiBaseUrl();
    const headers = this.getAuthHeader();

    try {
      const res = await fetch(`${baseUrl}/api/conversations/${convId}/messages`, { headers });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  async saveMessage(
    convId: string,
    role: "user" | "assistant",
    content: string,
    thought?: string | null,
    model = "Robin Auto"
  ): Promise<MessageItem> {
    const baseUrl = getApiBaseUrl();
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
    };

    const res = await fetch(`${baseUrl}/api/conversations/${convId}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({ role, content, thought, model }),
    });

    if (!res.ok) throw new Error("Failed to save message");
    return await res.json();
  }
}

export const chatService = new ChatService();
export default chatService;
